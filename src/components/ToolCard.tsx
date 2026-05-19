import Link from "next/link";
import type { Tool } from "@/lib/types";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link
      href={`/tool/${tool.slug}/`}
      className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {tool.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
            {tool.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
            {tool.tagline}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              ★ {tool.rating}
            </span>
            <span className="text-slate-500 dark:text-slate-500">
              {tool.reviewsCount.toLocaleString()} reviews
            </span>
            {tool.openSource && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Open Source
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
