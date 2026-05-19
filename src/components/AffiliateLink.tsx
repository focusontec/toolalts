"use client";

interface AffiliateLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function AffiliateLink({ href, children, className }: AffiliateLinkProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900";
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
