#!/usr/bin/env tsx
/**
 * Stage 5: Generate SEO-optimized blog post about the tool
 * Follows a multi-step process: angle selection → research → writing → validation
 */

import { callLlm } from "../lib/llm";
import type { EnrichedTool } from "./enrich-tool";
import type { ToolReport } from "./generate-tool-report";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  markdown: string;
}

const TEMPLATES = [
  { id: "review", pattern: (name: string) => `${name} Review: Features, Pricing & Is It Worth It?` },
  { id: "alternatives", pattern: (name: string) => `Top 7 Alternatives to ${name} in 2026` },
  { id: "guide", pattern: (name: string) => `How to Get Started with ${name}: A Complete Guide` },
  { id: "deep-dive", pattern: (name: string) => `${name} Explained: Everything You Need to Know` },
];

// Step 1: Choose best angle
async function selectAngle(tool: EnrichedTool): Promise<{ template: string; title: string }> {
  const systemPrompt = `You are an SEO content strategist. Choose the best blog angle for this tool.
Pick ONE template that would rank best in search engines and provide the most value to readers.

Templates:
1. "review" - Deep review with features, pricing, verdict. Best for: well-known tools with clear pricing.
2. "alternatives" - List of alternatives. Best for: popular tools people search alternatives for.
3. "guide" - Getting started guide. Best for: complex tools with learning curves.
4. "deep-dive" - Deep analysis. Best for: new/niche tools that need explanation.

Output JSON: {"template": "review", "reason": "why this angle"}`;

  const response = await callLlm(systemPrompt, `Tool: ${tool.name} (${tool.category})\nTagline: ${tool.tagline}\nFeatures: ${tool.features.length} features listed\nOpen Source: ${tool.openSource}`);
  const data = JSON.parse(response.content);

  const template = TEMPLATES.find((t) => t.id === data.template) || TEMPLATES[0];
  return { template: template.id, title: template.pattern(tool.name) };
}

// Step 2-3: Research competitors
async function researchCompetitors(tool: EnrichedTool): Promise<string> {
  const systemPrompt = `You are a market researcher. List 3-5 direct competitors to the given tool.
For each competitor, provide: name, one-line description, key differentiator.
Only list well-known, real competitors. If unsure, say "limited data available."

Output JSON: {"competitors": [{"name": "...", "description": "...", "differentiator": "..."}]}`;

  const response = await callLlm(systemPrompt, `Tool: ${tool.name}\nCategory: ${tool.category}\nTagline: ${tool.tagline}\nFeatures: ${tool.features.join(", ")}`);
  return response.content;
}

// Step 4: Write the article
async function writeArticle(tool: EnrichedTool, report: ToolReport, angle: { template: string; title: string }, competitors: string): Promise<string> {
  const systemPrompt = `You are a senior tech writer. Write an SEO-optimized blog post about this tool.

Rules:
- Write 1200-1800 words of actual content
- Use H2/H3 headings for SEO structure
- Include a comparison table if the template is "review" or "alternatives"
- Include actual pricing data from the provided information
- Include a FAQ section (3-4 questions)
- Use ONLY facts from the provided data. NEVER invent features, prices, or statistics.
- Write in a professional but accessible tone
- Include internal link placeholders: [Tool Name](/tool/slug/) format
- End with a clear recommendation

Output JSON: {"title": "...", "excerpt": "150 char excerpt", "tags": ["tag1", "tag2"], "body": "full markdown content"}`;

  const userPrompt = `Write a "${angle.template}" style blog post about ${tool.name}.

Tool Data:
- Name: ${tool.name}
- Tagline: ${tool.tagline}
- Description: ${tool.description}
- Category: ${tool.category}
- Features: ${tool.features.join(", ")}
- Pricing: ${JSON.stringify(tool.pricing)}
- Open Source: ${tool.openSource}
- GitHub Stars: ${tool.githubStars ?? "N/A"}

Analysis Report:
- Overall Score: ${report.scores.overall}/10
- Pros: ${report.pros.join(", ")}
- Cons: ${report.cons.join(", ")}
- Verdict: ${report.verdict}

Competitors: ${competitors}

Write the article now.`;

  const response = await callLlm(systemPrompt, userPrompt, { jsonMode: false });
  return response.content;
}

// Step 5: Validate the article
async function validateArticle(tool: EnrichedTool, article: string): Promise<{ valid: boolean; issues: string[] }> {
  const systemPrompt = `You are a fact-checker. Validate this blog article against the source data.
Check:
1. Are all feature names accurate?
2. Are all prices correct?
3. Are there any fabricated claims?
4. Are competitor names real?

Output JSON: {"valid": true/false, "issues": ["issue1", "issue2"]}`;

  const response = await callLlm(systemPrompt, `Source Data:\nName: ${tool.name}\nFeatures: ${tool.features.join(", ")}\nPricing: ${JSON.stringify(tool.pricing)}\n\nArticle:\n${article.slice(0, 5000)}`);
  return JSON.parse(response.content);
}

// Step 6: Revise if needed
async function reviseArticle(tool: EnrichedTool, article: string, issues: string[]): Promise<string> {
  const systemPrompt = `Fix the following issues in this blog article. Output the corrected full article as JSON: {"body": "corrected markdown"}`;
  const response = await callLlm(systemPrompt, `Issues to fix:\n${issues.join("\n")}\n\nOriginal article:\n${article}`, { jsonMode: false });
  return response.content;
}

export async function generateToolBlog(tool: EnrichedTool, report: ToolReport): Promise<BlogPost> {
  console.log("  [Blog] Step 1: Selecting angle...");
  const angle = await selectAngle(tool);

  console.log("  [Blog] Step 2: Researching competitors...");
  const competitors = await researchCompetitors(tool);

  console.log("  [Blog] Step 3: Writing article...");
  let article = await writeArticle(tool, report, angle, competitors);

  console.log("  [Blog] Step 4: Validating...");
  const validation = await validateArticle(tool, article);

  if (!validation.valid && validation.issues.length > 0) {
    console.log("  [Blog] Step 5: Revising...");
    article = await reviseArticle(tool, article, validation.issues);
  }

  // Parse the article JSON
  let parsed: any;
  try {
    parsed = JSON.parse(article);
  } catch {
    // If not valid JSON, use raw content
    parsed = { title: angle.title, excerpt: `A comprehensive look at ${tool.name}.`, tags: [tool.category, "review"], body: article };
  }

  const blogSlug = `${tool.slug}-review`;

  const markdown = `---
title: "${parsed.title || angle.title}"
date: "${new Date().toISOString().split("T")[0]}"
excerpt: "${parsed.excerpt || `A comprehensive look at ${tool.name}.`}"
tags: ${JSON.stringify(parsed.tags || [tool.category, "review"])}
author: "ToolAlts"
---

${parsed.body || article}
`;

  return {
    slug: blogSlug,
    title: parsed.title || angle.title,
    excerpt: parsed.excerpt || `A comprehensive look at ${tool.name}.`,
    tags: parsed.tags || [tool.category, "review"],
    markdown,
  };
}
