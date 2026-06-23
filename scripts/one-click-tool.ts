#!/usr/bin/env tsx
/**
 * One-Click Tool Pipeline
 *
 * Given a tool URL, automatically:
 * 1. Scrape the website
 * 2. Extract structured data via LLM
 * 3. Enrich with GitHub data
 * 4. Generate analysis report
 * 5. Generate SEO blog post
 * 6. Write all outputs to the repo
 *
 * Usage:
 *   npx tsx scripts/one-click-tool.ts "https://linear.app"
 *   npx tsx scripts/one-click-tool.ts "https://linear.app" --github "linear/linear"
 *   npx tsx scripts/one-click-tool.ts "https://linear.app" --no-blog
 *   npx tsx scripts/one-click-tool.ts "https://linear.app" --dry-run
 *   npx tsx scripts/one-click-tool.ts "https://linear.app" --category project-management
 */

import fs from "fs";
import path from "path";
import { loadLocalEnv } from "./lib/env";

loadLocalEnv();

import { scrapeTool } from "./pipeline/scrape-tool";
import { extractToolData } from "./pipeline/extract-tool-data";
import { enrichTool } from "./pipeline/enrich-tool";
import { generateToolReport } from "./pipeline/generate-tool-report";
import { generateToolBlog } from "./pipeline/generate-tool-blog";
import { analyzeToolScreenshot } from "./lib/llm";

const PENDING_PATH = path.resolve(__dirname, "../data/pending-tools.json");
const REPORTS_DIR = path.resolve(__dirname, "../src/content/reports");
const BLOG_DIR = path.resolve(__dirname, "../src/content/blog");

interface CliArgs {
  url: string;
  github?: string;
  category?: string;
  dryRun: boolean;
  noBlog: boolean;
  scrapeOnly: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const url = args.find((a) => !a.startsWith("--"));
  if (!url) {
    console.error("Usage: npx tsx scripts/one-click-tool.ts <url> [--github owner/repo] [--category cat] [--dry-run] [--no-blog] [--scrape-only]");
    process.exit(1);
  }

  const parsed: CliArgs = { url, dryRun: false, noBlog: false, scrapeOnly: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--github" && args[i + 1]) parsed.github = args[++i];
    if (args[i] === "--category" && args[i + 1]) parsed.category = args[++i];
    if (args[i] === "--dry-run") parsed.dryRun = true;
    if (args[i] === "--no-blog") parsed.noBlog = true;
    if (args[i] === "--scrape-only") parsed.scrapeOnly = true;
  }
  return parsed;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadJson<T>(filepath: string, fallback: T): T {
  if (!fs.existsSync(filepath)) return fallback;
  return JSON.parse(fs.readFileSync(filepath, "utf-8"));
}

function saveJson(filepath: string, data: any) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + "\n");
}

function saveMarkdown(dir: string, slug: string, content: string) {
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, `${slug}.md`), content);
}

async function main() {
  const args = parseArgs();

  console.log("=".repeat(60));
  console.log("One-Click Tool Pipeline");
  console.log("=".repeat(60));
  console.log(`URL: ${args.url}`);
  if (args.github) console.log(`GitHub: ${args.github}`);
  if (args.category) console.log(`Category: ${args.category}`);
  console.log(`Mode: ${args.dryRun ? "DRY RUN" : args.scrapeOnly ? "SCRAPE ONLY" : "FULL"}`);
  console.log("=".repeat(60));

  // Stage 1: Scrape
  console.log("\n[Stage 1/6] Scraping website...");
  const screenshotDir = path.resolve(__dirname, "../public/images/tools");
  const scraped = await scrapeTool(args.url, screenshotDir);
  console.log(`  Title: ${scraped.title}`);
  console.log(`  Description: ${scraped.description.slice(0, 100)}...`);
  console.log(`  Page text: ${scraped.pageText.length} chars`);
  console.log(`  Pricing page: ${scraped.pricingPageText ? "found" : "not found"}`);
  console.log(`  Features page: ${scraped.featuresPageText ? "found" : "not found"}`);
  console.log(`  Screenshot: ${scraped.screenshotPath ? "captured" : "skipped"}`);

  // Stage 1.5: Vision analysis (uses mimo-v2.5 for image understanding)
  let screenshotAnalysis: { description: string; uiQuality: string; keyElements: string[] } | null = null;
  if (scraped.screenshotPath && process.env.VISION_MODEL) {
    console.log("\n[Stage 1.5] Analyzing screenshot with vision model...");
    try {
      screenshotAnalysis = await analyzeToolScreenshot(scraped.screenshotPath, scraped.title || "Unknown Tool");
      console.log(`  UI Quality: ${screenshotAnalysis.uiQuality}`);
      console.log(`  Key Elements: ${screenshotAnalysis.keyElements.join(", ")}`);
    } catch (err) {
      console.log(`  Vision analysis skipped: ${(err as Error).message}`);
    }
  }

  if (args.scrapeOnly) {
    console.log("\n[Scrape Only] Output:");
    console.log(JSON.stringify(scraped, null, 2).slice(0, 3000));
    return;
  }

  // Stage 2: Extract
  console.log("\n[Stage 2/6] Extracting structured data...");
  const extracted = await extractToolData(scraped);
  if (args.category) extracted.category = args.category;
  console.log(`  Name: ${extracted.name}`);
  console.log(`  Category: ${extracted.category}`);
  console.log(`  Features: ${extracted.features.length}`);
  console.log(`  Pricing tiers: ${extracted.pricing.length}`);

  // Stage 3: Enrich
  console.log("\n[Stage 3/6] Enriching data...");
  const enriched = await enrichTool(extracted, args.url, args.github);
  console.log(`  Slug: ${enriched.slug}`);
  console.log(`  GitHub Stars: ${enriched.githubStars ?? "N/A"}`);
  console.log(`  Duplicate: ${enriched.isDuplicate ? `YES (existing: ${enriched.existingSlug})` : "no"}`);

  if (enriched.isDuplicate) {
    console.log("\n⚠ Tool already exists in tools.json. Skipping data write.");
    console.log("  Continuing with report and blog generation...");
  }

  // Stage 4: Report
  console.log("\n[Stage 4/6] Generating analysis report...");
  const report = await generateToolReport(enriched);
  console.log(`  Title: ${report.title}`);
  console.log(`  Overall Score: ${report.scores.overall}/10`);
  console.log(`  Pros: ${report.pros.length}, Cons: ${report.cons.length}`);

  // Stage 5: Blog
  let blog = null;
  if (!args.noBlog) {
    console.log("\n[Stage 5/6] Generating blog post...");
    blog = await generateToolBlog(enriched, report);
    console.log(`  Title: ${blog.title}`);
    console.log(`  Tags: ${blog.tags.join(", ")}`);
    console.log(`  Length: ${blog.markdown.length} chars`);
  } else {
    console.log("\n[Stage 5/6] Skipping blog (--no-blog)");
  }

  // Stage 6: Write outputs
  console.log("\n[Stage 6/6] Writing outputs...");

  if (args.dryRun) {
    console.log("\n[DRY RUN] Would write:");
    console.log(`  - pending-tools.json: +1 entry (${enriched.slug})`);
    console.log(`  - reports/${enriched.slug}.md`);
    if (blog) console.log(`  - blog/${blog.slug}.md`);
    console.log("\n[DRY RUN] Extracted data:");
    console.log(JSON.stringify(extracted, null, 2));
    console.log("\n[DRY RUN] Report summary:");
    console.log(`  Score: ${report.scores.overall}/10`);
    console.log(`  Pros: ${report.pros.join("; ")}`);
    console.log(`  Cons: ${report.cons.join("; ")}`);
    return;
  }

  // Write to pending-tools.json (if not duplicate)
  if (!enriched.isDuplicate) {
    const pending = loadJson<any[]>(PENDING_PATH, []);
    pending.push({
      slug: enriched.slug,
      name: enriched.name,
      source: "one-click",
      website: enriched.websiteUrl,
      github: enriched.githubUrl,
      category: enriched.category,
      discoveredAt: new Date().toISOString(),
    });
    saveJson(PENDING_PATH, pending);
    console.log(`  ✓ Added to pending-tools.json (${enriched.slug})`);
  }

  // Write report
  saveMarkdown(REPORTS_DIR, enriched.slug, report.markdown);
  console.log(`  ✓ Saved report: reports/${enriched.slug}.md`);

  // Write blog
  if (blog) {
    saveMarkdown(BLOG_DIR, blog.slug, blog.markdown);
    console.log(`  ✓ Saved blog: blog/${blog.slug}.md`);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("Pipeline Complete!");
  console.log("=".repeat(60));
  console.log(`Tool: ${enriched.name} (${enriched.slug})`);
  console.log(`Report: src/content/reports/${enriched.slug}.md`);
  if (blog) console.log(`Blog: src/content/blog/${blog.slug}.md`);
  console.log(`Pending: ${!enriched.isDuplicate ? "added to review queue" : "already exists"}`);
  console.log("\nNext steps:");
  console.log("  1. Review the generated content");
  console.log("  2. Run ai-verify.ts to verify the tool");
  console.log("  3. Run auto-approve.ts to add to tools.json");
  console.log("  4. Commit and push to deploy");
}

main().catch((error) => {
  console.error("\nPipeline failed:", error.message);
  process.exit(1);
});
