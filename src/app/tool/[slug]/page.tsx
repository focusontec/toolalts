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
      reviewCount: tool.reviewsCount,
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
    <div className="mx-auto max-w-6xl px-6 py-12">
      <SchemaJsonLd schema={schema} />
      <SchemaJsonLd schema={breadcrumbSchema} />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Tools", href: "/category/" },
          { label: tool.name },
        ]}
      />

      <div className="flex flex-col gap-12 lg:flex-row">
        {/* Main Content */}
        <div className="flex-1">
          {/* Tool Header */}
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-highlight)] text-2xl font-bold text-white">
              {tool.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-3xl tracking-tight text-[var(--color-ink)] sm:text-4xl">
                {tool.name}
              </h1>
              <p className="mt-2 text-lg text-[var(--color-ink-faint)]">
                {tool.tagline}
              </p>
            </div>
          </div>

          {/* Meta Badges */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-amber-light)] px-3 py-1 text-sm font-semibold text-[var(--color-amber-warm)]">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {tool.rating}
            </span>
            <span className="text-sm text-[var(--color-ink-faint)]">
              {tool.reviewsCount.toLocaleString()} reviews
            </span>
            {tool.openSource && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success-light)] px-3 py-1 text-sm font-semibold text-[var(--color-success)]">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Open Source
              </span>
            )}
            {tool.githubStars && (
              <a
                href={tool.githubUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-sm font-medium text-[var(--color-ink-muted)] transition-all hover:border-[var(--color-ink)]/20 hover:shadow-sm"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.233 1.911 1.233 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                {tool.githubStars.toLocaleString()}
              </a>
            )}
          </div>

          {/* Description */}
          <div className="mt-8">
            <p className="text-base leading-relaxed text-[var(--color-ink-muted)]">
              {tool.description}
            </p>
          </div>

          {/* Features */}
          <div className="mt-10">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-faint)]">
              Features
            </h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {tool.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 text-sm text-[var(--color-ink-muted)]"
                >
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Alternatives CTA */}
          <div className="mt-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-warm)] p-6">
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">
              Looking for something similar?
            </h2>
            <p className="mt-1 text-sm text-[var(--color-ink-faint)]">
              <Link
                href={`/alternative-to/${tool.slug}/`}
                className="font-medium text-[var(--color-accent)] hover:underline"
              >
                See the best alternatives to {tool.name}
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full shrink-0 space-y-5 lg:w-80">
          {/* Visit Website */}
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
            <AffiliateLink href={tool.websiteUrl}>
              Visit {tool.name}
              <svg className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </AffiliateLink>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-faint)]">
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
        </aside>
      </div>
    </div>
  );
}
