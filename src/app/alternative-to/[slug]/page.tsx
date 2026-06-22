import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";
import {
  getActiveToolSlugs,
  getActiveToolBySlug,
  getAlternativesFor,
  isAlternativeIndexable,
} from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";
import { promises as fs } from "fs";
import { join } from "path";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getActiveToolSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getActiveToolBySlug(slug);
  if (!tool) return { title: "Not Found" };
  const indexable = isAlternativeIndexable(slug);
  const altTitle = `Best ${tool.name} Alternatives — Free & Open Source | ToolAlts`;
  const altDescription = `Discover the best free alternatives to ${tool.name}. Compare features, pricing, and ratings side by side to find the right ${tool.category} tool for your team.`;
  return {
    title: altTitle,
    description: altDescription,
    alternates: { canonical: `https://www.toolalts.dev/alternative-to/${slug}/` },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type: "website",
      title: altTitle,
      description: altDescription,
      url: `https://www.toolalts.dev/alternative-to/${slug}/`,
      siteName: "ToolAlts",
    },
    twitter: {
      card: "summary_large_image",
      title: altTitle,
      description: altDescription,
    },
  };
}

async function loadAltContent(slug: string): Promise<string | null> {
  try {
    const filePath = join(process.cwd(), "src", "content", "alternative-to", `${slug}.md`);
    const raw = await fs.readFile(filePath, "utf-8");
    return matter(raw).content;
  } catch {
    return null;
  }
}

export default async function AlternativeToPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getActiveToolBySlug(slug);
  if (!tool) notFound();

  const alternatives = getAlternativesFor(slug);
  const content = await loadAltContent(slug);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.toolalts.dev/" },
      { "@type": "ListItem", position: 2, name: `Alternative to ${tool.name}`, item: `https://www.toolalts.dev/alternative-to/${slug}/` },
    ],
  };

  const itemListSchema = alternatives.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `Best ${tool.name} Alternatives`,
        description: `A list of the best alternatives to ${tool.name}`,
        numberOfItems: alternatives.length,
        itemListElement: alternatives.map((alt, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "SoftwareApplication",
            name: alt.name,
            url: `https://www.toolalts.dev/tool/${alt.slug}/`,
            description: alt.tagline,
            applicationCategory: alt.category,
            aggregateRating: alt.rating
              ? { "@type": "AggregateRating", ratingValue: alt.rating, reviewCount: alt.reviewsCount }
              : undefined,
          },
        })),
      }
    : null;

  return (
    <>
      <SchemaJsonLd schema={breadcrumbSchema} />
      {itemListSchema && <SchemaJsonLd schema={itemListSchema} />}
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: `Alternative to ${tool.name}` },
          ]}
        />

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Best {tool.name} Alternatives in 2026
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Looking for a free or open-source alternative to {tool.name}? We compared the top {tool.category} tools
            to help you find the right fit. {tool.description}
          </p>
        </div>

        {alternatives.length > 0 && (
          <>
            <h2 className="mt-10 text-xl font-bold text-slate-900">
              Top {tool.name} Alternatives
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {alternatives.map((alt) => (
                <ToolCard key={alt.slug} tool={alt} />
              ))}
            </div>
          </>
        )}

        {content && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8">
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          </div>
        )}

        {alternatives.length === 0 && !content && (
          <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-slate-600">No alternatives listed yet. We&#39;re adding more tools every week.</p>
          </div>
        )}
      </div>
    </>
  );
}
