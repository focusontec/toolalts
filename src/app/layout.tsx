import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Link from "next/link";
import "./globals.css";

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

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-[var(--color-ink)] transition-opacity hover:opacity-70"
        >
          ToolAlts
        </Link>
        <nav className="flex items-center gap-1">
          {[
            { href: "/", label: "Home" },
            { href: "/blog/", label: "Blog" },
            { href: "/reports/", label: "Reports" },
            { href: "/submit/", label: "Submit a Tool" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-[var(--color-ink-faint)] transition-colors hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-warm)]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <span className="font-display text-lg text-[var(--color-ink)]">
              ToolAlts
            </span>
            <p className="mt-1 text-sm text-[var(--color-ink-faint)]">
              Find the best alternatives to your favorite tools.
            </p>
          </div>
          <div className="flex gap-8">
            {[
              { href: "/blog/", label: "Blog" },
              { href: "/reports/", label: "Reports" },
              { href: "/category/", label: "Categories" },
              { href: "/submit/", label: "Submit a Tool" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-ink)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-[var(--color-border-light)] pt-6 text-center text-xs text-[var(--color-ink-faint)]">
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
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
