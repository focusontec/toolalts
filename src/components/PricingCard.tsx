import type { PricingPlan } from "@/lib/types";

interface PricingCardProps {
  plan: PricingPlan;
  featured?: boolean;
}

export function PricingCard({ plan, featured }: PricingCardProps) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        featured
          ? "border-indigo-200 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/30"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {plan.plan}
      </h4>
      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
        {plan.price}
      </p>
      <ul className="mt-4 space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
