import type { MetadataRoute } from "next";
import { getAllToolSlugs, getAllCategorySlugs, getAllComparisonSlugs, getAllBlogSlugs } from "@/lib/tools";
import { getAllReportSlugs } from "@/lib/reports";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.toolalts.dev";

  const toolSlugs = getAllToolSlugs();
  const categorySlugs = getAllCategorySlugs();
  const comparisonSlugs = getAllComparisonSlugs();
  const blogSlugs = getAllBlogSlugs();
  const reportSlugs = getAllReportSlugs();

  const urls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/blog/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/reports/`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  ];

  toolSlugs.forEach((slug) => {
    urls.push({ url: `${baseUrl}/tool/${slug}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 });
    urls.push({ url: `${baseUrl}/alternative-to/${slug}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 });
  });

  categorySlugs.forEach((slug) => {
    urls.push({ url: `${baseUrl}/category/${slug}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 });
  });

  comparisonSlugs.forEach((slug) => {
    urls.push({ url: `${baseUrl}/compare/${slug}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 });
  });

  blogSlugs.forEach((slug) => {
    urls.push({ url: `${baseUrl}/blog/${slug}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 });
  });

  reportSlugs.forEach((slug) => {
    urls.push({ url: `${baseUrl}/reports/${slug}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 });
  });

  return urls;
}
