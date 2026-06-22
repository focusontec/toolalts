#!/usr/bin/env tsx
/**
 * AutoClaw AI Verification Engine
 * Cross-validates candidates using multi-source data + LLM reasoning.
 * Generates structured audit reports.
 */

import fs from "fs";
import path from "path";
import { callLlm } from "./lib/llm";

const PENDING_PATH = path.resolve(__dirname, "../data/pending-tools.json");
const REPORTS_DIR = path.resolve(__dirname, "../src/content/reports");

interface VerificationResult {
  slug: string;
  name: string;
  website: string;
  github: string | null;
  decision: "APPROVE" | "REJECT" | "AMBIGUOUS";
  confidence: number; // 0-100
  verificationScore: number; // 0-100
  qualityScore: number; // 0-100
  consistencyScore: number; // 0-100
  category: string;
  tagline: string;
  description: string;
  features: string[];
  pricing: { plan: string; price: string; features: string[] }[];
  targetAudience: string;
  directAlternativeTo: string[];
  evidenceGaps: string[];
  publishReadiness: {
    score: number;
    recommendation: "draft" | "review" | "active";
    reasons: string[];
  };
  concerns: string[];
  sources: string[];
  fullReport: string;
  processedAt: string;
}

function loadPending(): any[] {
  if (!fs.existsSync(PENDING_PATH)) return [];
  return JSON.parse(fs.readFileSync(PENDING_PATH, "utf-8"));
}

function savePending(candidates: any[]) {
  fs.writeFileSync(PENDING_PATH, JSON.stringify(candidates, null, 2));
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function fetchGitHubData(fullName: string): Promise<any> {
  const url = `https://api.github.com/repos/${fullName}`;
  try {
    const res = await fetch(url, {
      headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {},
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fetchWebsiteMeta(websiteUrl: string): Promise<{ title?: string; description?: string; reachable: boolean }> {
  try {
    const res = await fetch(websiteUrl, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { reachable: false };
    const html = await res.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                       html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
    return {
      title: titleMatch?.[1]?.trim(),
      description: descMatch?.[1]?.trim(),
      reachable: true,
    };
  } catch { return { reachable: false }; }
}

function isUrlSuspicious(url: string, slug: string): string | null {
  if (!url) return "URL is empty";
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, "");
    const slugAsDomain = slug.replace(/-/g, "") + ".com";
    if (domain === slugAsDomain || domain === slug + ".com") {
      return `URL "${url}" appears auto-generated from slug "${slug}"`;
    }
    return null;
  } catch {
    return `URL "${url}" is malformed`;
  }
}

async function verifyCandidate(candidate: any): Promise<VerificationResult> {
  console.log(`\n🔬 Verifying: ${candidate.name} (${candidate.source})`);

  // Pre-check: flag suspicious URLs before LLM verification
  const urlWarning = isUrlSuspicious(candidate.website, candidate.slug);
  if (urlWarning) {
    console.warn(`   ⚠️ URL CHECK: ${urlWarning}`);
  }

  // Gather multi-source evidence
  const [ghData, webMeta] = await Promise.all([
    candidate.github ? fetchGitHubData(candidate.github) : Promise.resolve(null),
    candidate.website ? fetchWebsiteMeta(candidate.website) : Promise.resolve({ reachable: false }),
  ]);

  if (candidate.website && !webMeta.reachable) {
    console.warn(`   ⚠️ URL CHECK: Website "${candidate.website}" is not reachable`);
  }

  const evidence = {
    name: candidate.name,
    source: candidate.source,
    github: candidate.github,
    website: candidate.website,
    websiteReachable: webMeta.reachable,
    githubData: ghData ? {
      description: ghData.description,
      stars: ghData.stargazers_count,
      forks: ghData.forks_count,
      language: ghData.language,
      topics: ghData.topics,
      license: ghData.license?.spdx_id,
      updatedAt: ghData.updated_at,
      homepage: ghData.homepage,
    } : null,
    websiteMeta: webMeta,
    rawDescription: candidate.rawData?.description,
    rawStars: candidate.rawData?.stars,
  };

  const systemPrompt = `You are a senior software product analyst. Your job is to cross-verify a discovered software tool by analyzing evidence from multiple sources (GitHub, official website, community signals).

Evaluation Rules:
1. CONSISTENCY: Does the GitHub description match the website description? Are the claimed features realistic?
2. QUALITY: Is this a real, maintained project? (stars >500 = good, >5000 = excellent, last update <6 months = active)
3. CLASSIFICATION: Determine the most accurate category and tagline
4. PRICING: Infer pricing model from description and README context (Free/Open Source/Paid/Freemium)
5. URL VERIFICATION: Check if the website URL is real and reachable. If the URL looks auto-generated (e.g. slug-name.com), fabricated, or is unreachable, flag this as a RED FLAG and include it in concerns.
6. USER VALUE: Identify who would actually use this, what mainstream tool it can replace, and what decision the page helps a reader make.
7. RED FLAGS: Abandoned repos (>1yr stale), placeholder/unreachable websites, misleading descriptions, auto-generated URLs

IMPORTANT on URLs:
- If websiteReachable is false, the website URL is likely fake or dead. Add this to concerns.
- If the URL domain looks like it was generated from the tool name (e.g. "toolname.com" for a tool called "toolname"), it may be fabricated. Verify against the GitHub homepage field instead.
- The website URL in the evidence is the ORIGINAL discovered URL. If it's valid, include it in your output.

CRITICAL — DO NOT FABRICATE DATA:
- NEVER invent GitHub stars, forks, or other statistics. Only use numbers from the evidence provided.
- If githubData is null, do NOT claim the project has stars or forks. Say "GitHub data not available".
- NEVER invent pricing tiers, feature lists, or capabilities. Only reference what appears in the evidence.
- NEVER use GitHub plan features such as "Unlimited public/private repositories", "Dependabot", "CI/CD minutes", or "Codespaces" as product features unless the tool itself is GitHub.
- If you are unsure about a fact, say "unverifiable" rather than guessing.
- The fullReport must only contain facts supported by the evidence. Do not embellish or speculate.

Output MUST be valid JSON with NO markdown formatting, NO code blocks, NO extra text.

Required JSON schema:
{
  "decision": "APPROVE" | "REJECT" | "AMBIGUOUS",
  "confidence": 0-100,
  "verificationScore": 0-100,
  "qualityScore": 0-100,
  "consistencyScore": 0-100,
  "category": "productivity|design|project-management|development|communication|video-editing|password-manager|note-taking|other",
  "tagline": "One compelling sentence",
  "description": "2-3 sentences describing what it does and who it's for",
  "features": ["3-5 key features"],
  "pricing": [{"plan": "Free|Pro|Enterprise", "price": "$0 or $X/mo", "features": ["what's included"]}],
  "websiteUrl": "the verified real URL of the tool (from GitHub homepage or official site, NOT a fabricated URL)",
  "githubUrl": "full GitHub URL if applicable, or null",
  "targetAudience": "specific user or team type this helps",
  "directAlternativeTo": ["mainstream tool names this could reasonably replace"],
  "evidenceGaps": ["facts still missing or unverifiable"],
  "publishReadiness": {
    "score": 0-100,
    "recommendation": "draft|review|active",
    "reasons": ["why it should or should not be published"]
  },
  "concerns": ["list any red flags or uncertainties"],
  "fullReport": "Detailed multi-paragraph analysis of the verification process and final verdict"
}`;

  const userPrompt = `Please verify this tool based on the following multi-source evidence. Return ONLY JSON.

${JSON.stringify(evidence, null, 2)}`;

  const llmRes = await callLlm(systemPrompt, userPrompt);
  let parsed: any;
  try {
    const clean = llmRes.content.replace(/```json\s*|```\s*$/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    console.error("Failed to parse LLM response:", llmRes.content.slice(0, 500));
    parsed = {
      decision: "AMBIGUOUS",
      confidence: 30,
      concerns: ["LLM response parsing failed"],
      fullReport: llmRes.content.slice(0, 1000),
    };
  }

  // Determine the best website URL: prefer LLM-verified, fallback to original candidate URL
  const llmWebsite = parsed.websiteUrl;
  const originalWebsite = candidate.website;
  const githubHomepage = ghData?.homepage;

  // Pick the most reliable URL
  let bestWebsite = "";
  if (llmWebsite && !isUrlSuspicious(llmWebsite, candidate.slug)) {
    bestWebsite = llmWebsite;
  } else if (githubHomepage && !isUrlSuspicious(githubHomepage, candidate.slug)) {
    bestWebsite = githubHomepage;
  } else if (originalWebsite && webMeta.reachable) {
    bestWebsite = originalWebsite;
  } else if (githubHomepage) {
    bestWebsite = githubHomepage;
  } else if (originalWebsite) {
    bestWebsite = originalWebsite;
  }

  // Build concerns list, adding URL issues
  const concerns: string[] = parsed.concerns || [];
  if (!bestWebsite) {
    concerns.push("No valid website URL found");
  } else if (isUrlSuspicious(bestWebsite, candidate.slug)) {
    concerns.push(`Website URL may be auto-generated: ${bestWebsite}`);
  }

  let githubUrl: string | null = null;
  if (typeof parsed.githubUrl === "string" && parsed.githubUrl.startsWith("https://github.com/")) {
    githubUrl = parsed.githubUrl;
  } else if (candidate.github) {
    githubUrl = candidate.github.startsWith("http") ? candidate.github : `https://github.com/${candidate.github}`;
  }

  const result: VerificationResult = {
    slug: candidate.slug,
    name: candidate.name,
    website: bestWebsite,
    github: githubUrl,
    decision: parsed.decision || "AMBIGUOUS",
    confidence: parsed.confidence || 0,
    verificationScore: parsed.verificationScore || 0,
    qualityScore: parsed.qualityScore || 0,
    consistencyScore: parsed.consistencyScore || 0,
    category: parsed.category || "other",
    tagline: parsed.tagline || candidate.name,
    description: parsed.description || candidate.rawData?.description || "",
    features: parsed.features || [],
    pricing: parsed.pricing || [{ plan: "Unknown", price: "?", features: [] }],
    targetAudience: parsed.targetAudience || "",
    directAlternativeTo: Array.isArray(parsed.directAlternativeTo) ? parsed.directAlternativeTo : [],
    evidenceGaps: Array.isArray(parsed.evidenceGaps) ? parsed.evidenceGaps : [],
    publishReadiness: {
      score: parsed.publishReadiness?.score || 0,
      recommendation: parsed.publishReadiness?.recommendation || "draft",
      reasons: Array.isArray(parsed.publishReadiness?.reasons) ? parsed.publishReadiness.reasons : [],
    },
    concerns,
    sources: ["github", "website", "llm-analysis"].filter(Boolean),
    fullReport: parsed.fullReport || "",
    processedAt: new Date().toISOString(),
  };

  return result;
}

async function saveReport(result: VerificationResult) {
  ensureDir(REPORTS_DIR);
  const markdown = `---
slug: "${result.slug}"
name: "${result.name}"
decision: "${result.decision}"
confidence: ${result.confidence}
category: "${result.category}"
processedAt: "${result.processedAt}"
---

# AI Verification Report: ${result.name}

## Decision: ${result.decision} (${result.confidence}/100 confidence)

| Metric | Score |
|--------|-------|
| Verification Score | ${result.verificationScore}/100 |
| Quality Score | ${result.qualityScore}/100 |
| Consistency Score | ${result.consistencyScore}/100 |

## Proposed Metadata

- **Website**: ${result.website || "N/A"}
- **GitHub**: ${result.github || "N/A"}
- **Category**: ${result.category}
- **Tagline**: ${result.tagline}
- **Features**: ${result.features.join(", ")}
- **Pricing**: ${result.pricing.map((p) => `${p.plan} (${p.price})`).join(", ")}
- **Target audience**: ${result.targetAudience || "Unspecified"}
- **Direct alternatives**: ${result.directAlternativeTo.length > 0 ? result.directAlternativeTo.join(", ") : "Unspecified"}

## Publish Readiness

- **Recommendation**: ${result.publishReadiness.recommendation}
- **Score**: ${result.publishReadiness.score}/100
- **Reasons**: ${result.publishReadiness.reasons.length > 0 ? result.publishReadiness.reasons.join("; ") : "Not provided"}

## Evidence Gaps
${result.evidenceGaps.length > 0 ? result.evidenceGaps.map((gap) => `- ${gap}`).join("\n") : "None identified."}

## Concerns
${result.concerns.length > 0 ? result.concerns.map((c) => `- ${c}`).join("\n") : "None identified."}

## Full Analysis

${result.fullReport}
`;

  fs.writeFileSync(path.join(REPORTS_DIR, `${result.slug}.md`), markdown);
}

async function main() {
  const candidates = loadPending();
  if (candidates.length === 0) {
    console.log("📭 No pending candidates to verify.");
    return;
  }

  console.log(`🤖 AutoClaw AI Verification starting...`);
  console.log(`   Candidates to verify: ${candidates.length}`);
  console.log(`   LLM Provider: ${process.env.LLM_PROVIDER || "ollama (default)"}`);
  console.log(`   Model: ${process.env.LLM_MODEL || "gemma4:31b"}`);

  const verified: VerificationResult[] = [];
  const remaining: any[] = [];

  for (const candidate of candidates) {
    try {
      const result = await verifyCandidate(candidate);
      await saveReport(result);
      verified.push(result);

      if (result.decision === "APPROVE" && result.confidence >= 70) {
        console.log(`   ✅ APPROVED — confidence ${result.confidence}, scores V${result.verificationScore}/Q${result.qualityScore}/C${result.consistencyScore}`);
        console.log(`      website: ${result.website || "MISSING"}`);
      } else if (result.decision === "REJECT") {
        console.log(`   ❌ REJECTED — ${result.concerns.join("; ")}`);
      } else {
        console.log(`   ⚠️ AMBIGUOUS — needs review (confidence ${result.confidence})`);
        remaining.push(candidate); // keep ambiguous for next run
      }
    } catch (e) {
      console.error(`   💥 Error verifying ${candidate.name}:`, (e as Error).message);
      remaining.push(candidate);
    }
  }

  savePending(remaining);

  // Save verified results summary
  const summaryPath = path.resolve(__dirname, "../data/verified-results.json");
  const existingVerified = fs.existsSync(summaryPath) ? JSON.parse(fs.readFileSync(summaryPath, "utf-8")) : [];
  fs.writeFileSync(summaryPath, JSON.stringify([...existingVerified, ...verified], null, 2));

  console.log(`\n📊 Verification complete:`);
  console.log(`   Approved: ${verified.filter((v) => v.decision === "APPROVE").length}`);
  console.log(`   Rejected: ${verified.filter((v) => v.decision === "REJECT").length}`);
  console.log(`   Ambiguous (kept pending): ${remaining.length}`);
  console.log(`   Reports saved to: src/content/reports/`);
}

main().catch(console.error);
