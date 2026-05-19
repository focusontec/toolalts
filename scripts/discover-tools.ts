#!/usr/bin/env tsx
/**
 * AutoClaw Discovery Engine
 * Discover new tools from GitHub, HN, and manual sources.
 * Outputs: data/pending-tools.json (candidate list)
 */

import fs from "fs";
import path from "path";

const PENDING_PATH = path.resolve(__dirname, "../data/pending-tools.json");
const EXISTING_TOOLS_PATH = path.resolve(__dirname, "../data/tools.json");

interface Candidate {
  slug: string;
  name: string;
  source: string;
  github?: string;
  website?: string;
  discoveredAt: string;
  rawData: any;
}

function loadExistingSlugs(): Set<string> {
  if (!fs.existsSync(EXISTING_TOOLS_PATH)) return new Set();
  const tools = JSON.parse(fs.readFileSync(EXISTING_TOOLS_PATH, "utf-8"));
  return new Set(tools.map((t: any) => t.slug));
}

function loadPending(): Candidate[] {
  if (!fs.existsSync(PENDING_PATH)) return [];
  return JSON.parse(fs.readFileSync(PENDING_PATH, "utf-8"));
}

function savePending(candidates: Candidate[]) {
  fs.writeFileSync(PENDING_PATH, JSON.stringify(candidates, null, 2));
}

async function fetchGitHubTrending(query: string): Promise<Candidate[]> {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+created:>2024-01-01+stars:>500&sort=stars&order=desc&per_page=10`;
  const res = await fetch(url, {
    headers: process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {},
  });
  if (!res.ok) {
    console.warn(`GitHub API error: ${res.status}`);
    return [];
  }
  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: item.name,
    source: "github-trending",
    github: item.full_name,
    website: item.homepage || `https://github.com/${item.full_name}`,
    discoveredAt: new Date().toISOString(),
    rawData: {
      description: item.description,
      stars: item.stargazers_count,
      language: item.language,
      topics: item.topics,
      updatedAt: item.updated_at,
    },
  }));
}

async function fetchHackerNews(): Promise<Candidate[]> {
  const url = "https://hn.algolia.com/api/v1/search?tags=show_hn&query=open+source+app+tool&numericFilters=points>20&hitsPerPage=15";
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.hits || []).map((hit: any) => {
    const name = hit.title.replace(/Show HN:?/i, "").trim().split(/[\s:—-]/)[0];
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
    return {
      slug,
      name: name || hit.title.slice(0, 30),
      source: "hackernews-showhn",
      website: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      discoveredAt: new Date().toISOString(),
      rawData: { title: hit.title, points: hit.points, comments: hit.num_comments },
    };
  });
}

async function main() {
  const existing = loadExistingSlugs();
  const pending = loadPending();
  const allSlugs = new Set([...existing, ...pending.map((p) => p.slug)]);

  console.log(`📡 AutoClaw Discovery Engine starting...`);
  console.log(`   Existing tools: ${existing.size}`);
  console.log(`   Pending candidates: ${pending.length}`);

  // Parallel discovery from multiple sources
  const [github, hn] = await Promise.all([
    fetchGitHubTrending("note-taking OR project-management OR design tool").catch((e) => {
      console.warn("GitHub discovery failed:", e.message);
      return [];
    }),
    fetchHackerNews().catch((e) => {
      console.warn("HN discovery failed:", e.message);
      return [];
    }),
  ]);

  const allNew: Candidate[] = [...github, ...hn];
  const trulyNew = allNew.filter((c) => !allSlugs.has(c.slug) && c.name.length > 1);

  console.log(`\n🔍 Discovery results:`);
  console.log(`   GitHub candidates: ${github.length}`);
  console.log(`   HN candidates: ${hn.length}`);
  console.log(`   New (not in existing): ${trulyNew.length}`);

  if (trulyNew.length > 0) {
    const updatedPending = [...pending, ...trulyNew];
    savePending(updatedPending);
    console.log(`\n✅ Saved ${trulyNew.length} new candidates to data/pending-tools.json`);
    for (const c of trulyNew.slice(0, 5)) {
      console.log(`   + ${c.name} (${c.source})`);
    }
  } else {
    console.log("\n📭 No new tools discovered today.");
  }
}

main().catch(console.error);
