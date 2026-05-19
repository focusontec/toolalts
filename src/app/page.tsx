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
    canonical: "https://tool-alts.vercel.app/",
  },
};

const tools = toolsData as Tool[];
const categories = categoriesData as Category[];

const hotAlternatives = [
  { slug: "notion", label: "Notion Alternatives" },
  { slug: "figma", label: "Figma Alternatives" },
  { slug: "linear", label: "Linear Alternatives" },
  { slug: "cursor", label: "Cursor Alternatives" },
  { slug: "slack", label: "Slack Alternatives" },
  { slug: "vscode", label: "VS Code Alternatives" },
];

export default function HomePage() {
  const featuredTools = tools.slice(0, 6);

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ToolAlts",
    url: "https://tool-alts.vercel.app/",
    description: metadata.description,
    potentialAction: {
      "@type": "SearchAction",
      target: "https://tool-alts.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <SchemaJsonLd schema={schema} />
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Find the Best Alternatives to Your Favorite Tools
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Open-source and paid alternatives for developers, designers, and
              productivity hackers.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/category/"
                className="inline-flex items-center rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                Browse Categories
              </Link>
              <Link
                href="/blog/"
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Read Blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900">
            Popular Alternatives
          </h2>
          <p className="mt-2 text-slate-600">
            Explore the most-searched tools and their best alternatives.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hotAlternatives.map((alt) => (
            <Link
              key={alt.slug}
              href={`/alternative-to/${alt.slug}/`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {alt.label}
              </span>
              <svg
                className="h-5 w-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Browse by Category</h2>
          <p className="mt-2 text-slate-600">
            Find tools tailored to your workflow.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}/`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                {cat.name}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Featured Tools</h2>
          <p className="mt-2 text-slate-600">
            Hand-picked tools worth checking out today.
          </p>
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
