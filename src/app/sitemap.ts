import type { MetadataRoute } from "next";
import {
  getActiveToolSlugs,
  getAllBlogSlugs,
  getAllCategorySlugs,
  getIndexableAlternativeSlugs,
  getIndexableComparisonSlugs,
} from "@/lib/tools";
import { getAllReportSlugs } from "@/lib/reports";
import { getAllMigrationGuideSlugs } from "@/lib/migration-guides";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.toolalts.dev";
  const now = new Date();

  const toolSlugs = getActiveToolSlugs();
  const alternativeSlugs = getIndexableAlternativeSlugs();
  const categorySlugs = getAllCategorySlugs();
  const comparisonSlugs = getIndexableComparisonSlugs();
  const blogSlugs = getAllBlogSlugs();
  const reportSlugs = getAllReportSlugs();
  const migrationGuideSlugs = getAllMigrationGuideSlugs();

  const urls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/blog/`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/reports/`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/quiz/`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/calculator/`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/migration-guides/`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/stack-builder/`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/search/`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  toolSlugs.forEach((slug) => {
    urls.push({ url: `${baseUrl}/tool/${slug}/`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
  });

  alternativeSlugs.forEach((slug) => {
    urls.push({ url: `${baseUrl}/alternative-to/${slug}/`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
  });

  categorySlugs.forEach((slug) => {
    urls.push({ url: `${baseUrl}/category/${slug}/`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
  });

  comparisonSlugs.forEach((slug) => {
    urls.push({ url: `${baseUrl}/compare/${slug}/`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
  });

  blogSlugs.forEach((slug) => {
    urls.push({ url: `${baseUrl}/blog/${slug}/`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
  });

  reportSlugs.forEach((slug) => {
    urls.push({ url: `${baseUrl}/reports/${slug}/`, lastModified: now, changeFrequency: "weekly", priority: 0.6 });
  });

  migrationGuideSlugs.forEach((slug) => {
    urls.push({ url: `${baseUrl}/migration-guides/${slug}/`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
  });

  return Array.from(new Map(urls.map((entry) => [entry.url, entry])).values());
}
