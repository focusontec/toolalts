#!/usr/bin/env tsx
/**
 * Stage 1: Scrape tool website using Playwright
 * Extracts raw HTML, meta tags, and page text for LLM processing.
 */

import { chromium } from "playwright";

export interface ScrapedData {
  url: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  pageText: string;
  pricingPageText: string;
  featuresPageText: string;
  html: string;
  screenshotPath: string | null;
}

function extractMetaFromHtml(html: string) {
  const getMeta = (name: string) => {
    const patterns = [
      new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${name}["']`, "i"),
      new RegExp(`<meta[^>]*property=["']${name}["'][^>]*content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${name}["']`, "i"),
    ];
    for (const p of patterns) {
      const m = html.match(p);
      if (m) return m[1];
    }
    return "";
  };

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return {
    title: titleMatch ? titleMatch[1].trim() : "",
    description: getMeta("description"),
    ogTitle: getMeta("og:title"),
    ogDescription: getMeta("og:description"),
    ogImage: getMeta("og:image"),
  };
}

function htmlToText(html: string): string {
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 15000);
}

async function scrapePage(url: string, context: any): Promise<{ html: string; text: string }> {
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(2000);
    const html = await page.content();
    const text = htmlToText(html);
    return { html, text };
  } catch {
    return { html: "", text: "" };
  } finally {
    await page.close();
  }
}

export async function scrapeTool(websiteUrl: string, screenshotDir?: string): Promise<ScrapedData> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  let screenshotPath: string | null = null;

  try {
    // Scrape main page
    const main = await scrapePage(websiteUrl, context);

    // Take screenshot if directory provided
    if (screenshotDir && main.html) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
        const slug = new URL(websiteUrl).hostname.replace(/^www\./, "").replace(/\./g, "-");
        screenshotPath = path.join(screenshotDir, `${slug}-home.png`);
        const page = await context.newPage();
        await page.goto(websiteUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        await page.close();
      } catch {
        screenshotPath = null;
      }
    }
    const meta = extractMetaFromHtml(main.html);

    // Try pricing page
    let pricingPageText = "";
    let origin: string;
    try {
      origin = new URL(websiteUrl).origin;
    } catch {
      origin = "";
    }

    if (origin) {
      for (const path of ["/pricing", "/pricing/", "/plans", "/plans/"]) {
        const result = await scrapePage(`${origin}${path}`, context);
        if (result.text.length > 300) {
          pricingPageText = result.text.slice(0, 8000);
          break;
        }
      }
    }

    // Try features page
    let featuresPageText = "";
    if (origin) {
      for (const path of ["/features", "/features/", "/product", "/product/"]) {
        const result = await scrapePage(`${origin}${path}`, context);
        if (result.text.length > 300) {
          featuresPageText = result.text.slice(0, 8000);
          break;
        }
      }
    }

    return {
      url: websiteUrl,
      title: meta.title,
      description: meta.description,
      ogTitle: meta.ogTitle,
      ogDescription: meta.ogDescription,
      ogImage: meta.ogImage,
      pageText: main.text,
      pricingPageText,
      featuresPageText,
      html: main.html.slice(0, 30000),
      screenshotPath,
    };
  } finally {
    await browser.close();
  }
}
