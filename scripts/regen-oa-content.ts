#!/usr/bin/env tsx
/**
 * Regenerate content for tools with template-like descriptions.
 * Uses GitHub description + topics + website meta as context for the LLM.
 */

import fs from "fs";
import path from "path";
import { callLlm } from "./lib/llm";

const TOOLS_PATH = path.resolve(__dirname, "../data/tools.json");

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

function isTemplateContent(t: Tool): boolean {
  const desc = t.description.toLowerCase();
  const tagline = t.tagline.toLowerCase();
  return (
    desc.includes("is an open-source alternative in the") ||
    desc.includes("is an open-source tool in the") ||
    desc.length < 100 ||
    (tagline.includes("open-source") && tagline.includes("tool") && tagline.includes("—"))
  );
}

async function fetchGithubInfo(githubUrl: string): Promise<{ description: string | null; topics: string[] | null }> {
  if (!githubUrl) return { description: null, topics: null };
  try {
    const repo = githubUrl.replace("https://github.com/", "");
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {},
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      return { description: data.description, topics: data.topics || [] };
    }
  } catch {}
  return { description: null, topics: null };
}

async function fetchWebsiteMeta(url: string): Promise<string | null> {
  if (!url || url.includes("openalternative.co")) return null;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; toolalts/1.0)" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (match) return match[1];
    const ogMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    return ogMatch ? ogMatch[1] : null;
  } catch {}
  return null;
}

async function regenerateContent(
  tool: Tool,
  ghDesc: string | null,
  ghTopics: string[] | null,
  webMeta: string | null,
  existingTaglines: string[]
): Promise<{ tagline: string; description: string; features: string[] }> {
  const systemPrompt = `You are a software analyst writing for a SaaS alternatives directory called ToolAlts.
Your job is to write a concise, accurate, and ORIGINAL tagline, description, and feature list for a software tool.

CRITICAL RULES FOR ORIGINALITY:
- Write completely original content. Do NOT copy or closely paraphrase any source material.
- Use the provided context (GitHub description, topics, website meta) only as FACTUAL reference.
- Avoid generic phrases like "open-source platform that", "is an open-source alternative".
- The tagline must be unique — avoid common templates other tools use.

FORMAT:
- Tagline: one compelling sentence, max 80 characters, highlighting the tool's SPECIFIC differentiator.
- Description: 2-3 factual sentences, 150-300 characters, about what the tool does and who it serves.
- Features: 4-5 short bullet points, each 30-60 characters, specific to this tool.

Respond in JSON: { "tagline": "...", "description": "...", "features": ["...", ...] }`;

  const contextParts: string[] = [`Tool name: ${tool.name}`, `Category: ${tool.category}`];
  if (tool.websiteUrl && !tool.websiteUrl.includes("openalternative.co")) {
    contextParts.push(`Website: ${tool.websiteUrl}`);
  }
  if (tool.githubStars) contextParts.push(`GitHub stars: ${tool.githubStars}`);
  if (ghDesc) contextParts.push(`GitHub description: ${ghDesc}`);
  if (ghTopics && ghTopics.length > 0) contextParts.push(`Topics: ${ghTopics.join(", ")}`);
  if (webMeta) contextParts.push(`Website meta: ${webMeta}`);
  if (existingTaglines.length > 0) {
    contextParts.push(`\nAvoid these taglines:\n${existingTaglines.slice(0, 10).map((t, i) => `${i + 1}. "${t}"`).join("\n")}`);
  }

  const userPrompt = `${contextParts.join("\n")}\n\nWrite an original tagline, description, and features.`;

  const res = await callLlm(systemPrompt, userPrompt, { jsonMode: true });
  const data = JSON.parse(res.content);
  return {
    tagline: data.tagline || tool.tagline,
    description: data.description || tool.description,
    features: Array.isArray(data.features) ? data.features.slice(0, 5) : tool.features,
  };
}

async function main() {
  const tools: Tool[] = JSON.parse(fs.readFileSync(TOOLS_PATH, "utf-8"));
  const toFix = tools.filter((t) => t.status === "active" && isTemplateContent(t));

  console.log(`Found ${toFix.length} tools with template content to regenerate`);

  // Collect existing good taglines for dedup
  const existingTaglines = tools
    .filter((t) => t.status === "active" && !isTemplateContent(t))
    .map((t) => t.tagline)
    .filter(Boolean);

  let fixed = 0;
  for (const tool of toFix) {
    console.log(`  🔄 ${tool.name} (${tool.slug})...`);

    // Fetch extra context
    const ghInfo = await fetchGithubInfo(tool.githubUrl || "");
    const webMeta = await fetchWebsiteMeta(tool.websiteUrl);

    try {
      const content = await regenerateContent(tool, ghInfo.description, ghInfo.topics, webMeta, existingTaglines);

      // Update tool
      const idx = tools.findIndex((t) => t.slug === tool.slug);
      tools[idx].tagline = content.tagline;
      tools[idx].description = content.description;
      tools[idx].features = content.features;
      existingTaglines.push(content.tagline);
      fixed++;

      console.log(`    ✓ ${content.tagline}`);
    } catch (e: any) {
      console.log(`    ✗ LLM failed: ${e.message}`);
    }

    // Rate limit
    await new Promise((r) => setTimeout(r, 2000));
  }

  fs.writeFileSync(TOOLS_PATH, JSON.stringify(tools, null, 2) + "\n");
  console.log(`\nDone! Regenerated ${fixed}/${toFix.length} tools`);
}

main().catch(console.error);