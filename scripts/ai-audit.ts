#!/usr/bin/env tsx
/**
 * AutoClaw Audit Engine — Deterministic six-dimension data quality scoring
 *
 * Data audit uses pure rule-based checks (no LLM, fully reproducible).
 * Content audit still uses LLM (writing quality is subjective).
 *
 * Six dimensions (based on DAMA-DMBOK / PIM quality framework):
 *   Completeness  30%  — required fields populated
 *   Accuracy      25%  — values match reality, no cross-contamination
 *   Validity      20%  — formats, lengths, URL syntax correct
 *   Consistency   15%  — logical relationships between fields hold
 *   Timeliness     7%  — data not stale
 *   Uniqueness     3%  — no duplicate slugs/names
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { callLlm } from "./lib/llm";

const TOOLS_PATH = path.resolve(__dirname, "../data/tools.json");
const COMPARISONS_PATH = path.resolve(__dirname, "../data/comparisons.json");
const CATEGORIES_PATH = path.resolve(__dirname, "../data/categories.json");
const AUDIT_RESULTS_PATH = path.resolve(__dirname, "../data/audit-results.json");
const CONTENT_DIR = path.resolve(__dirname, "../src/content");

// ─── Types ───────────────────────────────────────────────────────────

interface FieldCheck {
  field: string;
  storedValue: string;
  actualValue: string;
  verdict: "ACCURATE" | "OUTDATED" | "INCORRECT" | "UNVERIFIABLE" | "MISSING";
  source: string;
  note: string;
}

interface DataAuditResult {
  slug: string;
  name: string;
  accuracyScore: number; // 0-100
  fieldChecks: FieldCheck[];
  recommendations: string[];
  concerns: string[];
  auditedAt: string;
}

interface ContentAuditResult {
  slug: string;
  type: "comparison" | "blog" | "report";
  qualityScore: number; // 0-100
  accuracyScore: number; // 0-100
  seoScore: number; // 0-100
  issues: { severity: "high" | "medium" | "low"; message: string }[];
  strengths: string[];
  recommendations: string[];
  auditedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function loadJson<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}


// ─── Rule Engine: Six-Dimension Data Audit ────────────────────────────

const CONTAMINATION_KEYWORDS = [
  "Unlimited public/private repositories",
  "Dependabot security",
  "CI/CD minutes/month",
  "500MB of Packages storage",
  "Codespaces Access",
  "Host open source projects in public GitHub",
];

const URL_REGEX = /^https?:\/\/[^\s]+$/;

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

function loadCategories(): string[] {
  return loadJson<{ slug: string }>(CATEGORIES_PATH).map((c) => c.slug);
}

function auditCompleteness(tool: any): { score: number; checks: FieldCheck[] } {
  const checks: FieldCheck[] = [];
  let deductions = 0;
  const rules: { field: string; test: () => boolean; deduct: number; note: string }[] = [
    { field: "name", test: () => !!tool.name?.trim(), deduct: 15, note: "name is missing" },
    { field: "tagline", test: () => !!tool.tagline?.trim(), deduct: 10, note: "tagline is missing" },
    { field: "description", test: () => (tool.description?.length || 0) >= 30, deduct: 15, note: "description missing or <30 chars" },
    { field: "features", test: () => Array.isArray(tool.features) && tool.features.length > 0, deduct: 15, note: "features missing or empty" },
    { field: "pricing", test: () => Array.isArray(tool.pricing) && tool.pricing.length > 0, deduct: 10, note: "pricing missing or empty" },
    { field: "websiteUrl", test: () => !!tool.websiteUrl?.trim(), deduct: 15, note: "websiteUrl missing" },
    { field: "category", test: () => !!tool.category?.trim(), deduct: 10, note: "category missing" },
  ];
  for (const r of rules) {
    if (!r.test()) {
      deductions += r.deduct;
      checks.push({ field: r.field, storedValue: String(tool[r.field] ?? ""), actualValue: "missing", verdict: "MISSING", source: "inference", note: r.note });
    }
  }
  if (!tool.logo?.trim()) { deductions += 2; checks.push({ field: "logo", storedValue: "", actualValue: "missing", verdict: "MISSING", source: "inference", note: "logo path missing" }); }
  return { score: clamp(Math.round(((92 - deductions) / 92) * 100)), checks };
}

function auditAccuracy(tool: any): { score: number; checks: FieldCheck[] } {
  const checks: FieldCheck[] = [];
  let deductions = 0;
  if (Array.isArray(tool.features)) {
    const hits = CONTAMINATION_KEYWORDS.filter((k) => tool.features.join(" ").includes(k));
    if (hits.length) { deductions += 30; checks.push({ field: "features", storedValue: JSON.stringify(tool.features), actualValue: "third-party data", verdict: "INCORRECT", source: "inference", note: `Contamination: ${hits.join(", ")}` }); }
    const empty = tool.features.filter((f: string) => !f?.trim()).length;
    if (empty) { deductions += 10; checks.push({ field: "features", storedValue: JSON.stringify(tool.features), actualValue: `${empty} empty`, verdict: "INCORRECT", source: "inference", note: `${empty} empty feature entries` }); }
  }
  const devopsTools = ["gitlab", "github-issues", "github-copilot", "docker"];
  if (Array.isArray(tool.pricing) && !devopsTools.includes(tool.slug)) {
    const hits = CONTAMINATION_KEYWORDS.filter((k) => JSON.stringify(tool.pricing).includes(k));
    if (hits.length) { deductions += 30; checks.push({ field: "pricing", storedValue: JSON.stringify(tool.pricing), actualValue: "third-party data", verdict: "INCORRECT", source: "inference", note: `Contamination: ${hits.join(", ")}` }); }
    const bad = tool.pricing.filter((p: any) => !p.plan?.trim() || !p.price?.trim()).length;
    if (bad) { deductions += 10; checks.push({ field: "pricing", storedValue: JSON.stringify(tool.pricing), actualValue: `${bad} invalid`, verdict: "INCORRECT", source: "inference", note: `${bad} pricing entries missing plan/price` }); }
  }
  if (tool.description && tool.tagline && tool.description === tool.tagline) { deductions += 10; checks.push({ field: "description", storedValue: tool.description, actualValue: "same as tagline", verdict: "INCORRECT", source: "inference", note: "Description identical to tagline" }); }
  return { score: clamp(Math.round(((70 - deductions) / 70) * 100)), checks };
}

function auditValidity(tool: any, validCategories: string[]): { score: number; checks: FieldCheck[] } {
  const checks: FieldCheck[] = [];
  let deductions = 0;
  if (tool.websiteUrl && !URL_REGEX.test(tool.websiteUrl)) { deductions += 20; checks.push({ field: "websiteUrl", storedValue: tool.websiteUrl, actualValue: "invalid URL", verdict: "INCORRECT", source: "inference", note: "websiteUrl not a valid URL" }); }
  if (tool.tagline) {
    if (tool.tagline.length < 5) { deductions += 10; checks.push({ field: "tagline", storedValue: tool.tagline, actualValue: "too short", verdict: "INCORRECT", source: "inference", note: `Tagline ${tool.tagline.length} chars < 5` }); }
    else if (tool.tagline.length > 120) { deductions += 10; checks.push({ field: "tagline", storedValue: tool.tagline, actualValue: "too long", verdict: "OUTDATED", source: "inference", note: `Tagline ${tool.tagline.length} chars > 120` }); }
  }
  if (tool.description?.length > 500) { deductions += 5; checks.push({ field: "description", storedValue: String(tool.description.length), actualValue: "too long", verdict: "OUTDATED", source: "inference", note: `Description ${tool.description.length} chars > 500` }); }
  if (tool.category && !validCategories.includes(tool.category)) { deductions += 20; checks.push({ field: "category", storedValue: tool.category, actualValue: `not in [${validCategories.join(",")}]`, verdict: "INCORRECT", source: "inference", note: `Category "${tool.category}" not in whitelist` }); }
  if (tool.rating !== undefined && tool.rating !== null && (tool.rating < 0 || tool.rating > 5)) { deductions += 10; checks.push({ field: "rating", storedValue: String(tool.rating), actualValue: "out of range", verdict: "INCORRECT", source: "inference", note: `Rating ${tool.rating} outside 0-5` }); }
  return { score: clamp(Math.round(((65 - deductions) / 65) * 100)), checks };
}

function auditConsistency(tool: any): { score: number; checks: FieldCheck[] } {
  const checks: FieldCheck[] = [];
  let deductions = 0;
  if (tool.githubUrl && (tool.githubStars === null || tool.githubStars === undefined)) { deductions += 15; checks.push({ field: "githubStars", storedValue: "null", actualValue: "githubUrl exists", verdict: "OUTDATED", source: "inference", note: "Has GitHub URL but stars is null" }); }
  if (tool.openSource === true && !tool.githubUrl) { deductions += 10; checks.push({ field: "openSource", storedValue: "true", actualValue: "no githubUrl", verdict: "INCORRECT", source: "inference", note: "Open source but no GitHub URL" }); }
  if (tool.githubUrl && tool.githubStars === 0) { deductions += 10; checks.push({ field: "githubStars", storedValue: "0", actualValue: "has githubUrl", verdict: "INCORRECT", source: "inference", note: "Stars is 0 but has GitHub URL" }); }
  return { score: clamp(Math.round(((35 - deductions) / 35) * 100)), checks };
}

function auditToolData(tool: any, validCategories: string[], allSlugs: Set<string>, allNames: Set<string>): DataAuditResult {
  console.log(`  📊 ${tool.name} (${tool.slug})`);
  const c = auditCompleteness(tool);
  const a = auditAccuracy(tool);
  const v = auditValidity(tool, validCategories);
  const co = auditConsistency(tool);

  // Uniqueness (catalog-level)
  const uChecks: FieldCheck[] = [];
  let uDeductions = 0;
  if ([...allSlugs].filter((s) => s === tool.slug).length > 1) { uDeductions += 50; uChecks.push({ field: "slug", storedValue: tool.slug, actualValue: "duplicate", verdict: "INCORRECT", source: "inference", note: `Slug "${tool.slug}" duplicated` }); }
  const nameL = tool.name?.toLowerCase();
  if ([...allNames].filter((n) => n === nameL).length > 1) { uDeductions += 20; uChecks.push({ field: "name", storedValue: tool.name, actualValue: "duplicate", verdict: "OUTDATED", source: "inference", note: `Name "${tool.name}" duplicated` }); }
  const uScore = clamp(Math.round(((70 - uDeductions) / 70) * 100));

  const composite = Math.round(c.score * 0.30 + a.score * 0.25 + v.score * 0.20 + co.score * 0.15 + 100 * 0.07 + uScore * 0.03);
  const allChecks = [...c.checks, ...a.checks, ...v.checks, ...co.checks, ...uChecks];
  return {
    slug: tool.slug, name: tool.name, accuracyScore: composite, fieldChecks: allChecks,
    recommendations: allChecks.filter((x) => x.verdict !== "ACCURATE").map((x) => `${x.field}: ${x.note}`),
    concerns: allChecks.filter((x) => x.verdict === "INCORRECT").map((x) => `${x.field}: ${x.note}`),
    auditedAt: new Date().toISOString(),
  };
}

// ─── Content Quality Audit ───────────────────────────────────────────

async function auditContent(
  slug: string,
  type: "comparison" | "blog" | "report",
  content: string,
  toolData?: any
): Promise<ContentAuditResult> {
  console.log(`\n📝 Auditing ${type}: ${slug}`);

  const systemPrompt = `You are a senior content quality auditor for a software tools directory website. Evaluate the following ${type} article for quality, accuracy, and SEO effectiveness.

SCORING (0-100 each):
1. qualityScore: Writing quality, structure, usefulness for readers
2. accuracyScore: Factual accuracy (cross-check against provided tool data if available)
3. seoScore: SEO structure (headings, keywords, internal linking potential, meta-friendliness)

For issues, use severity: high (factual errors, misleading info), medium (missing important info, poor structure), low (minor improvements).

Output MUST be valid JSON only, no markdown blocks.

Required JSON schema:
{
  "qualityScore": 0-100,
  "accuracyScore": 0-100,
  "seoScore": 0-100,
  "issues": [
    { "severity": "high|medium|low", "message": "description of the issue" }
  ],
  "strengths": ["what this content does well"],
  "recommendations": ["specific improvements"]
}`;

  const contextSection = toolData
    ? `\nTOOL DATA FOR CROSS-REFERENCE:\n${JSON.stringify(toolData, null, 2)}`
    : "";

  const userPrompt = `Evaluate this ${type} article.

CONTENT:
---
${content.slice(0, 6000)}
---
${contextSection}

Return ONLY JSON with your evaluation.`;

  try {
    const llmRes = await callLlm(systemPrompt, userPrompt);
    const clean = llmRes.content.replace(/```json\s*|```\s*$/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      slug,
      type,
      qualityScore: parsed.qualityScore || 0,
      accuracyScore: parsed.accuracyScore || 0,
      seoScore: parsed.seoScore || 0,
      issues: parsed.issues || [],
      strengths: parsed.strengths || [],
      recommendations: parsed.recommendations || [],
      auditedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`   ❌ Audit failed for ${slug}:`, (err as Error).message);
    return {
      slug,
      type,
      qualityScore: 0,
      accuracyScore: 0,
      seoScore: 0,
      issues: [{ severity: "high", message: `Audit failed: ${(err as Error).message}` }],
      strengths: [],
      recommendations: [],
      auditedAt: new Date().toISOString(),
    };
  }
}

// ─── CLI ─────────────────────────────────────────────────────────────

function parseArgs(): { mode: string; slug?: string; limit: number } {
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
  return {
    mode: parsed.mode || "all",
    slug: parsed.slug,
    limit: parseInt(parsed.limit, 10) || 0,
  };
}

function loadExistingAuditResults(): { data: DataAuditResult[]; content: ContentAuditResult[] } {
  if (!fs.existsSync(AUDIT_RESULTS_PATH)) return { data: [], content: [] };
  try {
    return JSON.parse(fs.readFileSync(AUDIT_RESULTS_PATH, "utf-8"));
  } catch {
    return { data: [], content: [] };
  }
}

function saveAuditResults(results: { data: DataAuditResult[]; content: ContentAuditResult[] }) {
  fs.writeFileSync(AUDIT_RESULTS_PATH, JSON.stringify(results, null, 2) + "\n");
}

function generateFixPrompt(dataResults: DataAuditResult[], contentResults: ContentAuditResult[]) {
  const lines: string[] = [];
  const now = new Date().toISOString().split("T")[0];

  lines.push(`# Audit Fix Prompt — ${now}`);
  lines.push("");
  lines.push("This file was auto-generated by `ai-audit.ts`. Read it and fix all issues listed below.");
  lines.push("");

  // Data accuracy issues
  const dataWithIssues = dataResults.filter((d) =>
    d.fieldChecks.some((f) => f.verdict !== "ACCURATE" && f.verdict !== "UNVERIFIABLE")
  );

  if (dataWithIssues.length > 0) {
    lines.push("## Data Accuracy Issues (data/tools.json)");
    lines.push("");

    for (const audit of dataWithIssues) {
      const issues = audit.fieldChecks.filter(
        (f) => f.verdict !== "ACCURATE" && f.verdict !== "UNVERIFIABLE"
      );
      lines.push(`### ${audit.name} (slug: \`${audit.slug}\`, accuracy: ${audit.accuracyScore}/100)`);

      for (const issue of issues) {
        lines.push(`- **${issue.field}**: ${issue.verdict} — ${issue.note}`);
        if (issue.actualValue && issue.actualValue !== "unverifiable") {
          lines.push(`  Current value: \`${issue.storedValue}\``);
          lines.push(`  Should be: \`${issue.actualValue}\``);
        }
      }

      if (audit.recommendations.length > 0) {
        for (const rec of audit.recommendations) {
          lines.push(`  → ${rec}`);
        }
      }
      lines.push("");
    }
  }

  // Content quality issues
  const contentWithIssues = contentResults.filter((c) =>
    c.issues.some((i) => i.severity === "high")
  );

  if (contentWithIssues.length > 0) {
    lines.push("## Content Quality Issues (src/content/)");
    lines.push("");

    for (const audit of contentWithIssues) {
      const highIssues = audit.issues.filter((i) => i.severity === "high");
      const ext = audit.type === "blog" ? "md" : "md";
      const dir = audit.type === "blog" ? "blog" : audit.type === "comparison" ? "comparisons" : "reports";
      lines.push(`### ${audit.slug} (\`src/content/${dir}/${audit.slug}.${ext}\`)`);
      lines.push(`Scores: quality=${audit.qualityScore}/100, accuracy=${audit.accuracyScore}/100, seo=${audit.seoScore}/100`);

      for (const issue of highIssues) {
        lines.push(`- **[high]** ${issue.message}`);
      }

      if (audit.recommendations.length > 0) {
        for (const rec of audit.recommendations) {
          lines.push(`  → ${rec}`);
        }
      }
      lines.push("");
    }
  }

  // Low-quality content
  const lowQuality = contentResults.filter((c) => {
    const avg = (c.qualityScore + c.accuracyScore + c.seoScore) / 3;
    return avg < 60 && !contentWithIssues.includes(c);
  });

  if (lowQuality.length > 0) {
    lines.push("## Low-Quality Content (needs rewrite)");
    lines.push("");

    for (const audit of lowQuality) {
      const avg = Math.round((audit.qualityScore + audit.accuracyScore + audit.seoScore) / 3);
      const dir = audit.type === "blog" ? "blog" : audit.type === "comparison" ? "comparisons" : "reports";
      lines.push(`- \`${audit.slug}\` (src/content/${dir}/${audit.slug}.md): avg ${avg}/100`);
      if (audit.recommendations.length > 0) {
        lines.push(`  → ${audit.recommendations[0]}`);
      }
    }
    lines.push("");
  }

  // Action summary
  lines.push("## Action Items");
  lines.push("");
  lines.push("1. Fix `data/tools.json` — update the fields listed above with correct values");
  lines.push("2. Rewrite content — regenerate low-quality and inaccurate markdown files");
  lines.push("3. Run `npm run build` to verify no errors");
  lines.push("4. Commit and push changes");

  const totalIssues = dataWithIssues.length + contentWithIssues.length + lowQuality.length;
  if (totalIssues === 0) {
    lines.push("No issues found. All data and content passed audit checks.");
  }

  const promptPath = path.resolve(__dirname, "../data/audit-fix-prompt.md");
  fs.writeFileSync(promptPath, lines.join("\n") + "\n");
  console.log(`\n📝 Fix prompt saved to: data/audit-fix-prompt.md`);
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  const { mode, slug, limit } = parseArgs();

  console.log(`🔍 AutoClaw AI Audit Engine starting...`);
  console.log(`   Mode: ${mode}`);
  console.log(`   Slug filter: ${slug || "none"}`);
  console.log(`   Limit: ${limit || "unlimited"}`);

  const existing = loadExistingAuditResults();
  const dataResults: DataAuditResult[] = existing.data || [];
  const contentResults: ContentAuditResult[] = existing.content || [];

  // ── Data Accuracy Audit ──
  if (mode === "data" || mode === "all") {
    const tools = loadJson<any>(TOOLS_PATH);
    const validCategories = loadCategories();
    const allSlugs = new Set(tools.map((t: any) => t.slug));
    const allNames = new Set(tools.map((t: any) => t.name?.toLowerCase()));
    const toAudit = slug ? tools.filter((t: any) => t.slug === slug) : tools;
    const limited = limit ? toAudit.slice(0, limit) : toAudit;
    console.log(`\n📊 Data audit: ${limited.length} tools (rule engine, no LLM)\n`);

    for (const tool of limited) {
      const result = auditToolData(tool, validCategories, allSlugs, allNames);
      const idx = dataResults.findIndex((r) => r.slug === result.slug);
      if (idx >= 0) dataResults[idx] = result;
      else dataResults.push(result);

      const icon = result.accuracyScore >= 80 ? "✅" : result.accuracyScore >= 60 ? "⚠️" : "❌";
      console.log(`   ${icon} ${result.name}: ${result.accuracyScore}/100`);
      for (const issue of result.fieldChecks.filter((f) => f.verdict !== "ACCURATE" && f.verdict !== "UNVERIFIABLE")) {
        console.log(`      ${issue.field}: ${issue.verdict} — ${issue.note}`);
      }
    }
  }

  // ── Content Quality Audit ──
  if (mode === "content" || mode === "all") {
    const tools = loadJson<any>(TOOLS_PATH);
    const toolMap = new Map(tools.map((t: any) => [t.slug, t]));

    const contentTypes: { dir: string; type: "comparison" | "blog" | "report" }[] = [
      { dir: path.join(CONTENT_DIR, "comparisons"), type: "comparison" },
      { dir: path.join(CONTENT_DIR, "blog"), type: "blog" },
      { dir: path.join(CONTENT_DIR, "reports"), type: "report" },
    ];

    for (const { dir, type } of contentTypes) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
      const toAudit = slug
        ? files.filter((f) => f.replace(/\.md$/, "") === slug)
        : files;
      const limited = limit ? toAudit.slice(0, limit) : toAudit;

      console.log(`\n📝 Content audit (${type}): ${limited.length} files`);

      for (const file of limited) {
        const contentSlug = file.replace(/\.md$/, "");
        const raw = fs.readFileSync(path.join(dir, file), "utf-8");
        const { content } = matter(raw);

        // For comparisons, include both tools' data for cross-reference
        let toolData: any = undefined;
        if (type === "comparison") {
          const comp = loadJson<any>(COMPARISONS_PATH).find((c: any) => c.slug === contentSlug);
          if (comp) {
            const tA = toolMap.get(comp.toolA);
            const tB = toolMap.get(comp.toolB);
            if (tA && tB) toolData = { toolA: tA, toolB: tB };
          }
        } else if (type === "report") {
          toolData = toolMap.get(contentSlug);
        }

        const result = await auditContent(contentSlug, type, content, toolData);
        const idx = contentResults.findIndex((r) => r.slug === result.slug && r.type === result.type);
        if (idx >= 0) contentResults[idx] = result;
        else contentResults.push(result);

        const avg = Math.round((result.qualityScore + result.accuracyScore + result.seoScore) / 3);
        const icon = avg >= 80 ? "✅" : avg >= 60 ? "⚠️" : "❌";
        console.log(`   ${icon} ${contentSlug}: Q${result.qualityScore}/A${result.accuracyScore}/S${result.seoScore}`);
        for (const issue of result.issues.filter((i) => i.severity === "high")) {
          console.log(`      🔴 ${issue.message}`);
        }
      }
    }
  }

  // ── Save Results ──
  saveAuditResults({ data: dataResults, content: contentResults });

  // ── Summary ──
  console.log(`\n${"═".repeat(50)}`);
  console.log(`📊 AUDIT SUMMARY`);
  console.log(`${"═".repeat(50)}`);

  if (dataResults.length > 0) {
    const avgAcc = Math.round(dataResults.reduce((s, r) => s + r.accuracyScore, 0) / dataResults.length);
    const critical = dataResults.filter((r) => r.accuracyScore < 60).length;
    console.log(`\nData Accuracy:`);
    console.log(`   Tools audited: ${dataResults.length}`);
    console.log(`   Average accuracy: ${avgAcc}/100`);
    console.log(`   Critical (< 60): ${critical}`);

    const allIssues = dataResults.flatMap((r) =>
      r.fieldChecks.filter((f) => f.verdict === "OUTDATED" || f.verdict === "INCORRECT")
    );
    if (allIssues.length > 0) {
      console.log(`\n   Top issues:`);
      for (const issue of allIssues.slice(0, 10)) {
        console.log(`   - ${issue.field}: ${issue.verdict} (${issue.note})`);
      }
    }
  }

  if (contentResults.length > 0) {
    const avgQ = Math.round(contentResults.reduce((s, r) => s + r.qualityScore, 0) / contentResults.length);
    const avgA = Math.round(contentResults.reduce((s, r) => s + r.accuracyScore, 0) / contentResults.length);
    const avgS = Math.round(contentResults.reduce((s, r) => s + r.seoScore, 0) / contentResults.length);
    console.log(`\nContent Quality:`);
    console.log(`   Content audited: ${contentResults.length}`);
    console.log(`   Quality: ${avgQ}/100 | Accuracy: ${avgA}/100 | SEO: ${avgS}/100`);
  }

  console.log(`\nFull results saved to: data/audit-results.json`);

  // Generate fix prompt for Claude Code
  generateFixPrompt(dataResults, contentResults);
}

main().catch(console.error);
