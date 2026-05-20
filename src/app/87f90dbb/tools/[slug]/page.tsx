"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Tool {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  rating: number;
  reviewsCount: number;
  openSource: boolean;
  githubStars: number | null;
  githubUrl: string | null;
  websiteUrl: string;
  pricing: { plan: string; price: string; features: string[] }[];
  features: string[];
  category: string;
  logo: string;
}

const EMPTY_TOOL: Tool = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  rating: 0,
  reviewsCount: 0,
  openSource: false,
  githubStars: null,
  githubUrl: null,
  websiteUrl: "",
  pricing: [],
  features: [],
  category: "other",
  logo: "",
};

export default function ToolEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const isNew = slug === "new";

  const [tool, setTool] = useState<Tool>(EMPTY_TOOL);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/tools/${slug}/`)
        .then((r) => r.json())
        .then((data) => {
          setTool(data);
          setLoading(false);
        })
        .catch(() => {
          setMessage({ type: "error", text: "Failed to load tool" });
          setLoading(false);
        });
    }
  }, [slug, isNew]);

  function updateField(field: keyof Tool, value: any) {
    setTool((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const url = isNew ? "/api/admin/tools/" : `/api/admin/tools/${slug}/`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tool),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Saved! Changes will appear after redeployment." });
        if (isNew) {
          router.push("/87f90dbb/tools/");
        }
      } else {
        setMessage({ type: "error", text: data.error || "Save failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isNew ? "Add New Tool" : `Edit: ${tool.name}`}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{tool.slug}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/87f90dbb/tools/")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Basic info */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Basic Info</h2>
          <div className="mt-4 space-y-4">
            <Field label="Name" value={tool.name} onChange={(v) => updateField("name", v)} />
            <Field label="Slug" value={tool.slug} onChange={(v) => updateField("slug", v)} disabled={!isNew} />
            <Field label="Tagline" value={tool.tagline} onChange={(v) => updateField("tagline", v)} />
            <Field label="Description" value={tool.description} onChange={(v) => updateField("description", v)} textarea />
            <Field label="Category" value={tool.category} onChange={(v) => updateField("category", v)} />
            <Field label="Website URL" value={tool.websiteUrl} onChange={(v) => updateField("websiteUrl", v)} />
            <Field label="GitHub URL" value={tool.githubUrl || ""} onChange={(v) => updateField("githubUrl", v || null)} />
          </div>
        </div>

        {/* Ratings & Meta */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Ratings & Meta</h2>
          <div className="mt-4 space-y-4">
            <Field
              label="Rating (1-5)"
              value={String(tool.rating)}
              onChange={(v) => updateField("rating", parseFloat(v) || 0)}
              type="number"
            />
            <Field
              label="Reviews Count"
              value={String(tool.reviewsCount)}
              onChange={(v) => updateField("reviewsCount", parseInt(v) || 0)}
              type="number"
            />
            <Field
              label="GitHub Stars"
              value={String(tool.githubStars ?? "")}
              onChange={(v) => updateField("githubStars", v ? parseInt(v) : null)}
              type="number"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={tool.openSource}
                onChange={(e) => updateField("openSource", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label className="text-sm text-slate-700">Open Source</label>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Features</h2>
          <p className="mt-0.5 text-xs text-slate-500">One feature per line</p>
          <textarea
            value={tool.features.join("\n")}
            onChange={(e) =>
              updateField(
                "features",
                e.target.value.split("\n").filter((f) => f.trim())
              )
            }
            rows={5}
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Pricing */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Pricing</h2>
            <button
              onClick={() =>
                updateField("pricing", [
                  ...tool.pricing,
                  { plan: "", price: "", features: [] },
                ])
              }
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >
              + Add Plan
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {tool.pricing.map((plan, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <input
                      value={plan.plan}
                      onChange={(e) => {
                        const updated = [...tool.pricing];
                        updated[i] = { ...updated[i], plan: e.target.value };
                        updateField("pricing", updated);
                      }}
                      placeholder="Plan name"
                      className="w-32 rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                    <input
                      value={plan.price}
                      onChange={(e) => {
                        const updated = [...tool.pricing];
                        updated[i] = { ...updated[i], price: e.target.value };
                        updateField("pricing", updated);
                      }}
                      placeholder="Price"
                      className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const updated = tool.pricing.filter((_, j) => j !== i);
                      updateField("pricing", updated);
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  value={plan.features.join("\n")}
                  onChange={(e) => {
                    const updated = [...tool.pricing];
                    updated[i] = {
                      ...updated[i],
                      features: e.target.value.split("\n").filter((f) => f.trim()),
                    };
                    updateField("pricing", updated);
                  }}
                  placeholder="Features (one per line)"
                  rows={2}
                  className="mt-2 w-full rounded border border-slate-300 px-2 py-1 text-xs"
                />
              </div>
            ))}
            {tool.pricing.length === 0 && (
              <p className="text-xs text-slate-400">No pricing plans yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  disabled?: boolean;
}) {
  const cls =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400";

  return (
    <div>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={cls}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
          disabled={disabled}
          step={type === "number" ? "0.1" : undefined}
        />
      )}
    </div>
  );
}
