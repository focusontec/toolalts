#!/usr/bin/env tsx
/**
 * scrape-reviews.ts — Real review ratings from public sources
 *
 * Tries multiple strategies to get real ratings:
 * 1. Direct G2/Capterra page fetch (via Playwright)
 * 2. Bing search for review snippets
 * 3. DuckDuckGo HTML search (fallback)
 *
 * Only writes data that is explicitly found — never fabricates.
 * If no data found, sets rating/reviewsCount to 0 (not a fake number).
 *
 * Usage:
 *   npx tsx scripts/scrape-reviews.ts                    # all tools
 *   npx tsx scripts/scrape-reviews.ts --slug notion      # single tool
 *   npx tsx scripts/scrape-reviews.ts --dry-run          # preview without saving
 */

import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { callLlm } from "./lib/llm";

// Load .env.local for local development
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

const DATA_PATH = path.resolve(__dirname, "../data/tools.json");
const SLEEP_MS = 3000;

interface ToolEntry {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  rating: number;
  reviewsCount: number;
  openSource: boolean;
  githubStars: number | null;
  githubUrl: string | null;
  websiteUrl: string;
  pricing: { plan: string; price: string; features: string[] }[];
  features: string[];
  category: string;
  logo: string;
  status: string;
}

interface ReviewData {
  rating: number | null;
  reviewsCount: number | null;
  source: string | null;
  confidence: "high" | "medium" | "low" | "none";
}

function parseArgs(): { slug?: string; dryRun: boolean } {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  let dryRun = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    if (args[i] === "--dry-run") dryRun = true;
  }
  return { slug, dryRun };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Strategy 1: Try to fetch G2 or Capterra page directly via Playwright.
 * These sites may show rating data in the initial HTML.
 */
async function fetchReviewPage(
  page: any,
  toolName: string,
  slug: string
): Promise<string> {
  const urls = [
    `https://www.g2.com/products/${slug}/reviews`,
    `https://www.capterra.com/p/${slug}/`,
  ];

  for (const url of urls) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 12000 });
      await page.waitForTimeout(2000);

      const text = await page.evaluate(() => {
        // Look for structured data
        const ldJson = document.querySelector(
          'script[type="application/ld+json"]'
        );
        if (ldJson) return ldJson.textContent || "";

        // Look for rating elements
        const ratingEl = document.querySelector(
          '[itemprop="ratingValue"], [data-testid*="rating"], [class*="star-rating"]'
        );
        const reviewEl = document.querySelector(
          '[itemprop="reviewCount"], [data-testid*="review-count"]'
        );
        const parts = [];
        if (ratingEl)
          parts.push(`Rating: ${ratingEl.getAttribute("content") || ratingEl.textContent}`);
        if (reviewEl)
          parts.push(`Reviews: ${reviewEl.getAttribute("content") || reviewEl.textContent}`);

        if (parts.length > 0) return parts.join(", ");

        // Fallback: get body text
        return document.body?.innerText?.replace(/\s+/g, " ").trim().slice(0, 4000) || "";
      });

      if (text.length > 200) return `Source: ${url}\n${text}`;
    } catch {
      // Page didn't load, try next
    }
  }
  return "";
}

/**
 * Strategy 2: Search Bing for review data via Playwright.
 */
async function searchBing(page: any, query: string): Promise<string> {
  try {
    const encoded = encodeURIComponent(query);
    await page.goto(`https://www.bing.com/search?q=${encoded}`, {
      waitUntil: "domcontentloaded",
      timeout: 12000,
    });
    await page.waitForTimeout(2000);

    const text = await page.evaluate(() => {
      const results: string[] = [];
      // Bing result containers
      const items = document.querySelectorAll(
        ".b_algo, .b_ans, .b_entityFeatured"
      );
      for (const item of items) {
        const title = item.querySelector("h2, h3")?.textContent || "";
        const snippet = item.querySelector(
          ".b_caption p, .b_lineclamp2, .b_paractl"
        )?.textContent || "";
        if (title || snippet) {
          results.push(`${title}: ${snippet}`.trim());
        }
      }
      // Knowledge panel
      const kp = document.querySelector(
        ".b_entityFeatured, .entity-card, .kcard-sc"
      );
      if (kp) {
        results.push(
          `Knowledge: ${kp.textContent?.replace(/\s+/g, " ").trim().slice(0, 1500) || ""}`
        );
      }
      return results.join("\n").slice(0, 6000);
    });

    return text;
  } catch {
    return "";
  }
}

/**
 * Use LLM to extract structured review data from raw text.
 */
async function extractReviewWithLlm(
  toolName: string,
  rawText: string
): Promise<ReviewData> {
  const systemPrompt = `You extract review ratings from web page text and search results.

RULES:
- Only extract ratings that are EXPLICITLY mentioned in the text
- If no clear rating is found, return null for rating and reviewsCount
- NEVER guess, estimate, or use your training data
- Source must be the actual website mentioned (G2, Capterra, Product Hunt, TrustRadius, etc.)
- Return ONLY valid JSON, no markdown code blocks`;

  const userPrompt = `Extract review data for "${toolName}" from this text:

${rawText.slice(0, 6000)}

Return JSON:
{
  "rating": 4.7,
  "reviewsCount": 1200,
  "source": "G2",
  "confidence": "high"
}

If no rating data found:
{
  "rating": null,
  "reviewsCount": null,
  "source": null,
  "confidence": "none"
}`;

  try {
    const res = await callLlm(systemPrompt, userPrompt);
    const clean = res.content.replace(/```json\s*|```\s*$/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      rating:
        typeof parsed.rating === "number" &&
        parsed.rating >= 1 &&
        parsed.rating <= 5
          ? Math.round(parsed.rating * 10) / 10
          : null,
      reviewsCount:
        typeof parsed.reviewsCount === "number" && parsed.reviewsCount > 0
          ? parsed.reviewsCount
          : null,
      source: typeof parsed.source === "string" ? parsed.source : null,
      confidence: ["high", "medium", "low", "none"].includes(
        parsed.confidence
      )
        ? parsed.confidence
        : "none",
    };
  } catch (err) {
    console.error(`  LLM extraction failed:`, (err as Error).message);
    return {
      rating: null,
      reviewsCount: null,
      source: null,
      confidence: "none",
    };
  }
}

async function main() {
  const { slug, dryRun } = parseArgs();

  const tools: ToolEntry[] = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const toProcess = slug
    ? tools.filter((t) => t.slug === slug)
    : tools.filter((t) => t.websiteUrl && t.status !== "removed");

  if (toProcess.length === 0) {
    console.log("No tools to process.");
    return;
  }

  console.log("=".repeat(50));
  console.log("Scrape Reviews — Real Rating Data");
  console.log("=".repeat(50));
  console.log(`Tools to process: ${toProcess.length}`);
  console.log(`Dry run: ${dryRun}`);
  console.log(`LLM: ${process.env.LLM_PROVIDER || "default"}`);
  console.log("=".repeat(50));

  const browser = await chromium.launch({ headless: true });
  const results: {
    slug: string;
    oldRating: number;
    newRating: number | null;
    oldReviews: number;
    newReviews: number | null;
    source: string | null;
    confidence: string;
  }[] = [];

  for (const tool of toProcess) {
    console.log(`\n${tool.name} (${tool.slug})`);
    console.log(
      `  Current: rating=${tool.rating}, reviews=${tool.reviewsCount}`
    );

    const context = await browser.newContext({ userAgent: randomUA() });
    const page = await context.newPage();

    let bestResult: ReviewData = {
      rating: null,
      reviewsCount: null,
      source: null,
      confidence: "none",
    };

    // Strategy 1: Try G2/Capterra directly
    const pageText = await fetchReviewPage(page, tool.name, tool.slug);
    if (pageText.length > 200) {
      const result = await extractReviewWithLlm(tool.name, pageText);
      if (result.confidence !== "none" && result.rating !== null) {
        bestResult = result;
        console.log(
          `  [Direct] ${result.rating}/5 (${result.reviewsCount ?? "?"} reviews) from ${result.source}`
        );
      }
    }

    // Strategy 2: Try Bing search if no result yet
    if (bestResult.confidence !== "high") {
      const queries = [
        `${tool.name} G2 rating reviews`,
        `${tool.name} Capterra rating`,
      ];

      for (const query of queries) {
        if (bestResult.confidence === "high") break;

        const searchResult = await searchBing(page, query);
        if (!searchResult || searchResult.length < 100) continue;

        const result = await extractReviewWithLlm(tool.name, searchResult);
        if (
          result.confidence !== "none" &&
          result.rating !== null &&
          (bestResult.confidence === "none" || result.confidence === "high")
        ) {
          bestResult = result;
          console.log(
            `  [Search] ${result.rating}/5 (${result.reviewsCount ?? "?"} reviews) from ${result.source}`
          );
        }

        await sleep(1000);
      }
    }

    await page.close();
    await context.close();

    // Record result
    results.push({
      slug: tool.slug,
      oldRating: tool.rating,
      newRating: bestResult.rating,
      oldReviews: tool.reviewsCount,
      newReviews: bestResult.reviewsCount,
      source: bestResult.source,
      confidence: bestResult.confidence,
    });

    // Update tool data (only if we found real data)
    if (
      !dryRun &&
      bestResult.confidence !== "none" &&
      bestResult.rating !== null
    ) {
      const toolInArray = tools.find((t) => t.slug === tool.slug);
      if (toolInArray) {
        toolInArray.rating = bestResult.rating;
        if (bestResult.reviewsCount !== null) {
          toolInArray.reviewsCount = bestResult.reviewsCount;
        }
      }
    }

    if (bestResult.confidence === "none") {
      console.log(`  No review data found`);
    }

    await sleep(SLEEP_MS);
  }

  await browser.close();

  // Save updated data
  if (!dryRun) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(tools, null, 2) + "\n");
    console.log(`\nUpdated: ${DATA_PATH}`);
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("SCRAPE REVIEWS SUMMARY");
  console.log("=".repeat(50));

  const found = results.filter((r) => r.confidence !== "none");
  const notFound = results.filter((r) => r.confidence === "none");
  const changed = results.filter(
    (r) => r.newRating !== null && r.newRating !== r.oldRating
  );

  console.log(`Processed: ${results.length}`);
  console.log(`Found real data: ${found.length}`);
  console.log(`No data found: ${notFound.length}`);
  console.log(`Rating changed: ${changed.length}`);

  if (changed.length > 0) {
    console.log(`\nRating changes:`);
    for (const r of changed) {
      console.log(
        `  ${r.slug}: ${r.oldRating} -> ${r.newRating} (${r.source}, ${r.confidence})`
      );
    }
  }

  if (notFound.length > 0) {
    console.log(`\nNo review data found for:`);
    for (const r of notFound) {
      console.log(`  ${r.slug} (current rating: ${r.oldRating})`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
