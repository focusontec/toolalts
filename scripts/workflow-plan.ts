#!/usr/bin/env tsx
/**
 * Weekly Workflow Planner
 *
 * Generates a prioritized task queue from content opportunities and tool
 * review needs. Preserves existing task statuses across runs.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ROOT = path.resolve(__dirname, "..");
const TOOLS_PATH = path.join(ROOT, "data", "tools.json");
const COMPARISONS_PATH = path.join(ROOT, "data", "comparisons.json");
const OPPORTUNITIES_PATH = path.join(ROOT, "data", "content-opportunities.json");
const TASKS_PATH = path.join(ROOT, "data", "workflow-tasks.json");
const OUTPUT_MD = path.join(ROOT, "docs", "weekly-workflow.md");

const MAX_OPEN_TASKS = 5;
const MIN_ALTERNATIVES_FOR_INDEX = 2;

type Tool = {
  slug: string;
  name: string;
  category: string;
  rating: number;
  reviewsCount: number;
  githubStars: number | null;
  status?: string;
};

type Comparison = {
  slug: string;
  toolA: string;
  toolB: string;
};

type Opportunity = {
  slug: string;
  name: string;
  category: string;
  activeAlternativesCount: number;
  contentWords: number;
  priorityScore: number;
  reason: string;
  suggestedAction: string;
};

type WorkflowTask = {
  id: string;
  title: string;
  type: "content" | "tool-review" | "seo-fix";
  slug: string;
  status: "todo" | "doing" | "done" | "skipped";
  priorityScore: number;
  source: string;
  reason: string;
  action: string;
  createdAt: string;
  dueAt: string;
};

function readJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch (e) {
    console.error(`Failed to parse ${filePath}: ${(e as Error).message}`);
    return null;
  }
}

function localDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function today(): string {
  return localDate(new Date());
}

function plusDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return localDate(d);
}

function promotionScore(tool: Tool): number {
  return tool.rating * 20 + tool.reviewsCount * 0.1;
}

function main() {
  const todayStr = today();
  const tools = readJson<Tool[]>(TOOLS_PATH) ?? [];
  const comparisons = readJson<Comparison[]>(COMPARISONS_PATH) ?? [];
  const opportunities = readJson<Opportunity[]>(OPPORTUNITIES_PATH) ?? [];
  const existingTasks = readJson<WorkflowTask[]>(TASKS_PATH) ?? [];

  // Count active tools and indexable alternatives
  const activeTools = tools.filter((t) => t.status === "active");
  const activeSlugs = new Set(activeTools.map((t) => t.slug));

  // Build set of open task slug+type combos to avoid duplicates
  const openTasks = existingTasks.filter((t) => t.status === "todo" || t.status === "doing");
  const openKeys = new Set(openTasks.map((t) => `${t.type}:${t.slug}`));

  // Track all existing slug+type combos for ID generation (done/skipped get re-queued with new ID)
  const allExistingKeys = new Map<string, number>();
  for (const t of existingTasks) {
    const key = `${t.type}:${t.slug}`;
    allExistingKeys.set(key, (allExistingKeys.get(key) ?? 0) + 1);
  }

  const newTasks: WorkflowTask[] = [];
  let openCount = openTasks.length;

  // Source 1: Content opportunities (top 3)
  for (const opp of opportunities) {
    if (openCount >= MAX_OPEN_TASKS) break;
    const key = `content:${opp.slug}`;
    if (openKeys.has(key)) continue;

    const existingCount = allExistingKeys.get(`content:${opp.slug}`) ?? 0;
    newTasks.push({
      id: existingCount > 0 ? `content-${opp.slug}-v${existingCount + 1}` : `content-${opp.slug}`,
      title: `Write ${opp.name} alternatives page`,
      type: "content",
      slug: opp.slug,
      status: "todo",
      priorityScore: opp.priorityScore,
      source: "content-opportunities",
      reason: opp.reason,
      action: opp.suggestedAction,
      createdAt: todayStr,
      dueAt: plusDays(todayStr, 7),
    });
    openKeys.add(key);
    openCount++;
  }

  // Source 2: Tool review (review status, up to 2)
  const reviewTools = tools
    .filter((t) => t.status === "review" && (t.rating > 0 || t.reviewsCount > 0))
    .sort((a, b) => promotionScore(b) - promotionScore(a));

  for (const tool of reviewTools) {
    if (openCount >= MAX_OPEN_TASKS) break;
    const key = `tool-review:${tool.slug}`;
    if (openKeys.has(key)) continue;

    const score = Math.round(promotionScore(tool));
    const existingCount = allExistingKeys.get(`tool-review:${tool.slug}`) ?? 0;
    newTasks.push({
      id: existingCount > 0 ? `tool-review-${tool.slug}-v${existingCount + 1}` : `tool-review-${tool.slug}`,
      title: `Review ${tool.name} for promotion`,
      type: "tool-review",
      slug: tool.slug,
      status: "todo",
      priorityScore: score,
      source: "promotion-gate",
      reason: `Tool is in review status with rating ${tool.rating} and ${tool.reviewsCount} reviews`,
      action: "Verify pricing, features, and website. Promote to active if quality passes.",
      createdAt: todayStr,
      dueAt: plusDays(todayStr, 7),
    });
    openKeys.add(key);
    openCount++;
  }

  // Source 3: SEO fix (close to indexable — has 1 alternative but not enough content)
  for (const opp of opportunities) {
    if (openCount >= MAX_OPEN_TASKS) break;
    if (opp.activeAlternativesCount >= MIN_ALTERNATIVES_FOR_INDEX) continue;
    if (opp.activeAlternativesCount === 0) continue;
    const key = `seo-fix:${opp.slug}`;
    if (openKeys.has(key)) continue;

    const existingCount = allExistingKeys.get(`seo-fix:${opp.slug}`) ?? 0;
    newTasks.push({
      id: existingCount > 0 ? `seo-fix-${opp.slug}-v${existingCount + 1}` : `seo-fix-${opp.slug}`,
      title: `Fix ${opp.name} alternative page SEO`,
      type: "seo-fix",
      slug: opp.slug,
      status: "todo",
      priorityScore: opp.priorityScore,
      source: "seo-audit",
      reason: opp.reason,
      action: `Add ${MIN_ALTERNATIVES_FOR_INDEX - opp.activeAlternativesCount} more comparison pair(s) to reach ${MIN_ALTERNATIVES_FOR_INDEX} active alternatives.`,
      createdAt: todayStr,
      dueAt: plusDays(todayStr, 7),
    });
    openKeys.add(key);
    openCount++;
  }

  // Merge: preserve existing tasks, append new
  const allTasks = [...existingTasks, ...newTasks];

  // Write JSON
  fs.mkdirSync(path.dirname(TASKS_PATH), { recursive: true });
  fs.writeFileSync(TASKS_PATH, JSON.stringify(allTasks, null, 2) + "\n");

  // Write Markdown
  const openAfter = allTasks.filter((t) => t.status === "todo" || t.status === "doing");
  const doneCount = allTasks.filter((t) => t.status === "done").length;
  const indexableCount = activeTools.filter((t) => {
    const alts = comparisons.filter((c) => c.toolA === t.slug || c.toolB === t.slug);
    const uniqueAlts = new Set(
      alts.map((c) => (c.toolA === t.slug ? c.toolB : c.toolA)).filter((s) => activeSlugs.has(s))
    );
    if (uniqueAlts.size >= MIN_ALTERNATIVES_FOR_INDEX) return true;
    // Check for supporting markdown content (500+ words)
    const contentPath = path.join(ROOT, "src", "content", "alternative-to", `${t.slug}.md`);
    if (!fs.existsSync(contentPath)) return false;
    const raw = fs.readFileSync(contentPath, "utf-8");
    const words = matter(raw).content.trim().split(/\s+/).filter(Boolean).length;
    return words >= 500;
  }).length;
  const coverage = activeTools.length > 0 ? Math.round((indexableCount / activeTools.length) * 100) : 0;

  const md: string[] = [];
  md.push("# ToolAlts Weekly Workflow");
  md.push("");
  md.push(`Last generated: ${todayStr}`);
  md.push("");

  if (openAfter.length > 0) {
    md.push("## This Week's Tasks");
    md.push("");
    md.push("| # | Task | Type | Priority | Due | Source |");
    md.push("|---|------|------|----------|-----|--------|");
    for (let i = 0; i < openAfter.length; i++) {
      const t = openAfter[i];
      md.push(`| ${i + 1} | ${t.title} | ${t.type} | ${t.priorityScore} | ${t.dueAt} | ${t.source} |`);
    }
    md.push("");

    md.push("### Task Details");
    md.push("");
    for (const t of openAfter) {
      md.push(`#### ${t.title}`);
      md.push("");
      md.push(`- **Slug:** \`${t.slug}\``);
      md.push(`- **Priority:** ${t.priorityScore}`);
      md.push(`- **Reason:** ${t.reason}`);
      md.push(`- **Action:** ${t.action}`);
      md.push(`- **Due:** ${t.dueAt}`);
      md.push("");
    }
  } else {
    md.push("## This Week's Tasks");
    md.push("");
    md.push("No open tasks. Run `npm run workflow:plan` to generate new ones.");
    md.push("");
  }

  md.push("## SEO Status");
  md.push("");
  md.push(`- Active tools: ${activeTools.length}`);
  md.push(`- Indexable alternative pages: ${indexableCount}/${activeTools.length} (${coverage}%)`);
  md.push(`- Content opportunities: ${opportunities.length}`);
  md.push(`- Open tasks: ${openAfter.length}`);
  md.push(`- Completed tasks: ${doneCount}`);
  md.push("");

  md.push("## Before You Start");
  md.push("");
  md.push("- Write前先验证官网和 pricing");
  md.push("- 发布前跑 `npm run seo:audit && npm run build`");
  md.push("- 不要 bulk promote");
  md.push("");

  fs.mkdirSync(path.dirname(OUTPUT_MD), { recursive: true });
  fs.writeFileSync(OUTPUT_MD, md.join("\n") + "\n");

  // Print summary
  console.log("Workflow Plan Summary");
  console.log(`  Existing tasks: ${existingTasks.length}`);
  console.log(`  New tasks added: ${newTasks.length}`);
  console.log(`  Open tasks: ${openAfter.length}/${MAX_OPEN_TASKS}`);
  console.log(`  Top priority: ${openAfter[0]?.title ?? "none"}`);
  console.log(`\n  Written to:`);
  console.log(`    ${TASKS_PATH}`);
  console.log(`    ${OUTPUT_MD}`);
}

main();
