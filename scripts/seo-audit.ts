#!/usr/bin/env tsx
/**
 * Local SEO guardrail for the public index surface.
 *
 * This does not replace GSC or a full crawler. It catches the issues that hurt
 * ToolAlts most today: sitemap pollution, duplicate public URLs, draft tools in
 * public routes, empty alternatives pages, broken internal links, and markdown
 * frontmatter leaks.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ROOT = path.resolve(__dirname, "..");
const TOOLS_PATH = path.join(ROOT, "data", "tools.json");
const COMPARISONS_PATH = path.join(ROOT, "data", "comparisons.json");
const CATEGORIES_PATH = path.join(ROOT, "data", "categories.json");
const CONTENT_DIR = path.join(ROOT, "src", "content");
const SEARCH_PAGE_PATH = path.join(ROOT, "src", "app", "search", "page.tsx");
const BASE_URL = "https://www.toolalts.dev";

const MIN_ALTERNATIVES_FOR_INDEX = 2;
const MIN_ALT_CONTENT_WORDS = 500;
const MIN_COMPARISON_CONTENT_WORDS = 300;
const MIN_ACTIVE_TOOL_FEATURES = 3;
const MIN_ACTIVE_TOOL_DESCRIPTION_CHARS = 80;
const CONTENT_SECTIONS_TO_SCAN = [
  "alternative-to",
  "blog",
  "compare",
  "comparisons",
  "migration-guides",
  "reports",
];
const GITHUB_PLACEHOLDER_FEATURES = [
  "Unlimited public/private repositories",
  "Dependabot security and version updates",
  "2,000 CI/CD minutes",
  "500MB of Packages storage",
  "GitHub Codespaces Access",
];
const LOW_VALUE_CONTENT_PATTERNS = [
  /both tools are solid choices/i,
  /both .* are popular .* tools/i,
  /consider .* if you need/i,
  /it depends on your needs/i,
  /ultimately,? the best choice/i,
];

type Tool = {
  slug: string;
  name: string;
  status?: string;
  category: string;
  tagline?: string;
  description?: string;
  websiteUrl?: string;
  githubUrl?: string | null;
  features?: string[];
  pricing?: { plan?: string; price?: string; features?: string[] }[];
};

type Comparison = {
  slug: string;
  toolA: string;
  toolB: string;
  category: string;
};

type Category = {
  slug: string;
  name: string;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function readMarkdownContent(section: string, slug: string): string | null {
  const filePath = path.join(CONTENT_DIR, section, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return matter(raw).content;
}

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function pushUrl(urls: string[], pathName: string) {
  urls.push(`${BASE_URL}${pathName}`);
}

function listMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(entryPath);
    return entry.name.endsWith(".md") ? [entryPath] : [];
  });
}

function normalizeInternalRoute(href: string): string | null {
  if (!href.startsWith("/") || href.startsWith("//")) return null;

  const [pathName] = href.split(/[?#]/);
  if (!pathName || /\.[a-zA-Z0-9]+$/.test(pathName)) return null;

  return pathName.endsWith("/") ? pathName : `${pathName}/`;
}

function findInternalRoutes(content: string): string[] {
  const routes = new Set<string>();
  const linkPattern = /!?\[[^\]]*\]\((\/[^)\s]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(content)) !== null) {
    const route = normalizeInternalRoute(match[1]);
    if (route) routes.add(route);
  }

  return [...routes];
}

function hasBadGithubUrl(tool: Tool): boolean {
  return typeof tool.githubUrl === "string" && /github\.com\/undefined\/?$/.test(tool.githubUrl);
}

function hasRealWebsite(tool: Tool): boolean {
  if (!tool.websiteUrl) return false;
  try {
    const url = new URL(tool.websiteUrl);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function getActiveToolQualityIssues(tool: Tool): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const features = tool.features ?? [];
  const pricing = tool.pricing ?? [];
  const serialized = JSON.stringify({ features, pricing });

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tool.slug)) {
    errors.push(`Active tool "${tool.slug}" has an invalid slug.`);
  }
  if (!hasRealWebsite(tool)) {
    errors.push(`Active tool "${tool.slug}" is missing a valid websiteUrl.`);
  }
  if (hasBadGithubUrl(tool)) {
    errors.push(`Active tool "${tool.slug}" has invalid githubUrl "${tool.githubUrl}".`);
  }
  if ((tool.description ?? "").trim().length < MIN_ACTIVE_TOOL_DESCRIPTION_CHARS) {
    warnings.push(`Active tool "${tool.slug}" has a short description.`);
  }
  if (features.length < MIN_ACTIVE_TOOL_FEATURES) {
    warnings.push(`Active tool "${tool.slug}" has fewer than ${MIN_ACTIVE_TOOL_FEATURES} features.`);
  }
  if (GITHUB_PLACEHOLDER_FEATURES.some((phrase) => serialized.includes(phrase))) {
    warnings.push(`Active tool "${tool.slug}" may contain GitHub default feature/pricing text.`);
  }
  if (pricing.length === 0 || pricing.some((plan) => plan.price === "?" || plan.plan === "Unknown")) {
    warnings.push(`Active tool "${tool.slug}" has incomplete pricing data.`);
  }

  return { errors, warnings };
}

function getContentQualityWarnings(relativePath: string, content: string): string[] {
  const warnings: string[] = [];
  if (!relativePath.includes(`${path.sep}comparisons${path.sep}`) && !relativePath.includes(`${path.sep}blog${path.sep}`)) {
    return warnings;
  }

  for (const pattern of LOW_VALUE_CONTENT_PATTERNS) {
    if (pattern.test(content)) {
      warnings.push(`Low-value AI-style phrasing in ${relativePath}: ${pattern.source}`);
    }
  }

  return warnings;
}

function main() {
  const tools = readJson<Tool[]>(TOOLS_PATH);
  const comparisons = readJson<Comparison[]>(COMPARISONS_PATH);
  const categories = readJson<Category[]>(CATEGORIES_PATH);

  const errors: string[] = [];
  const warnings: string[] = [];
  const activeTools = tools.filter((tool) => tool.status === "active");
  const activeSlugs = new Set(activeTools.map((tool) => tool.slug));
  const categorySlugs = new Set(categories.map((category) => category.slug));

  for (const tool of activeTools) {
    if (!categorySlugs.has(tool.category)) {
      errors.push(`Active tool "${tool.slug}" uses unknown category "${tool.category}".`);
    }
    const qualityIssues = getActiveToolQualityIssues(tool);
    errors.push(...qualityIssues.errors);
    warnings.push(...qualityIssues.warnings);
  }

  const comparisonSlugCounts = new Map<string, number>();
  for (const comparison of comparisons) {
    comparisonSlugCounts.set(comparison.slug, (comparisonSlugCounts.get(comparison.slug) ?? 0) + 1);
  }

  for (const [slug, count] of comparisonSlugCounts) {
    if (count > 1) {
      warnings.push(`Raw data has duplicate comparison slug "${slug}" (${count} entries).`);
    }
  }

  const publicComparisons: Comparison[] = [];
  const publicComparisonSlugs = new Set<string>();
  for (const comparison of comparisons) {
    if (publicComparisonSlugs.has(comparison.slug)) continue;
    if (!activeSlugs.has(comparison.toolA) || !activeSlugs.has(comparison.toolB)) {
      warnings.push(
        `Comparison "${comparison.slug}" references inactive tool(s): ${comparison.toolA}, ${comparison.toolB}.`
      );
      continue;
    }
    publicComparisonSlugs.add(comparison.slug);
    publicComparisons.push(comparison);
  }

  const indexableComparisonSlugs = publicComparisons
    .filter((comparison) => {
      const content = readMarkdownContent("comparisons", comparison.slug);
      if (!content) {
        warnings.push(`Public comparison "${comparison.slug}" has no markdown content.`);
        return false;
      }
      const words = wordCount(content);
      if (words < MIN_COMPARISON_CONTENT_WORDS) {
        warnings.push(`Public comparison "${comparison.slug}" is thin (${words} words).`);
        return false;
      }
      if (/^---\s*$/m.test(content.slice(0, 20))) {
        errors.push(`Comparison "${comparison.slug}" content still exposes frontmatter.`);
      }
      return true;
    })
    .map((comparison) => comparison.slug);

  const indexableAlternativeSlugs = activeTools
    .filter((tool) => {
      const alternatives = comparisons
        .filter((comparison) => comparison.toolA === tool.slug || comparison.toolB === tool.slug)
        .map((comparison) => (comparison.toolA === tool.slug ? comparison.toolB : comparison.toolA))
        .filter((slug, index, slugs) => activeSlugs.has(slug) && slugs.indexOf(slug) === index);

      const content = readMarkdownContent("alternative-to", tool.slug);
      const hasSupportingContent = content !== null && wordCount(content) >= MIN_ALT_CONTENT_WORDS;
      const indexable = alternatives.length >= MIN_ALTERNATIVES_FOR_INDEX || hasSupportingContent;

      if (!indexable) {
        warnings.push(
          `Alternative page "${tool.slug}" is excluded from sitemap (${alternatives.length} active alternatives, ${content ? wordCount(content) : 0} content words).`
        );
      }

      return indexable;
    })
    .map((tool) => tool.slug);

  const urls: string[] = [];
  pushUrl(urls, "/");
  pushUrl(urls, "/blog/");
  pushUrl(urls, "/reports/");
  pushUrl(urls, "/quiz/");
  pushUrl(urls, "/calculator/");
  pushUrl(urls, "/migration-guides/");
  pushUrl(urls, "/stack-builder/");
  pushUrl(urls, "/search/");

  for (const tool of activeTools) pushUrl(urls, `/tool/${tool.slug}/`);
  for (const slug of indexableAlternativeSlugs) pushUrl(urls, `/alternative-to/${slug}/`);
  for (const category of categories) pushUrl(urls, `/category/${category.slug}/`);
  for (const slug of indexableComparisonSlugs) pushUrl(urls, `/compare/${slug}/`);

  const blogDir = path.join(CONTENT_DIR, "blog");
  if (fs.existsSync(blogDir)) {
    for (const file of fs.readdirSync(blogDir).filter((name) => name.endsWith(".md"))) {
      pushUrl(urls, `/blog/${file.replace(/\.md$/, "")}/`);
    }
  }

  const reportDir = path.join(CONTENT_DIR, "reports");
  if (fs.existsSync(reportDir)) {
    for (const file of fs.readdirSync(reportDir).filter((name) => name.endsWith(".md"))) {
      pushUrl(urls, `/reports/${file.replace(/\.md$/, "")}/`);
    }
  }

  const migrationGuidesDir = path.join(CONTENT_DIR, "migration-guides");
  if (fs.existsSync(migrationGuidesDir)) {
    for (const file of fs.readdirSync(migrationGuidesDir).filter((name) => name.endsWith(".md"))) {
      pushUrl(urls, `/migration-guides/${file.replace(/\.md$/, "")}/`);
    }
  }

  const duplicateUrls = [...new Set(urls.filter((url, index) => urls.indexOf(url) !== index))];
  for (const url of duplicateUrls) {
    errors.push(`Duplicate public sitemap URL: ${url}`);
  }

  if (!fs.existsSync(SEARCH_PAGE_PATH)) {
    errors.push("SearchAction target is missing: src/app/search/page.tsx");
  }

  const publicRoutes = new Set([
    ...urls.map((url) => new URL(url).pathname),
    "/category/",
    ...activeTools.map((tool) => `/alternative-to/${tool.slug}/`),
  ]);
  for (const section of CONTENT_SECTIONS_TO_SCAN) {
    const sectionDir = path.join(CONTENT_DIR, section);
    for (const filePath of listMarkdownFiles(sectionDir)) {
      const relativePath = path.relative(ROOT, filePath);
      const content = fs.readFileSync(filePath, "utf-8");
      warnings.push(...getContentQualityWarnings(relativePath, content));
      for (const route of findInternalRoutes(content)) {
        if (!publicRoutes.has(route)) {
          errors.push(`Broken internal link in ${relativePath}: ${route}`);
        }
      }
    }
  }

  console.log("SEO audit summary");
  console.log(`- active tools: ${activeTools.length}/${tools.length}`);
  console.log(`- indexable alternatives: ${indexableAlternativeSlugs.length}/${activeTools.length}`);
  console.log(`- indexable comparisons: ${indexableComparisonSlugs.length}/${publicComparisons.length}`);
  console.log(`- modeled sitemap URLs: ${new Set(urls).size}`);
  console.log(`- warnings: ${warnings.length}`);
  console.log(`- errors: ${errors.length}`);

  if (warnings.length > 0) {
    console.log("\nWarnings");
    for (const warning of warnings.slice(0, 80)) {
      console.log(`- ${warning}`);
    }
    if (warnings.length > 80) {
      console.log(`- ... ${warnings.length - 80} more warnings`);
    }
  }

  if (errors.length > 0) {
    console.error("\nErrors");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }
}

main();
