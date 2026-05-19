import type { Tool } from "./types";

export const AFFILIATE_PROGRAMS: Record<string, string> = {
  notion: "https://affiliate.notion.so/",
  figma: "https://www.figma.com/",
  linear: "https://linear.app/",
  slack: "https://slack.com/",
  "github-issues": "https://github.com/",
  cursor: "https://cursor.sh/",
  vscode: "https://code.visualstudio.com/",
  penpot: "https://penpot.app/",
  obsidian: "https://obsidian.md/",
  discord: "https://discord.com/",
};

export function getAffiliateUrl(tool: Tool): string {
  if (AFFILIATE_PROGRAMS[tool.slug]) {
    return AFFILIATE_PROGRAMS[tool.slug];
  }
  return tool.websiteUrl;
}

export function hasAffiliate(tool: Tool): boolean {
  return !!AFFILIATE_PROGRAMS[tool.slug];
}
