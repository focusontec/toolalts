#!/usr/bin/env tsx
/**
 * ai-review.ts — Quality Guardian
 *
 * Reviews all tools and content for quality, worthiness, and data accuracy.
 * Generates actionable review report with recommendations.
 *
 * Usage:
 *   npx tsx scripts/ai-review.ts              # full review
 *   npx tsx scripts/ai-review.ts --dry-run    # preview without saving
 */

import fs from "fs";
import path from "path";
import { callLlm } from "./lib/llm";

const TOOLS_PATH = path.resolve(__dirname, "../data/tools.json");
const COMPARISONS_PATH = path.resolve(__dirname, "../data/comparisons.json");
const REPORT_PATH = path.resolve(__dirname, "../data/review-report.md");

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
  status: string;
}

interface ToolReview {
  slug: string;
  name: string;
  worthinessScore: number;   // 0-100: should this tool be on the site?
  dataQualityScore: number;  // 0-100: how accurate is the stored data?
  recommendation: "keep" | "review" | "hide" | "remove";
  reasons: string[];
  dataIssues: string[];
  suggestedFixes: string[];
}

interface PipelineReview {
  overallHealth: string;
  strengths: string[];
  weaknesses: string[];
  promptSuggestions: { prompt: string; issue: string; fix: string }[];
  thresholdSuggestions: { parameter: string; current: string; suggested: string; reason: string }[];
}

interface ReviewResult {
  reviewedAt: string;
  toolReviews: ToolReview[];
  pipelineReview: PipelineReview;
  summary: {
    totalTools: number;
    keepCount: number;
    reviewCount: number;
    hideCount: number;
    removeCount: number;
  };
}

function parseArgs(): { dryRun: boolean } {
  return { dryRun: process.argv.includes("--dry-run") };
}

/**
 * Evaluate a single tool's worthiness and data quality.
 */
async function reviewTool(tool: ToolEntry): Promise<ToolReview> {
  const systemPrompt = `You are a quality curator for a software tools comparison website. Your job is to evaluate whether a tool deserves to be listed.

EVALUATION CRITERIA for worthiness (0-100):
- 80-100: Well-known tool with significant market presence (e.g., Notion, Figma, VS Code)
- 60-79: Established tool with real user base, recognizable in its niche
- 40-59: Smaller tool but legitimate, has real users and active development
- 20-39: Very niche or unproven, limited community awareness
- 0-19: Does not appear to be a real product, or is too obscure to be useful

DATA QUALITY (0-100):
- Check if tagline, description, features seem accurate and well-written
- Check if pricing data looks complete and realistic
- Check if the tool has real website URL (not auto-generated)
- Check if category is appropriate

RECOMMENDATION:
- "keep": tool is valuable and data is good
- "review": tool needs attention (data issues or borderline quality)
- "hide": tool should be hidden from public pages (not good enough)
- "remove": tool should be deleted entirely (not a real product)

Return ONLY valid JSON.`;

  const userPrompt = `Evaluate this tool:

Name: ${tool.name}
Slug: ${tool.slug}
Tagline: ${tool.tagline}
Description: ${tool.description}
Category: ${tool.category}
Rating: ${tool.rating}/5 (${tool.reviewsCount} reviews)
Open Source: ${tool.openSource}
GitHub Stars: ${tool.githubStars ?? "N/A"}
GitHub URL: ${tool.githubUrl || "N/A"}
Website URL: ${tool.websiteUrl || "N/A"}
Status: ${tool.status}
Pricing plans: ${JSON.stringify(tool.pricing)}
Features: ${JSON.stringify(tool.features)}

Return JSON:
{
  "worthinessScore": 0-100,
  "dataQualityScore": 0-100,
  "recommendation": "keep|review|hide|remove",
  "reasons": ["why this recommendation"],
  "dataIssues": ["specific data problems found"],
  "suggestedFixes": ["specific actions to fix data issues"]
}`;

  try {
    const res = await callLlm(systemPrompt, userPrompt);
    const clean = res.content.replace(/```json\s*|```\s*$/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      slug: tool.slug,
      name: tool.name,
      worthinessScore: parsed.worthinessScore || 0,
      dataQualityScore: parsed.dataQualityScore || 0,
      recommendation: parsed.recommendation || "review",
      reasons: parsed.reasons || [],
      dataIssues: parsed.dataIssues || [],
      suggestedFixes: parsed.suggestedFixes || [],
    };
  } catch (err) {
    return {
      slug: tool.slug,
      name: tool.name,
      worthinessScore: 0,
      dataQualityScore: 0,
      recommendation: "review",
      reasons: [`Review failed: ${(err as Error).message}`],
      dataIssues: [],
      suggestedFixes: [],
    };
  }
}

/**
 * Analyze the overall pipeline health and suggest improvements.
 */
async function reviewPipeline(tools: ToolEntry[], toolReviews: ToolReview[]): Promise<PipelineReview> {
  const lowQualityCount = toolReviews.filter((r) => r.worthinessScore < 40).length;
  const dataIssueCount = toolReviews.filter((r) => r.dataQualityScore < 60).length;
  const noUrlCount = tools.filter((t) => !t.websiteUrl).length;
  const noGithubCount = tools.filter((t) => !t.githubUrl).length;
  const zeroReviewsCount = tools.filter((t) => t.reviewsCount === 0).length;

  const systemPrompt = `You are a pipeline quality analyst for an automated tool discovery system. Based on the current state data, analyze the pipeline health and suggest specific improvements.

Focus on:
1. Discovery quality: Are the right tools being found?
2. Verification quality: Is the LLM doing a good job verifying?
3. Data quality: What systematic issues exist?
4. Threshold tuning: Are the discovery/verification thresholds right?
5. Prompt improvements: What specific prompt changes would help?

Return ONLY valid JSON.`;

  const userPrompt = `Pipeline state:
- Total tools: ${tools.length}
- Active: ${tools.filter((t) => t.status === "active").length}
- Draft: ${tools.filter((t) => t.status === "draft").length}
- Low worthiness score (<40): ${lowQualityCount}
- Low data quality (<60): ${dataIssueCount}
- Missing website URL: ${noUrlCount}
- Missing GitHub URL: ${noGithubCount}
- Zero reviews: ${zeroReviewsCount}

Tool review summaries:
${toolReviews.map((r) => `- ${r.name}: worthiness=${r.worthinessScore}, dataQuality=${r.dataQualityScore}, rec=${r.recommendation}`).join("\n")}

Return JSON:
{
  "overallHealth": "brief assessment",
  "strengths": ["what's working well"],
  "weaknesses": ["what needs improvement"],
  "promptSuggestions": [
    {"prompt": "which prompt file", "issue": "what problem", "fix": "specific change"}
  ],
  "thresholdSuggestions": [
    {"parameter": "e.g. GitHub stars minimum", "current": "500", "suggested": "2000", "reason": "why"}
  ]
}`;

  try {
    const res = await callLlm(systemPrompt, userPrompt);
    const clean = res.content.replace(/```json\s*|```\s*$/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      overallHealth: parsed.overallHealth || "Unable to assess",
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      promptSuggestions: parsed.promptSuggestions || [],
      thresholdSuggestions: parsed.thresholdSuggestions || [],
    };
  } catch (err) {
    return {
      overallHealth: `Review failed: ${(err as Error).message}`,
      strengths: [],
      weaknesses: [],
      promptSuggestions: [],
      thresholdSuggestions: [],
    };
  }
}

/**
 * Generate markdown review report.
 */
function generateReport(result: ReviewResult): string {
  const lines: string[] = [];

  lines.push(`# Quality Review Report — ${result.reviewedAt}`);
  lines.push("");

  // Summary
  lines.push("## Summary");
  lines.push("");
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total tools | ${result.summary.totalTools} |`);
  lines.push(`| Keep (quality) | ${result.summary.keepCount} |`);
  lines.push(`| Needs review | ${result.summary.reviewCount} |`);
  lines.push(`| Suggest hide | ${result.summary.hideCount} |`);
  lines.push(`| Suggest remove | ${result.summary.removeCount} |`);
  lines.push("");

  // Pipeline health
  lines.push("## Pipeline Health");
  lines.push("");
  lines.push(result.pipelineReview.overallHealth);
  lines.push("");

  if (result.pipelineReview.strengths.length > 0) {
    lines.push("### Strengths");
    result.pipelineReview.strengths.forEach((s) => lines.push(`- ${s}`));
    lines.push("");
  }

  if (result.pipelineReview.weaknesses.length > 0) {
    lines.push("### Weaknesses");
    result.pipelineReview.weaknesses.forEach((w) => lines.push(`- ${w}`));
    lines.push("");
  }

  // Prompt suggestions
  if (result.pipelineReview.promptSuggestions.length > 0) {
    lines.push("### Prompt Improvement Suggestions");
    lines.push("");
    lines.push("| Prompt | Issue | Suggested Fix |");
    lines.push("|--------|-------|---------------|");
    result.pipelineReview.promptSuggestions.forEach((s) => {
      lines.push(`| ${s.prompt} | ${s.issue} | ${s.fix} |`);
    });
    lines.push("");
  }

  // Threshold suggestions
  if (result.pipelineReview.thresholdSuggestions.length > 0) {
    lines.push("### Threshold Suggestions");
    lines.push("");
    lines.push("| Parameter | Current | Suggested | Reason |");
    lines.push("|-----------|---------|-----------|--------|");
    result.pipelineReview.thresholdSuggestions.forEach((s) => {
      lines.push(`| ${s.parameter} | ${s.current} | ${s.suggested} | ${s.reason} |`);
    });
    lines.push("");
  }

  // Tool reviews - grouped by recommendation
  const groups = {
    remove: result.toolReviews.filter((r) => r.recommendation === "remove"),
    hide: result.toolReviews.filter((r) => r.recommendation === "hide"),
    review: result.toolReviews.filter((r) => r.recommendation === "review"),
    keep: result.toolReviews.filter((r) => r.recommendation === "keep"),
  };

  if (groups.remove.length > 0) {
    lines.push("## Suggest Remove");
    lines.push("");
    for (const r of groups.remove) {
      lines.push(`### ${r.name} (\`${r.slug}\`) — W:${r.worthinessScore} D:${r.dataQualityScore}`);
      r.reasons.forEach((reason) => lines.push(`- ${reason}`));
      if (r.suggestedFixes.length) {
        lines.push("  Fixes:");
        r.suggestedFixes.forEach((f) => lines.push(`  → ${f}`));
      }
      lines.push("");
    }
  }

  if (groups.hide.length > 0) {
    lines.push("## Suggest Hide");
    lines.push("");
    for (const r of groups.hide) {
      lines.push(`### ${r.name} (\`${r.slug}\`) — W:${r.worthinessScore} D:${r.dataQualityScore}`);
      r.reasons.forEach((reason) => lines.push(`- ${reason}`));
      lines.push("");
    }
  }

  if (groups.review.length > 0) {
    lines.push("## Needs Review");
    lines.push("");
    for (const r of groups.review) {
      lines.push(`### ${r.name} (\`${r.slug}\`) — W:${r.worthinessScore} D:${r.dataQualityScore}`);
      r.reasons.forEach((reason) => lines.push(`- ${reason}`));
      if (r.dataIssues.length) {
        lines.push("  Data issues:");
        r.dataIssues.forEach((i) => lines.push(`  - ${i}`));
      }
      if (r.suggestedFixes.length) {
        lines.push("  Fixes:");
        r.suggestedFixes.forEach((f) => lines.push(`  → ${f}`));
      }
      lines.push("");
    }
  }

  if (groups.keep.length > 0) {
    lines.push("## Keep");
    lines.push("");
    for (const r of groups.keep) {
      lines.push(`- **${r.name}** (\`${r.slug}\`) — W:${r.worthinessScore} D:${r.dataQualityScore}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  const { dryRun } = parseArgs();

  const tools: ToolEntry[] = JSON.parse(fs.readFileSync(TOOLS_PATH, "utf-8"));

  console.log(`🔍 Quality Review starting...`);
  console.log(`   Tools to review: ${tools.length}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   LLM: ${process.env.LLM_PROVIDER || "default"}`);

  // Review each tool
  const toolReviews: ToolReview[] = [];
  for (const tool of tools) {
    console.log(`\n  📦 Reviewing: ${tool.name}...`);
    const review = await reviewTool(tool);
    toolReviews.push(review);

    const icon = review.recommendation === "keep" ? "✅" :
                 review.recommendation === "review" ? "⚠️" :
                 review.recommendation === "hide" ? "👁️" : "❌";
    console.log(`     ${icon} ${review.recommendation} (W:${review.worthinessScore} D:${review.dataQualityScore})`);
  }

  // Review pipeline
  console.log(`\n  🔧 Analyzing pipeline...`);
  const pipelineReview = await reviewPipeline(tools, toolReviews);

  // Build result
  const result: ReviewResult = {
    reviewedAt: new Date().toISOString().split("T")[0],
    toolReviews,
    pipelineReview,
    summary: {
      totalTools: tools.length,
      keepCount: toolReviews.filter((r) => r.recommendation === "keep").length,
      reviewCount: toolReviews.filter((r) => r.recommendation === "review").length,
      hideCount: toolReviews.filter((r) => r.recommendation === "hide").length,
      removeCount: toolReviews.filter((r) => r.recommendation === "remove").length,
    },
  };

  // Generate report
  const report = generateReport(result);

  if (!dryRun) {
    fs.writeFileSync(REPORT_PATH, report);
    console.log(`\n💾 Report saved to: ${REPORT_PATH}`);
  } else {
    console.log(`\n--- DRY RUN: Report preview ---`);
    console.log(report.slice(0, 3000));
    console.log(`--- (truncated) ---`);
  }

  // Summary
  console.log(`\n${"═".repeat(50)}`);
  console.log(`📊 QUALITY REVIEW SUMMARY`);
  console.log(`${"═".repeat(50)}`);
  console.log(`Total:    ${result.summary.totalTools}`);
  console.log(`Keep:     ${result.summary.keepCount}`);
  console.log(`Review:   ${result.summary.reviewCount}`);
  console.log(`Hide:     ${result.summary.hideCount}`);
  console.log(`Remove:   ${result.summary.removeCount}`);
  console.log(`\nPipeline: ${pipelineReview.overallHealth}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
