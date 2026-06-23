import fs from "fs";
import path from "path";
import { ExportButton } from "./export-button";
import { PaginatedList, PaginatedTable } from "./paginated-list";

export const dynamic = "force-dynamic";

interface FieldCheck {
  field: string;
  storedValue: string;
  actualValue: string;
  verdict: string;
  source: string;
  note: string;
}

interface DataAudit {
  slug: string;
  name: string;
  accuracyScore: number;
  fieldChecks: FieldCheck[];
  recommendations: string[];
  concerns: string[];
  auditedAt: string;
}

interface ContentIssue {
  severity: "high" | "medium" | "low";
  message: string;
}

interface ContentAudit {
  slug: string;
  type: string;
  qualityScore: number;
  accuracyScore: number;
  seoScore: number;
  issues: ContentIssue[];
  strengths: string[];
  recommendations: string[];
  auditedAt: string;
}

function loadAuditResults(): { data: DataAudit[]; content: ContentAudit[] } {
  const filePath = path.join(process.cwd(), "data", "audit-results.json");
  try {
    if (!fs.existsSync(filePath)) return { data: [], content: [] };
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return { data: [], content: [] };
  }
}

function ScoreBadge({ score, label }: { score: number; label?: string }) {
  const color =
    score >= 80
      ? "bg-emerald-50 text-emerald-700"
      : score >= 60
      ? "bg-amber-50 text-amber-700"
      : "bg-red-50 text-red-700";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {label && <span className="text-[10px] opacity-60">{label}</span>}
      {score}/100
    </span>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const colors: Record<string, string> = {
    ACCURATE: "bg-emerald-50 text-emerald-700",
    OUTDATED: "bg-amber-50 text-amber-700",
    INCORRECT: "bg-red-50 text-red-700",
    MISSING: "bg-orange-50 text-orange-700",
    UNVERIFIABLE: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${colors[verdict] || "bg-slate-100 text-slate-500"}`}>
      {verdict}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    high: "bg-red-50 text-red-700",
    medium: "bg-amber-50 text-amber-700",
    low: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${colors[severity] || "bg-slate-100 text-slate-500"}`}>
      {severity}
    </span>
  );
}

export default function AuditPage() {
  const { data, content } = loadAuditResults();

  const dataAvg =
    data.length > 0
      ? Math.round(data.reduce((s, r) => s + r.accuracyScore, 0) / data.length)
      : 0;

  const contentAvgQ =
    content.length > 0
      ? Math.round(content.reduce((s, r) => s + r.qualityScore, 0) / content.length)
      : 0;
  const contentAvgA =
    content.length > 0
      ? Math.round(content.reduce((s, r) => s + r.accuracyScore, 0) / content.length)
      : 0;
  const contentAvgS =
    content.length > 0
      ? Math.round(content.reduce((s, r) => s + r.seoScore, 0) / content.length)
      : 0;

  const totalIssues = data.reduce(
    (s, r) => s + r.fieldChecks.filter((f) => f.verdict !== "ACCURATE" && f.verdict !== "UNVERIFIABLE").length,
    0
  ) + content.reduce((s, r) => s + r.issues.length, 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Results</h1>
          <p className="mt-1 text-sm text-slate-500">
            AI-powered data accuracy and content quality analysis
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Data Accuracy</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{dataAvg || "—"}</p>
          <p className="text-xs text-slate-400">{data.length} tools audited</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Content Quality</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{contentAvgQ || "—"}</p>
          <p className="text-xs text-slate-400">{content.length} pieces audited</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Content Accuracy</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{contentAvgA || "—"}</p>
          <p className="text-xs text-slate-400">avg across content</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total Issues</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalIssues}</p>
          <p className="text-xs text-slate-400">need attention</p>
        </div>
      </div>

      {/* Export for Claude Code */}
      {(data.length > 0 || content.length > 0) && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Export for Claude Code
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Copy all audit issues as a structured prompt. Paste into Claude Code to auto-fix data
            accuracy and content quality issues.
          </p>
          <div className="mt-3">
            <ExportButton data={data} content={content} />
          </div>
        </div>
      )}

      {data.length === 0 && content.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">No audit results yet.</p>
          <p className="mt-1 text-xs text-slate-400">
            Run the AI Audit workflow from the Pipeline page to generate results.
          </p>
        </div>
      ) : (
        <>
          {/* Data Accuracy Section */}
          {data.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">Data Accuracy</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Field-by-field verification against GitHub and official websites
              </p>

              <div className="mt-4">
                <PaginatedList
                  items={data.sort((a, b) => a.accuracyScore - b.accuracyScore)}
                  pageSize={10}
                  renderItem={(audit) => {
                    const issues = audit.fieldChecks.filter(
                      (f) => f.verdict !== "ACCURATE" && f.verdict !== "UNVERIFIABLE"
                    );
                    return (
                      <div
                        key={audit.slug}
                        className="rounded-xl border border-slate-200 bg-white"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-900">
                              {audit.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              {audit.slug}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ScoreBadge score={audit.accuracyScore} />
                            <span className="text-[10px] text-slate-400">
                              {new Date(audit.auditedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {issues.length > 0 ? (
                          <div className="divide-y divide-slate-50">
                            {issues.map((check, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-4 px-5 py-2.5"
                              >
                                <span className="mt-0.5 w-28 shrink-0 text-xs font-medium text-slate-500">
                                  {check.field}
                                </span>
                                <VerdictBadge verdict={check.verdict} />
                                <span className="flex-1 text-xs text-slate-600">
                                  {check.note}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-5 py-3 text-xs text-slate-400">
                            All checks passed
                          </div>
                        )}

                        {audit.recommendations.length > 0 && (
                          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Recommendations
                            </p>
                            <ul className="mt-1.5 space-y-1">
                              {audit.recommendations.map((rec, i) => (
                                <li key={i} className="text-xs text-slate-600">
                                  → {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
            </div>
          )}

          {/* Content Quality Section */}
          {content.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-slate-900">Content Quality</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Quality, accuracy, and SEO evaluation of generated content
              </p>

              <div className="mt-4">
                <PaginatedTable
                  items={content.sort((a, b) => {
                    const avgA = (a.qualityScore + a.accuracyScore + a.seoScore) / 3;
                    const avgB = (b.qualityScore + b.accuracyScore + b.seoScore) / 3;
                    return avgA - avgB;
                  })}
                  pageSize={15}
                  columns={["Content", "Type", "Quality", "Accuracy", "SEO", "Issues"]}
                  renderRow={(audit) => (
                    <tr key={`${audit.type}-${audit.slug}`} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {audit.slug}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {audit.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ScoreBadge score={audit.qualityScore} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ScoreBadge score={audit.accuracyScore} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ScoreBadge score={audit.seoScore} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {audit.issues.slice(0, 2).map((issue, i) => (
                            <span key={i} className="flex items-center gap-1">
                              <SeverityBadge severity={issue.severity} />
                            </span>
                          ))}
                          {audit.issues.length > 2 && (
                            <span className="text-[10px] text-slate-400">
                              +{audit.issues.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                />
              </div>

              {/* Detailed Issues */}
              <div className="mt-6 space-y-4">
                {content
                  .filter((c) => c.issues.some((i) => i.severity === "high"))
                  .map((audit) => (
                    <div
                      key={`detail-${audit.type}-${audit.slug}`}
                      className="rounded-xl border border-red-100 bg-white p-5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {audit.slug}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {audit.type}
                        </span>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {audit.issues
                          .filter((i) => i.severity === "high")
                          .map((issue, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                              <span className="mt-0.5 text-red-400">●</span>
                              {issue.message}
                            </li>
                          ))}
                      </ul>
                      {audit.recommendations.length > 0 && (
                        <div className="mt-3 border-t border-slate-100 pt-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Recommendations
                          </p>
                          <ul className="mt-1.5 space-y-1">
                            {audit.recommendations.map((rec, i) => (
                              <li key={i} className="text-xs text-slate-500">
                                → {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
