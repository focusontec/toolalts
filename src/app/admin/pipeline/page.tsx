"use client";

import { useState, useEffect } from "react";

const WORKFLOWS = [
  { id: "discover-tools.yml", label: "Full Pipeline", description: "Discover → Verify → Approve → Compare → Sync" },
  { id: "sync-tools.yml", label: "Sync Tools", description: "Update GitHub stars and pricing screenshots" },
  { id: "generate-comparisons.yml", label: "Generate Comparisons", description: "Generate comparison articles via LLM" },
  { id: "scrape-new-tool.yml", label: "Scrape New Tool", description: "Manually add a new tool" },
];

interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  event: string;
}

export default function PipelinePage() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchRuns();
  }, []);

  async function fetchRuns() {
    try {
      const res = await fetch("/api/admin/github/");
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function triggerPipeline(workflowId: string) {
    setTriggering(workflowId);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/github/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: `Pipeline triggered: ${workflowId}` });
        // Refresh runs after a short delay
        setTimeout(fetchRuns, 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to trigger" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setTriggering(null);
    }
  }

  function statusBadge(status: string, conclusion: string | null) {
    if (status === "in_progress" || status === "queued") {
      return <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">Running</span>;
    }
    if (conclusion === "success") {
      return <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">Success</span>;
    }
    if (conclusion === "failure") {
      return <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">Failed</span>;
    }
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{status}</span>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
      <p className="mt-1 text-sm text-slate-500">Trigger and monitor automation workflows.</p>

      {message && (
        <div
          className={`mt-4 rounded-lg px-4 py-2 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Trigger buttons */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {WORKFLOWS.map((wf) => (
          <div
            key={wf.id}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <h3 className="text-sm font-semibold text-slate-900">{wf.label}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{wf.description}</p>
            <button
              onClick={() => triggerPipeline(wf.id)}
              disabled={triggering === wf.id}
              className="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {triggering === wf.id ? "Triggering..." : "Run"}
            </button>
          </div>
        ))}
      </div>

      {/* Recent runs */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Runs</h2>
          <button
            onClick={fetchRuns}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {loading ? (
            <p className="p-4 text-sm text-slate-400">Loading...</p>
          ) : runs.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">No runs found.</p>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Workflow</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Trigger</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Time</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {runs.slice(0, 15).map((run) => (
                  <tr key={run.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{run.name}</td>
                    <td className="px-4 py-3">{statusBadge(run.status, run.conclusion)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{run.event}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(run.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={run.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        View on GitHub →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
