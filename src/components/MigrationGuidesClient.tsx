"use client";

import Link from "next/link";

interface MigrationGuideMeta {
  slug: string;
  fromTool: string;
  toTool: string;
  fromSlug: string;
  toSlug: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  steps: number;
  title: string;
  excerpt: string;
}

const difficultyColors: Record<string, { bg: string; text: string; label: string }> = {
  easy: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Easy" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", label: "Medium" },
  hard: { bg: "bg-red-50", text: "text-red-700", label: "Hard" },
};

export function MigrationGuidesClient({ guides }: { guides: MigrationGuideMeta[] }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent-light)] px-4 py-1.5 text-sm font-medium text-[var(--color-accent)]">
          🔄 Migration Guides
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tight text-[var(--color-ink)] sm:text-4xl">
          Switch to Open Source, Step by Step
        </h1>
        <p className="mt-3 text-[var(--color-ink-faint)]">
          Detailed guides to help you migrate from proprietary SaaS tools to open source alternatives.
        </p>
      </div>

      <div className="mt-10 space-y-4">
        {guides.map((guide) => {
          const diff = difficultyColors[guide.difficulty] || difficultyColors.medium;
          return (
            <Link
              key={guide.slug}
              href={`/migration-guides/${guide.slug}/`}
              className="group flex items-start gap-5 rounded-xl border border-[var(--color-border)] bg-white p-6 transition-all hover:border-[var(--color-accent)]/30 hover:shadow-md"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-highlight)] text-2xl">
                →
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-accent)]">
                  {guide.fromTool} → {guide.toTool}
                </h2>
                <p className="mt-1 text-sm text-[var(--color-ink-faint)]">{guide.excerpt}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  <span className={`rounded-full px-2.5 py-1 font-medium ${diff.bg} ${diff.text}`}>
                    {diff.label}
                  </span>
                  <span className="text-[var(--color-ink-muted)]">
                    ⏱ {guide.estimatedTime}
                  </span>
                  <span className="text-[var(--color-ink-muted)]">
                    📋 {guide.steps} steps
                  </span>
                  <span className="capitalize text-[var(--color-ink-muted)]">
                    {guide.category}
                  </span>
                </div>
              </div>
              <svg
                className="h-5 w-5 shrink-0 text-[var(--color-ink-faint)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
