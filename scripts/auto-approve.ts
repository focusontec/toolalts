#!/usr/bin/env tsx
/**
 * AutoClaw Auto-Approval Pipeline
 * Reads verified results and automatically adds APPROVED tools to tools.json
 * Also generates comparison entries for same-category tools.
 */

import fs from "fs";
import path from "path";

const VERIFIED_PATH = path.resolve(__dirname, "../data/verified-results.json");
const TOOLS_PATH = path.resolve(__dirname, "../data/tools.json");
const COMPARISONS_PATH = path.resolve(__dirname, "../data/comparisons.json");
const CATEGORIES_PATH = path.resolve(__dirname, "../data/categories.json");

interface Tool {
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

interface Comparison {
  slug: string;
  toolA: string;
  toolB: string;
  category: string;
}

function loadVerified(): any[] {
  if (!fs.existsSync(VERIFIED_PATH)) return [];
  return JSON.parse(fs.readFileSync(VERIFIED_PATH, "utf-8"));
}

function loadTools(): Tool[] {
  if (!fs.existsSync(TOOLS_PATH)) return [];
  return JSON.parse(fs.readFileSync(TOOLS_PATH, "utf-8"));
}

function loadComparisons(): Comparison[] {
  if (!fs.existsSync(COMPARISONS_PATH)) return [];
  return JSON.parse(fs.readFileSync(COMPARISONS_PATH, "utf-8"));
}

function saveTools(tools: Tool[]) {
  fs.writeFileSync(TOOLS_PATH, JSON.stringify(tools, null, 2));
}

function saveComparisons(comparisons: Comparison[]) {
  fs.writeFileSync(COMPARISONS_PATH, JSON.stringify(comparisons, null, 2));
}

function loadValidCategories(): Set<string> {
  if (!fs.existsSync(CATEGORIES_PATH)) return new Set();
  const cats = JSON.parse(fs.readFileSync(CATEGORIES_PATH, "utf-8"));
  return new Set(cats.map((c: any) => c.slug));
}

function validateTool(tool: Tool, validCategories: Set<string>): string[] {
  const errors: string[] = [];

  if (!tool.slug || typeof tool.slug !== "string") errors.push("missing or invalid slug");
  if (!tool.name || typeof tool.name !== "string") errors.push("missing or invalid name");
  if (!tool.tagline || typeof tool.tagline !== "string") errors.push("missing or invalid tagline");
  if (!tool.description || typeof tool.description !== "string") errors.push("missing or invalid description");
  if (typeof tool.rating !== "number" || tool.rating < 0 || tool.rating > 5) errors.push(`invalid rating: ${tool.rating}`);
  if (typeof tool.reviewsCount !== "number" || tool.reviewsCount < 0) errors.push(`invalid reviewsCount: ${tool.reviewsCount}`);
  if (!tool.websiteUrl || typeof tool.websiteUrl !== "string") errors.push("missing or invalid websiteUrl");

  if (!tool.category || !validCategories.has(tool.category)) {
    errors.push(`invalid category "${tool.category}" — must be one of: ${[...validCategories].join(", ")}`);
  }

  if (!Array.isArray(tool.pricing)) {
    errors.push("pricing must be an array");
  } else {
    tool.pricing.forEach((p, i) => {
      if (!p.plan) errors.push(`pricing[${i}].plan is missing`);
      if (!p.price) errors.push(`pricing[${i}].price is missing`);
    });
  }

  if (!Array.isArray(tool.features)) errors.push("features must be an array");

  return errors;
}

function verifiedToTool(v: any): Tool {
  const isOpenSource =
    v.category?.includes("open") ||
    (v.sources?.includes("github") && (v.qualityScore || 0) > 30);

  return {
    slug: v.slug,
    name: v.name,
    tagline: v.tagline || `${v.name} — ${v.category}`,
    description: v.description || v.tagline || "",
    rating: Math.min(5, Math.max(1, (v.qualityScore || 50) / 20)),
    reviewsCount: 0,
    openSource: isOpenSource,
    githubStars: v.rawData?.stars || null,
    githubUrl: v.github ? `https://github.com/${v.github}` : null,
    websiteUrl: v.website || `https://${v.slug}.com`,
    pricing: Array.isArray(v.pricing)
      ? v.pricing.map((p: any) => ({
          plan: p.plan || "Unknown",
          price: p.price || "?",
          features: Array.isArray(p.features) ? p.features : [],
        }))
      : [{ plan: "Free", price: "$0", features: ["Basic features"] }],
    features: Array.isArray(v.features) ? v.features : [],
    category: v.category || "other",
    logo: `/logos/${v.slug}.svg`,
  };
}

function generateComparisonsForCategory(
  tools: Tool[],
  category: string,
  existing: Comparison[]
): Comparison[] {
  const catTools = tools.filter((t) => t.category === category);
  const existingPairs = new Set(existing.map((c) => `${c.toolA}-${c.toolB}`));
  const newComparisons: Comparison[] = [];

  // Generate top-rated pairs within same category (limit to avoid explosion)
  const topTools = catTools.filter((t) => t.rating >= 3).slice(0, 8);
  for (let i = 0; i < topTools.length; i++) {
    for (let j = i + 1; j < topTools.length; j++) {
      const a = topTools[i].slug;
      const b = topTools[j].slug;
      const pairKey = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!existingPairs.has(pairKey)) {
        newComparisons.push({
          slug: `${a}-vs-${b}`,
          toolA: a,
          toolB: b,
          category,
        });
        existingPairs.add(pairKey);
      }
    }
  }

  return newComparisons;
}

async function main() {
  const verified = loadVerified();
  const tools = loadTools();
  const comparisons = loadComparisons();
  const existingSlugs = new Set(tools.map((t) => t.slug));

  const approved = verified.filter(
    (v) => v.decision === "APPROVE" && v.confidence >= 70 && !existingSlugs.has(v.slug)
  );

  const validCategories = loadValidCategories();

  console.log(`🔧 Auto-Approval Pipeline starting...`);
  console.log(`   Existing tools: ${tools.length}`);
  console.log(`   Verified results: ${verified.length}`);
  console.log(`   New approved to add: ${approved.length}`);

  if (approved.length === 0) {
    console.log("📭 No new approved tools to add.");
    return;
  }

  const newTools = approved.map(verifiedToTool);

  // Validate all new tools before writing
  const validationErrors: Map<string, string[]> = new Map();
  for (const tool of newTools) {
    const errors = validateTool(tool, validCategories);
    if (errors.length > 0) {
      validationErrors.set(tool.slug, errors);
    }
  }

  if (validationErrors.size > 0) {
    console.warn(`\n⚠️ Validation issues found:`);
    for (const [slug, errors] of validationErrors) {
      console.warn(`   ${slug}: ${errors.join("; ")}`);
    }
    console.warn(`   Tools with errors will still be added but need manual review.`);
  }

  const allTools = [...tools, ...newTools];

  // Generate new comparison pairs for affected categories
  const affectedCategories = new Set(newTools.map((t) => t.category));
  let newComparisons: Comparison[] = [];
  for (const cat of affectedCategories) {
    const catNew = generateComparisonsForCategory(allTools, cat, comparisons);
    newComparisons = [...newComparisons, ...catNew];
  }

  const allComparisons = [...comparisons, ...newComparisons];

  saveTools(allTools);
  saveComparisons(allComparisons);

  // Clear verified results to avoid re-processing
  fs.writeFileSync(VERIFIED_PATH, "[]");

  console.log(`\n✅ Pipeline complete:`);
  console.log(`   Tools added: ${newTools.length}`);
  console.log(`   New comparisons: ${newComparisons.length}`);
  console.log(`   Total tools: ${allTools.length}`);
  console.log(`   Total comparisons: ${allComparisons.length}`);

  for (const t of newTools) {
    console.log(`   + ${t.name} (${t.category}) — ${t.openSource ? "Open Source" : "Proprietary"}`);
  }
}

main().catch(console.error);
