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
  status?: string;
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

function isComparisonValid(comp: ComparisonEntry, tools: ToolEntry[]): boolean {
  const toolA = getToolBySlug(tools, comp.toolA);
  const toolB = getToolBySlug(tools, comp.toolB);
  if (!toolA || !toolB) return false;
  if (toolA.status !== "active") return false;
  if (toolB.status !== "active") return false;
  return true;
}

function checkContentQuality(content: string): string[] {
  const issues: string[] = [];
  if (content.length < 1200) issues.push(`too short (${content.length} chars, need 1200+)`);
  const hasOverview = /^##\s+Overview/m.test(content) || /^##\s+Introduction/m.test(content);
  const hasVerdict = /^##\s+Verdict/m.test(content) || /^##\s+Conclusion/m.test(content);
  const hasPricing = /^##\s+Pricing/m.test(content);
  const lowValuePhrases = [
    /both tools are solid choices/i,
    /both .* are popular .* tools/i,
    /consider .* if you need/i,
    /it depends on your needs/i,
    /ultimately,? the best choice/i,
  ];
  if (!hasOverview) issues.push("missing ## Overview section");
  if (!hasVerdict) issues.push("missing ## Verdict section");
  if (!hasPricing) issues.push("missing ## Pricing section");
  for (const phrase of lowValuePhrases) {
    if (phrase.test(content)) issues.push(`generic AI phrasing detected (${phrase.source})`);
  }
  return issues;
}

async function generateComparisonContent(toolA: ToolEntry, toolB: ToolEntry): Promise<string> {
  const systemPrompt = `You are a senior software analyst writing a practical buyer/user decision memo.
The article must help a real person decide between two software tools using only the provided data.

Output MUST be raw Markdown (no frontmatter, no code blocks). Use ## for sections. Include:
- ## Overview — one direct paragraph explaining the decision context
- ## Key Differences — 3-5 concrete differences, not marketing claims
- ## Feature Comparison — table comparing verified capabilities from the data
- ## Pricing — pricing tiers and any unknowns; say "not verified" where data is missing
- ## When to Choose ${toolA.name} — specific user/team scenarios
- ## When to Choose ${toolB.name} — specific user/team scenarios
- ## Trade-offs and Limits — important downsides, missing data, and migration friction
- ## Verdict — direct recommendation for different user profiles

Rules:
- Do not write generic lines like "both tools are solid choices" or "it depends on your needs".
- Do not invent prices, usage limits, integrations, rankings, customers, or statistics.
- Do not turn GitHub-hosting plan features into product features unless the tool is GitHub itself.
- Prefer short, specific paragraphs over promotional language.
- Keep it between 700-1000 words.`;

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

  // Filter to only comparisons where both tools are active
  const validComparisons = comparisons.filter((c) => isComparisonValid(c, tools));
  const filteredCount = comparisons.length - validComparisons.length;
  if (filteredCount > 0) {
    console.log(`  ⚠️ Filtered out ${filteredCount} comparisons with missing/inactive tools`);
  }

  console.log(`📝 Generate Comparisons starting...`);
  console.log(`   Comparisons: ${validComparisons.length} (of ${comparisons.length} total)`);
  console.log(`   LLM: ${useLlm ? `${provider} (real content)` : "disabled (generation skipped)"}`);

  let generated = 0;
  let skipped = 0;
  let lowQuality = 0;
  let failed = 0;

  if (!useLlm) {
    console.warn("  ⛔ LLM is not configured. Skipping generation instead of writing fallback content.");
  }

  for (const comp of validComparisons) {
    const filePath = path.join(CONTENT_DIR, `${comp.slug}.md`);

    if (fs.existsSync(filePath)) {
      skipped++;
      continue;
    }

    const toolA = getToolBySlug(tools, comp.toolA)!;
    const toolB = getToolBySlug(tools, comp.toolB)!;

    if (!useLlm) {
      skipped++;
      continue;
    }

    let content: string;
    try {
      console.log(`  🤖 Generating: ${comp.slug} via LLM...`);
      content = await generateComparisonContent(toolA, toolB);
      console.log(`  ✅ Generated: ${comp.slug} (${content.length} chars)`);
    } catch (err) {
      console.warn(`  ⛔ Skipped ${comp.slug}: LLM failed:`, (err as Error).message);
      failed++;
      continue;
    }

    // Quality gate: skip writing if content fails checks
    const qualityIssues = checkContentQuality(content);
    if (qualityIssues.length > 0) {
      console.warn(`  ⛔ Skipped ${comp.slug}: ${qualityIssues.join(", ")}`);
      lowQuality++;
      continue;
    }

    fs.writeFileSync(filePath, content, "utf-8");
    generated++;
  }

  console.log(`\n========== GENERATION SUMMARY ==========`)
  console.log(`Total comparisons: ${validComparisons.length}`);
  console.log(`Generated:         ${generated}`);
  console.log(`Skipped (exists):  ${skipped}`);
  console.log(`Low quality:       ${lowQuality}`);
  console.log(`Failed:            ${failed}`);
  console.log(`LLM enabled:       ${useLlm}`);
  console.log(`========================================\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
