import fs from "fs";
import path from "path";
import { chromium } from "playwright";

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

async function main() {
  const args = parseArgs();
  const slug = args.slug;
  const url = args.url;

  if (!slug || !url) {
    console.error(
      "Usage: npx tsx scripts/screenshot-tool.ts --slug <slug> --url <url>"
    );
    process.exit(1);
  }

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // Full page screenshot
    const fullPath = path.join(SCREENSHOT_DIR, `${slug}.png`);
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`✅ Full page screenshot saved: ${fullPath}`);

    // Pricing section screenshot
    const pricingPath = path.join(SCREENSHOT_DIR, `${slug}-pricing.png`);
    const pricingSelectors = [
      '[id*="pricing"]',
      '[class*="pricing"]',
      'section:has-text("Pricing")',
      'div:has-text("Pricing")',
    ];

    let pricingFound = false;
    for (const selector of pricingSelectors) {
      try {
        const el = await page.locator(selector).first();
        if (el && (await el.count()) > 0) {
          await el.screenshot({ path: pricingPath });
          pricingFound = true;
          console.log(`✅ Pricing section screenshot saved: ${pricingPath}`);
          break;
        }
      } catch {
        // ignore and try next selector
      }
    }

    if (!pricingFound) {
      console.warn(`⚠️ Pricing section not found for ${slug}, falling back to full page.`);
      await page.screenshot({ path: pricingPath, fullPage: true });
      console.log(`✅ Fallback pricing screenshot saved: ${pricingPath}`);
    }
  } catch (err) {
    console.error("Screenshot failed:", (err as Error).message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
