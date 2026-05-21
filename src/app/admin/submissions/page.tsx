"use client";

import { useState, useEffect } from "react";

interface Submission {
  id: string;
  toolName: string;
  websiteUrl: string;
  githubUrl: string;
  category: string;
  reason: string;
  submitterEmail: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
}

const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    try {
      const res = await fetch("/api/admin/submissions/");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, action: "approve" | "reject") {
    setProcessingId(id);
    try {
      const res = await fetch("/api/admin/submissions/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, note: reviewNote || undefined }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? data.submission : s))
        );
        setReviewNote("");
      } else {
        const data = await res.json();
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setProcessingId(null);
    }
  }

  const filtered = filter === "all" ? submissions : submissions.filter((s) => s.status === filter);
  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-slate-500">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Submissions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review tools submitted by visitors.
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === f
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      <div className="mt-6 space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-sm text-slate-500">No submissions found.</p>
          </div>
        ) : (
          filtered.map((submission) => (
            <div
              key={submission.id}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {submission.toolName}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[submission.status]
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1.5 text-sm text-slate-600">
                    <p>
                      <span className="font-medium text-slate-500">Website:</span>{" "}
                      <a
                        href={submission.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {submission.websiteUrl}
                      </a>
                    </p>
                    {submission.githubUrl && (
                      <p>
                        <span className="font-medium text-slate-500">GitHub:</span>{" "}
                        <a
                          href={submission.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          {submission.githubUrl}
                        </a>
                      </p>
                    )}
                    <p>
                      <span className="font-medium text-slate-500">Category:</span>{" "}
                      {submission.category.replace(/-/g, " ")}
                    </p>
                    {submission.reason && (
                      <p>
                        <span className="font-medium text-slate-500">Reason:</span>{" "}
                        {submission.reason}
                      </p>
                    )}
                    {submission.submitterEmail && (
                      <p>
                        <span className="font-medium text-slate-500">Email:</span>{" "}
                        {submission.submitterEmail}
                      </p>
                    )}
                    <p className="text-xs text-slate-400">
                      Submitted {new Date(submission.submittedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {submission.reviewedAt && (
                      <p className="text-xs text-slate-400">
                        Reviewed {new Date(submission.reviewedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                        {submission.reviewNote && ` — ${submission.reviewNote}`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {submission.status === "pending" && (
                  <div className="ml-6 flex flex-col items-end gap-2">
                    {processingId === submission.id ? (
                      <div className="text-sm text-slate-500">Processing...</div>
                    ) : (
                      <>
                        <textarea
                          placeholder="Review note (optional)"
                          value={processingId === submission.id ? reviewNote : ""}
                          onChange={(e) => setReviewNote(e.target.value)}
                          className="w-64 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 focus:border-indigo-500 focus:outline-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(submission.id, "reject")}
                            className="rounded-lg border border-red-200 bg-white px-4 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAction(submission.id, "approve")}
                            className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
