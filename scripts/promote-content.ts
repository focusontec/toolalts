#!/usr/bin/env tsx
/**
 * Promote reviewed draft tools to the public index.
 *
 * This is intentionally rule-based. AI can produce drafts and recommendations,
 * but public promotion must pass deterministic quality gates first.
 */

import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");
const TOOLS_PATH = path.join(ROOT, "data", "tools.json");
const CATEGORIES_PATH = path.join(ROOT, "data", "categories.json");

const MIN_DESCRIPTION_CHARS = 120;
const MIN_TAGLINE_CHARS = 24;
const MIN_FEATURES = 4;
const MIN_SCORE_TO_PROMOTE = 85;

const GITHUB_PLACEHOLDER_FEATURES = [
  "Unlimited public/private repositories",
  "Dependabot security and version updates",
  "2,000 CI/CD minutes",
  "500MB of Packages storage",
  "GitHub Codespaces Access",
];

const SOURCE_HOSTS_REQUIRING_REVIEW = new Set([
  "github.com",
  "gitlab.com",
  "bitbucket.org",
]);

const LOW_VALUE_PRODUCT_PHRASES = [
  /powerful (tool|platform|solution)/i,
  /all-in-one/i,
  /streamline your workflow/i,
  /boost productivity/i,
  /seamless integration/i,
];

type ToolStatus = "active" | "draft" | "review" | "hidden" | "removed";

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
  pricing: { plan: string; price: string; features: string[] }[];
  features: string[];
  category: string;
  logo: string;
  status: ToolStatus;
};

type Category = {
  slug: string;
  name: string;
};

type Assessment = {
  score: number;
  errors: string[];
  warnings: string[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    slug: getArgValue(args, "--slug"),
    all: args.includes("--all"),
    apply: args.includes("--apply"),
    forceAll: args.includes("--force-all"),
  };
}

function getArgValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function isValidUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function hasBadGithubUrl(tool: Tool): boolean {
  return typeof tool.githubUrl === "string" && /github\.com\/undefined\/?$/.test(tool.githubUrl);
}

function hasPlaceholderProductText(tool: Tool): boolean {
  const serialized = JSON.stringify({
    features: tool.features,
    pricing: tool.pricing,
  });
  if (GITHUB_PLACEHOLDER_FEATURES.some((phrase) => serialized.includes(phrase))) return true;
  return serialized.includes("Basic features") || serialized.includes("\"Unknown\"") || serialized.includes("\"?\"");
}

function getHostname(value: string): string | null {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function usesSourceHostAsWebsite(tool: Tool): boolean {
  const hostname = getHostname(tool.websiteUrl);
  if (!hostname) return false;
  if (!SOURCE_HOSTS_REQUIRING_REVIEW.has(hostname)) return false;
  return !tool.name.toLowerCase().startsWith("github ");
}

function hasLowValueProductCopy(tool: Tool): boolean {
  const text = [
    tool.tagline,
    tool.description,
    ...(Array.isArray(tool.features) ? tool.features : []),
  ].join(" ");
  return LOW_VALUE_PRODUCT_PHRASES.some((phrase) => phrase.test(text));
}

function assessTool(tool: Tool, categorySlugs: Set<string>): Assessment {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (tool.status !== "draft" && tool.status !== "review") errors.push("tool is not draft/review");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tool.slug)) errors.push("invalid slug");
  if (!tool.name?.trim()) errors.push("missing name");
  if (!categorySlugs.has(tool.category)) errors.push(`unknown category: ${tool.category}`);
  if (!isValidUrl(tool.websiteUrl)) errors.push("missing or invalid websiteUrl");
  if (hasBadGithubUrl(tool)) errors.push("invalid githubUrl");
  if (hasPlaceholderProductText(tool)) errors.push("contains GitHub default feature/pricing text");
  if (usesSourceHostAsWebsite(tool)) errors.push("websiteUrl is only a source-code host; needs official product page or manual review");

  if ((tool.tagline || "").trim().length < MIN_TAGLINE_CHARS) warnings.push("tagline is too short");
  if ((tool.description || "").trim().length < MIN_DESCRIPTION_CHARS) warnings.push("description is too short");
  if (!Array.isArray(tool.features) || tool.features.length < MIN_FEATURES) warnings.push("not enough product-specific features");
  if (!Array.isArray(tool.pricing) || tool.pricing.length === 0) {
    warnings.push("missing pricing");
  } else if (tool.pricing.some((plan) => !plan.plan || !plan.price || plan.price === "?" || plan.plan === "Unknown")) {
    warnings.push("incomplete pricing");
  }
  if (tool.category === "other") warnings.push("category is too broad");
  if (tool.rating === 0 && tool.reviewsCount === 0) warnings.push("no review/rating signal");
  if (hasLowValueProductCopy(tool)) warnings.push("generic marketing copy detected");

  const score = Math.max(0, 100 - errors.length * 35 - warnings.length * 5);
  return { score, errors, warnings };
}

function main() {
  const { slug, all, apply, forceAll } = parseArgs();
  const tools = readJson<Tool[]>(TOOLS_PATH);
  const categories = readJson<Category[]>(CATEGORIES_PATH);
  const categorySlugs = new Set(categories.map((category) => category.slug));

  if (!slug && !all) {
    console.log("Usage: npx tsx scripts/promote-content.ts --all [--apply]");
    console.log("   or: npx tsx scripts/promote-content.ts --slug <tool-slug> [--apply]");
    console.log("   bulk apply requires: --all --apply --force-all");
    console.log("\nNo changes made. Pass --apply to write promotions.");
    return;
  }

  if (apply && all && !forceAll) {
    console.error("Refusing bulk promotion without --force-all.");
    console.error("Use --slug <tool-slug> --apply for normal publishing, or --all --apply --force-all after manual review.");
    process.exit(1);
  }

  const candidates = tools.filter((tool) => {
    if (slug) return tool.slug === slug;
    return tool.status === "draft" || tool.status === "review";
  });

  if (candidates.length === 0) {
    console.log("No matching draft tools found.");
    return;
  }

  let promoted = 0;
  let blocked = 0;

  for (const tool of candidates) {
    const assessment = assessTool(tool, categorySlugs);
    const eligible = assessment.errors.length === 0 && assessment.score >= MIN_SCORE_TO_PROMOTE;
    const status = eligible ? "ELIGIBLE" : "BLOCKED";

    console.log(`\n${status}: ${tool.slug} (${tool.name})`);
    console.log(`  score: ${assessment.score}/100`);
    if (assessment.errors.length > 0) console.log(`  errors: ${assessment.errors.join("; ")}`);
    if (assessment.warnings.length > 0) console.log(`  warnings: ${assessment.warnings.join("; ")}`);

    if (eligible) {
      if (apply) tool.status = "active";
      promoted++;
    } else {
      blocked++;
    }
  }

  if (apply && promoted > 0) {
    fs.writeFileSync(TOOLS_PATH, JSON.stringify(tools, null, 2) + "\n");
  }

  console.log("\nPromotion summary");
  console.log(`- candidates: ${candidates.length}`);
  console.log(`- eligible: ${promoted}`);
  console.log(`- blocked: ${blocked}`);
  console.log(`- mode: ${apply ? "apply" : "dry-run"}`);
}

main();
