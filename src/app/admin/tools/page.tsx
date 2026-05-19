import fs from "fs";
import path from "path";
import Link from "next/link";

export const dynamic = "force-dynamic";

function readTools(): any[] {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "tools.json"), "utf-8"));
  } catch {
    return [];
  }
}

export default function ToolsPage() {
  const tools = readTools();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tools</h1>
          <p className="mt-1 text-sm text-slate-500">{tools.length} tools in database</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Open Source</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tools.map((tool: any) => {
              const issues: string[] = [];
              if (!tool.tagline) issues.push("tagline");
              if (!tool.pricing?.length) issues.push("pricing");
              if (tool.rating === 0) issues.push("rating");
              if (!tool.features?.length) issues.push("features");

              return (
                <tr key={tool.slug} className="hover:bg-slate-50">
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
                    {issues.length === 0 ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">Complete</span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">
                        Missing: {issues.join(", ")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {tool.openSource ? (
                      <span className="text-emerald-600">Yes</span>
                    ) : (
                      <span className="text-slate-400">No</span>
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
    </div>
  );
}
