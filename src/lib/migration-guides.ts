import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import guidesData from "@/../data/migration-guides.json";

export interface MigrationGuideMeta {
  slug: string;
  fromTool: string;
  toTool: string;
  fromSlug: string;
  toSlug: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  steps: number;
  title: string;
  excerpt: string;
}

export interface MigrationGuide extends MigrationGuideMeta {
  content: string;
}

export const allMigrationGuides: MigrationGuideMeta[] = guidesData as MigrationGuideMeta[];

const GUIDES_DIR = join(process.cwd(), "src", "content", "migration-guides");

export function getAllMigrationGuideSlugs(): string[] {
  return allMigrationGuides.map((g) => g.slug);
}

export function getMigrationGuideBySlug(slug: string): MigrationGuide | null {
  const meta = allMigrationGuides.find((g) => g.slug === slug);
  if (!meta) return null;
  try {
    const raw = readFileSync(join(GUIDES_DIR, `${slug}.md`), "utf-8");
    const { content } = matter(raw);
    return { ...meta, content };
  } catch {
    return null;
  }
}
