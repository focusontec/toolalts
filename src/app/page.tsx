import Link from "next/link";
import type { Metadata } from "next";
import toolsData from "@/../data/tools.json";
import categoriesData from "@/../data/categories.json";
import { ToolCard } from "@/components/ToolCard";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";
import type { Tool, Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "ToolAlts — Best Open Source & Paid Alternatives to Popular Tools",
  description:
    "Discover the best open source and paid alternatives to popular software tools. Compare features, pricing, and ratings side by side.",
  alternates: {
    canonical: "https://www.toolalts.dev/",
  },
};

const tools = toolsData as Tool[];
const categories = categoriesData as Category[];

const hotAlternatives = [
  { slug: "notion", label: "Notion" },
  { slug: "figma", label: "Figma" },
  { slug: "linear", label: "Linear" },
  { slug: "cursor", label: "Cursor" },
  { slug: "slack", label: "Slack" },
  { slug: "vscode", label: "VS Code" },
];

export default function HomePage() {
  const featuredTools = tools.slice(0, 6);

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ToolAlts",
    url: "https://www.toolalts.dev/",
    description: metadata.description,
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.toolalts.dev/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <SchemaJsonLd schema={schema} />

      {/* ─── Hero ─── */}
      <section className="noise relative overflow-hidden bg-[var(--color-highlight)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(232,85,61,0.15),transparent)]" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-24 sm:pb-28 sm:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                Open source & paid alternatives
              </span>
            </div>
            <h1 className="animate-fade-in-up-delay-1 mt-8 font-display text-4xl leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find the best alternatives
              <br />
              <span className="text-white/40">to your favorite tools</span>
            </h1>
            <p className="animate-fade-in-up-delay-2 mt-6 text-lg leading-relaxed text-white/50">
              Side-by-side comparisons of features, pricing, and ratings.
              <br className="hidden sm:block" />
              For developers, designers, and productivity hackers.
            </p>
            <div className="animate-fade-in-up-delay-3 mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/category/"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition-all hover:bg-white/90 hover:shadow-lg"
              >
                Browse Categories
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/blog/"
                className="inline-flex items-center rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-white/70 transition-all hover:border-white/30 hover:text-white"
              >
                Read Blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Popular Alternatives ─── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-accent)]">
            Trending
          </span>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-[var(--color-ink)] sm:text-4xl">
            Popular Alternatives
          </h2>
          <p className="mt-3 max-w-xl text-[var(--color-ink-faint)]">
            Explore the most-searched tools and discover what else is out there.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hotAlternatives.map((alt, i) => (
            <Link
              key={alt.slug}
              href={`/alternative-to/${alt.slug}/`}
              className={`group flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white px-5 py-4 transition-all hover:border-[var(--color-accent)]/30 hover:shadow-md ${
                i === 0 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-surface-warm)] text-sm font-bold text-[var(--color-ink-muted)] group-hover:bg-[var(--color-accent-light)] group-hover:text-[var(--color-accent)]">
                  {alt.label.slice(0, 2)}
                </span>
                <span className="font-semibold text-[var(--color-ink)]">
                  {alt.label} Alternatives
                </span>
              </div>
              <svg className="h-4 w-4 text-[var(--color-ink-faint)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="bg-[var(--color-surface-warm)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-accent)]">
              Explore
            </span>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-[var(--color-ink)] sm:text-4xl">
              Browse by Category
            </h2>
            <p className="mt-3 max-w-xl text-[var(--color-ink-faint)]">
              Find tools tailored to your workflow.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}/`}
                className="group rounded-xl border border-[var(--color-border)] bg-white p-6 transition-all hover:border-[var(--color-accent)]/30 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-accent)]">
                  {cat.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-faint)]">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Tools ─── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-accent)]">
              Curated
            </span>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-[var(--color-ink)] sm:text-4xl">
              Featured Tools
            </h2>
            <p className="mt-3 max-w-xl text-[var(--color-ink-faint)]">
              Hand-picked tools worth checking out today.
            </p>
          </div>
          <Link
            href="/category/"
            className="hidden items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] transition-opacity hover:opacity-70 sm:inline-flex"
          >
            View all
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>
    </>
  );
}
