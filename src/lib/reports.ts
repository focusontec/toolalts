import fs from "fs";
import path from "path";
import matter from "gray-matter";

const REPORTS_DIR = path.resolve(process.cwd(), "src", "content", "reports");

export interface Report {
  slug: string;
  name: string;
  decision: string;
  confidence: number;
  category: string;
  processedAt: string;
  content: string;
}

function getReportFiles(): string[] {
  if (!fs.existsSync(REPORTS_DIR)) return [];
  return fs.readdirSync(REPORTS_DIR).filter((f) => f.endsWith(".md"));
}

export function getAllReports(): Report[] {
  return getReportFiles()
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(REPORTS_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug,
        name: data.name || slug,
        decision: data.decision || "UNKNOWN",
        confidence: data.confidence || 0,
        category: data.category || "other",
        processedAt: data.processedAt || new Date().toISOString(),
        content,
      };
    })
    .sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime());
}

export function getReportBySlug(slug: string): Report | null {
  try {
    const raw = fs.readFileSync(path.join(REPORTS_DIR, `${slug}.md`), "utf-8");
    const { data, content } = matter(raw);
    return {
      slug,
      name: data.name || slug,
      decision: data.decision || "UNKNOWN",
      confidence: data.confidence || 0,
      category: data.category || "other",
      processedAt: data.processedAt || new Date().toISOString(),
      content,
    };
  } catch {
    return null;
  }
}

export function getAllReportSlugs(): string[] {
  return getReportFiles().map((f) => f.replace(/\.md$/, ""));
}
