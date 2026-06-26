#!/usr/bin/env tsx
/**
 * Loop Engine — Automated fix loop for ToolAlts data and content quality.
 *
 * Reads audit-results.json, builds a fix plan, applies fixes (inline LLM or
 * subprocess delegation), regenerates content, re-audits, and loops until
 * a stop condition is met.
 *
 * Usage:
 *   npx tsx scripts/loop-engine.ts                        # fix all
 *   npx tsx scripts/loop-engine.ts --slug notion           # single tool
 *   npx tsx scripts/loop-engine.ts --dry-run               # plan only
 *   npx tsx scripts/loop-engine.ts --resume                # resume last run
 *   npx tsx scripts/loop-engine.ts --max-iterations 2
 *   npx tsx scripts/loop-engine.ts --mode data             # data only
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { callLlm } from "./lib/llm";
import { searchAndFetch } from "./lib/ollama";
import type {
  AuditResults,
  FieldFix,
  FixPlan,
  LoopState,
  LoopEngineArgs,
} from "./lib/loop-types";

// ─── Paths ───────────────────────────────────────────────────────────

const SCRIPTS_DIR = __dirname;
const ROOT_DIR = path.resolve(SCRIPTS_DIR, "..");
const AUDIT_RESULTS_PATH = path.join(ROOT_DIR, "data/audit-results.json");
const TOOLS_PATH = path.join(ROOT_DIR, "data/tools.json");
const CATEGORIES_PATH = path.join(ROOT_DIR, "data/categories.json");
const STATE_PATH = path.join(ROOT_DIR, "data/loop-engine-state.json");

// ─── CLI ─────────────────────────────────────────────────────────────

function parseArgs(): LoopEngineArgs {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) parsed.slug = args[++i];
    else if (args[i] === "--max-iterations" && args[i + 1]) parsed.maxIterations = args[++i];
    else if (args[i] === "--mode" && args[i + 1]) parsed.mode = args[++i];
    else if (args[i] === "--dry-run") parsed.dryRun = "true";
    else if (args[i] === "--resume") parsed.resume = "true";
  }
  return {
    slug: parsed.slug,
    maxIterations: parseInt(parsed.maxIterations, 10) || 3,
    dryRun: parsed.dryRun === "true",
    resume: parsed.resume === "true",
    mode: (parsed.mode as LoopEngineArgs["mode"]) || "all",
  };
}

// ─── Loaders ─────────────────────────────────────────────────────────

function loadJson<T>(filePath: string, fallback: T): T {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return fallback;
  }
}

function loadAuditResults(): AuditResults {
  return loadJson(AUDIT_RESULTS_PATH, { data: [], content: [] });
}

interface ToolEntry {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  rating: number;
  reviewsCount: number;
  openSource: boolean;
  githubStars: number | null;
  githubUrl: string | null;
  websiteUrl: string;
  pricing: { plan: string; price: string; features: string[] }[];
  features: string[];
  logo: string;
}

function loadTools(): ToolEntry[] {
  return loadJson(TOOLS_PATH, []);
}

function loadCategories(): { slug: string; name: string }[] {
  return loadJson(CATEGORIES_PATH, []);
}

// ─── Fix Plan Builder ────────────────────────────────────────────────

const ESCALATED_FIELDS = new Set(["rating", "reviewsCount", "openSource"]);

const FIELD_TO_STRATEGY: Record<string, string> = {
  websiteUrl: "extract-github-homepage",
  githubStars: "delegate-sync-stars",
  tagline: "llm-rewrite",
  description: "llm-rewrite",
  category: "llm-reclassify",
  features: "delegate-enrich-features",
  pricing: "delegate-scrape-pricing",
};

function buildFixPlan(auditResults: AuditResults, tools: ToolEntry[], slugFilter?: string): FixPlan {
  const dataFixes: FieldFix[] = [];
  const contentFixes: { slug: string; type: "comparison"; action: "regenerate"; reason: string; toolASlug?: string; toolBSlug?: string }[] = [];
  const toolMap = new Map(tools.map((t) => [t.slug, t]));

  for (const result of auditResults.data) {
    if (slugFilter && result.slug !== slugFilter) continue;
    const tool = toolMap.get(result.slug);
    if (!tool) continue;

    for (const check of result.fieldChecks) {
      if (check.verdict === "ACCURATE" || check.verdict === "UNVERIFIABLE") continue;
      if (ESCALATED_FIELDS.has(check.field)) continue;

      const strategy = FIELD_TO_STRATEGY[check.field];
      if (!strategy) continue;

      dataFixes.push({
        slug: result.slug,
        field: check.field,
        strategy: strategy as any,
        currentValue: check.storedValue,
        newValue: check.actualValue !== "unverifiable" ? check.actualValue : undefined,
        evidence: check.note,
        reason: `${check.verdict}: ${check.note}`,
      });
    }
  }

  if (auditResults.content) {
    for (const result of auditResults.content) {
      if (result.type !== "comparison") continue;
      if (result.qualityScore >= 70 && result.accuracyScore >= 70) continue;

      const parts = result.slug.split("-vs-");
      if (parts.length === 2) {
        if (slugFilter && parts[0] !== slugFilter && parts[1] !== slugFilter) continue;
        contentFixes.push({
          slug: result.slug,
          type: "comparison",
          action: "regenerate",
          reason: `quality=${result.qualityScore}, accuracy=${result.accuracyScore}`,
          toolASlug: parts[0],
          toolBSlug: parts[1],
        });
      }
    }
  }

  return { dataFixes, contentFixes };
}

// ─── Fix Executors ───────────────────────────────────────────────────

function updateToolField(slug: string, field: string, newValue: unknown): void {
  const tools = loadTools();
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) throw new Error(`Tool ${slug} not found`);
  (tool as Record<string, unknown>)[field] = newValue;
  fs.writeFileSync(TOOLS_PATH, JSON.stringify(tools, null, 2) + "\n", "utf-8");
}

async function fetchEvidence(slug: string): Promise<{ websiteText: string; githubDesc: string }> {
  const tools = loadTools();
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) return { websiteText: "", githubDesc: "" };

  let websiteText = "";
  try {
    websiteText = await searchAndFetch(tool.name + " pricing features");
  } catch {
    // best effort
  }

  let githubDesc = "";
  if (tool.githubUrl) {
    try {
      const repoPath = tool.githubUrl.replace("https://github.com/", "");
      const apiRes = await fetch(`https://api.github.com/repos/${repoPath}`, {
        headers: { "User-Agent": "toolalts-loop-engine" },
      });
      if (apiRes.ok) {
        const data = (await apiRes.json()) as { description?: string };
        githubDesc = data.description || "";
      }
    } catch {
      // best effort
    }
  }

  return { websiteText, githubDesc };
}

async function fixTagline(tool: ToolEntry, evidence: { websiteText: string; githubDesc: string }): Promise<string | null> {
  const systemPrompt = `You are rewriting a software tool's one-line tagline.
Rules:
- Max 12 words, no marketing fluff
- Say what the tool actually does
- Use evidence below, don't invent claims
- Return ONLY the new tagline text, no JSON, no quotes`;

  const userPrompt = `Current tagline: "${tool.tagline}"
Description: "${tool.description}"
GitHub: "${evidence.githubDesc}"
Website snippet: "${evidence.websiteText.slice(0, 1000)}"

Write a better tagline. Return ONLY the tagline.`;

  try {
    const res = await callLlm(systemPrompt, userPrompt, { jsonMode: false });
    const tagline = res.content.replace(/^["']|["']$/g, "").trim();
    return tagline.length > 5 && tagline.length < 100 ? tagline : null;
  } catch {
    return null;
  }
}

async function fixDescription(tool: ToolEntry, evidence: { websiteText: string; githubDesc: string }): Promise<string | null> {
  const systemPrompt = `You are rewriting a software tool's description (2-3 sentences).
Rules:
- Describe what the tool does and who it's for
- Use evidence below, don't invent features or pricing
- No marketing language
- Return ONLY the new description, no JSON`;

  const userPrompt = `Current description: "${tool.description}"
Tagline: "${tool.tagline}"
GitHub: "${evidence.githubDesc}"
Website snippet: "${evidence.websiteText.slice(0, 1500)}"

Write a better description. Return ONLY the description.`;

  try {
    const res = await callLlm(systemPrompt, userPrompt, { jsonMode: false });
    const desc = res.content.replace(/^["']|["']$/g, "").trim();
    return desc.length > 30 ? desc : null;
  } catch {
    return null;
  }
}

async function fixCategory(tool: ToolEntry, categories: { slug: string; name: string }[]): Promise<string | null> {
  const catList = categories.map((c) => `- ${c.slug}: ${c.name}`).join("\n");
  const systemPrompt = `You are reclassifying a software tool into one of these categories:
${catList}

Rules:
- Pick the BEST matching category slug
- Return ONLY the category slug, nothing else`;

  const userPrompt = `Tool: ${tool.name}
Tagline: "${tool.tagline}"
Description: "${tool.description}"

Category:`;

  try {
    const res = await callLlm(systemPrompt, userPrompt, { jsonMode: false });
    const cat = res.content.replace(/["`]/g, "").trim().toLowerCase();
    const validSlugs = categories.map((c) => c.slug);
    return validSlugs.includes(cat) ? cat : null;
  } catch {
    return null;
  }
}

function delegateToScript(command: string): { success: boolean; output: string } {
  try {
    const output = execSync(command, {
      cwd: ROOT_DIR,
      timeout: 120000,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { success: true, output };
  } catch (err) {
    return { success: false, output: (err as Error).message };
  }
}

async function applyFix(fix: FieldFix, tools: ToolEntry[], categories: { slug: string; name: string }[]): Promise<boolean> {
  const tool = tools.find((t) => t.slug === fix.slug);
  if (!tool) return false;

  switch (fix.strategy) {
    case "llm-rewrite": {
      const evidence = await fetchEvidence(fix.slug);
      if (fix.field === "tagline") {
        const newTagline = await fixTagline(tool, evidence);
        if (newTagline) {
          updateToolField(fix.slug, "tagline", newTagline);
          return true;
        }
      } else if (fix.field === "description") {
        const newDesc = await fixDescription(tool, evidence);
        if (newDesc) {
          updateToolField(fix.slug, "description", newDesc);
          return true;
        }
      }
      return false;
    }
    case "llm-reclassify": {
      const newCat = await fixCategory(tool, categories);
      if (newCat) {
        updateToolField(fix.slug, "category", newCat);
        return true;
      }
      return false;
    }
    case "delegate-sync-stars": {
      const result = delegateToScript(`npx tsx scripts/sync-tools.ts --slug ${fix.slug}`);
      return result.success;
    }
    case "delegate-enrich-features": {
      const result = delegateToScript(`npx tsx scripts/enrich-tools.ts --slug ${fix.slug} --fields features`);
      return result.success;
    }
    case "delegate-scrape-pricing": {
      const result = delegateToScript(`npx tsx scripts/scrape-pricing.ts --slug ${fix.slug}`);
      return result.success;
    }
    case "extract-github-homepage": {
      // Can't auto-fix websiteUrl without knowing the real product URL
      return false;
    }
    default:
      return false;
  }
}

// ─── Content Regeneration ────────────────────────────────────────────

function regenerateComparisons(slugs: string[]): void {
  for (const slug of slugs) {
    const contentDir = path.join(ROOT_DIR, "src/content/comparisons");
    if (fs.existsSync(contentDir)) {
      const files = fs.readdirSync(contentDir);
      for (const file of files) {
        if (file.includes(slug)) {
          fs.unlinkSync(path.join(contentDir, file));
          console.log(`    🗑️  Deleted comparison: ${file}`);
        }
      }
    }

    console.log(`    🤖 Regenerating comparisons for ${slug}...`);
    const result = delegateToScript(`npx tsx scripts/generate-comparisons.ts --slug ${slug}`);
    if (result.success) {
      console.log(`    ✅ Regenerated for ${slug}`);
    } else {
      console.warn(`    ⚠️  Regeneration failed for ${slug}`);
    }
  }
}

// ─── Re-Audit ────────────────────────────────────────────────────────

function reAuditSlugs(slugs: string[]): void {
  for (const slug of slugs) {
    console.log(`    🔍 Re-auditing ${slug}...`);
    const result = delegateToScript(`npx tsx scripts/ai-audit.ts --slug ${slug}`);
    if (!result.success) {
      console.warn(`    ⚠️  Re-audit failed for ${slug}`);
    }
  }
}

// ─── Stop Conditions ─────────────────────────────────────────────────

function checkStopConditions(
  auditResults: AuditResults,
  currentIteration: number,
  maxIterations: number,
  llmCallsUsed: number,
  totalCostCap: number,
  previousTotalAccuracy: number | null
): { stop: boolean; reason: LoopState["status"] } {
  const allPass = auditResults.data.length > 0 && auditResults.data.every((d) => d.accuracyScore >= 80);
  if (allPass) return { stop: true, reason: "completed" };

  if (currentIteration >= maxIterations) return { stop: true, reason: "completed" };

  if (llmCallsUsed >= totalCostCap) return { stop: true, reason: "cost-capped" };

  if (previousTotalAccuracy !== null) {
    const currentTotal = auditResults.data.reduce((sum, d) => sum + d.accuracyScore, 0);
    if (Math.abs(currentTotal - previousTotalAccuracy) < 2) {
      return { stop: true, reason: "completed" };
    }
  }

  return { stop: false, reason: "running" };
}

// ─── State Persistence ───────────────────────────────────────────────

function saveState(state: LoopState): void {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n", "utf-8");
}

function loadState(): LoopState | null {
  if (!fs.existsSync(STATE_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf-8"));
  } catch {
    return null;
  }
}

// ─── Main Loop ───────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  const tools = loadTools();
  const categories = loadCategories();

  let state: LoopState;
  if (args.resume) {
    const existing = loadState();
    if (!existing) {
      console.error("No previous state found. Starting fresh.");
      state = createInitialState(args);
    } else {
      state = existing;
      console.log(`Resuming run ${state.runId} from iteration ${state.currentIteration}`);
    }
  } else {
    state = createInitialState(args);
  }

  console.log(`\n🔄 Loop Engine starting...`);
  console.log(`   Mode: ${args.mode}`);
  console.log(`   Max iterations: ${args.maxIterations}`);
  console.log(`   Slug filter: ${args.slug || "all"}`);
  console.log(`   Dry run: ${args.dryRun}`);
  console.log(`   Cost cap: ${state.totalCostCap} LLM calls\n`);

  let previousTotalAccuracy: number | null = null;

  for (let iter = state.currentIteration; iter < args.maxIterations; iter++) {
    state.currentIteration = iter;
    const iterStart = new Date().toISOString();
    console.log(`\n═══════════════════════════════════════════════`);
    console.log(`  ITERATION ${iter + 1}/${args.maxIterations}`);
    console.log(`═══════════════════════════════════════════════\n`);

    const auditResults = loadAuditResults();
    const fixPlan = buildFixPlan(auditResults, tools, args.slug);
    console.log(`📋 Fix plan: ${fixPlan.dataFixes.length} data fixes, ${fixPlan.contentFixes.length} content fixes`);

    if (fixPlan.dataFixes.length === 0 && fixPlan.contentFixes.length === 0) {
      console.log(`\n✅ No fixes needed. All data is clean.`);
      state.status = "completed";
      saveState(state);
      break;
    }

    if (args.dryRun) {
      console.log(`\n--- DRY RUN: Fix plan ---`);
      for (const fix of fixPlan.dataFixes) {
        console.log(`  [DATA] ${fix.slug}.${fix.field} → ${fix.strategy}: ${fix.reason}`);
      }
      for (const fix of fixPlan.contentFixes) {
        console.log(`  [CONTENT] ${fix.slug} → ${fix.action}: ${fix.reason}`);
      }
      saveState(state);
      break;
    }

    // Apply data fixes
    let fixesApplied = 0;
    let fixesFailed = 0;
    const changedSlugs = new Set<string>();

    for (const fix of fixPlan.dataFixes) {
      console.log(`  🔧 Fixing ${fix.slug}.${fix.field} (${fix.strategy})...`);
      try {
        const success = await applyFix(fix, tools, categories);
        if (success) {
          console.log(`    ✅ Applied`);
          fixesApplied++;
          changedSlugs.add(fix.slug);
          state.llmCallsUsed++;
          state.fixLog.push({
            iteration: iter,
            slug: fix.slug,
            field: fix.field,
            strategy: fix.strategy,
            previousValue: fix.currentValue,
            newValue: fix.newValue,
            evidence: fix.evidence,
            success: true,
          });
        } else {
          console.log(`    ⚠️  Could not fix (no better value found)`);
          fixesFailed++;
          state.fixLog.push({
            iteration: iter,
            slug: fix.slug,
            field: fix.field,
            strategy: fix.strategy,
            previousValue: fix.currentValue,
            success: false,
            error: "No better value found",
          });
        }
      } catch (err) {
        console.error(`    ❌ Failed: ${(err as Error).message}`);
        fixesFailed++;
        state.fixLog.push({
          iteration: iter,
          slug: fix.slug,
          field: fix.field,
          strategy: fix.strategy,
          previousValue: fix.currentValue,
          success: false,
          error: (err as Error).message,
        });
      }
    }

    // Regenerate content for changed tools
    if (changedSlugs.size > 0 && args.mode !== "data") {
      console.log(`\n📝 Regenerating content for ${changedSlugs.size} tools...`);
      regenerateComparisons([...changedSlugs]);
    }

    // Re-audit changed tools
    if (changedSlugs.size > 0) {
      console.log(`\n🔍 Re-auditing ${changedSlugs.size} changed tools...`);
      reAuditSlugs([...changedSlugs]);
    }

    // Track iteration
    state.iterations.push({
      iteration: iter,
      startedAt: iterStart,
      completedAt: new Date().toISOString(),
      fixesApplied,
      fixesFailed,
      escalated: 0,
      reAuditResults: [],
      stopCondition: "continue",
    });

    // Check stop conditions
    const freshAudit = loadAuditResults();
    const currentTotalAccuracy = freshAudit.data.reduce((sum, d) => sum + d.accuracyScore, 0);
    const { stop, reason } = checkStopConditions(
      freshAudit,
      iter + 1,
      args.maxIterations,
      state.llmCallsUsed,
      state.totalCostCap,
      previousTotalAccuracy
    );

    console.log(`\n📊 Iteration ${iter + 1} summary: ${fixesApplied} applied, ${fixesFailed} failed`);
    console.log(`   Total accuracy sum: ${currentTotalAccuracy} (previous: ${previousTotalAccuracy ?? "n/a"})`);
    console.log(`   LLM calls used: ${state.llmCallsUsed}/${state.totalCostCap}`);

    previousTotalAccuracy = currentTotalAccuracy;

    if (stop) {
      state.status = reason;
      console.log(`\n🛑 Stopping: ${reason}`);
      saveState(state);
      break;
    }

    state.status = "running";
    saveState(state);
  }

  // Final summary
  console.log(`\n${"═".repeat(50)}`);
  console.log(`  LOOP ENGINE COMPLETE`);
  console.log(`${"═".repeat(50)}`);
  console.log(`  Status: ${state.status}`);
  console.log(`  Iterations: ${state.currentIteration + 1}`);
  console.log(`  Fixes applied: ${state.fixLog.filter((f) => f.success).length}`);
  console.log(`  Fixes failed: ${state.fixLog.filter((f) => !f.success).length}`);
  console.log(`  LLM calls used: ${state.llmCallsUsed}`);
  console.log(`${"═".repeat(50)}\n`);

  saveState(state);
}

function createInitialState(args: LoopEngineArgs): LoopState {
  return {
    runId: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    maxIterations: args.maxIterations,
    currentIteration: 0,
    iterations: [],
    totalCostCap: 100,
    llmCallsUsed: 0,
    slugsProcessed: [],
    status: "running",
    fixLog: [],
  };
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
