"use client";

import { useState, useEffect } from "react";

interface Category {
  slug: string;
  name: string;
  description: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: "", name: "", description: "" });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories/").then((r) => r.json()),
      fetch("/api/admin/tools/").then((r) => r.json()),
    ])
      .then(([cats, t]) => {
        setCategories(cats);
        setTools(t);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function toolCount(slug: string) {
    return tools.filter((t: any) => t.category === slug).length;
  }

  async function handleSave() {
    setMessage(null);
    try {
      const res = await fetch("/api/admin/categories/", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...form, originalSlug: editing } : form),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Saved!" });
        setEditing(null);
        setForm({ slug: "", name: "", description: "" });
        // Reload
        const cats = await fetch("/api/admin/categories/").then((r) => r.json());
        setCategories(cats);
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
  }

  async function handleDelete(slug: string) {
    if (toolCount(slug) > 0) {
      setMessage({ type: "error", text: `Cannot delete: ${toolCount(slug)} tools use this category` });
      return;
    }

    if (!confirm(`Delete category "${slug}"?`)) return;

    try {
      const res = await fetch("/api/admin/categories/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.slug !== slug));
        setMessage({ type: "success", text: "Deleted!" });
      }
    } catch {
      setMessage({ type: "error", text: "Delete failed" });
    }
  }

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
      <p className="mt-1 text-sm text-slate-500">{categories.length} categories</p>

      {message && (
        <div
          className={`mt-4 rounded-lg px-4 py-2 text-sm ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">
          {editing ? `Editing: ${editing}` : "Add Category"}
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="slug"
            disabled={!!editing}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
          />
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Name"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleSave}
            disabled={!form.slug || !form.name}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {editing ? "Update" : "Add"}
          </button>
          {editing && (
            <button
              onClick={() => {
                setEditing(null);
                setForm({ slug: "", name: "", description: "" });
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Tools</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat.slug} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-mono text-slate-700">{cat.slug}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{cat.name}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{cat.description}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{toolCount(cat.slug)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditing(cat.slug);
                        setForm({ slug: cat.slug, name: cat.name, description: cat.description });
                      }}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.slug)}
                      className="rounded-lg bg-red-50 px-2.5 py-1 text-xs text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
