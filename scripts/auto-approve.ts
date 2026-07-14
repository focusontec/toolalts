#!/usr/bin/env tsx
/**
 * AutoClaw Auto-Approval Pipeline
 * Reads verified results and automatically adds APPROVED tools to tools.json
 * Also generates comparison entries for same-category tools.
 */

import fs from "fs";
import path from "path";
import { callLlm } from "./lib/llm";

const VERIFIED_PATH = path.resolve(__dirname, "../data/verified-results.json");
const PENDING_PATH = path.resolve(__dirname, "../data/pending-tools.json");
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

function loadPending(): any[] {
  if (!fs.existsSync(PENDING_PATH)) return [];
  return JSON.parse(fs.readFileSync(PENDING_PATH, "utf-8"));
}

function savePending(pending: any[]) {
  fs.writeFileSync(PENDING_PATH, JSON.stringify(pending, null, 2) + "\n");
}

// ── OA Fast Track ────────────────────────────────────────────────────
// For tools discovered from OpenAlternative, we skip the LLM verification
// step (ai-verify) and instead use LLM to generate unique content directly.
// We NEVER copy OA's descriptions — SEO safety.

const OA_CATEGORY_MAP: Record<string, string> = {
  "AI Development Platforms": "developer-tools",
  "Machine Learning Infrastructure": "developer-tools",
  "AI Security & Privacy": "security",
  "AI Interaction & Interfaces": "productivity",
  "CRM & Sales": "crm",
  "ERP & Operations": "other",
  "Finance & Accounting": "finance",
  "Human Resources (HR)": "other",
  "Marketing & Customer Engagement": "marketing",
  "Customer Support & Success": "communication",
  "E-commerce Platforms": "other",
  "Project & Work Management": "project-management",
  "Collaboration & Communication": "communication",
  "Scheduling & Event Management": "scheduling",
  "Document Management & E-Signatures": "productivity",
  "Forms & Surveys": "productivity",
  "Compliance & Risk Management": "security",
  "Legal": "other",
  "Social Networking": "other",
  "Community Building Platforms": "communication",
  "Collaboration & Feedback": "communication",
  "Content Management Systems (CMS)": "cms",
  "Community Platforms": "communication",
  "Documentation & Knowledge Base": "productivity",
  "Learning Management Systems (LMS)": "education",
  "Digital Asset Management (DAM)": "design",
  "Publishing": "cms",
  "Blogging & Personal Sites": "cms",
  "Web & Product Analytics": "analytics",
  "Business Intelligence & Reporting": "analytics",
  "Data Engineering & Integration": "developer-tools",
  "Data Warehousing & Processing": "database",
  "Data Extraction & Web Scraping": "developer-tools",
  "Website Builders": "design",
  "IDEs & Code Editors": "development",
  "Frameworks & Platforms": "development",
  "API Development & Testing": "developer-tools",
  "Testing & Quality Assurance": "developer-tools",
  "Version Control & Collaboration": "development",
  "Code Analysis & Transformation": "developer-tools",
  "Build & Deployment": "developer-tools",
  "Integration Platforms": "automation",
  "AI Assisted Coding": "development",
  "Terminals": "development",
  "Search Engines": "database",
  "Cloud Infrastructure Management": "cloud",
  "Server & VM Management": "cloud",
  "Monitoring & Observability": "monitoring",
  "Databases": "database",
  "Networking & Connectivity": "cloud",
  "Orchestration & Scheduling": "automation",
  "Messaging & Event Streaming": "developer-tools",
  "Storage Solutions": "cloud",
  "Backup & Recovery": "cloud",
  "Finance & Fintech": "finance",
  "Design & Prototyping": "design",
  "Cryptocurrency & Blockchain": "other",
  "Gaming": "other",
  "Internet of Things (IoT)": "other",
  "Logistics & Supply Chain": "other",
  "Media & Streaming": "other",
  "Photo & Video Editors": "design",
  "Note Taking & Knowledge Management": "productivity",
  "Password & Secret Management": "identity",
  "Screen Capture & Recording": "productivity",
  "File Management & Sync": "productivity",
  "Email & Communication": "email",
  "Automation": "automation",
  "Time & Task Management": "productivity",
  "Personal Finance Management": "finance",
  "Design & Visualization": "design",
  "Bookmark & Content Management": "productivity",
  "Remote Desktop & Access": "developer-tools",
  "Browsers & Extensions": "other",
  "Input & Dictation": "productivity",
  "Office Suites": "productivity",
  "Identity & Access Management (IAM)": "identity",
  "Secrets Management": "identity",
  "Threat Detection & Response": "security",
  "Network Security": "security",
  "Data Security & Privacy": "security",
  "Application Security": "security",
  "Fraud Prevention": "security",
};

/**
 * Resolve the actual website URL from an OpenAlternative tool page.
 * OA pages contain the real tool URL as a link with utm_source=openalternative.
 * We extract the first such link and strip the UTM parameters.
 */
/**
 * Find GitHub repo and extract homepage URL + stars.
 * Uses fuzzy matching since tool names often differ from repo names.
 */
async function findGithubInfo(
  name: string
): Promise<{ githubUrl: string | null; websiteUrl: string | null; githubStars: number | null; githubDescription: string | null; githubTopics: string[] | null }> {
  try {
    // Clean the name for searching: remove special chars, handle multi-word names
    const searchName = name.replace(/[^\w\s]/g, "").trim();
    const query = encodeURIComponent(searchName);
    const ghHeaders: Record<string, string> = process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {};
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=10`,
      { headers: ghHeaders, signal: AbortSignal.timeout(10000) }
    );
    if (res.ok) {
      const data = await res.json();
      const toolSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const toolCompact = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const toolWords = name.toLowerCase().split(/\s+/).filter(w => w.length > 2);

      for (const repo of data.items || []) {
        const repoName = repo.name.toLowerCase();
        const fullName = repo.full_name.toLowerCase();
        
        // Exact match
        if (repoName === toolSlug || repoName === toolCompact) {
          return {
            githubUrl: `https://github.com/${repo.full_name}`,
            websiteUrl: repo.homepage || null,
            githubStars: repo.stargazers_count,
            githubDescription: repo.description || null,
            githubTopics: repo.topics || [],
          };
        }
        
        // Repo name contains tool slug or vice versa
        if (repoName.includes(toolSlug) || toolSlug.includes(repoName)) {
          return {
            githubUrl: `https://github.com/${repo.full_name}`,
            websiteUrl: repo.homepage || null,
            githubStars: repo.stargazers_count,
            githubDescription: repo.description || null,
            githubTopics: repo.topics || [],
          };
        }

        // All significant words from tool name appear in repo full name
        if (toolWords.length >= 2 && toolWords.every(w => fullName.includes(w))) {
          return {
            githubUrl: `https://github.com/${repo.full_name}`,
            websiteUrl: repo.homepage || null,
            githubStars: repo.stargazers_count,
            githubDescription: repo.description || null,
            githubTopics: repo.topics || [],
          };
        }
      }
    }
  } catch {}
  return { githubUrl: null, websiteUrl: null, githubStars: null, githubDescription: null, githubTopics: null };
}

/**
 * Fetch website meta description for extra context.
 */
async function fetchWebsiteMeta(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; toolalts/1.0)" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Extract <meta name="description" content="...">
    const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (match) return match[1];
    // Fallback: og:description
    const ogMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    return ogMatch ? ogMatch[1] : null;
  } catch {}
  return null;
}

/**
 * Use LLM to generate UNIQUE tagline, description, and features.
 * We feed GitHub description + topics + website meta as context,
 * but instruct the LLM to write ORIGINAL content (not paraphrase).
 */
async function generateOaContent(
  name: string,
  websiteUrl: string,
  oaSubcategory: string,
  oaStars: string | null,
  githubDescription: string | null,
  githubTopics: string[] | null,
  websiteMeta: string | null,
  existingTaglines: string[]
): Promise<{ tagline: string; description: string; features: string[] }> {
  const systemPrompt = `You are a software analyst writing for a SaaS alternatives directory called ToolAlts.
Your job is to write a concise, accurate, and ORIGINAL tagline, description, and feature list for a software tool.

CRITICAL RULES FOR ORIGINALITY:
- Write completely original content. Do NOT copy or closely paraphrase any source material.
- Use the provided context (GitHub description, topics, website meta) only as FACTUAL reference to understand what the tool does.
- Your output must be distinct from any input text. Use your own words and sentence structure.
- Avoid generic phrases like "open-source platform that", "is an open-source alternative", "build and deploy AI agents with ease".
- Each tagline must be unique — avoid common templates other tools might use.

FORMAT REQUIREMENTS:
- Tagline: one compelling sentence, max 80 characters. Must highlight the tool's SPECIFIC differentiator.
- Description: 2-3 factual sentences about what the tool does, its key capabilities, and who it serves. 150-300 characters.
- Features: exactly 4-5 short bullet points, each 30-60 characters. Be specific to this tool, not generic.

Respond in JSON format:
{
  "tagline": "...",
  "description": "...",
  "features": ["...", "...", "...", "..."]
}`;

  // Build context section
  const contextParts: string[] = [`Tool name: ${name}`, `Category: ${oaSubcategory}`];
  if (websiteUrl && !websiteUrl.includes("openalternative.co")) {
    contextParts.push(`Website: ${websiteUrl}`);
  }
  if (oaStars) contextParts.push(`GitHub stars: ${oaStars}`);
  if (githubDescription) contextParts.push(`GitHub repo description: ${githubDescription}`);
  if (githubTopics && githubTopics.length > 0) {
    contextParts.push(`GitHub topics: ${githubTopics.join(", ")}`);
  }
  if (websiteMeta) contextParts.push(`Website meta description: ${websiteMeta}`);
  if (existingTaglines.length > 0) {
    contextParts.push(`\nAvoid these taglines (already used by other tools):\n${existingTaglines.slice(0, 10).map((t, i) => `${i + 1}. "${t}"`).join("\n")}`);
  }

  const userPrompt = `${contextParts.join("\n")}

Write an original tagline, description, and features for this tool. Remember: use your own words, do not paraphrase the context above.`;

  try {
    const response = await callLlm(systemPrompt, userPrompt, { jsonMode: true });
    const data = JSON.parse(response.content);
    return {
      tagline: data.tagline || `${name} — ${oaSubcategory}`,
      description: data.description || `${name} is an open-source tool in the ${oaSubcategory} space.`,
      features: Array.isArray(data.features) ? data.features.slice(0, 5) : [],
    };
  } catch (err) {
    console.warn(`   ⚠ LLM failed for ${name}, using fallback content`);
    return {
      tagline: `${name} — open-source ${oaSubcategory.toLowerCase()} tool`,
      description: `${name} is an open-source alternative in the ${oaSubcategory} category.`,
      features: [`Open-source ${oaSubcategory.toLowerCase()} solution`],
    };
  }
}

/**
 * Try to find the GitHub repo URL from the tool's website or name.
 */
async function findGithubUrl(name: string, websiteUrl: string): Promise<string | null> {
  // Try GitHub search API
  try {
    const query = encodeURIComponent(name.replace(/[^\w\s]/g, ""));
    const res = await fetch(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=1`, {
      headers: process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {},
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.items?.length > 0) {
        const repo = data.items[0];
        // Verify the repo name matches closely
        if (repo.name.toLowerCase() === name.toLowerCase().replace(/\s+/g, "-") ||
            repo.name.toLowerCase() === name.toLowerCase().replace(/\s+/g, "")) {
          return `https://github.com/${repo.full_name}`;
        }
      }
    }
  } catch {}
  return null;
}

async function processOaCandidates(
  pending: any[],
  tools: Tool[],
  validCategories: Set<string>
): Promise<{ newTools: Tool[]; processed: any[]; remaining: any[] }> {
  const oaCandidates = pending.filter((p) => p.source === "openalternative");
  const otherCandidates = pending.filter((p) => p.source !== "openalternative");

  if (oaCandidates.length === 0) {
    return { newTools: [], processed: [], remaining: otherCandidates };
  }

  console.log(`\n📡 OpenAlternative Fast Track: ${oaCandidates.length} candidates`);
  const existingSlugs = new Set(tools.map((t) => t.slug));
  const newTools: Tool[] = [];
  const processed: any[] = [];
  // Collect existing taglines for dedup
  const existingTaglines = tools
    .filter((t) => t.status === "active")
    .map((t) => t.tagline)
    .filter(Boolean);

  for (const candidate of oaCandidates) {
    if (existingSlugs.has(candidate.slug)) {
      console.log(`   ⏭ ${candidate.name}: already exists, skipping`);
      processed.push(candidate);
      continue;
    }

    const oaSubcategory = candidate.rawData?.oaSubcategory || "Other";
    const mappedCategory = OA_CATEGORY_MAP[oaSubcategory] || "other";

    if (!validCategories.has(mappedCategory)) {
      console.warn(`   ⚠ ${candidate.name}: category "${mappedCategory}" not valid, using "other"`);
    }

    console.log(`   🔄 ${candidate.name}: finding GitHub repo & website...`);

    // Step 1: Find GitHub repo → get homepage URL + stars + description + topics
    const ghInfo = await findGithubInfo(candidate.name);
    const githubUrl = ghInfo.githubUrl;
    const githubStars = ghInfo.githubStars;

    // Website priority: GitHub homepage > OA fallback
    const websiteUrl = ghInfo.websiteUrl || `https://openalternative.co/${candidate.slug}`;

    // Step 1.5: Fetch website meta description for extra context
    let websiteMeta: string | null = null;
    if (websiteUrl && !websiteUrl.includes("openalternative.co")) {
      websiteMeta = await fetchWebsiteMeta(websiteUrl);
    }

    // Step 2: Generate UNIQUE content via LLM with rich context
    console.log(`   🧠 ${candidate.name}: generating content...`);
    const content = await generateOaContent(
      candidate.name,
      websiteUrl,
      oaSubcategory,
      candidate.rawData?.oaStars,
      ghInfo.githubDescription,
      ghInfo.githubTopics,
      websiteMeta,
      existingTaglines
    );

    // Add new tagline to existing list for dedup in next iteration
    existingTaglines.push(content.tagline);

    const tool: Tool = {
      slug: candidate.slug,
      name: candidate.name,
      tagline: content.tagline,
      description: content.description,
      rating: 0,
      reviewsCount: 0,
      openSource: true,
      githubStars,
      githubUrl,
      websiteUrl,
      pricing: [],
      features: content.features,
      category: validCategories.has(mappedCategory) ? mappedCategory : "other",
      logo: `/logos/${candidate.slug}.svg`,
      status: "active",
    };

    newTools.push(tool);
    processed.push(candidate);
    existingSlugs.add(candidate.slug);
    console.log(`   ✓ ${candidate.name} → ${tool.category} (active)`);

    // Rate limit: delay between LLM calls to avoid API throttling
    await new Promise((r) => setTimeout(r, 3000));
  }

  const remaining = [...otherCandidates];
  return { newTools, processed, remaining };
}

async function main() {
  const verified = loadVerified();
  const pending = loadPending();
  const tools = loadTools();
  let comparisons = loadComparisons();

  console.log(`🔧 Auto-Approval Pipeline starting...`);
  console.log(`   Existing tools: ${tools.length}`);
  console.log(`   Verified results: ${verified.length}`);
  console.log(`   Pending candidates: ${pending.length}`);

  // Early exit: nothing to process
  if (verified.length === 0 && pending.length === 0) {
    console.log("📭 Nothing to process (no verified results, no pending candidates).");
    return;
  }

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
  }

  // ── Part 1: Process verified results (existing pipeline) ────────────
  const existingSlugs = new Set(tools.map((t) => t.slug));
  const approved = verified.filter(
    (v) => v.decision === "APPROVE" && v.confidence >= 80 && !existingSlugs.has(v.slug)
  );

  console.log(`   New verified drafts to ingest: ${approved.length}`);

  const validCategories = loadValidCategories();
  let verifiedTools: Tool[] = [];
  let skippedCount = 0;

  if (approved.length > 0) {
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
    verifiedTools = newTools.filter((tool) => {
      const errors = validationErrors.get(tool.slug) || [];
      const hasCriticalError = errors.some(
        (e) => e.includes("missing websiteUrl") || e.includes("auto-generated")
      );
      if (hasCriticalError) {
        console.warn(`   ❌ SKIPPED ${tool.slug}: has critical URL issues`);
      }
      return !hasCriticalError;
    });

    skippedCount = newTools.length - verifiedTools.length;
    if (skippedCount > 0) {
      console.warn(`\n   Skipped ${skippedCount} tools with missing/fake URLs.`);
    }

    // Clear verified results to avoid re-processing
    fs.writeFileSync(VERIFIED_PATH, "[]");
  }

  // ── Part 2: OA Fast Track Processing ────────────────────────────────
  let oaNewTools: Tool[] = [];
  let oaProcessedCount = 0;
  let remainingPending: any[] = pending;

  if (pending.length > 0) {
    const oaResult = await processOaCandidates(pending, [...tools, ...verifiedTools], validCategories);
    oaNewTools = oaResult.newTools;
    oaProcessedCount = oaResult.processed.length;
    remainingPending = oaResult.remaining;

    // Update pending: remove processed OA candidates, keep others
    savePending(remainingPending);
  }

  // ── Part 3: Merge everything and generate comparisons ───────────────
  const allTools = [...tools, ...verifiedTools, ...oaNewTools];

  // Generate comparisons for all new tools (verified + OA)
  const allNewTools = [...verifiedTools, ...oaNewTools];
  const affectedCategories = new Set(allNewTools.map((t) => t.category));
  const newComparisons: Comparison[] = [];
  for (const cat of affectedCategories) {
    const catNew = generateComparisonsForCategory(allTools, cat, comparisons);
    newComparisons.push(...catNew);
  }

  // Merge and deduplicate comparisons
  const allComparisonsRaw = [...comparisons, ...newComparisons];
  const seenPairs2 = new Set<string>();
  const allComparisons: Comparison[] = [];
  for (const c of allComparisonsRaw) {
    const pair = [c.toolA, c.toolB].sort();
    const key = `${pair[0]}-${pair[1]}`;
    if (!seenPairs2.has(key)) {
      seenPairs2.add(key);
      allComparisons.push(c);
    }
  }

  // Save final state
  saveTools(allTools);
  saveComparisons(allComparisons);

  console.log(`\n✅ Pipeline complete:`);
  console.log(`   Verified drafts ingested: ${verifiedTools.length}`);
  console.log(`   Verified skipped (URL issues): ${skippedCount}`);
  console.log(`   OA tools added (active): ${oaNewTools.length}`);
  console.log(`   OA pending processed: ${oaProcessedCount}`);
  console.log(`   New comparisons: ${newComparisons.length}`);
  console.log(`   Total tools: ${allTools.length}`);
  console.log(`   Total comparisons: ${allComparisons.length}`);
  console.log(`   Remaining pending: ${remainingPending.length}`);

  for (const t of verifiedTools) {
    console.log(`   + ${t.name} (${t.category}) — draft, ${t.openSource ? "Open Source" : "Proprietary"}`);
  }
  for (const t of oaNewTools) {
    console.log(`   + ${t.name} (${t.category}) — active, Open Source`);
  }
}

main().catch(console.error);
