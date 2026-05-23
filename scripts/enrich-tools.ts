#!/usr/bin/env tsx
/**
 * enrich-tools.ts — Enrich tool data with real information from the web
 *
 * Uses Ollama web search + web fetch to gather real data about each tool,
 * then uses LLM to extract and structure the information.
 *
 * Enriches: features, integrations, use cases, pros, cons, FAQ, description
 *
 * Usage:
 *   npx tsx scripts/enrich-tools.ts --slug notion           # single tool
 *   npx tsx scripts/enrich-tools.ts --all                   # all tools
 *   npx tsx scripts/enrich-tools.ts --slug notion --dry-run # preview
 *   npx tsx scripts/enrich-tools.ts --slug notion --fields features,faq
 */

import fs from "fs";
import path from "path";
import { callLlm } from "./lib/llm";
import { searchOllama, fetchOllama, searchAndFetch } from "./lib/ollama";

// Load .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

const DATA_PATH = path.resolve(__dirname, "../data/tools.json");
const SLEEP_MS = 2000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs(): { slug?: string; all: boolean; dryRun: boolean; fields?: string[] } {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  let all = false;
  let dryRun = false;
  let fields: string[] | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    if (args[i] === "--all") all = true;
    if (args[i] === "--dry-run") dryRun = true;
    if (args[i] === "--fields" && args[i + 1]) fields = args[++i].split(",");
  }
  return { slug, all, dryRun, fields };
}

const ALL_FIELDS = ["features", "integrations", "useCases", "pros", "cons", "faq", "description"];

interface EnrichedData {
  features?: string[];
  integrations?: string[];
  targetAudience?: string;
  useCases?: { icon: string; title: string; description: string }[];
  pros?: string[];
  cons?: string[];
  faq?: { question: string; answer: string }[];
  description?: string;
}

async function extractWithLlm<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T | null> {
  try {
    const res = await callLlm(systemPrompt, userPrompt);
    const clean = res.content.replace(/```json\s*|```\s*$/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

async function enrichFeatures(toolName: string, websiteUrl: string): Promise<string[] | null> {
  const content = await searchAndFetch(`${toolName} features product capabilities`);
  if (!content) return null;

  return extractWithLlm<string[]>(
    `You extract product features from web content. Extract the 8-12 most important features.
RULES:
- Only extract features explicitly mentioned in the text
- Each feature should be a short phrase (3-8 words)
- Return ONLY a JSON array of strings
- Do NOT invent features`,
    `Extract the key features of "${toolName}" from this content:\n\n${content.slice(0, 8000)}\n\nReturn JSON array: ["feature 1", "feature 2", ...]`
  );
}

async function enrichIntegrations(toolName: string): Promise<string[] | null> {
  const content = await searchAndFetch(`${toolName} integrations connect with`);
  if (!content) return null;

  return extractWithLlm<string[]>(
    `You extract integration names from web content. Extract the 5-10 most notable integrations.
RULES:
- Only extract integrations explicitly mentioned
- Return tool/service names as strings
- Return ONLY a JSON array of strings`,
    `Extract the integrations of "${toolName}" from this content:\n\n${content.slice(0, 6000)}\n\nReturn JSON array: ["Slack", "GitHub", ...]`
  );
}

async function enrichUseCases(toolName: string, category: string): Promise<EnrichedData["useCases"] | null> {
  const content = await searchAndFetch(`${toolName} use cases who uses ${toolName}`);
  if (!content) return null;

  return extractWithLlm<EnrichedData["useCases"]>(
    `You extract use cases from web content. Return exactly 3 use cases.
RULES:
- Each use case needs: icon (single emoji), title (3-6 words), description (1 sentence)
- Only extract use cases explicitly mentioned or clearly implied
- Return ONLY a JSON array`,
    `Extract use cases for "${toolName}" (${category}) from this content:\n\n${content.slice(0, 6000)}\n\nReturn JSON array: [{"icon": "emoji", "title": "Use Case Title", "description": "One sentence."}]`
  );
}

async function enrichProsAndCons(
  toolName: string
): Promise<{ pros: string[]; cons: string[] } | null> {
  const content = await searchAndFetch(`${toolName} review pros cons advantages disadvantages`);
  if (!content) return null;

  return extractWithLlm<{ pros: string[]; cons: string[] }>(
    `You extract pros and cons from review content.
RULES:
- Extract 3-5 pros and 2-4 cons
- Each point should be a short phrase (5-15 words)
- Only extract points explicitly mentioned in reviews
- Return ONLY a JSON object`,
    `Extract pros and cons for "${toolName}" from these reviews:\n\n${content.slice(0, 8000)}\n\nReturn JSON: {"pros": ["pro 1", ...], "cons": ["con 1", ...]}`
  );
}

async function enrichFaq(toolName: string, websiteUrl: string): Promise<EnrichedData["faq"] | null> {
  const content = await searchAndFetch(`${toolName} FAQ frequently asked questions`);
  if (!content) return null;

  return extractWithLlm<EnrichedData["faq"]>(
    `You generate FAQ entries from web content. Return exactly 4 Q&A pairs.
RULES:
- Questions should be real questions users ask (not generic)
- Answers should be 1-2 sentences, factual
- Only use information from the provided content
- Return ONLY a JSON array`,
    `Generate FAQ for "${toolName}" from this content:\n\n${content.slice(0, 8000)}\n\nReturn JSON: [{"question": "...", "answer": "..."}]`
  );
}

async function enrichDescription(toolName: string, tagline: string): Promise<string | null> {
  const results = await searchOllama(`${toolName} about what is ${toolName}`, 3);
  if (results.length === 0) return null;

  const snippets = results.map((r) => r.content).join("\n\n");

  return extractWithLlm<string>(
    `You write concise product descriptions.
RULES:
- Write exactly 2-3 sentences
- Focus on what the product does and who it's for
- Use factual information only from the provided text
- Return ONLY the description string in JSON`,
    `Write a description for "${toolName}" (current tagline: "${tagline}") based on:\n\n${snippets.slice(0, 4000)}\n\nReturn JSON: {"description": "..."}`
  ).then((d) => {
    if (d && typeof d === "object" && "description" in d) return (d as any).description;
    return d;
  });
}

async function main() {
  const { slug, all, dryRun, fields } = parseArgs();
  const fieldsToEnrich = fields || ALL_FIELDS;

  const tools: any[] = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const toProcess = slug
    ? tools.filter((t) => t.slug === slug)
    : all
      ? tools.filter((t) => t.status !== "removed")
      : [];

  if (toProcess.length === 0) {
    console.log("Usage: npx tsx scripts/enrich-tools.ts --slug <name> | --all [--dry-run] [--fields features,faq]");
    return;
  }

  console.log("=".repeat(50));
  console.log("Enrich Tools — Real Data via Ollama");
  console.log("=".repeat(50));
  console.log(`Tools: ${toProcess.length}`);
  console.log(`Fields: ${fieldsToEnrich.join(", ")}`);
  console.log(`Dry run: ${dryRun}`);
  console.log("=".repeat(50));

  const results: { slug: string; enriched: string[]; failed: string[] }[] = [];

  for (const tool of toProcess) {
    console.log(`\n${tool.name} (${tool.slug})`);

    const enriched: EnrichedData = {};
    const enrichedFields: string[] = [];
    const failedFields: string[] = [];

    // Features
    if (fieldsToEnrich.includes("features")) {
      const features = await enrichFeatures(tool.name, tool.websiteUrl);
      if (features && features.length > (tool.features?.length || 0)) {
        enriched.features = features;
        enrichedFields.push(`features (${features.length})`);
      } else {
        failedFields.push("features");
      }
      await sleep(SLEEP_MS);
    }

    // Integrations
    if (fieldsToEnrich.includes("integrations")) {
      const integrations = await enrichIntegrations(tool.name);
      if (integrations && integrations.length > 0) {
        enriched.integrations = integrations;
        enrichedFields.push(`integrations (${integrations.length})`);
      } else {
        failedFields.push("integrations");
      }
      await sleep(SLEEP_MS);
    }

    // Use Cases
    if (fieldsToEnrich.includes("useCases")) {
      const useCases = await enrichUseCases(tool.name, tool.category);
      if (useCases && useCases.length > 0) {
        enriched.useCases = useCases;
        enrichedFields.push(`useCases (${useCases.length})`);
      } else {
        failedFields.push("useCases");
      }
      await sleep(SLEEP_MS);
    }

    // Pros & Cons
    if (fieldsToEnrich.includes("pros") || fieldsToEnrich.includes("cons")) {
      const prosCons = await enrichProsAndCons(tool.name);
      if (prosCons) {
        if (fieldsToEnrich.includes("pros") && prosCons.pros?.length > 0) {
          enriched.pros = prosCons.pros;
          enrichedFields.push(`pros (${prosCons.pros.length})`);
        }
        if (fieldsToEnrich.includes("cons") && prosCons.cons?.length > 0) {
          enriched.cons = prosCons.cons;
          enrichedFields.push(`cons (${prosCons.cons.length})`);
        }
      } else {
        if (fieldsToEnrich.includes("pros")) failedFields.push("pros");
        if (fieldsToEnrich.includes("cons")) failedFields.push("cons");
      }
      await sleep(SLEEP_MS);
    }

    // FAQ
    if (fieldsToEnrich.includes("faq")) {
      const faq = await enrichFaq(tool.name, tool.websiteUrl);
      if (faq && faq.length > 0) {
        enriched.faq = faq;
        enrichedFields.push(`faq (${faq.length})`);
      } else {
        failedFields.push("faq");
      }
      await sleep(SLEEP_MS);
    }

    // Description
    if (fieldsToEnrich.includes("description")) {
      const description = await enrichDescription(tool.name, tool.tagline);
      if (description && description.length > 20) {
        enriched.description = description;
        enrichedFields.push("description");
      } else {
        failedFields.push("description");
      }
      await sleep(SLEEP_MS);
    }

    // Apply enrichments
    if (!dryRun && enrichedFields.length > 0) {
      const toolInArray = tools.find((t) => t.slug === tool.slug);
      if (toolInArray) {
        for (const [key, value] of Object.entries(enriched)) {
          if (value !== undefined && value !== null) {
            toolInArray[key] = value;
          }
        }
      }
    }

    console.log(`  Enriched: ${enrichedFields.join(", ") || "none"}`);
    if (failedFields.length > 0) {
      console.log(`  Failed: ${failedFields.join(", ")}`);
    }

    results.push({ slug: tool.slug, enriched: enrichedFields, failed: failedFields });
  }

  // Save
  if (!dryRun) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(tools, null, 2) + "\n");
    console.log(`\nSaved: ${DATA_PATH}`);
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("ENRICHMENT SUMMARY");
  console.log("=".repeat(50));
  const totalEnriched = results.reduce((sum, r) => sum + r.enriched.length, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed.length, 0);
  console.log(`Tools processed: ${results.length}`);
  console.log(`Fields enriched: ${totalEnriched}`);
  console.log(`Fields failed: ${totalFailed}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
