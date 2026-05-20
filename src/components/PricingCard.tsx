import type { PricingPlan } from "@/lib/types";

interface PricingCardProps {
  plan: PricingPlan;
  featured?: boolean;
}

export function PricingCard({ plan, featured }: PricingCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 transition-all ${
        featured
          ? "border-[var(--color-accent)]/30 bg-[var(--color-accent-light)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)]"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-faint)]">
          {plan.plan}
        </h4>
        {featured && (
          <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
            Popular
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
        {plan.price}
      </p>
      <ul className="mt-3 space-y-1.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13px] text-[var(--color-ink-muted)]">
            <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
