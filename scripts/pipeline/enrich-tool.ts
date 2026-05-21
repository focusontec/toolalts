#!/usr/bin/env tsx
/**
 * Stage 3: Enrich tool data with GitHub info and dedup check
 */

import fs from "fs";
import path from "path";
import type { ExtractedTool } from "./extract-tool-data";

const TOOLS_PATH = path.resolve(__dirname, "../../data/tools.json");

interface ToolEntry {
  slug: string;
  name: string;
  [key: string]: any;
}

export interface EnrichedTool extends ExtractedTool {
  slug: string;
  websiteUrl: string;
  githubUrl: string | null;
  githubStars: number | null;
  rating: number;
  reviewsCount: number;
  logo: string;
  isDuplicate: boolean;
  existingSlug: string | null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function loadTools(): ToolEntry[] {
  if (!fs.existsSync(TOOLS_PATH)) return [];
  return JSON.parse(fs.readFileSync(TOOLS_PATH, "utf-8"));
}

async function fetchGitHubData(githubUrl: string): Promise<{ stars: number; description: string } | null> {
  const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;

  const [, owner, repo] = match;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "tool-alts/1.0",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      stars: data.stargazers_count ?? 0,
      description: data.description ?? "",
    };
  } catch {
    return null;
  }
}

export async function enrichTool(
  extracted: ExtractedTool,
  websiteUrl: string,
  githubUrl?: string
): Promise<EnrichedTool> {
  const tools = loadTools();
  const slug = slugify(extracted.name);

  // Check for duplicates
  const existing = tools.find(
    (t) =>
      t.slug === slug ||
      t.websiteUrl === websiteUrl ||
      t.name.toLowerCase() === extracted.name.toLowerCase()
  );

  // Fetch GitHub data if available
  let githubStars: number | null = null;
  let resolvedGithubUrl = githubUrl || null;

  if (resolvedGithubUrl) {
    const ghData = await fetchGitHubData(resolvedGithubUrl);
    if (ghData) {
      githubStars = ghData.stars;
    }
  }

  return {
    ...extracted,
    slug,
    websiteUrl,
    githubUrl: resolvedGithubUrl,
    githubStars,
    rating: 0,
    reviewsCount: 0,
    logo: `/logos/${slug}.svg`,
    isDuplicate: !!existing,
    existingSlug: existing?.slug || null,
  };
}
