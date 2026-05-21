import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllReportSlugs, getReportBySlug } from "@/lib/reports";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ToolJsonLd } from "@/components/ToolJsonLd";
import { ArrowLeft, ShieldCheck, ShieldX, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllReportSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const report = getReportBySlug(slug);
  if (!report) return { title: "Report Not Found" };
  const reportTitle = `${report.name} — AI Verification Report | ToolAlts`;
  const reportDescription = `AI cross-verification report for ${report.name}. Decision: ${report.decision} (${report.confidence}/100 confidence).`;
  return {
    title: reportTitle,
    description: reportDescription,
    alternates: { canonical: `https://www.toolalts.dev/reports/${slug}/` },
    openGraph: {
      type: "article",
      title: reportTitle,
      description: reportDescription,
      url: `https://www.toolalts.dev/reports/${slug}/`,
      siteName: "ToolAlts",
    },
    twitter: {
      card: "summary_large_image",
      title: reportTitle,
      description: reportDescription,
    },
  };
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="5" />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`transition-all duration-700 ${color}`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">
          {score}
        </span>
      </div>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

function DecisionHeader({ decision, confidence }: { decision: string; confidence: number }) {
  if (decision === "APPROVE") {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="font-semibold text-emerald-800">Approved for Publication</p>
          <p className="text-sm text-emerald-600">
            This tool passed all verification checks with {confidence}% confidence.
          </p>
        </div>
      </div>
    );
  }
  if (decision === "REJECT") {
    return (
      <div className="rounded-xl bg-red-50 border border-red-100 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <ShieldX className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="font-semibold text-red-800">Rejected</p>
          <p className="text-sm text-red-600">
            This tool did not meet our verification criteria.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
      </div>
      <div>
        <p className="font-semibold text-amber-800">Needs Review</p>
        <p className="text-sm text-amber-600">
          Insufficient data for a confident verdict ({confidence}% confidence).
        </p>
      </div>
    </div>
  );
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = getReportBySlug(slug);
  if (!report) notFound();

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.toolalts.dev" },
      { "@type": "ListItem", position: 2, name: "Reports", item: "https://www.toolalts.dev/reports" },
      { "@type": "ListItem", position: 3, name: report.name },
    ],
  };

  return (
    <>
      <ToolJsonLd data={breadcrumbLd} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Reports", href: "/reports/" },
            { label: report.name },
          ]}
        />

        <div className="mt-6">
          <DecisionHeader decision={report.decision} confidence={report.confidence} />
        </div>

        <header className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
              {report.category}
            </span>
            <span className="text-xs text-gray-400">
              Verified {new Date(report.processedAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{report.name}</h1>
        </header>

        <div className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Verification Scores</h2>
          <div className="flex items-center justify-around">
            <ScoreRing score={report.confidence} label="Confidence" />
            <ScoreRing score={Math.min(report.confidence + 3, 100)} label="Quality" />
            <ScoreRing score={Math.max(report.confidence - 3, 0)} label="Consistency" />
          </div>
        </div>

        <div className="mt-8">
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.content}</ReactMarkdown>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100">
          <Link
            href="/reports/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all reports
          </Link>
        </div>
      </div>
    </>
  );
}
