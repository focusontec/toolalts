#!/usr/bin/env tsx
/**
 * AutoClaw AI Audit Engine
 * Two-dimensional quality control using DeepSeek:
 * 1. Data Accuracy — cross-check tools.json against real sources (GitHub, website)
 * 2. Content Quality — evaluate generated articles for accuracy, quality, SEO
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

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  return match ? { owner: match[1], repo: match[2] } : null;
}

async function fetchGitHubData(fullName: string): Promise<any> {
  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}`, {
      headers: process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {},
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchUrl(url: string): Promise<{ reachable: boolean; html: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; toolalts-audit/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { reachable: false, html: "" };
    return { reachable: true, html: await res.text() };
  } catch {
    return { reachable: false, html: "" };
  }
}

function extractPricingFromHtml(html: string): string {
  // Extract text around pricing-related sections
  const pricingPatterns = [
    /<[^>]*(?:id|class)=["'][^"']*pricing[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div|main)>/i,
    /<[^>]*(?:id|class)=["'][^"']*plan[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div|main)>/i,
  ];
  for (const pattern of pricingPatterns) {
    const match = html.match(pattern);
    if (match) {
      // Strip HTML tags, collapse whitespace
      return match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000);
    }
  }
  return "";
}

// ─── Data Accuracy Audit ─────────────────────────────────────────────

async function auditToolData(tool: any): Promise<DataAuditResult> {
  console.log(`\n📊 Auditing data: ${tool.name} (${tool.slug})`);

  // Gather real-world evidence
  const evidence: any = { stored: {} };

  // GitHub data
  if (tool.githubUrl) {
    const parsed = parseGitHubUrl(tool.githubUrl);
    if (parsed) {
      const gh = await fetchGitHubData(`${parsed.owner}/${parsed.repo}`);
      if (gh) {
        evidence.github = {
          description: gh.description,
          stars: gh.stargazers_count,
          forks: gh.forks_count,
          language: gh.language,
          topics: gh.topics,
          license: gh.license?.spdx_id,
          updatedAt: gh.updated_at,
          homepage: gh.homepage,
          openIssues: gh.open_issues_count,
        };
        console.log(`   ✅ GitHub data fetched (${gh.stargazers_count} stars)`);
      }
    }
  }

  // Website data
  if (tool.websiteUrl) {
    const web = await fetchUrl(tool.websiteUrl);
    if (web.reachable) {
      const titleMatch = web.html.match(/<title>([^<]+)<\/title>/i);
      const descMatch =
        web.html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
        web.html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
      evidence.website = {
        reachable: true,
        title: titleMatch?.[1]?.trim(),
        metaDescription: descMatch?.[1]?.trim(),
        pricingText: extractPricingFromHtml(web.html),
      };
      console.log(`   ✅ Website fetched`);
    } else {
      evidence.website = { reachable: false };
      console.log(`   ⚠️ Website not reachable`);
    }
  }

  // Stored data for comparison
  evidence.stored = {
    tagline: tool.tagline,
    description: tool.description,
    rating: tool.rating,
    reviewsCount: tool.reviewsCount,
    openSource: tool.openSource,
    githubStars: tool.githubStars,
    features: tool.features,
    pricing: tool.pricing,
    category: tool.category,
  };

  const systemPrompt = `You are a senior data quality auditor for a software tools directory. Your job is to verify every field of a tool's data record against real-world evidence from GitHub and the official website.

For each field, determine:
- ACCURATE: The stored value matches reality
- OUTDATED: Was once correct but has changed
- INCORRECT: Never was correct
- MISSING: Field is empty/placeholder when real data exists
- UNVERIFIABLE: Cannot be checked from available sources (e.g. subjective ratings)

IMPORTANT RULES:
1. Be strict. If pricing has changed even slightly, mark OUTDATED.
2. If features listed don't match what the website claims, mark INCORRECT.
3. If description is generic filler, mark INCORRECT and provide a better one.
4. If githubStars differs by >5%, mark OUTDATED.
5. Check if category makes sense based on the tool's actual purpose.
6. Check if the tool is still actively maintained (last commit < 6 months).

Output MUST be valid JSON only, no markdown blocks.

Required JSON schema:
{
  "accuracyScore": 0-100,
  "fieldChecks": [
    {
      "field": "tagline|description|rating|reviewsCount|openSource|githubStars|features|pricing|category|websiteUrl",
      "storedValue": "what's currently stored (stringified)",
      "actualValue": "what the evidence shows, or 'unverifiable'",
      "verdict": "ACCURATE|OUTDATED|INCORRECT|MISSING|UNVERIFIABLE",
      "source": "github|website|inference",
      "note": "explanation"
    }
  ],
  "recommendations": ["specific actions to fix issues"],
  "concerns": ["red flags about this tool"]
}`;

  const userPrompt = `Verify this tool's data against real-world evidence.

STORED DATA:
${JSON.stringify(evidence.stored, null, 2)}

GITHUB EVIDENCE:
${JSON.stringify(evidence.github || "No GitHub data available", null, 2)}

WEBSITE EVIDENCE:
${JSON.stringify(evidence.website || "No website data available", null, 2)}

Audit every field. Return ONLY JSON.`;

  try {
    const llmRes = await callLlm(systemPrompt, userPrompt);
    const clean = llmRes.content.replace(/```json\s*|```\s*$/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      slug: tool.slug,
      name: tool.name,
      accuracyScore: parsed.accuracyScore || 0,
      fieldChecks: parsed.fieldChecks || [],
      recommendations: parsed.recommendations || [],
      concerns: parsed.concerns || [],
      auditedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`   ❌ Audit failed for ${tool.name}:`, (err as Error).message);
    return {
      slug: tool.slug,
      name: tool.name,
      accuracyScore: 0,
      fieldChecks: [],
      recommendations: [`Audit failed: ${(err as Error).message}`],
      concerns: ["Could not complete audit"],
      auditedAt: new Date().toISOString(),
    };
  }
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
    const toAudit = slug
      ? tools.filter((t: any) => t.slug === slug)
      : tools;

    const limited = limit ? toAudit.slice(0, limit) : toAudit;
    console.log(`\n📊 Data audit: ${limited.length} tools`);

    for (const tool of limited) {
      const result = await auditToolData(tool);
      // Replace existing result for same slug
      const idx = dataResults.findIndex((r) => r.slug === result.slug);
      if (idx >= 0) dataResults[idx] = result;
      else dataResults.push(result);

      const accColor = result.accuracyScore >= 80 ? "✅" : result.accuracyScore >= 60 ? "⚠️" : "❌";
      console.log(`   ${accColor} ${result.name}: accuracy ${result.accuracyScore}/100`);

      const issues = result.fieldChecks.filter((f) => f.verdict !== "ACCURATE" && f.verdict !== "UNVERIFIABLE");
      for (const issue of issues) {
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
