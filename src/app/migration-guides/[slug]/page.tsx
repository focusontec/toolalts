import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getAllMigrationGuideSlugs,
  getMigrationGuideBySlug,
} from "@/lib/migration-guides";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllMigrationGuideSlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getMigrationGuideBySlug(slug);
  if (!guide) return {};
  return {
    title: `${guide.title} | ToolAlts`,
    description: guide.excerpt,
    alternates: { canonical: `https://www.toolalts.dev/migration-guides/${slug}/` },
    openGraph: {
      type: "article",
      title: `${guide.title} | ToolAlts`,
      description: guide.excerpt,
      url: `https://www.toolalts.dev/migration-guides/${slug}/`,
      siteName: "ToolAlts",
    },
  };
}

export default async function MigrationGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getMigrationGuideBySlug(slug);
  if (!guide) notFound();

  const difficultyColors: Record<string, string> = {
    easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    hard: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
        <Link href="/" className="hover:text-[var(--color-accent)]">Home</Link>
        <span>/</span>
        <Link href="/migration-guides/" className="hover:text-[var(--color-accent)]">Migration Guides</Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">{guide.fromTool} → {guide.toTool}</span>
      </nav>

      {/* Header */}
      <div className="mt-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent-light)] px-4 py-1.5 text-sm font-medium text-[var(--color-accent)]">
          🔄 Migration Guide
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tight text-[var(--color-ink)] sm:text-4xl">
          {guide.fromTool} → {guide.toTool}
        </h1>
        <p className="mt-3 text-[var(--color-ink-faint)]">{guide.excerpt}</p>
      </div>

      {/* Meta cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--color-border)] bg-white p-3 text-center">
          <p className="text-xs text-[var(--color-ink-muted)]">Difficulty</p>
          <p className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${difficultyColors[guide.difficulty] || difficultyColors.medium}`}>
            {guide.difficulty.charAt(0).toUpperCase() + guide.difficulty.slice(1)}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-white p-3 text-center">
          <p className="text-xs text-[var(--color-ink-muted)]">Time</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{guide.estimatedTime}</p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-white p-3 text-center">
          <p className="text-xs text-[var(--color-ink-muted)]">Steps</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{guide.steps}</p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-white p-3 text-center">
          <p className="text-xs text-[var(--color-ink-muted)]">Category</p>
          <p className="mt-1 text-sm font-semibold capitalize text-[var(--color-ink)]">{guide.category}</p>
        </div>
      </div>

      {/* Content */}
      <article className="prose prose-slate mt-10 max-w-none dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{guide.content}</ReactMarkdown>
      </article>

      {/* Tool links */}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href={`/tool/${guide.fromSlug}/`}
          className="flex-1 rounded-xl border border-[var(--color-border)] bg-white p-4 text-center transition-all hover:border-[var(--color-accent)]/30"
        >
          <p className="text-sm text-[var(--color-ink-muted)]">Migrating from</p>
          <p className="mt-1 font-semibold text-[var(--color-ink)]">{guide.fromTool}</p>
        </Link>
        <div className="flex items-center justify-center text-[var(--color-ink-muted)]">→</div>
        <Link
          href={`/tool/${guide.toSlug}/`}
          className="flex-1 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-light)] p-4 text-center transition-all hover:border-[var(--color-accent)]/40"
        >
          <p className="text-sm text-[var(--color-ink-muted)]">Migrating to</p>
          <p className="mt-1 font-semibold text-[var(--color-accent)]">{guide.toTool}</p>
        </Link>
      </div>

      {/* Back link */}
      <div className="mt-10 text-center">
        <Link
          href="/migration-guides/"
          className="text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          ← All Migration Guides
        </Link>
      </div>
    </div>
  );
}
