import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getActiveToolSlugs, getActiveToolBySlug, getAlternativesFor } from "@/lib/tools";
import { generateBreadcrumbJsonLd } from "@/lib/seo";
import { ToolCard } from "@/components/ToolCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ToolJsonLd } from "@/components/ToolJsonLd";

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
  const altTitle = `Best ${tool.name} Alternatives — Open Source \u0026 Paid | ToolAlts`;
  const altDescription = `Discover the best alternatives to ${tool.name}. Compare features, pricing, and ratings side by side to find the right ${tool.category} tool for you.`;
  return {
    title: altTitle,
    description: altDescription,
    alternates: { canonical: `https://www.toolalts.dev/alternative-to/${slug}/` },
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

export default async function AlternativeToPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getActiveToolBySlug(slug);
  if (!tool) notFound();

  const alternatives = getAlternativesFor(slug);
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { label: "Home", href: "https://www.toolalts.dev/" },
    { label: `Alternative to ${tool.name}`, href: `https://www.toolalts.dev/alternative-to/${slug}/` },
  ]);

  return (
    <>
      <ToolJsonLd data={breadcrumbLd} />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: `Alternative to ${tool.name}` },
          ]}
        />

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Best {tool.name} Alternatives
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            {tool.description}
          </p>
        </div>

        {alternatives.length > 0 ? (
          <>
            <h2 className="mt-10 text-xl font-bold text-slate-900">Top Alternatives</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {alternatives.map((alt) => (
                <ToolCard key={alt.slug} tool={alt} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-slate-600">No alternatives listed yet. We\u0026#39;re adding more tools every week.</p>
          </div>
        )}
      </div>
    </>
  );
}
