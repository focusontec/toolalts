import fs from "fs";
import path from "path";
import { chromium } from "playwright";

const DATA_PATH = path.resolve(__dirname, "../data/tools.json");
const SCREENSHOT_DIR = path.resolve(__dirname, "../public/images/tools");

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

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : "";
      parsed[key] = value;
      if (value) i++;
    }
  }
  return parsed;
}

function toKebabCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function fetchGitHubInfo(githubUrl: string): Promise<{ stars: number; description: string; homepage: string }> {
  const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error(`Invalid GitHub URL: ${githubUrl}`);
  const [, owner, repo] = match;

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "tool-alts-scrape/1.0",
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return {
    stars: data.stargazers_count ?? 0,
    description: data.description ?? "",
    homepage: data.homepage ?? "",
  };
}

async function fetchWebsiteMeta(url: string): Promise<{ title?: string; description?: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; tool-alts/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return {};
    const html = await res.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const descMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
    return {
      title: titleMatch?.[1]?.trim(),
      description: descMatch?.[1]?.trim(),
    };
  } catch {
    return {};
  }
}

async function screenshotWebsite(url: string, savePath: string) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.screenshot({ path: savePath, fullPage: true });
  } finally {
    await browser.close();
  }
}

function loadTools(): ToolEntry[] {
  if (!fs.existsSync(DATA_PATH)) return [];
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function saveTools(tools: ToolEntry[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(tools, null, 2) + "\n", "utf-8");
}

async function main() {
  const args = parseArgs();
  const name = args.name;
  const website = args.website;
  const github = args.github;
  const category = args.category || "other";

  if (!name) {
    console.error("Usage: npx tsx scripts/scrape-tool.ts --name <name> [--website <url>] [--github <url>] [--category <cat>]");
    process.exit(1);
  }

  const slug = toKebabCase(name);
  console.log(`Adding new tool: ${name} (slug: ${slug})`);

  // Check for duplicates
  const tools = loadTools();
  if (tools.some((t) => t.slug === slug)) {
    console.error(`  ❌ Tool with slug "${slug}" already exists.`);
    process.exit(1);
  }

  // Gather data from multiple sources
  let githubStars: number | null = null;
  let githubDesc = "";
  let homepage = "";

  if (github) {
    try {
      const info = await fetchGitHubInfo(github);
      githubStars = info.stars;
      githubDesc = info.description;
      homepage = info.homepage;
      console.log(`  ✅ GitHub: stars=${info.stars}, desc="${info.description.slice(0, 60)}..."`);
    } catch (err) {
      console.warn(`  ⚠️ Failed to fetch GitHub info:`, (err as Error).message);
    }
  }

  const websiteUrl = website || homepage;
  let webMeta: { title?: string; description?: string } = {};

  if (websiteUrl) {
    webMeta = await fetchWebsiteMeta(websiteUrl);
    console.log(`  ✅ Website meta: title="${webMeta.title ?? "N/A"}", desc="${(webMeta.description ?? "N/A").slice(0, 60)}..."`);
  }

  // Take screenshot if website available
  if (websiteUrl) {
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
    const screenshotPath = path.join(SCREENSHOT_DIR, `${slug}.png`);
    try {
      await screenshotWebsite(websiteUrl, screenshotPath);
      console.log(`  ✅ Screenshot saved: ${screenshotPath}`);
    } catch (err) {
      console.warn(`  ⚠️ Failed to screenshot website:`, (err as Error).message);
    }
  }

  // Build tool entry with correct schema
  const tagline = webMeta.description || githubDesc || `${name} — a ${category} tool`;
  const description = githubDesc || webMeta.description || `${name} is a software tool in the ${category} category.`;

  const newTool: ToolEntry = {
    slug,
    name,
    tagline: tagline.slice(0, 200),
    description: description.slice(0, 500),
    rating: 0,
    reviewsCount: 0,
    openSource: !!github,
    githubStars: githubStars ?? null,
    githubUrl: github ? (github.startsWith("http") ? github : `https://github.com/${github}`) : null,
    websiteUrl: websiteUrl || "",
    pricing: [],
    features: [],
    category,
    logo: `/logos/${slug}.svg`,
  };

  tools.push(newTool);
  saveTools(tools);

  console.log("\n========== NEW TOOL SUMMARY ==========");
  console.log(`slug:        ${newTool.slug}`);
  console.log(`name:        ${newTool.name}`);
  console.log(`tagline:     ${newTool.tagline}`);
  console.log(`websiteUrl:  ${newTool.websiteUrl || "N/A"}`);
  console.log(`githubUrl:   ${newTool.githubUrl ?? "N/A"}`);
  console.log(`githubStars: ${newTool.githubStars ?? "N/A"}`);
  console.log(`openSource:  ${newTool.openSource}`);
  console.log(`category:    ${newTool.category}`);
  console.log(`Note:        pricing[], features[], rating, reviewsCount need manual/LLM enrichment`);
  console.log("======================================\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
