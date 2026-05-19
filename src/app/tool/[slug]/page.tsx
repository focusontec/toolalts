import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import toolsData from "@/../data/tools.json";
import { PricingCard } from "@/components/PricingCard";
import { AffiliateLink } from "@/components/AffiliateLink";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";
import type { Tool } from "@/lib/types";

export const dynamicParams = false;

const tools = toolsData as Tool[];

export function generateStaticParams(): { slug: string }[] {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) {
    return {
      title: "Not Found — ToolAlts",
      description: "This page could not be found.",
    };
  }
  return {
    title: `${tool.name} — Reviews, Pricing & Alternatives | ToolAlts`,
    description: `${tool.tagline}. Read reviews, compare pricing, and find the best alternatives to ${tool.name}.`,
    alternates: {
      canonical: `https://www.toolalts.dev/tool/${slug}/`,
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) {
    notFound();
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.tagline,
    applicationCategory: tool.category,
    url: tool.websiteUrl,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: tool.rating,
      ratingCount: tool.reviewsCount,
    },
    offers: tool.pricing.map((p) => ({
      "@type": "Offer",
      name: p.plan,
      price: p.price.replace(/[^0-9.]/g, ""),
      priceCurrency: "USD",
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.toolalts.dev/" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://www.toolalts.dev/category/" },
      { "@type": "ListItem", position: 3, name: tool.name },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <SchemaJsonLd schema={schema} />
      <SchemaJsonLd schema={breadcrumbSchema} />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Tools", href: "/category/" },
          { label: tool.name },
        ]}
      />

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex-1">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {tool.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {tool.name}
              </h1>
              <p className="mt-1 text-lg text-slate-600 dark:text-slate-400">
                {tool.tagline}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              ★ {tool.rating}
            </span>
            <span className="text-sm text-slate-500">
              {tool.reviewsCount.toLocaleString()} reviews
            </span>
            {tool.openSource && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Open Source
              </span>
            )}
            {tool.githubStars && (
              <a
                href={tool.githubUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.233 1.911 1.233 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                {tool.githubStars.toLocaleString()}
              </a>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Features
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {tool.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  <svg
                    className="h-4 w-4 shrink-0 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Best Alternatives
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Looking for something similar?{" "}
              <Link
                href={`/alternative-to/${tool.slug}/`}
                className="font-medium text-primary-600 hover:text-primary-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                See the best alternatives to {tool.name}
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="w-full shrink-0 space-y-6 lg:w-80">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Pricing
            </h3>
            <div className="mt-4 space-y-4">
              {tool.pricing.map((p, i) => (
                <PricingCard
                  key={p.plan}
                  plan={p}
                  featured={i === 1}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Actions
            </h3>
            <div className="mt-4">
              <AffiliateLink href={tool.websiteUrl}>
                Visit Website
              </AffiliateLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
