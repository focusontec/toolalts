#!/usr/bin/env tsx
/**
 * Stage 2: Extract structured tool data from scraped HTML using LLM
 */

import { callLlm } from "../lib/llm";
import type { ScrapedData } from "./scrape-tool";

export interface ExtractedTool {
  name: string;
  tagline: string;
  description: string;
  features: string[];
  pricing: { plan: string; price: string; features: string[] }[];
  category: string;
  openSource: boolean;
  integrations: string[];
  targetAudience: string;
}

const SYSTEM_PROMPT = `You are a software analyst. Extract structured tool information from the provided website content.

Rules:
- ONLY use information present in the provided content. NEVER invent or fabricate data.
- If information is not available, use empty string/array or null.
- For category, choose ONE of: development, productivity, project-management, design, communication
- For pricing, extract actual prices from the content. If no pricing found, return empty array.
- For features, extract the most important 5-10 features mentioned.
- Description should be 2-3 sentences, factual and specific.
- Tagline should be the tool's own tagline or a concise one-line description.

Output JSON format:
{
  "name": "Tool Name",
  "tagline": "One line description",
  "description": "2-3 sentence description",
  "features": ["feature1", "feature2", ...],
  "pricing": [{"plan": "Free", "price": "$0", "features": ["feature1", ...]}, ...],
  "category": "development",
  "openSource": false,
  "integrations": ["integration1", ...],
  "targetAudience": "Who this tool is for"
}`;

export async function extractToolData(scraped: ScrapedData): Promise<ExtractedTool> {
  const userPrompt = `Extract structured tool data from this website:

URL: ${scraped.url}
Page Title: ${scraped.title}
Meta Description: ${scraped.description}
OG Title: ${scraped.ogTitle}
OG Description: ${scraped.ogDescription}

--- PAGE CONTENT ---
${scraped.pageText.slice(0, 10000)}

--- PRICING PAGE ---
${scraped.pricingPageText.slice(0, 5000) || "Not found"}

--- FEATURES PAGE ---
${scraped.featuresPageText.slice(0, 5000) || "Not found"}

Extract all available information into the JSON format.`;

  const response = await callLlm(SYSTEM_PROMPT, userPrompt);
  const data = JSON.parse(response.content);

  return {
    name: data.name || "",
    tagline: data.tagline || "",
    description: data.description || "",
    features: Array.isArray(data.features) ? data.features : [],
    pricing: Array.isArray(data.pricing) ? data.pricing : [],
    category: data.category || "development",
    openSource: !!data.openSource,
    integrations: Array.isArray(data.integrations) ? data.integrations : [],
    targetAudience: data.targetAudience || "",
  };
}
