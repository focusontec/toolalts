#!/usr/bin/env tsx
/**
 * scrape-pricing.ts — Real pricing data extraction using Playwright
 *
 * Visits actual pricing pages, extracts text content, then uses LLM
 * to structure the data into our tools.json schema.
 *
 * Usage:
 *   npx tsx scripts/scrape-pricing.ts                    # all tools
 *   npx tsx scripts/scrape-pricing.ts --slug notion      # single tool
 *   npx tsx scripts/scrape-pricing.ts --dry-run          # preview without saving
 */

import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { callLlm } from "./lib/llm";

const DATA_PATH = path.resolve(__dirname, "../data/tools.json");
const SLEEP_MS = 2000;

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

/**
 * Try multiple URL patterns to find a pricing page.
 * Returns the URL that loaded successfully with meaningful content.
 */
async function findPricingPage(
  page: any,
  websiteUrl: string
): Promise<{ url: string; text: string } | null> {
  let origin: string;
  try {
    origin = new URL(websiteUrl).origin;
  } catch {
    return null;
  }

  const candidates = [
    `${origin}/pricing`,
    `${origin}/pricing/`,
    `${origin}/plans`,
    `${origin}/plans/`,
    `${origin}/#pricing`,
  ];

  // Also try the homepage itself (many sites have pricing section on homepage)
  candidates.push(websiteUrl);

  for (const url of candidates) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
      // Wait a bit for JS to render
      await page.waitForTimeout(2000);

      const text = await page.evaluate(() => {
        // Try to find pricing-specific section first
        const selectors = [
          '[id*="pricing" i]',
          '[class*="pricing" i]',
          '[id*="plan" i]',
          '[class*="plan" i]',
          '[data-section*="pricing" i]',
          'section:has(h2:text-matches("pricing|plans", "i"))',
        ];

        for (const sel of selectors) {
          try {
            const el = document.querySelector(sel);
            if (el && el.textContent && el.textContent.length > 200) {
              return el.textContent.replace(/\s+/g, " ").trim().slice(0, 12000);
            }
          } catch {}
        }

        // Fallback: get all text from the page
        return document.body?.innerText?.replace(/\s+/g, " ").trim().slice(0, 12000) || "";
      });

      // Check if the text contains pricing-related keywords
      const hasPricing = /\$\d|€\d|£\d|free|pro|enterprise|starter|premium|per month|\/mo|\/year/i.test(text);
      if (hasPricing && text.length > 500) {
        return { url, text };
      }
    } catch {
      // Page didn't load, try next
    }
  }

  return null;
}

/**
 * Use LLM to extract structured pricing data from raw page text.
 */
async function extractPricingWithLlm(
  toolName: string,
  pageText: string,
  pageUrl: string
): Promise<{
  pricing: { plan: string; price: string; features: string[] }[];
  features: string[];
  tagline: string;
  description: string;
}> {
  const systemPrompt = `You are a data extraction specialist. Extract pricing and feature information from website text.

RULES:
- Only extract data that is ACTUALLY PRESENT in the text. Do NOT invent or infer.
- If pricing is not found, return an empty array.
- Extract the exact prices shown (e.g., "$10/mo", "Free", "Custom").
- Extract features from feature lists, comparison tables, or plan descriptions.
- Return ONLY valid JSON, no markdown code blocks.`;

  const userPrompt = `Extract pricing data from this webpage text.

Tool: ${toolName}
Page URL: ${pageUrl}

Text content:
---
${pageText.slice(0, 10000)}
---

Return JSON:
{
  "pricing": [
    {"plan": "Plan Name", "price": "$X/mo or Free", "features": ["feature1", "feature2"]}
  ],
  "features": ["key feature 1", "key feature 2", "key feature 3"],
  "tagline": "one-line tagline from the page, or empty string if not found",
  "description": "2-3 sentence description from the page, or empty string"
}`;

  try {
    const res = await callLlm(systemPrompt, userPrompt);
    const clean = res.content.replace(/```json\s*|```\s*$/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      pricing: Array.isArray(parsed.pricing) ? parsed.pricing : [],
      features: Array.isArray(parsed.features) ? parsed.features : [],
      tagline: parsed.tagline || "",
      description: parsed.description || "",
    };
  } catch (err) {
    console.error(`  ❌ LLM extraction failed:`, (err as Error).message);
    return { pricing: [], features: [], tagline: "", description: "" };
  }
}

/**
 * Compare old and new pricing, return a human-readable diff.
 */
function diffPricing(
  oldPricing: { plan: string; price: string }[],
  newPricing: { plan: string; price: string }[]
): string[] {
  const diffs: string[] = [];
  const oldMap = new Map(oldPricing.map((p) => [p.plan.toLowerCase(), p.price]));
  const newMap = new Map(newPricing.map((p) => [p.plan.toLowerCase(), p.price]));

  for (const [plan, price] of newMap) {
    const oldPrice = oldMap.get(plan);
    if (!oldPrice) {
      diffs.push(`  + ${plan}: ${price} (new)`);
    } else if (oldPrice !== price) {
      diffs.push(`  ~ ${plan}: ${oldPrice} → ${price}`);
    }
  }

  for (const [plan, price] of oldMap) {
    if (!newMap.has(plan)) {
      diffs.push(`  - ${plan}: ${price} (removed)`);
    }
  }

  return diffs;
}

async function main() {
  const { slug, dryRun } = parseArgs();

  const tools: ToolEntry[] = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const toProcess = slug
    ? tools.filter((t) => t.slug === slug)
    : tools.filter((t) => t.websiteUrl);

  if (toProcess.length === 0) {
    console.log("📭 No tools to process.");
    return;
  }

  console.log(`🔍 Scrape Pricing starting...`);
  console.log(`   Tools to process: ${toProcess.length}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   LLM: ${process.env.LLM_PROVIDER || "default"}`);

  const browser = await chromium.launch({ headless: true });
  const results: { slug: string; changed: boolean; diffs: string[] }[] = [];

  for (const tool of toProcess) {
    console.log(`\n📦 ${tool.name} (${tool.slug})`);
    console.log(`   Website: ${tool.websiteUrl}`);

    const page = await browser.newPage();
    let found: { url: string; text: string } | null = null;

    try {
      found = await findPricingPage(page, tool.websiteUrl);
    } catch (err) {
      console.warn(`  ⚠️ Failed to load pages:`, (err as Error).message);
    }

    if (!found) {
      console.log(`  ❌ No pricing page found`);
      await page.close();
      results.push({ slug: tool.slug, changed: false, diffs: ["  no pricing page found"] });
      continue;
    }

    console.log(`  ✅ Found pricing at: ${found.url}`);
    console.log(`  📄 Text length: ${found.text.length} chars`);

    // Extract structured data with LLM
    const extracted = await extractPricingWithLlm(tool.name, found.text, found.url);

    if (extracted.pricing.length === 0) {
      console.log(`  ⚠️ LLM could not extract pricing from page text`);
      await page.close();
      results.push({ slug: tool.slug, changed: false, diffs: ["  LLM extraction returned empty"] });
      continue;
    }

    // Show extracted data
    console.log(`  💰 Pricing plans: ${extracted.pricing.length}`);
    for (const p of extracted.pricing) {
      console.log(`     ${p.plan}: ${p.price} (${p.features.length} features)`);
    }
    console.log(`  🔧 Features: ${extracted.features.length}`);

    // Compare with existing data
    const diffs = diffPricing(tool.pricing, extracted.pricing);
    const hasChanges = diffs.length > 0 ||
      (extracted.features.length > 0 && JSON.stringify(extracted.features) !== JSON.stringify(tool.features));

    if (hasChanges) {
      console.log(`  📝 Changes detected:`);
      diffs.forEach((d) => console.log(d));
    } else {
      console.log(`  ✅ No changes needed`);
    }

    // Update tool data
    if (!dryRun && hasChanges) {
      const toolInArray = tools.find((t) => t.slug === tool.slug);
      if (toolInArray) {
        toolInArray.pricing = extracted.pricing;
        if (extracted.features.length > 0) {
          toolInArray.features = extracted.features;
        }
        if (extracted.tagline && !toolInArray.tagline) {
          toolInArray.tagline = extracted.tagline;
        }
        if (extracted.description && !toolInArray.description) {
          toolInArray.description = extracted.description;
        }
      }
    }

    await page.close();
    results.push({ slug: tool.slug, changed: hasChanges, diffs });
    await sleep(SLEEP_MS);
  }

  await browser.close();

  // Save updated data
  if (!dryRun) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(tools, null, 2) + "\n");
    console.log(`\n💾 Updated: ${DATA_PATH}`);
  }

  // Summary
  console.log(`\n${"═".repeat(50)}`);
  console.log(`📊 SCRAPE PRICING SUMMARY`);
  console.log(`${"═".repeat(50)}`);
  const changed = results.filter((r) => r.changed);
  console.log(`Processed: ${results.length}`);
  console.log(`Changed:   ${changed.length}`);
  console.log(`Unchanged: ${results.length - changed.length}`);

  if (changed.length > 0) {
    console.log(`\nChanges:`);
    for (const r of changed) {
      console.log(`\n  ${r.slug}:`);
      r.diffs.forEach((d) => console.log(d));
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
