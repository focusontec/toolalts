import fs from "fs";
import path from "path";
import { callLlm } from "./lib/llm";

const COMPARISONS_PATH = path.resolve(__dirname, "../data/comparisons.json");
const TOOLS_PATH = path.resolve(__dirname, "../data/tools.json");
const CONTENT_DIR = path.resolve(__dirname, "../src/content/comparisons");

interface ComparisonEntry {
  slug: string;
  toolA: string;
  toolB: string;
  category: string;
}

interface ToolEntry {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  rating: number;
  reviewsCount: number;
  openSource: boolean;
  githubStars: number | null;
  websiteUrl: string;
  pricing: { plan: string; price: string; features: string[] }[];
  features: string[];
  category: string;
}

function loadComparisons(): ComparisonEntry[] {
  if (!fs.existsSync(COMPARISONS_PATH)) return [];
  return JSON.parse(fs.readFileSync(COMPARISONS_PATH, "utf-8"));
}

function loadTools(): ToolEntry[] {
  if (!fs.existsSync(TOOLS_PATH)) return [];
  return JSON.parse(fs.readFileSync(TOOLS_PATH, "utf-8"));
}

function getToolBySlug(tools: ToolEntry[], slug: string): ToolEntry | undefined {
  return tools.find((t) => t.slug === slug);
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

async function generateComparisonContent(toolA: ToolEntry, toolB: ToolEntry): Promise<string> {
  const systemPrompt = `You are a senior software analyst. Write a detailed, SEO-optimized comparison article between two software tools. The article should be factual, balanced, and helpful for users deciding between the two.

Output MUST be raw Markdown (no frontmatter, no code blocks). Use ## for sections. Include:
- ## Overview — brief intro to both tools
- ## Feature Comparison — table comparing key features
- ## Pricing — breakdown of each tool's pricing tiers
- ## When to Choose ${toolA.name} — scenarios where tool A is better
- ## When to Choose ${toolB.name} — scenarios where tool B is better
- ## Verdict — balanced recommendation

Keep it between 500-800 words. Be specific with feature names and pricing numbers from the data provided.`;

  const userPrompt = `Compare these two tools:

## ${toolA.name}
- Tagline: ${toolA.tagline}
- Description: ${toolA.description}
- Category: ${toolA.category}
- Rating: ${toolA.rating}/5 (${toolA.reviewsCount.toLocaleString()} reviews)
- Open Source: ${toolA.openSource ? "Yes" : "No"}
- GitHub Stars: ${toolA.githubStars?.toLocaleString() ?? "N/A"}
- Website: ${toolA.websiteUrl}
- Features: ${toolA.features.join(", ")}
- Pricing: ${toolA.pricing.map((p) => `${p.plan} (${p.price})`).join(", ")}

## ${toolB.name}
- Tagline: ${toolB.tagline}
- Description: ${toolB.description}
- Category: ${toolB.category}
- Rating: ${toolB.rating}/5 (${toolB.reviewsCount.toLocaleString()} reviews)
- Open Source: ${toolB.openSource ? "Yes" : "No"}
- GitHub Stars: ${toolB.githubStars?.toLocaleString() ?? "N/A"}
- Website: ${toolB.websiteUrl}
- Features: ${toolB.features.join(", ")}
- Pricing: ${toolB.pricing.map((p) => `${p.plan} (${p.price})`).join(", ")}

Write the comparison article now.`;

  const response = await callLlm(systemPrompt, userPrompt, { jsonMode: false });
  return response.content;
}

function generateFallbackMarkdown(toolA: ToolEntry, toolB: ToolEntry): string {
  const today = formatDate(new Date());
  const allFeatures = Array.from(new Set([...toolA.features, ...toolB.features]));

  return `---
title: "${toolA.name} vs ${toolB.name}: Which is Better in 2025?"
date: "${today}"
---

## Overview
${toolA.name} and ${toolB.name} are both popular ${toolA.category} tools. ${toolA.tagline} ${toolB.tagline}

## Feature Comparison
| Feature | ${toolA.name} | ${toolB.name} |
|---------|${"-".repeat(toolA.name.length + 2)}|${"-".repeat(toolB.name.length + 2)}|
| Rating | ${toolA.rating}/5 | ${toolB.rating}/5 |
| Open Source | ${toolA.openSource ? "Yes" : "No"} | ${toolB.openSource ? "Yes" : "No"} |
| GitHub Stars | ${toolA.githubStars?.toLocaleString() ?? "N/A"} | ${toolB.githubStars?.toLocaleString() ?? "N/A"} |
${allFeatures.map((f) => `| ${f} | ${toolA.features.includes(f) ? "✅" : "❌"} | ${toolB.features.includes(f) ? "✅" : "❌"} |`).join("\n")}

## Pricing

### ${toolA.name}
${toolA.pricing.map((p) => `- **${p.plan}**: ${p.price} — ${p.features.join(", ")}`).join("\n")}

### ${toolB.name}
${toolB.pricing.map((p) => `- **${p.plan}**: ${p.price} — ${p.features.join(", ")}`).join("\n")}

## When to Choose ${toolA.name}
Consider ${toolA.name} if you need ${toolA.features.slice(0, 3).join(", ")}.

## When to Choose ${toolB.name}
Consider ${toolB.name} if you need ${toolB.features.slice(0, 3).join(", ")}.

## Verdict
Both tools are solid choices in the ${toolA.category} space. ${toolA.name} has a ${toolA.rating}/5 rating while ${toolB.name} has a ${toolB.rating}/5 rating.
`;
}

async function main() {
  const comparisons = loadComparisons();
  const tools = loadTools();

  if (comparisons.length === 0) {
    console.log("📭 No comparisons found.");
    return;
  }

  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  const useLlm = !!(process.env.LLM_API_KEY || process.env.OLLAMA_URL);
  const provider = process.env.LLM_PROVIDER || "ollama";

  console.log(`📝 Generate Comparisons starting...`);
  console.log(`   Comparisons: ${comparisons.length}`);
  console.log(`   LLM: ${useLlm ? `${provider} (real content)` : "disabled (fallback template)"}`);

  let generated = 0;
  let skipped = 0;

  for (const comp of comparisons) {
    const filePath = path.join(CONTENT_DIR, `${comp.slug}.md`);

    if (fs.existsSync(filePath)) {
      skipped++;
      continue;
    }

    const toolA = getToolBySlug(tools, comp.toolA);
    const toolB = getToolBySlug(tools, comp.toolB);

    if (!toolA || !toolB) {
      console.warn(`  ⚠️ Skipping ${comp.slug}: missing tool data (${comp.toolA} or ${comp.toolB})`);
      continue;
    }

    let content: string;

    if (useLlm) {
      try {
        console.log(`  🤖 Generating: ${comp.slug} via LLM...`);
        content = await generateComparisonContent(toolA, toolB);
        console.log(`  ✅ Generated: ${comp.slug} (${content.length} chars)`);
      } catch (err) {
        console.warn(`  ⚠️ LLM failed for ${comp.slug}, using fallback:`, (err as Error).message);
        content = generateFallbackMarkdown(toolA, toolB);
      }
    } else {
      console.log(`  📄 Template: ${comp.slug}`);
      content = generateFallbackMarkdown(toolA, toolB);
    }

    fs.writeFileSync(filePath, content, "utf-8");
    generated++;
  }

  console.log(`\n========== GENERATION SUMMARY ==========`)
  console.log(`Total comparisons: ${comparisons.length}`);
  console.log(`Generated:         ${generated}`);
  console.log(`Skipped:           ${skipped}`);
  console.log(`LLM enabled:       ${useLlm}`);
  console.log(`========================================\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
