import { chromium } from "playwright";

async function screenshot() {
  const browser = await chromium.launch({
    executablePath: "/Users/zhaozhenchao/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium",
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const shots = [
    { url: "http://localhost:3002/", path: "/tmp/toolalts-home.png" },
    { url: "http://localhost:3002/tool/notion/", path: "/tmp/toolalts-tool.png" },
    { url: "http://localhost:3002/compare/notion-vs-obsidian/", path: "/tmp/toolalts-compare.png" },
    { url: "http://localhost:3002/alternative-to/notion/", path: "/tmp/toolalts-alt.png" },
  ];

  for (const s of shots) {
    await page.goto(s.url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: s.path, fullPage: false });
    console.log(`✓ ${s.path}`);
  }

  await browser.close();
}

screenshot();
