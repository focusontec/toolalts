import fs from "fs";
import path from "path";
import { chromium } from "playwright";

const DATA_PATH = path.resolve(__dirname, "../data/tools.json");
const SCREENSHOT_DIR = path.resolve(__dirname, "../public/images/tools");

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : "";
      parsed[key] = value;
      if (value) i++;
    }
  }
  return parsed;
}

function toKebabCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface Tool {
  slug: string;
  name: string;
  website?: string;
  github?: string;
  category?: string;
  description?: string;
  stars?: number;
  lastUpdated?: string;
  [key: string]: any;
}

async function fetchGitHubInfo(githubUrl: string): Promise<{ stars: number; description: string }> {
  const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  const parts = githubUrl.split("/");
  const owner = match ? match[1] : parts[parts.length - 2];
  const repo = match ? match[2] : parts[parts.length - 1];

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "tool-alts-scrape/1.0",
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return {
    stars: data.stargazers_count ?? 0,
    description: data.description ?? "",
  };
}

async function screenshotWebsite(url: string, savePath: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.screenshot({ path: savePath, fullPage: true });
  await browser.close();
}

async function main() {
  const args = parseArgs();
  const name = args.name;
  const website = args.website;
  const github = args.github;
  const category = args.category;

  if (!name) {
    console.error("Usage: npx tsx scripts/scrape-tool.ts --name <name> [--website <url>] [--github <url>] [--category <cat>]");
    process.exit(1);
  }

  const slug = toKebabCase(name);
  console.log(`Adding new tool: ${name} (slug: ${slug})`);

  let description = "";
  let stars: number | undefined;

  if (github) {
    try {
      const info = await fetchGitHubInfo(github);
      stars = info.stars;
      description = info.description;
      console.log(`  ✅ GitHub: stars=${info.stars}`);
    } catch (err) {
      console.warn(`  ⚠️ Failed to fetch GitHub info:`, (err as Error).message);
    }
  }

  if (website) {
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
    const screenshotPath = path.join(SCREENSHOT_DIR, `${slug}.png`);
    try {
      await screenshotWebsite(website, screenshotPath);
      console.log(`  ✅ Screenshot saved: ${screenshotPath}`);
    } catch (err) {
      console.warn(`  ⚠️ Failed to screenshot website:`, (err as Error).message);
    }
  }

  const raw = fs.existsSync(DATA_PATH) ? fs.readFileSync(DATA_PATH, "utf-8") : '{"tools":[]}';
  const data = JSON.parse(raw);
  const tools: Tool[] = data.tools || [];

  if (tools.some((t) => t.slug === slug)) {
    console.error(`  ❌ Tool with slug "${slug}" already exists.`);
    process.exit(1);
  }

  const newTool: Tool = {
    slug,
    name,
    ...(website ? { website } : {}),
    ...(github ? { github } : {}),
    ...(category ? { category } : {}),
    ...(description ? { description } : {}),
    ...(stars !== undefined ? { stars } : {}),
    lastUpdated: new Date().toISOString(),
  };

  tools.push(newTool);
  data.tools = tools;
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");

  console.log("\n========== NEW TOOL SUMMARY ==========");
  console.log(`slug:       ${newTool.slug}`);
  console.log(`name:       ${newTool.name}`);
  console.log(`website:    ${newTool.website ?? "N/A"}`);
  console.log(`github:     ${newTool.github ?? "N/A"}`);
  console.log(`category:   ${newTool.category ?? "N/A"}`);
  console.log(`stars:      ${newTool.stars ?? "N/A"}`);
  console.log(`description: ${newTool.description ?? "N/A"}`);
  console.log("======================================\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
