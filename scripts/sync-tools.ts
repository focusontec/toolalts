import fs from "fs";
import path from "path";
import { chromium } from "playwright";

const DATA_PATH = path.resolve(__dirname, "../data/tools.json");
const SCREENSHOT_DIR = path.resolve(__dirname, "../public/images/tools");

const SLEEP_MS = 1000;
const MAX_RETRIES = 3;

interface Tool {
  slug: string;
  name: string;
  github?: string;
  website?: string;
  stars?: number;
  lastUpdated?: string;
  [key: string]: any;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "tool-alts-sync/1.0",
        },
      });
      if (res.status === 403 || res.status === 429) {
        const retryAfter = res.headers.get("retry-after");
        const wait = retryAfter ? parseInt(retryAfter, 10) * 1000 : SLEEP_MS * 2 ** i;
        console.warn(`Rate limited, waiting ${wait}ms before retry ${i + 1}/${retries}...`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      console.error(`Fetch error (attempt ${i + 1}/${retries}):`, (err as Error).message);
      if (i === retries - 1) throw err;
      await sleep(SLEEP_MS * 2 ** i);
    }
  }
  throw new Error("Max retries exceeded");
}

async function scrapePricingPage(tool: Tool, browser: any) {
  if (!tool.website) return;
  const url = new URL(tool.website);
  const pricingUrl = `${url.origin}/pricing`;
  const screenshotPath = path.join(SCREENSHOT_DIR, `${tool.slug}-pricing.png`);

  try {
    const page = await browser.newPage();
    await page.goto(pricingUrl, { waitUntil: "networkidle", timeout: 30000 });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await page.close();
    console.log(`  ✅ Pricing screenshot saved: ${screenshotPath}`);
  } catch (err) {
    console.warn(`  ⚠️ Failed to screenshot pricing for ${tool.name}:`, (err as Error).message);
  }
}

async function main() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`tools.json not found at ${DATA_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const data = JSON.parse(raw);
  const tools: Tool[] = data.tools || [];

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();

  const changes: string[] = [];

  for (const tool of tools) {
    console.log(`\nProcessing: ${tool.name} (${tool.slug})`);

    if (tool.github) {
      const match = tool.github.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      const parts = tool.github.split("/");
      const owner = match ? match[1] : parts[parts.length - 2];
      const repo = match ? match[2] : parts[parts.length - 1];

      try {
        await sleep(SLEEP_MS);
        const info = await fetchWithRetry(
          `https://api.github.com/repos/${owner}/${repo}`
        );
        const oldStars = tool.stars;
        const oldUpdated = tool.lastUpdated;

        tool.stars = info.stargazers_count;
        tool.lastUpdated = info.updated_at;

        const starDiff =
          oldStars !== undefined ? ` (${info.stargazers_count - oldStars > 0 ? "+" : ""}${info.stargazers_count - oldStars})` : "";
        changes.push(
          `${tool.name}: stars ${oldStars ?? "N/A"} → ${info.stargazers_count}${starDiff}, updated ${oldUpdated ?? "N/A"} → ${info.updated_at}`
        );
        console.log(`  ✅ GitHub: stars=${info.stargazers_count}, updated=${info.updated_at}`);
      } catch (err) {
        console.error(`  ❌ GitHub fetch failed for ${tool.github}:`, (err as Error).message);
      }
    }

    if (tool.website) {
      await scrapePricingPage(tool, browser);
      await sleep(SLEEP_MS);
    }
  }

  await browser.close();

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");

  console.log("\n========== SYNC SUMMARY ==========");
  console.log(`Total tools: ${tools.length}`);
  console.log(`Updated: ${changes.length}`);
  if (changes.length > 0) {
    changes.forEach((c) => console.log(`  - ${c}`));
  } else {
    console.log("  (no changes)");
  }
  console.log("==================================\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
