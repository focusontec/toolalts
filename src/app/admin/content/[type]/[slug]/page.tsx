"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ContentEditPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;
  const slug = params.slug as string;

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/content/?type=${type}&slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setContent(data.content || "");
        setLoading(false);
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to load content" });
        setLoading(false);
      });
  }, [type, slug]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/content/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, slug, content }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Saved! Changes will appear after redeployment." });
      } else {
        setMessage({ type: "error", text: data.error || "Save failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit: {slug}</h1>
          <p className="mt-1 text-sm text-slate-500">Type: {type}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/admin/content/")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mt-4 rounded-lg px-4 py-2 text-sm ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={30}
          className="w-full rounded-xl border border-slate-200 bg-white p-4 font-mono text-sm leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
