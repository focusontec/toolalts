#!/usr/bin/env tsx
/**
 * OpenAlternative Import Script
 *
 * Discovers tools from the piotrkulpinski/openalternative GitHub repo.
 * Uses OA as a DISCOVERY SOURCE ONLY — extracts tool names, URLs, and categories.
 * Does NOT copy descriptions or content from OA (SEO safety).
 *
 * Output: data/pending-tools.json (candidates for auto-approve pipeline)
 * State:  data/import-state.json (tracks batch progress)
 */

import fs from "fs";
import path from "path";

const OA_README_URL =
  "https://raw.githubusercontent.com/piotrkulpinski/openalternative/main/README.md";
const PENDING_PATH = path.resolve(__dirname, "../data/pending-tools.json");
const TOOLS_PATH = path.resolve(__dirname, "../data/tools.json");
const STATE_PATH = path.resolve(__dirname, "../data/import-state.json");
const CATEGORIES_PATH = path.resolve(__dirname, "../data/categories.json");

const BATCH_SIZE = 20;

// ── OA subcategory → ToolAlts category mapping ──────────────────────
const CATEGORY_MAP: Record<string, string> = {
  // AI & Machine Learning
  "AI Development Platforms": "developer-tools",
  "Machine Learning Infrastructure": "developer-tools",
  "AI Security & Privacy": "security",
  "AI Interaction & Interfaces": "productivity",

  // Business Software
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

  // Community & Social
  "Social Networking": "other",
  "Community Building Platforms": "communication",
  "Collaboration & Feedback": "communication",

  // Content & Publishing
  "Content Management Systems (CMS)": "cms",
  "Community Platforms": "communication",
  "Documentation & Knowledge Base": "productivity",
  "Learning Management Systems (LMS)": "education",
  "Digital Asset Management (DAM)": "design",
  "Publishing": "cms",
  "Blogging & Personal Sites": "cms",

  // Data & Analytics
  "Web & Product Analytics": "analytics",
  "Business Intelligence & Reporting": "analytics",
  "Data Engineering & Integration": "developer-tools",
  "Data Warehousing & Processing": "database",
  "Data Extraction & Web Scraping": "developer-tools",

  // Developer Tools
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

  // Infrastructure & Operations
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

  // Miscellaneous
  "Finance & Fintech": "finance",
  "Design & Prototyping": "design",
  "Cryptocurrency & Blockchain": "other",
  "Gaming": "other",
  "Internet of Things (IoT)": "other",
  "Logistics & Supply Chain": "other",
  "Media & Streaming": "other",
  "Photo & Video Editors": "design",

  // Productivity & Utilities
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

  // Security & Privacy
  "Identity & Access Management (IAM)": "identity",
  "Secrets Management": "identity",
  "Threat Detection & Response": "security",
  "Network Security": "security",
  "Data Security & Privacy": "security",
  "Application Security": "security",
  "Fraud Prevention": "security",
};

// ── Types ────────────────────────────────────────────────────────────
interface Candidate {
  slug: string;
  name: string;
  source: "openalternative";
  website?: string;
  discoveredAt: string;
  rawData: {
    oaCategory: string;
    oaSubcategory: string;
    oaLicense: string | null;
    oaStars: string | null;
  };
}

interface ImportState {
  openalternative: {
    lastOffset: number;
    lastRun: string | null;
    totalImported: number;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function loadExistingSlugs(): Set<string> {
  const slugs = new Set<string>();
  if (fs.existsSync(TOOLS_PATH)) {
    const tools = JSON.parse(fs.readFileSync(TOOLS_PATH, "utf-8"));
    for (const t of tools) slugs.add(t.slug);
  }
  return slugs;
}

function loadPendingSlugs(): Set<string> {
  const slugs = new Set<string>();
  if (fs.existsSync(PENDING_PATH)) {
    const pending = JSON.parse(fs.readFileSync(PENDING_PATH, "utf-8"));
    for (const p of pending) slugs.add(p.slug);
  }
  return slugs;
}

function loadState(): ImportState {
  if (fs.existsSync(STATE_PATH)) {
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf-8"));
  }
  return { openalternative: { lastOffset: 0, lastRun: null, totalImported: 0 } };
}

function saveState(state: ImportState) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n");
}

function appendPending(candidates: Candidate[]) {
  const existing: Candidate[] = [];
  if (fs.existsSync(PENDING_PATH)) {
    existing.push(...JSON.parse(fs.readFileSync(PENDING_PATH, "utf-8")));
  }
  existing.push(...candidates);
  fs.writeFileSync(PENDING_PATH, JSON.stringify(existing, null, 2) + "\n");
}

// ── Parser ───────────────────────────────────────────────────────────
interface ParsedEntry {
  name: string;
  url: string;
  license: string | null;
  stars: string | null;
  oaCategory: string;
  oaSubcategory: string;
}

function parseReadme(readme: string): ParsedEntry[] {
  const entries: ParsedEntry[] = [];
  let currentCategory = "";
  let currentSubcategory = "";

  // Pattern: - [Name](url) - Description `License` `⭐ Stars`
  // or:     - **[Name](url)** - Description `License` `⭐ Stars`
  const toolPattern =
    /^- (?:\*\*)?\[([^\]]+)\]\(([^)]+)\)(?:\*\*)? - (.+)$/;

  for (const line of readme.split("\n")) {
    if (line.startsWith("## ") && !line.startsWith("### ")) {
      currentCategory = line.slice(3).trim();
    } else if (line.startsWith("### ")) {
      currentSubcategory = line.slice(4).trim();
    }

    const match = line.trim().match(toolPattern);
    if (match && currentSubcategory) {
      const [, name, url, descRaw] = match;

      // Extract license and stars from the raw description (for category mapping only)
      const licenseMatch = descRaw.match(/`([A-Z]+[-\d.]*(?:\s[A-Z]+)*)`/);
      const starsMatch = descRaw.match(/⭐\s*([\d.]+[KMB]?)/);

      entries.push({
        name,
        url,
        license: licenseMatch ? licenseMatch[1] : null,
        stars: starsMatch ? starsMatch[1] : null,
        oaCategory: currentCategory,
        oaSubcategory: currentSubcategory,
      });
    }
  }

  return entries;
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  const state = loadState();
  const offset = state.openalternative.lastOffset;
  const existingSlugs = loadExistingSlugs();
  const pendingSlugs = loadPendingSlugs();
  const allKnownSlugs = new Set([...existingSlugs, ...pendingSlugs]);

  // Load valid ToolAlts categories
  const validCategories = new Set<string>();
  if (fs.existsSync(CATEGORIES_PATH)) {
    const cats = JSON.parse(fs.readFileSync(CATEGORIES_PATH, "utf-8"));
    for (const c of cats) validCategories.add(c.slug);
  }

  console.log(`Fetching OpenAlternative README...`);
  const res = await fetch(OA_README_URL);
  if (!res.ok) {
    console.error(`Failed to fetch README: ${res.status}`);
    process.exit(1);
  }
  const readme = await res.text();

  console.log(`Parsing tools from README...`);
  const allEntries = parseReadme(readme);
  console.log(`Found ${allEntries.length} total tools in OA`);

  // Deduplicate against existing
  const newEntries = allEntries.filter((e) => !allKnownSlugs.has(slugify(e.name)));
  console.log(`${newEntries.length} new tools (after dedup)`);

  // Apply batch offset
  const batch = newEntries.slice(offset, offset + BATCH_SIZE);
  if (batch.length === 0) {
    console.log("No more tools to import. Resetting offset to 0.");
    state.openalternative.lastOffset = 0;
    state.openalternative.lastRun = new Date().toISOString();
    saveState(state);
    return;
  }

  console.log(`Processing batch: ${offset + 1} to ${offset + batch.length}`);

  const candidates: Candidate[] = [];
  let skipped = 0;

  for (const entry of batch) {
    const slug = slugify(entry.name);
    const mappedCategory = CATEGORY_MAP[entry.oaSubcategory] || "other";

    // Validate category exists
    if (!validCategories.has(mappedCategory)) {
      console.warn(
        `  ⚠ ${entry.name}: mapped category "${mappedCategory}" not in categories.json, using "other"`
      );
    }

    // Build website URL:
    // OA links go to openalternative.co/{slug}, which redirects to the tool's actual site.
    // We store the OA page URL as a reference; auto-approve will resolve the real website.
    const website = entry.url.startsWith("http")
      ? entry.url
      : `https://openalternative.co/${slug}`;

    candidates.push({
      slug,
      name: entry.name,
      source: "openalternative",
      website,
      discoveredAt: new Date().toISOString(),
      rawData: {
        oaCategory: entry.oaCategory,
        oaSubcategory: entry.oaSubcategory,
        oaLicense: entry.license,
        oaStars: entry.stars,
      },
    });

    console.log(
      `  ✓ ${entry.name} → ${mappedCategory} (${entry.oaSubcategory})`
    );
  }

  // Save candidates
  appendPending(candidates);

  // Update state
  state.openalternative.lastOffset = offset + batch.length;
  state.openalternative.lastRun = new Date().toISOString();
  state.openalternative.totalImported += candidates.length;
  saveState(state);

  console.log(`\nDone! Added ${candidates.length} candidates to pending-tools.json`);
  console.log(`Next batch starts at offset ${state.openalternative.lastOffset}`);
  console.log(`Total imported so far: ${state.openalternative.totalImported}`);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
