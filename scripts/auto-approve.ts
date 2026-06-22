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
  status?: string;
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
  fs.writeFileSync(COMPARISONS_PATH, JSON.stringify(comparisons, null, 2) + "\n");
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

  // Website URL validation - reject empty or auto-generated URLs
  if (!tool.websiteUrl || typeof tool.websiteUrl !== "string") {
    errors.push("missing websiteUrl — tool must have a real URL");
  } else {
    const domain = tool.websiteUrl.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
    const slugAsDomain = tool.slug.replace(/-/g, "") + ".com";
    if (domain === slugAsDomain || domain === tool.slug + ".com") {
      errors.push(`websiteUrl "${tool.websiteUrl}" appears auto-generated from slug`);
    }
  }

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

// Features that belong to GitHub's free plan, not to individual tools.
// The LLM sometimes copies these from the GitHub page instead of the tool's own features.
const GITHUB_PLATFORM_FEATURES = new Set([
  "Unlimited public/private repositories",
  "Dependabot security and version updates",
  "2,000 CI/CD minutes",
  "2,000 CI/CD minutes/month",
  "500MB of Packages storage",
  "GitHub Codespaces Access",
  "Issues & Projects",
  "Community support",
]);

function filterGitHubFeatures(features: string[]): string[] {
  return features.filter((f) => !GITHUB_PLATFORM_FEATURES.has(f));
}

function verifiedToTool(v: any): Tool {
  const isOpenSource =
    v.category?.includes("open") ||
    (v.sources?.includes("github") && (v.qualityScore || 0) > 30);

  // Use website from ai-verify result (already validated), NO fake URL fallback
  const websiteUrl = v.website || "";

  // github may be a full URL from ai-verify or a slug like "owner/repo"
  let githubUrl: string | null = null;
  if (v.github) {
    githubUrl = v.github.startsWith("http") ? v.github : `https://github.com/${v.github}`;
  }

  return {
    slug: v.slug,
    name: v.name,
    tagline: v.tagline || `${v.name} — ${v.category}`,
    description: v.description || v.tagline || "",
    rating: 0, // Will be populated by scrape-reviews.ts with real data
    reviewsCount: 0,
    openSource: isOpenSource,
    githubStars: v.rawData?.stars || null,
    githubUrl,
    websiteUrl,
    pricing: Array.isArray(v.pricing)
      ? v.pricing.map((p: any) => ({
          plan: p.plan || "Unknown",
          price: p.price || "?",
          features: Array.isArray(p.features) ? filterGitHubFeatures(p.features) : [],
        }))
      : [{ plan: "Free", price: "$0", features: [] }],
    features: Array.isArray(v.features) ? filterGitHubFeatures(v.features) : [],
    category: v.category || "other",
    logo: `/logos/${v.slug}.svg`,
    // New discoveries need editorial review before they can enter public index.
    status: "draft",
  };
}

function generateComparisonsForCategory(
  tools: Tool[],
  category: string,
  existing: Comparison[]
): Comparison[] {
  // Only include active tools — never generate comparisons for draft/hidden/removed
  const catTools = tools.filter((t) => t.category === category && t.status === "active");

  // Build normalized pair keys from existing comparisons to prevent duplicates
  const existingPairs = new Set(
    existing.map((c) => {
      const pair = [c.toolA, c.toolB].sort();
      return `${pair[0]}-${pair[1]}`;
    })
  );

  const newComparisons: Comparison[] = [];
  const MAX_COMPARISONS_PER_CATEGORY = 10;

  // Pick top-rated tools, cap to prevent combinatorial explosion
  const topTools = catTools.filter((t) => t.rating >= 3).slice(0, 6);
  for (let i = 0; i < topTools.length; i++) {
    for (let j = i + 1; j < topTools.length; j++) {
      if (newComparisons.length >= MAX_COMPARISONS_PER_CATEGORY) break;
      const pair = [topTools[i].slug, topTools[j].slug].sort();
      const pairKey = `${pair[0]}-${pair[1]}`;
      if (!existingPairs.has(pairKey)) {
        newComparisons.push({
          slug: `${pair[0]}-vs-${pair[1]}`,
          toolA: pair[0],
          toolB: pair[1],
          category,
        });
        existingPairs.add(pairKey);
      }
    }
    if (newComparisons.length >= MAX_COMPARISONS_PER_CATEGORY) break;
  }

  return newComparisons;
}

async function main() {
  const verified = loadVerified();
  const tools = loadTools();
  let comparisons = loadComparisons();
  const existingSlugs = new Set(tools.map((t) => t.slug));

  console.log(`🔧 Auto-Approval Pipeline starting...`);
  console.log(`   Existing tools: ${tools.length}`);
  console.log(`   Verified results: ${verified.length}`);

  // Always run comparison cleanup: dedup + remove entries referencing inactive tools
  const activeSlugs = new Set(tools.filter((t) => t.status === "active").map((t) => t.slug));
  const seenPairs = new Set<string>();
  const beforeCount = comparisons.length;
  comparisons = comparisons.filter((c) => {
    if (!activeSlugs.has(c.toolA) || !activeSlugs.has(c.toolB)) return false;
    const pair = [c.toolA, c.toolB].sort();
    const key = `${pair[0]}-${pair[1]}`;
    if (seenPairs.has(key)) return false;
    seenPairs.add(key);
    return true;
  });
  if (comparisons.length < beforeCount) {
    console.log(`   Comparison cleanup: ${beforeCount} → ${comparisons.length} (removed ${beforeCount - comparisons.length} inactive/duplicate)`);
    saveComparisons(comparisons);
  }

  const approved = verified.filter(
    (v) => v.decision === "APPROVE" && v.confidence >= 80 && !existingSlugs.has(v.slug)
  );

  console.log(`   New verified drafts to ingest: ${approved.length}`);

  if (approved.length === 0) {
    console.log("📭 No new verified tools to ingest.");
    return;
  }

  const validCategories = loadValidCategories();
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
  }

  // Filter out tools with critical validation errors (missing/fake URLs)
  const validTools = newTools.filter((tool) => {
    const errors = validationErrors.get(tool.slug) || [];
    const hasCriticalError = errors.some(
      (e) => e.includes("missing websiteUrl") || e.includes("auto-generated")
    );
    if (hasCriticalError) {
      console.warn(`   ❌ SKIPPED ${tool.slug}: has critical URL issues`);
    }
    return !hasCriticalError;
  });

  const skippedCount = newTools.length - validTools.length;
  if (skippedCount > 0) {
    console.warn(`\n   Skipped ${skippedCount} tools with missing/fake URLs.`);
    console.warn(`   Fix their URLs in verified-results.json and re-run auto-approve.`);
  }

  const allTools = [...tools, ...validTools];

  // Comparison generation only uses active tools. Newly ingested tools stay draft
  // until reviewed, so they cannot expand the public index automatically.
  const affectedCategories = new Set(validTools.map((t) => t.category));
  let newComparisons: Comparison[] = [];
  for (const cat of affectedCategories) {
    const catNew = generateComparisonsForCategory(allTools, cat, comparisons);
    newComparisons = [...newComparisons, ...catNew];
  }

  const allComparisonsRaw = [...comparisons, ...newComparisons];

  // Deduplicate by normalized pair key, but PRESERVE the first record's original slug
  const seenPairs2 = new Set<string>();
  const allComparisons: Comparison[] = [];
  for (const c of allComparisonsRaw) {
    const pair = [c.toolA, c.toolB].sort();
    const key = `${pair[0]}-${pair[1]}`;
    if (!seenPairs2.has(key)) {
      seenPairs2.add(key);
      allComparisons.push(c); // Keep original slug, toolA, toolB
    }
  }

  saveTools(allTools);
  saveComparisons(allComparisons);

  // Clear verified results to avoid re-processing
  fs.writeFileSync(VERIFIED_PATH, "[]");

  console.log(`\n✅ Pipeline complete:`);
  console.log(`   Draft tools ingested: ${validTools.length}`);
  console.log(`   Tools skipped (URL issues): ${skippedCount}`);
  console.log(`   New comparisons: ${newComparisons.length}`);
  console.log(`   Total tools: ${allTools.length}`);
  console.log(`   Total comparisons: ${allComparisons.length}`);

  for (const t of validTools) {
    console.log(`   + ${t.name} (${t.category}) — draft, ${t.openSource ? "Open Source" : "Proprietary"}`);
  }
}

main().catch(console.error);
