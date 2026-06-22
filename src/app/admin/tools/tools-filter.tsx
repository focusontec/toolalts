"use client";

import { useState } from "react";
import Link from "next/link";
import type { ToolStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: ToolStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "hidden", label: "Hidden" },
];

function StatusBadge({ status }: { status: ToolStatus }) {
  const styles: Record<ToolStatus, string> = {
    active: "bg-emerald-50 text-emerald-700",
    draft: "bg-amber-50 text-amber-700",
    review: "bg-sky-50 text-sky-700",
    hidden: "bg-slate-100 text-slate-500",
    removed: "bg-red-50 text-red-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}

export function ToolsFilter({ tools }: { tools: any[] }) {
  const [filter, setFilter] = useState<ToolStatus | "all">("all");
  const [saving, setSaving] = useState<string | null>(null);

  const filtered = filter === "all" ? tools : tools.filter((t) => t.status === filter);

  async function updateStatus(slug: string, newStatus: ToolStatus) {
    setSaving(slug);
    try {
      const res = await fetch(`/api/admin/tools/${slug}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // Update local state
        const tool = tools.find((t) => t.slug === slug);
        if (tool) tool.status = newStatus;
        // Force re-render
        setFilter((f) => f);
      }
    } finally {
      setSaving(null);
    }
  }

  return (
    <>
      {/* Filter tabs */}
      <div className="mt-4 flex gap-1">
        {STATUS_OPTIONS.map((opt) => {
          const count = opt.value === "all" ? tools.length : tools.filter((t) => t.status === opt.value).length;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === opt.value
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              {opt.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Data</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((tool: any) => {
              const issues: string[] = [];
              if (!tool.tagline) issues.push("tagline");
              if (!tool.pricing?.length) issues.push("pricing");
              if (tool.rating === 0) issues.push("rating");
              if (!tool.features?.length) issues.push("features");

              return (
                <tr key={tool.slug} className={`hover:bg-slate-50 ${tool.status === "hidden" ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                        {tool.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{tool.name}</p>
                        <p className="text-xs text-slate-400">{tool.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {tool.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {tool.rating > 0 ? `★ ${tool.rating}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={tool.status}
                      onChange={(e) => updateStatus(tool.slug, e.target.value as ToolStatus)}
                      disabled={saving === tool.slug}
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs disabled:opacity-50"
                    >
                      <option value="active">active</option>
                      <option value="draft">draft</option>
                      <option value="review">review</option>
                      <option value="hidden">hidden</option>
                      <option value="removed">removed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {issues.length === 0 ? (
                      <span className="text-xs text-emerald-600">Complete</span>
                    ) : (
                      <span className="text-xs text-amber-600">{issues.join(", ")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/tools/${tool.slug}/`}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
