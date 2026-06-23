import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Link from "next/link";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.toolalts.dev"),
  title: "ToolAlts — Best Open Source & Paid Alternatives to Popular Tools",
  description:
    "Discover the best open source and paid alternatives to popular software tools. Compare features, pricing, and ratings side by side.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ToolAlts",
    title: "ToolAlts — Best Open Source & Paid Alternatives to Popular Tools",
    description:
      "Discover the best open source and paid alternatives to popular software tools. Compare features, pricing, and ratings side by side.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolAlts — Best Open Source & Paid Alternatives to Popular Tools",
    description:
      "Discover the best open source and paid alternatives to popular software tools. Compare features, pricing, and ratings side by side.",
  },
  robots: { index: true, follow: true },
};

function Footer() {
  const footerGroups = [
    {
      title: "Explore",
      links: [
        { href: "/blog/", label: "Blog" },
        { href: "/reports/", label: "Reports" },
        { href: "/category/", label: "Categories" },
      ],
    },
    {
      title: "Tools",
      links: [
        { href: "/quiz/", label: "Quiz" },
        { href: "/calculator/", label: "Calculator" },
        { href: "/stack-builder/", label: "Stack Builder" },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: "/migration-guides/", label: "Migration Guides" },
        { href: "/submit/", label: "Submit a Tool" },
      ],
    },
  ];

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-warm)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <span className="font-display text-lg text-[var(--color-ink)]">
              ToolAlts
            </span>
            <p className="mt-1 text-sm leading-6 text-[var(--color-ink-faint)]">
              Find the best alternatives to your favorite tools.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3 lg:w-[40rem]">
            {footerGroups.map((group) => (
              <nav key={group.title} className="min-w-0">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink)]">
                  {group.title}
                </h2>
                <ul className="mt-3 space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block text-sm leading-6 text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-ink)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-[var(--color-border-light)] pt-6 text-center text-xs leading-5 text-[var(--color-ink-faint)]">
          &copy; {new Date().getFullYear()} ToolAlts. Built with care.
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PGX7THVY9L"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PGX7THVY9L');
          `}
        </Script>
        <SiteNav />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
