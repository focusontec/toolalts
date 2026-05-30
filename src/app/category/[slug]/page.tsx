import { notFound } from "next/navigation";
import type { Metadata } from "next";
import toolsData from "@/../data/tools.json";
import categoriesData from "@/../data/categories.json";
import { ToolCard } from "@/components/ToolCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";
import type { Tool, Category } from "@/lib/types";

export const dynamicParams = false;

const tools = toolsData as Tool[];
const categories = categoriesData as Category[];

export function generateStaticParams(): { slug: string }[] {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    return {
      title: "Not Found — ToolAlts",
      description: "This page could not be found.",
    };
  }
  const title = `Best ${category.name} Tools — ToolAlts`;
  const description = `Discover the best ${category.name.toLowerCase()} tools. ${category.description}`;
  return {
    title,
    description,
    alternates: {
      canonical: `https://www.toolalts.dev/category/${slug}/`,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `https://www.toolalts.dev/category/${slug}/`,
      siteName: "ToolAlts",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    notFound();
  }

  const categoryTools = tools.filter((t) => t.category === slug && t.status === "active");

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best ${category.name} Tools`,
    itemListElement: categoryTools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareApplication",
        name: tool.name,
        url: `https://www.toolalts.dev/tool/${tool.slug}/`,
        applicationCategory: tool.category,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: tool.rating,
          ratingCount: tool.reviewsCount,
        },
      },
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <SchemaJsonLd schema={schema} />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/category/" },
          { label: category.name },
        ]}
      />

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Best {category.name} Tools
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          {category.description}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {categoryTools.length} {categoryTools.length === 1 ? "tool" : "tools"} · Compare features, pricing, and ratings
        </p>
      </div>

      {categoryTools.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-400">
            No tools found in this category yet.
          </p>
        </div>
      )}
    </div>
  );
}
