import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ToolAlts — Best Open Source \u0026 Paid Alternatives to Popular Tools",
  description:
    "Discover the best open source and paid alternatives to popular software tools. Compare features, pricing, and ratings side by side.",
};

function Nav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-primary-700">
          ToolAlts
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/reports/"
            className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
          >
            Reports
          </Link>
          <Link
            href="/blog/"
            className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
          >
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col text-slate-900">
        <Nav />
        <main className="flex-1">{children}</main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
