import Link from "next/link";
import { Menu } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/blog/", label: "Blog" },
  { href: "/reports/", label: "Reports" },
  { href: "/quiz/", label: "Quiz" },
  { href: "/calculator/", label: "Calculator" },
  { href: "/submit/", label: "Submit a Tool" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="min-w-0 shrink-0 font-display text-lg text-[var(--color-ink)] transition-opacity hover:opacity-70 sm:text-xl"
        >
          ToolAlts
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-[var(--color-ink-faint)] transition-colors hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <details className="relative md:hidden">
          <summary className="flex h-10 w-10 list-none items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-warm)] [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Open menu</span>
            <Menu className="h-5 w-5" />
          </summary>
          <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
            <nav className="flex flex-col p-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-ink-faint)] transition-colors hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-ink)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
