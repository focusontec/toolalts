"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import toolsData from "@/../data/tools.json";
import categoriesData from "@/../data/categories.json";
import type { Category, Tool } from "@/lib/types";

const tools = (toolsData as Tool[]).filter((tool) => tool.status === "active");
const categories = categoriesData as Category[];

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

export function SearchClient({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const normalizedQuery = normalize(query);

  const results = useMemo(() => {
    if (!normalizedQuery) return tools;

    return tools.filter((tool) => {
      const haystack = [
        tool.name,
        tool.tagline,
        tool.description,
        tool.category,
        ...(tool.features ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  return (
    <div>
      <label className="sr-only" htmlFor="tool-search">
        Search tools
      </label>
      <input
        id="tool-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search Notion, Slack, Figma, Cursor..."
        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-base text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10"
      />

      {!normalizedQuery && (
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}/`}
              className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-ink-faint)] transition hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
          {results.length} result{results.length === 1 ? "" : "s"}
        </h2>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tool/${tool.slug}/`}
            className="group rounded-xl border border-[var(--color-border)] bg-white p-5 transition hover:border-[var(--color-accent)]/40 hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-highlight)] text-xs font-bold text-white">
                {tool.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-accent)]">
                  {tool.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--color-ink-faint)]">
                  {tool.tagline}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--color-ink-faint)]">
              <span className="rounded-full bg-[var(--color-surface-warm)] px-2 py-1">
                {tool.category.replace(/-/g, " ")}
              </span>
              {tool.openSource && (
                <span className="rounded-full bg-[var(--color-success-light)] px-2 py-1 font-semibold text-[var(--color-success)]">
                  OSS
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {results.length === 0 && (
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-warm)] p-8 text-center">
          <p className="text-sm text-[var(--color-ink-muted)]">
            No matching tools yet. Try a category, product name, or workflow keyword.
          </p>
        </div>
      )}
    </div>
  );
}
