#!/usr/bin/env tsx
/**
 * Content Opportunity Queue
 *
 * Finds active tools whose /alternative-to/{slug}/ pages are excluded from
 * sitemap, calculates a priority score for each, and outputs a structured
 * queue as JSON + Markdown.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ROOT = path.resolve(__dirname, "..");
const TOOLS_PATH = path.join(ROOT, "data", "tools.json");
const COMPARISONS_PATH = path.join(ROOT, "data", "comparisons.json");
const ALT_CONTENT_DIR = path.join(ROOT, "src", "content", "alternative-to");
const OUTPUT_JSON = path.join(ROOT, "data", "content-opportunities.json");
const OUTPUT_MD = path.join(ROOT, "docs", "content-opportunities.md");

const MIN_ALTERNATIVES_FOR_INDEX = 2;
const MIN_CONTENT_WORDS = 500;

const HIGH_INTENT_SLUGS = new Set([
  "docker", "postman", "supabase", "vercel", "cal-com", "resend",
  "unkey", "trigger-dev",
]);

const HIGH_VALUE_CATEGORIES = new Set([
  "development", "design", "project-management", "communication",
]);

type Tool = {
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
  category: string;
  status?: string;
};

type Comparison = {
  slug: string;
  toolA: string;
  toolB: string;
  category: string;
};

type Opportunity = {
  slug: string;
  name: string;
  category: string;
  activeAlternativesCount: number;
  contentWords: number;
  rating: number;
  reviewsCount: number;
  githubStars: number | null;
  websiteUrl: string;
  reason: string;
  suggestedAction: string;
  priorityScore: number;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function readMarkdownContent(slug: string): string | null {
  const filePath = path.join(ALT_CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return matter(fs.readFileSync(filePath, "utf-8")).content;
}

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function getActiveAlternatives(slug: string, comparisons: Comparison[], activeSlugs: Set<string>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const c of comparisons) {
    if (c.toolA === slug && activeSlugs.has(c.toolB) && !seen.has(c.toolB)) {
      seen.add(c.toolB);
      result.push(c.toolB);
    } else if (c.toolB === slug && activeSlugs.has(c.toolA) && !seen.has(c.toolA)) {
      seen.add(c.toolA);
      result.push(c.toolA);
    }
  }
  return result;
}

function calculatePriority(altCount: number, contentWords: number, tool: Tool): number {
  let score = 0;
  if (altCount === 1) score += 40;
  if (HIGH_INTENT_SLUGS.has(tool.slug)) score += 20;
  if (HIGH_VALUE_CATEGORIES.has(tool.category)) score += 15;
  if (tool.reviewsCount > 0 || tool.rating > 0) score += 10;
  if (tool.githubStars != null && tool.githubStars > 5000) score += 10;
  if (contentWords > 0) score += 5;
  return score;
}

function buildReason(altCount: number, contentWords: number): string {
  if (altCount === 0 && contentWords === 0) {
    return "No active alternatives and no supporting content";
  }
  const parts: string[] = [];
  if (altCount === 0) parts.push("no active alternatives");
  else if (altCount === 1) parts.push("1 active alternative (needs 2)");
  if (contentWords === 0) parts.push("no content");
  else parts.push(`${contentWords} content words (needs ${MIN_CONTENT_WORDS})`);
  return parts.join("; ");
}

function buildSuggestedAction(altCount: number, contentWords: number): string {
  if (altCount < MIN_ALTERNATIVES_FOR_INDEX && contentWords < MIN_CONTENT_WORDS) {
    return `Add ${MIN_ALTERNATIVES_FOR_INDEX - altCount} more comparison pair(s) or write ${MIN_CONTENT_WORDS}+ word content`;
  }
  return `Add ${MIN_ALTERNATIVES_FOR_INDEX - altCount} more comparison pair(s)`;
}

function generateMarkdown(opportunities: Opportunity[], totalActive: number, indexableCount: number): string {
  const lines: string[] = [];
  const coverage = totalActive > 0 ? Math.round((indexableCount / totalActive) * 100) : 0;

  lines.push("# Content Opportunities");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Active tools:** ${totalActive}`);
  lines.push(`- **Indexable alternative pages:** ${indexableCount}/${totalActive} (${coverage}%)`);
  lines.push(`- **Content opportunities:** ${opportunities.length}`);
  lines.push("");

  if (opportunities.length > 0) {
    lines.push("## Top 10 Priority Pages");
    lines.push("");
    lines.push("| # | Tool | Category | Alt Count | Content Words | Score |");
    lines.push("|---|------|----------|-----------|---------------|-------|");
    for (let i = 0; i < Math.min(10, opportunities.length); i++) {
      const o = opportunities[i];
      lines.push(`| ${i + 1} | ${o.name} | ${o.category} | ${o.activeAlternativesCount} | ${o.contentWords} | ${o.priorityScore} |`);
    }
    lines.push("");
  }

  lines.push("## All Opportunities");
  lines.push("");
  for (const o of opportunities) {
    lines.push(`### ${o.name} (\`${o.slug}\`)`);
    lines.push("");
    lines.push(`- **Category:** ${o.category}`);
    lines.push(`- **Priority score:** ${o.priorityScore}`);
    lines.push(`- **Active alternatives:** ${o.activeAlternativesCount}`);
    lines.push(`- **Content words:** ${o.contentWords}`);
    if (o.githubStars != null) lines.push(`- **GitHub stars:** ${o.githubStars.toLocaleString()}`);
    lines.push(`- **Why:** ${o.reason}`);
    lines.push(`- **Action:** ${o.suggestedAction}`);
    lines.push("");
  }

  if (opportunities.length > 0) {
    lines.push("## Suggested Next 3 Pages");
    lines.push("");
    for (let i = 0; i < Math.min(3, opportunities.length); i++) {
      const o = opportunities[i];
      lines.push(`${i + 1}. **${o.name}** — ${o.suggestedAction}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function main() {
  const tools = readJson<Tool[]>(TOOLS_PATH);
  const comparisons = readJson<Comparison[]>(COMPARISONS_PATH);
  const activeTools = tools.filter((t) => t.status === "active");
  const activeSlugs = new Set(activeTools.map((t) => t.slug));

  const opportunities: Opportunity[] = [];

  for (const tool of activeTools) {
    const activeAlternatives = getActiveAlternatives(tool.slug, comparisons, activeSlugs);
    const content = readMarkdownContent(tool.slug);
    const contentWords = content ? wordCount(content) : 0;
    const indexable = activeAlternatives.length >= MIN_ALTERNATIVES_FOR_INDEX || contentWords >= MIN_CONTENT_WORDS;

    if (indexable) continue;

    opportunities.push({
      slug: tool.slug,
      name: tool.name,
      category: tool.category,
      activeAlternativesCount: activeAlternatives.length,
      contentWords,
      rating: tool.rating,
      reviewsCount: tool.reviewsCount,
      githubStars: tool.githubStars,
      websiteUrl: tool.websiteUrl,
      reason: buildReason(activeAlternatives.length, contentWords),
      suggestedAction: buildSuggestedAction(activeAlternatives.length, contentWords),
      priorityScore: calculatePriority(activeAlternatives.length, contentWords, tool),
    });
  }

  opportunities.sort((a, b) => b.priorityScore - a.priorityScore);

  // Write JSON
  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(opportunities, null, 2) + "\n");

  // Write Markdown
  fs.mkdirSync(path.dirname(OUTPUT_MD), { recursive: true });
  const indexableCount = activeTools.length - opportunities.length;
  fs.writeFileSync(OUTPUT_MD, generateMarkdown(opportunities, activeTools.length, indexableCount));

  // Print summary
  console.log("Content Opportunities Summary");
  console.log(`  Active tools: ${activeTools.length}`);
  console.log(`  Indexable: ${indexableCount}/${activeTools.length}`);
  console.log(`  Opportunities: ${opportunities.length}`);
  console.log(`  Top priority: ${opportunities[0]?.name ?? "none"} (score ${opportunities[0]?.priorityScore ?? 0})`);
  console.log(`\n  Written to:`);
  console.log(`    ${OUTPUT_JSON}`);
  console.log(`    ${OUTPUT_MD}`);
}

main();
