#!/usr/bin/env tsx
/**
 * Fix tool content issues:
 * 1. Resolve real website URLs for tools still pointing to openalternative.co
 * 2. Regenerate descriptions that are too short (< 120 chars)
 * 3. Enrich features from GitHub topics
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

const ghHeaders: Record<string, string> = process.env.GITHUB_TOKEN
  ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
  : {};

/**
 * Search GitHub for a tool's repo and return full info.
 */
async function searchGithub(name: string): Promise<{
  githubUrl: string | null;
  websiteUrl: string | null;
  githubStars: number | null;
  description: string | null;
  topics: string[] | null;
}> {
  try {
    const query = encodeURIComponent(name.replace(/[^\w\s]/g, ""));
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=5`,
      { headers: ghHeaders, signal: AbortSignal.timeout(10000) }
    );
    if (res.ok) {
      const data = await res.json();
      const toolSlug = name.toLowerCase().replace(/\s+/g, "-");
      const toolCompact = name.toLowerCase().replace(/\s+/g, "");
      for (const repo of data.items || []) {
        const repoName = repo.name.toLowerCase();
        if (repoName === toolSlug || repoName === toolCompact ||
            repo.full_name.toLowerCase().includes(toolCompact)) {
          return {
            githubUrl: `https://github.com/${repo.full_name}`,
            websiteUrl: repo.homepage || null,
            githubStars: repo.stargazers_count,
            description: repo.description,
            topics: repo.topics || [],
          };
        }
      }
    }
  } catch {}
  return { githubUrl: null, websiteUrl: null, githubStars: null, description: null, topics: null };
}

/**
 * Fetch website meta description.
 */
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
  webMeta: string | null
): Promise<{ tagline: string; description: string; features: string[] }> {
  const systemPrompt = `You are a software analyst writing for a SaaS alternatives directory called ToolAlts.
Write a concise, accurate, and ORIGINAL tagline, description, and feature list.

CRITICAL RULES:
- Write completely original content. Do NOT copy or paraphrase any source material.
- Use the provided context only as FACTUAL reference.
- Avoid generic phrases like "open-source platform that", "is an open-source alternative".

FORMAT:
- Tagline: one sentence, max 80 chars, highlighting the tool's SPECIFIC differentiator.
- Description: 3-4 factual sentences, 200-400 chars, about what the tool does, key capabilities, and who it serves.
- Features: 4-5 bullet points, each 30-60 chars, specific to this tool.

Respond in JSON: { "tagline": "...", "description": "...", "features": ["...", ...] }`;

  const contextParts: string[] = [`Tool name: ${tool.name}`, `Category: ${tool.category}`];
  if (tool.websiteUrl && !tool.websiteUrl.includes("openalternative.co")) {
    contextParts.push(`Website: ${tool.websiteUrl}`);
  }
  if (tool.githubStars) contextParts.push(`GitHub stars: ${tool.githubStars}`);
  if (ghDesc) contextParts.push(`GitHub description: ${ghDesc}`);
  if (ghTopics && ghTopics.length > 0) contextParts.push(`Topics: ${ghTopics.join(", ")}`);
  if (webMeta) contextParts.push(`Website meta: ${webMeta}`);
  // Include current features as reference
  if (tool.features && tool.features.length > 0) {
    contextParts.push(`Current features: ${tool.features.join(", ")}`);
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

  // Identify tools needing fixes
  const needsFix = tools.filter((t) => {
    if (t.status !== "active") return false;
    const desc = t.description || "";
    const web = t.websiteUrl || "";
    return desc.length < 120 || web.includes("openalternative.co");
  });

  console.log(`Found ${needsFix.length} tools to fix\n`);

  let fixed = 0;
  let urlFixed = 0;
  let contentFixed = 0;

  for (const tool of needsFix) {
    console.log(`🔄 ${tool.name} (${tool.slug})`);
    let changed = false;

    // Step 1: Fix website URL if pointing to OA
    if (tool.websiteUrl.includes("openalternative.co")) {
      console.log(`   🌐 Resolving real website...`);
      const ghInfo = await searchGithub(tool.name);

      if (ghInfo.githubUrl && !tool.githubUrl) {
        tool.githubUrl = ghInfo.githubUrl;
        tool.githubStars = ghInfo.githubStars;
        changed = true;
        console.log(`   ✓ GitHub: ${ghInfo.githubUrl} (⭐${ghInfo.githubStars})`);
      }

      if (ghInfo.websiteUrl) {
        tool.websiteUrl = ghInfo.websiteUrl;
        changed = true;
        urlFixed++;
        console.log(`   ✓ Website: ${ghInfo.websiteUrl}`);
      } else if (ghInfo.description) {
        // Even if no homepage, we have GitHub info for content generation
        console.log(`   ⚠ No homepage found, keeping OA URL but using GitHub info`);
      }
    }

    // Step 2: Regenerate content if description is too short
    if (tool.description.length < 120) {
      console.log(`   🧠 Regenerating content (desc ${tool.description.length} chars)...`);

      // Get extra context
      let ghDesc: string | null = null;
      let ghTopics: string[] | null = null;
      if (tool.githubUrl) {
        try {
          const repo = tool.githubUrl.replace("https://github.com/", "");
          const res = await fetch(`https://api.github.com/repos/${repo}`, {
            headers: ghHeaders,
            signal: AbortSignal.timeout(10000),
          });
          if (res.ok) {
            const data = await res.json();
            ghDesc = data.description;
            ghTopics = data.topics || [];
          }
        } catch {}
      }
      const webMeta = await fetchWebsiteMeta(tool.websiteUrl);

      try {
        const content = await regenerateContent(tool, ghDesc, ghTopics, webMeta);
        tool.tagline = content.tagline;
        tool.description = content.description;
        tool.features = content.features;
        changed = true;
        contentFixed++;
        console.log(`   ✓ New tagline: ${content.tagline}`);
        console.log(`   ✓ New desc: ${content.description.slice(0, 80)}... (${content.description.length} chars)`);
      } catch (e: any) {
        console.log(`   ✗ LLM failed: ${e.message}`);
      }
    }

    if (changed) {
      const idx = tools.findIndex((t) => t.slug === tool.slug);
      tools[idx] = tool;
      fixed++;
    }

    // Rate limit
    await new Promise((r) => setTimeout(r, 2500));
  }

  fs.writeFileSync(TOOLS_PATH, JSON.stringify(tools, null, 2) + "\n");
  console.log(`\n✅ Done! Fixed ${fixed} tools (URLs: ${urlFixed}, content: ${contentFixed})`);
}

main().catch(console.error);