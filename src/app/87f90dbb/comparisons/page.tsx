import fs from "fs";
import path from "path";
import Link from "next/link";

export const dynamic = "force-dynamic";

function readJson(filePath: string): any[] {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

export default function ComparisonsPage() {
  const dataDir = path.join(process.cwd(), "data");
  const contentDir = path.join(process.cwd(), "src", "content", "comparisons");

  const comparisons = readJson(path.join(dataDir, "comparisons.json"));
  const tools = readJson(path.join(dataDir, "tools.json"));

  const toolMap = new Map(tools.map((t: any) => [t.slug, t.name]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Comparisons</h1>
      <p className="mt-1 text-sm text-slate-500">{comparisons.length} comparison pairs</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Comparison</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Content</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comparisons.map((comp: any) => {
              const hasContent = fs.existsSync(path.join(contentDir, `${comp.slug}.md`));
              const nameA = toolMap.get(comp.toolA) || comp.toolA;
              const nameB = toolMap.get(comp.toolB) || comp.toolB;

              return (
                <tr key={comp.slug} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {nameA} vs {nameB}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {comp.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {hasContent ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">Has article</span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">No article</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/content/comparisons/${comp.slug}/`}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                    >
                      {hasContent ? "Edit" : "Generate"}
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
