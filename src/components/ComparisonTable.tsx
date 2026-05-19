import type { Tool } from "@/lib/types";

interface ComparisonTableProps {
  toolA: Tool;
  toolB: Tool;
}

export function ComparisonTable({ toolA, toolB }: ComparisonTableProps) {
  const allFeatures = Array.from(new Set([...toolA.features, ...toolB.features]));

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="grid grid-cols-3 divide-x divide-slate-200 bg-slate-50 text-sm font-medium text-slate-700 dark:divide-slate-800 dark:bg-slate-950 dark:text-slate-300">
        <div className="px-4 py-3">Feature</div>
        <div className="px-4 py-3">{toolA.name}</div>
        <div className="px-4 py-3">{toolB.name}</div>
      </div>
      <div className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-3 divide-x divide-slate-200 text-sm dark:divide-slate-800">
          <div className="px-4 py-3 text-slate-600 dark:text-slate-400">Rating</div>
          <div className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">★ {toolA.rating}</div>
          <div className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">★ {toolB.rating}</div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-200 text-sm dark:divide-slate-800">
          <div className="px-4 py-3 text-slate-600 dark:text-slate-400">Open Source</div>
          <div className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{toolA.openSource ? "Yes" : "No"}</div>
          <div className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{toolB.openSource ? "Yes" : "No"}</div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-200 text-sm dark:divide-slate-800">
          <div className="px-4 py-3 text-slate-600 dark:text-slate-400">GitHub Stars</div>
          <div className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{toolA.githubStars?.toLocaleString() ?? "N/A"}</div>
          <div className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{toolB.githubStars?.toLocaleString() ?? "N/A"}</div>
        </div>
        {allFeatures.map((feature) => (
          <div key={feature} className="grid grid-cols-3 divide-x divide-slate-200 text-sm dark:divide-slate-800">
            <div className="px-4 py-3 text-slate-600 dark:text-slate-400">{feature}</div>
            <div className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
              {toolA.features.includes(feature) ? (
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
              {toolB.features.includes(feature) ? (
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
