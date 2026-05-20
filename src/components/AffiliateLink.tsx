"use client";

interface AffiliateLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function AffiliateLink({ href, children, className }: AffiliateLinkProps) {
  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-highlight)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-highlight-soft)] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={className ? className : base}
    >
      {children}
    </a>
  );
}
