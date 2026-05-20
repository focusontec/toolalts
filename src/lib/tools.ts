import toolsData from "@/../data/tools.json";
import comparisonsData from "@/../data/comparisons.json";
import categoriesData from "@/../data/categories.json";
import type { Tool, Comparison, Category, BlogPost } from "./types";

export const allTools: Tool[] = toolsData as Tool[];
export const allComparisons: Comparison[] = comparisonsData as Comparison[];
export const allCategories: Category[] = categoriesData as Category[];

/** All tools (including draft/hidden) — for admin pages */
export function getAllTools(): Tool[] {
  return allTools;
}

/** Only active tools — for public pages */
export function getActiveTools(): Tool[] {
  return allTools.filter((t) => t.status === "active");
}

/** Get tool by slug regardless of status — for admin */
export function getToolBySlug(slug: string): Tool | undefined {
  return allTools.find((t) => t.slug === slug);
}

/** Get tool by slug only if active — for public pages */
export function getActiveToolBySlug(slug: string): Tool | undefined {
  return allTools.find((t) => t.slug === slug && t.status === "active");
}

/** Tools in category (active only) */
export function getToolsByCategory(category: string): Tool[] {
  return allTools.filter((t) => t.category === category && t.status === "active");
}

export function getCategories(): Category[] {
  return allCategories;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return allCategories.find((c) => c.slug === slug);
}

export function getAlternativesFor(slug: string): Tool[] {
  const comp = allComparisons.find(
    (c) => c.toolA === slug || c.toolB === slug
  );
  if (!comp) return [];
  const altSlug = comp.toolA === slug ? comp.toolB : comp.toolA;
  return allTools.filter((t) => t.slug === altSlug && t.status === "active");
}

/** Comparison pairs where both tools are active */
export function getComparisonPairs(): { a: Tool; b: Tool }[] {
  return allComparisons
    .map((c) => {
      const a = getActiveToolBySlug(c.toolA);
      const b = getActiveToolBySlug(c.toolB);
      if (!a || !b) return null;
      return { a, b };
    })
    .filter(Boolean) as { a: Tool; b: Tool }[];
}

export function getAllComparisonSlugs(): string[] {
  return allComparisons.map((c) => c.slug);
}

export function getToolsForComparison(
  slug: string
): { a: Tool; b: Tool } | null {
  const comp = allComparisons.find((c) => c.slug === slug);
  if (!comp) return null;
  const a = getActiveToolBySlug(comp.toolA);
  const b = getActiveToolBySlug(comp.toolB);
  if (!a || !b) return null;
  return { a, b };
}

/** All tool slugs (for admin static params) */
export function getAllToolSlugs(): string[] {
  return allTools.map((t) => t.slug);
}

/** Active tool slugs (for public static params) */
export function getActiveToolSlugs(): string[] {
  return allTools.filter((t) => t.status === "active").map((t) => t.slug);
}

export function getAllCategorySlugs(): string[] {
  return allCategories.map((c) => c.slug);
}

export function getPopularTools(limit = 6): Tool[] {
  return [...allTools]
    .filter((t) => t.status === "active")
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
}

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import matter from "gray-matter";

const CONTENT_DIR = join(process.cwd(), "src", "content", "blog");

export function getAllBlogPosts(): BlogPost[] {
  try {
    const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
    return files
      .map((file) => {
        const slug = file.replace(/\.md$/, "");
        const raw = readFileSync(join(CONTENT_DIR, file), "utf-8");
        const { data, content } = matter(raw);
        return {
          slug,
          title: data.title || slug,
          date: data.date || new Date().toISOString().split("T")[0],
          excerpt: data.excerpt || content.slice(0, 160).replace(/\n/g, " "),
          content,
          tags: data.tags || [],
          author: data.author || "ToolAlts Team",
        } as BlogPost;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  try {
    const raw = readFileSync(join(CONTENT_DIR, `${slug}.md`), "utf-8");
    const { data, content } = matter(raw);
    return {
      slug,
      title: data.title || slug,
      date: data.date || new Date().toISOString().split("T")[0],
      excerpt: data.excerpt || content.slice(0, 160).replace(/\n/g, " "),
      content,
      tags: data.tags || [],
      author: data.author || "ToolAlts Team",
    } as BlogPost;
  } catch {
    return null;
  }
}

export function getAllBlogSlugs(): string[] {
  try {
    return readdirSync(CONTENT_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}
