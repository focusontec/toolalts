"use client";

import { useState } from "react";
import Link from "next/link";

const CATEGORIES = [
  { value: "development", label: "Development" },
  { value: "productivity", label: "Productivity" },
  { value: "project-management", label: "Project Management" },
  { value: "design", label: "Design" },
  { value: "communication", label: "Communication" },
];

export default function SubmitPage() {
  const [form, setForm] = useState({
    toolName: "",
    websiteUrl: "",
    githubUrl: "",
    category: "",
    reason: "",
    submitterEmail: "",
    honeypot: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/submit/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(data.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success-light)]">
          <svg className="h-8 w-8 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-3xl tracking-tight text-[var(--color-ink)]">
          Thank you!
        </h1>
        <p className="mt-3 text-lg text-[var(--color-ink-muted)]">
          Your submission has been received. We&apos;ll review it and get back to you soon.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/submit/"
            className="rounded-lg border border-[var(--color-border)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-surface-warm)]"
            onClick={() => setStatus("idle")}
          >
            Submit another tool
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Browse tools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl tracking-tight text-[var(--color-ink)] sm:text-4xl">
        Submit a Tool
      </h1>
      <p className="mt-3 text-lg text-[var(--color-ink-muted)]">
        Know a great tool that should be on ToolAlts? Submit it for review.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        {/* Honeypot */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            name="website_confirm"
            tabIndex={-1}
            autoComplete="off"
            value={form.honeypot}
            onChange={(e) => updateField("honeypot", e.target.value)}
          />
        </div>

        {/* Tool Name */}
        <div>
          <label htmlFor="toolName" className="block text-sm font-medium text-[var(--color-ink)]">
            Tool Name <span className="text-[var(--color-accent)]">*</span>
          </label>
          <input
            id="toolName"
            type="text"
            required
            value={form.toolName}
            onChange={(e) => updateField("toolName", e.target.value)}
            placeholder="e.g. CoolTool"
            className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>

        {/* Website URL */}
        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-[var(--color-ink)]">
            Website URL <span className="text-[var(--color-accent)]">*</span>
          </label>
          <input
            id="websiteUrl"
            type="url"
            required
            value={form.websiteUrl}
            onChange={(e) => updateField("websiteUrl", e.target.value)}
            placeholder="https://cooltool.dev"
            className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>

        {/* GitHub URL */}
        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium text-[var(--color-ink)]">
            GitHub URL <span className="text-xs text-[var(--color-ink-faint)]">(optional)</span>
          </label>
          <input
            id="githubUrl"
            type="url"
            value={form.githubUrl}
            onChange={(e) => updateField("githubUrl", e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-[var(--color-ink)]">
            Category <span className="text-[var(--color-accent)]">*</span>
          </label>
          <select
            id="category"
            required
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Reason */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-[var(--color-ink)]">
            Why is this tool useful? <span className="text-xs text-[var(--color-ink-faint)]">(optional)</span>
          </label>
          <textarea
            id="reason"
            rows={3}
            value={form.reason}
            onChange={(e) => updateField("reason", e.target.value)}
            placeholder="Tell us why this tool deserves to be listed..."
            className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="submitterEmail" className="block text-sm font-medium text-[var(--color-ink)]">
            Your email <span className="text-xs text-[var(--color-ink-faint)]">(optional, for updates)</span>
          </label>
          <input
            id="submitterEmail"
            type="email"
            value={form.submitterEmail}
            onChange={(e) => updateField("submitterEmail", e.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "loading" || !form.toolName || !form.websiteUrl || !form.category}
          className="w-full rounded-lg bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {status === "loading" ? "Submitting..." : "Submit Tool"}
        </button>

        <p className="text-center text-xs text-[var(--color-ink-faint)]">
          Submissions are reviewed manually. We&apos;ll add your tool if it meets our quality standards.
        </p>
      </form>
    </div>
  );
}
