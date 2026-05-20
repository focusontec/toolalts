"use client";

import { useState } from "react";

interface FieldCheck {
  field: string;
  storedValue: string;
  actualValue: string;
  verdict: string;
  note: string;
}

interface DataAudit {
  slug: string;
  name: string;
  accuracyScore: number;
  fieldChecks: FieldCheck[];
  recommendations: string[];
}

interface ContentIssue {
  severity: string;
  message: string;
}

interface ContentAudit {
  slug: string;
  type: string;
  qualityScore: number;
  accuracyScore: number;
  seoScore: number;
  issues: ContentIssue[];
  recommendations: string[];
}

export function ExportButton({
  data,
  content,
}: {
  data: DataAudit[];
  content: ContentAudit[];
}) {
  const [copied, setCopied] = useState(false);

  function generatePrompt(): string {
    const lines: string[] = [];

    lines.push("Based on the AI audit results, fix the following issues in the ToolAlts project.");
    lines.push("");

    // Data accuracy issues
    const dataWithIssues = data.filter((d) =>
      d.fieldChecks.some((f) => f.verdict !== "ACCURATE" && f.verdict !== "UNVERIFIABLE")
    );

    if (dataWithIssues.length > 0) {
      lines.push("## Data Accuracy Issues (tools.json)");
      lines.push("");

      for (const audit of dataWithIssues) {
        const issues = audit.fieldChecks.filter(
          (f) => f.verdict !== "ACCURATE" && f.verdict !== "UNVERIFIABLE"
        );
        lines.push(`### ${audit.name} (slug: ${audit.slug}, accuracy: ${audit.accuracyScore}/100)`);

        for (const issue of issues) {
          lines.push(`- ${issue.field}: ${issue.verdict} — ${issue.note}`);
          if (issue.actualValue && issue.actualValue !== "unverifiable") {
            lines.push(`  Actual value: ${issue.actualValue}`);
          }
        }

        if (audit.recommendations.length > 0) {
          lines.push("  Recommendations:");
          for (const rec of audit.recommendations) {
            lines.push(`  → ${rec}`);
          }
        }
        lines.push("");
      }
    }

    // Content quality issues
    const contentWithIssues = content.filter((c) =>
      c.issues.some((i) => i.severity === "high")
    );

    if (contentWithIssues.length > 0) {
      lines.push("## Content Quality Issues");
      lines.push("");

      for (const audit of contentWithIssues) {
        const highIssues = audit.issues.filter((i) => i.severity === "high");
        lines.push(
          `### ${audit.slug} (${audit.type}, Q:${audit.qualityScore}/A:${audit.accuracyScore}/S:${audit.seoScore})`
        );

        for (const issue of highIssues) {
          lines.push(`- [high] ${issue.message}`);
        }

        if (audit.recommendations.length > 0) {
          lines.push("  Recommendations:");
          for (const rec of audit.recommendations) {
            lines.push(`  → ${rec}`);
          }
        }
        lines.push("");
      }
    }

    // Low-quality content
    const lowQuality = content.filter((c) => {
      const avg = (c.qualityScore + c.accuracyScore + c.seoScore) / 3;
      return avg < 60 && !contentWithIssues.includes(c);
    });

    if (lowQuality.length > 0) {
      lines.push("## Low-Quality Content (needs rewrite)");
      lines.push("");
      for (const audit of lowQuality) {
        const avg = Math.round(
          (audit.qualityScore + audit.accuracyScore + audit.seoScore) / 3
        );
        lines.push(
          `- ${audit.slug} (${audit.type}): avg score ${avg}/100`
        );
        if (audit.recommendations.length > 0) {
          lines.push(`  → ${audit.recommendations[0]}`);
        }
      }
      lines.push("");
    }

    lines.push("## Instructions");
    lines.push("");
    lines.push("1. For data accuracy issues: update data/tools.json with the correct values");
    lines.push("2. For content quality issues: rewrite the affected markdown files in src/content/");
    lines.push("3. For low-quality content: regenerate using LLM with better prompts");
    lines.push("4. After fixes, run `npm run build` to verify no errors");

    return lines.join("\n");
  }

  async function handleCopy() {
    const prompt = generatePrompt();
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const prompt = generatePrompt();
  const issueCount =
    data.filter((d) =>
      d.fieldChecks.some((f) => f.verdict !== "ACCURATE" && f.verdict !== "UNVERIFIABLE")
    ).length +
    content.filter((c) => c.issues.some((i) => i.severity === "high")).length;

  return (
    <div className="space-y-3">
      <button
        onClick={handleCopy}
        disabled={issueCount === 0}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-40"
      >
        {copied ? (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy for Claude Code ({issueCount} issues)
          </>
        )}
      </button>

      {/* Preview */}
      <details className="group">
        <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">
          Preview export content
        </summary>
        <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
          {prompt}
        </pre>
      </details>
    </div>
  );
}
