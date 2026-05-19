import Link from "next/link";
import type { Metadata } from "next";
import categoriesData from "@/../data/categories.json";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";
import type { Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Categories — ToolAlts",
  description: "Browse software tools by category.",
  alternates: {
    canonical: "https://tool-alts.vercel.app/category/",
  },
};

const categories = categoriesData as Category[];

export default function CategoriesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    label: "Tool Categories",
    itemListElement: categories.map((cat, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Thing",
        label: cat.name,
        href: `https://tool-alts.vercel.app/category/${cat.slug}/`,
        description: cat.description,
      },
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <SchemaJsonLd schema={schema} />
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Categories
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Browse software tools by category.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}/`}
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
              {cat.name}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {cat.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
