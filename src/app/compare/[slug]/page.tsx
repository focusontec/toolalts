import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";
import { ComparisonTable } from "@/components/ComparisonTable";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";
import {
  getActiveToolBySlug,
  getIndexableComparisonSlugs,
  getPublicComparisonBySlug,
} from "@/lib/tools";
import { promises as fs } from "fs";
import { join } from "path";

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getIndexableComparisonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const comp = getPublicComparisonBySlug(slug);
  if (!comp) {
    return {
      title: "Not Found — ToolAlts",
      description: "This page could not be found.",
    };
  }
  const toolA = getActiveToolBySlug(comp.toolA);
  const toolB = getActiveToolBySlug(comp.toolB);
  const title = `${toolA?.name ?? comp.toolA} vs ${toolB?.name ?? comp.toolB} — ToolAlts`;
  const description = `Compare ${toolA?.name ?? comp.toolA} and ${toolB?.name ?? comp.toolB} side by side. See features, pricing, ratings, and more.`;
  return {
    title,
    description,
    alternates: {
      canonical: `https://www.toolalts.dev/compare/${slug}/`,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `https://www.toolalts.dev/compare/${slug}/`,
      siteName: "ToolAlts",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

async function loadComparisonContent(slug: string): Promise<string | null> {
  try {
    const filePath = join(process.cwd(), "src", "content", "comparisons", `${slug}.md`);
    const raw = await fs.readFile(filePath, "utf-8");
    return matter(raw).content;
  } catch {
    return null;
  }
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comp = getPublicComparisonBySlug(slug);
  if (!comp) {
    notFound();
  }

  const toolA = getActiveToolBySlug(comp.toolA);
  const toolB = getActiveToolBySlug(comp.toolB);

  if (!toolA || !toolB) {
    notFound();
  }

  const content = await loadComparisonContent(slug);

  const comparisonSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${toolA.name} vs ${toolB.name}`,
    numberOfItems: 2,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "SoftwareApplication",
          name: toolA.name,
          url: `https://www.toolalts.dev/tool/${toolA.slug}/`,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: toolA.rating,
            ratingCount: toolA.reviewsCount,
          },
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "SoftwareApplication",
          name: toolB.name,
          url: `https://www.toolalts.dev/tool/${toolB.slug}/`,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: toolB.rating,
            ratingCount: toolB.reviewsCount,
          },
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.toolalts.dev/" },
      { "@type": "ListItem", position: 2, name: "Compare", item: "https://www.toolalts.dev/compare/" },
      { "@type": "ListItem", position: 3, name: `${toolA.name} vs ${toolB.name}` },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <SchemaJsonLd schema={comparisonSchema} />
      <SchemaJsonLd schema={breadcrumbSchema} />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Compare", href: "/compare/" },
          { label: `${toolA.name} vs ${toolB.name}` },
        ]}
      />

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {toolA.name} vs {toolB.name}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Side-by-side comparison of features, pricing, and ratings.
        </p>
      </div>

      <div className="mb-12">
        <ComparisonTable toolA={toolA} toolB={toolB} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Detailed Comparison
        </h2>
        {content ? (
          <div className="prose prose-slate mt-4 max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-slate-50 p-6 text-center dark:bg-slate-800">
            <p className="text-slate-600 dark:text-slate-400">
              Detailed comparison coming soon. Check back later for a full
              breakdown of {toolA.name} vs {toolB.name}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
