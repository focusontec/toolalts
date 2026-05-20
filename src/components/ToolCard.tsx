import Link from "next/link";
import type { Tool } from "@/lib/types";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link
      href={`/tool/${tool.slug}/`}
      className="group flex flex-col rounded-xl border border-[var(--color-border)] bg-white p-6 transition-all hover:border-[var(--color-accent)]/30 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-highlight)] text-sm font-bold text-white transition-colors group-hover:bg-[var(--color-accent)]">
          {tool.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-accent)]">
            {tool.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--color-ink-faint)]">
            {tool.tagline}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--color-border-light)] pt-4 text-xs">
        <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-amber-warm)]">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {tool.rating}
        </span>
        <span className="text-[var(--color-ink-faint)]">
          {tool.reviewsCount.toLocaleString()} reviews
        </span>
        {tool.openSource && (
          <span className="ml-auto rounded-md bg-[var(--color-success-light)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-success)]">
            OSS
          </span>
        )}
      </div>
    </Link>
  );
}
