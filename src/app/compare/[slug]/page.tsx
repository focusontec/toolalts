import { notFound } from "next/navigation";
import type { Metadata } from "next";
import toolsData from "@/../data/tools.json";
import comparisonsData from "@/../data/comparisons.json";
import { ComparisonTable } from "@/components/ComparisonTable";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";
import type { Tool, Comparison } from "@/lib/types";
import { promises as fs } from "fs";
import { join } from "path";

export const dynamicParams = false;

const tools = toolsData as Tool[];
const comparisons = comparisonsData as Comparison[];

export function generateStaticParams(): { slug: string }[] {
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const comp = comparisons.find((c) => c.slug === slug);
  if (!comp) {
    return {
      title: "Not Found — ToolAlts",
      description: "This page could not be found.",
    };
  }
  const toolA = tools.find((t) => t.slug === comp.toolA);
  const toolB = tools.find((t) => t.slug === comp.toolB);
  const title = `${toolA?.name ?? comp.toolA} vs ${toolB?.name ?? comp.toolB} — ToolAlts`;
  const description = `Compare ${toolA?.name ?? comp.toolA} and ${toolB?.name ?? comp.toolB} side by side. See features, pricing, ratings, and more.`;
  return {
    title,
    description,
    alternates: {
      canonical: `https://tool-alts.vercel.app/compare/${slug}/`,
    },
  };
}

async function loadComparisonContent(slug: string): Promise<string | null> {
  try {
    const filePath = join(process.cwd(), "src", "content", "comparisons", `${slug}.md`);
    const content = await fs.readFile(filePath, "utf-8");
    return content;
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
  const comp = comparisons.find((c) => c.slug === slug);
  if (!comp) {
    notFound();
  }

  const toolA = tools.find((t) => t.slug === comp.toolA);
  const toolB = tools.find((t) => t.slug === comp.toolB);

  if (!toolA || !toolB) {
    notFound();
  }

  const content = await loadComparisonContent(slug);

  const comparisonSchema = {
    "@context": "https://schema.org",
    "@type": "ComparisonTable",
    name: `${toolA.name} vs ${toolB.name}`,
    itemListElement: [
      {
        "@type": "SoftwareApplication",
        name: toolA.name,
        url: `https://tool-alts.vercel.app/tool/${toolA.slug}/`,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: toolA.rating,
          ratingCount: toolA.reviewsCount,
        },
      },
      {
        "@type": "SoftwareApplication",
        name: toolB.name,
        url: `https://tool-alts.vercel.app/tool/${toolB.slug}/`,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: toolB.rating,
          ratingCount: toolB.reviewsCount,
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://tool-alts.vercel.app/" },
      { "@type": "ListItem", position: 2, name: "Compare", item: "https://tool-alts.vercel.app/compare/" },
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
            {content.split("\n").map((line, i) => {
              if (line.startsWith("# ")) {
                return <h1 key={i} className="text-2xl font-bold">{line.replace("# ", "")}</h1>;
              }
              if (line.startsWith("## ")) {
                return <h2 key={i} className="text-xl font-semibold mt-6">{line.replace("## ", "")}</h2>;
              }
              if (line.startsWith("### ")) {
                return <h3 key={i} className="text-lg font-semibold mt-4">{line.replace("### ", "")}</h3>;
              }
              if (line.startsWith("- ")) {
                return <li key={i} className="ml-4 list-disc">{line.replace("- ", "")}</li>;
              }
              if (line.trim() === "") {
                return <div key={i} className="h-2" />;
              }
              return <p key={i} className="text-slate-700 dark:text-slate-300">{line}</p>;
            })}
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
