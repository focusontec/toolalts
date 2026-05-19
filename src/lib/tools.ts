import toolsData from "@/../data/tools.json";
import comparisonsData from "@/../data/comparisons.json";
import categoriesData from "@/../data/categories.json";
import type { Tool, Comparison, Category, BlogPost } from "./types";

export const allTools: Tool[] = toolsData as Tool[];
export const allComparisons: Comparison[] = comparisonsData as Comparison[];
export const allCategories: Category[] = categoriesData as Category[];

export function getAllTools(): Tool[] {
  return allTools;
}

export function getToolBySlug(slug: string): Tool | undefined {
  return allTools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: string): Tool[] {
  return allTools.filter((t) => t.category === category);
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
  return allTools.filter((t) => t.slug === altSlug);
}

export function getComparisonPairs(): { a: Tool; b: Tool }[] {
  return allComparisons
    .map((c) => {
      const a = getToolBySlug(c.toolA);
      const b = getToolBySlug(c.toolB);
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
  const a = getToolBySlug(comp.toolA);
  const b = getToolBySlug(comp.toolB);
  if (!a || !b) return null;
  return { a, b };
}

export function getAllToolSlugs(): string[] {
  return allTools.map((t) => t.slug);
}

export function getAllCategorySlugs(): string[] {
  return allCategories.map((c) => c.slug);
}

export function getPopularTools(limit = 6): Tool[] {
  return [...allTools]
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
