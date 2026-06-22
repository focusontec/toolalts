import type { Metadata } from "next";
import { SearchClient } from "@/components/SearchClient";

export const metadata: Metadata = {
  title: "Search Software Alternatives | ToolAlts",
  description:
    "Search open source, self-hosted, free, and paid SaaS alternatives by product name, category, or workflow.",
  alternates: { canonical: "https://www.toolalts.dev/search/" },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q : "";

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-accent)]">
          Search
        </span>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-[var(--color-ink)] sm:text-5xl">
          Find software alternatives
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-faint)]">
          Search the active ToolAlts catalog for open source, self-hosted, free,
          and paid alternatives.
        </p>
      </div>

      <div className="mt-8">
        <SearchClient initialQuery={query} />
      </div>
    </div>
  );
}
