import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, ShieldX, AlertTriangle, Clock } from "lucide-react";
import { getAllReports } from "@/lib/reports";

export const metadata: Metadata = {
  title: "Verification Reports — AI-Audited Tool Reviews | ToolAlts",
  description:
    "Browse our AI-powered verification reports. See how we cross-check tool data from GitHub, official websites, and community signals before publishing.",
};

function DecisionBadge({ decision }: { decision: string }) {
  if (decision === "APPROVE") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <ShieldCheck className="w-3.5 h-3.5" />
        Approved
      </span>
    );
  }
  if (decision === "REJECT") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        <ShieldX className="w-3.5 h-3.5" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
      <AlertTriangle className="w-3.5 h-3.5" />
      Ambiguous
    </span>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-xs text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            score >= 80
              ? "bg-emerald-500"
              : score >= 50
              ? "bg-amber-500"
              : "bg-red-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-700 w-8 text-right">{score}</span>
    </div>
  );
}

export default function ReportsPage() {
  const reports = getAllReports();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Verification Reports</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-2xl">
          Every tool on ToolAlts goes through a multi-source AI verification process.
          We cross-check GitHub data, official websites, and community signals before publishing.
          <span className="ml-2 text-gray-400">({reports.length} reports)</span>
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="p-12 bg-gray-50 rounded-xl text-center text-gray-500">
          No verification reports yet. Run the discovery pipeline to generate some.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Link
              key={report.slug}
              href={`/reports/${report.slug}/`}
              className="group block rounded-xl border border-gray-100 bg-white p-5 hover:border-primary-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <DecisionBadge decision={report.decision} />
                    <span className="text-xs text-gray-400">{report.category}</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-primary-600 transition-colors">
                    {report.name}
                  </h2>
                  <div className="mt-3 space-y-1.5">
                    <ScoreBar label="Verify" score={report.confidence} />
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(report.processedAt).toLocaleDateString()}
                  </div>
                  <span className="text-xs font-medium text-primary-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Read report
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
