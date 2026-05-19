import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: Crumb[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && (
              <svg className="h-4 w-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
            {item.href ? (
              <Link href={item.href} className="hover:text-slate-900 dark:hover:text-slate-200">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-900 dark:text-slate-100">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
