import type { Tool } from "./types";

export function generateToolJsonLd(tool: Tool): object {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: tool.category,
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: tool.pricing[0]?.price?.replace(/[^0-9.]/g, "") || "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: tool.rating,
      reviewCount: tool.reviewsCount,
    },
    url: tool.websiteUrl,
  };
}

export function generateComparisonJsonLd(a: Tool, b: Tool): object {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "Product",
        name: a.name,
        description: a.description,
        url: a.websiteUrl,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: a.rating,
          reviewCount: a.reviewsCount,
        },
      },
      {
        "@type": "Product",
        name: b.name,
        description: b.description,
        url: b.websiteUrl,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: b.rating,
          reviewCount: b.reviewsCount,
        },
      },
    ],
  };
}

export function generateBreadcrumbJsonLd(
  items: { label: string; href?: string }[]
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href || "",
    })),
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateMetaDescription(tool: Tool): string {
  const open = tool.openSource ? "open-source" : "proprietary";
  return `Discover ${tool.name} (${tool.tagline}) — best ${tool.category} tool. ${open} software with ${tool.rating}/5 rating. Compare pricing, features, and top alternatives.`;
}

export function generateComparisonMeta(a: Tool, b: Tool): string {
  return `${a.name} vs ${b.name} in 2025 — side-by-side comparison of features, pricing, and reviews. Find the best ${a.category} tool for your workflow.`;
}
