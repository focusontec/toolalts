import fs from "fs";
import path from "path";
import Link from "next/link";

function readJson(filePath: string): any[] {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

function countFiles(dir: string): number {
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith(".md")).length;
  } catch {
    return 0;
  }
}

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const dataDir = path.join(process.cwd(), "data");
  const contentDir = path.join(process.cwd(), "src", "content");

  const tools = readJson(path.join(dataDir, "tools.json"));
  const comparisons = readJson(path.join(dataDir, "comparisons.json"));
  const categories = readJson(path.join(dataDir, "categories.json"));
  const pending = readJson(path.join(dataDir, "pending-tools.json"));

  const blogCount = countFiles(path.join(contentDir, "blog"));
  const comparisonContentCount = countFiles(path.join(contentDir, "comparisons"));
  const reportCount = countFiles(path.join(contentDir, "reports"));

  const incompleteTools = tools.filter(
    (t: any) => !t.tagline || !t.pricing?.length || t.rating === 0
  );

  const comparisonsWithoutContent = comparisons.filter((c: any) => {
    const filePath = path.join(contentDir, "comparisons", `${c.slug}.md`);
    return !fs.existsSync(filePath);
  });

  const stats = [
    { label: "Tools", value: tools.length, href: "/admin/tools/", color: "bg-indigo-50 text-indigo-700" },
    { label: "Categories", value: categories.length, href: "/admin/categories/", color: "bg-emerald-50 text-emerald-700" },
    { label: "Comparisons", value: comparisons.length, href: "/admin/comparisons/", color: "bg-amber-50 text-amber-700" },
    { label: "Blog Posts", value: blogCount, href: "/admin/content/", color: "bg-purple-50 text-purple-700" },
    { label: "Reports", value: reportCount, href: "/admin/content/", color: "bg-slate-100 text-slate-700" },
    { label: "Pending Candidates", value: pending.length, href: "/admin/pipeline/", color: "bg-rose-50 text-rose-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Overview of your ToolAlts site.</p>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`rounded-xl p-4 transition hover:shadow-sm ${stat.color}`}
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="mt-0.5 text-xs font-medium opacity-75">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Action items */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Incomplete tools */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Tools Needing Attention
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Missing tagline, pricing, or rating
          </p>
          {incompleteTools.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">All tools are complete.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {incompleteTools.slice(0, 8).map((tool: any) => (
                <li key={tool.slug} className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-slate-900">{tool.name}</span>
                    <span className="ml-2 text-xs text-slate-400">{tool.category}</span>
                  </div>
                  <div className="flex gap-1">
                    {!tool.tagline && (
                      <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] text-red-600">tagline</span>
                    )}
                    {!tool.pricing?.length && (
                      <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] text-red-600">pricing</span>
                    )}
                    {tool.rating === 0 && (
                      <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] text-red-600">rating</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Comparisons missing content */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Comparisons Without Content
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            No Markdown article generated yet
          </p>
          {comparisonsWithoutContent.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">All comparisons have content.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {comparisonsWithoutContent.slice(0, 8).map((comp: any) => (
                <li key={comp.slug} className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-slate-900">{comp.slug}</span>
                  <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-600">no content</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Quick Actions</h2>
          <div className="mt-3 space-y-2">
            <Link
              href="/admin/pipeline/"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <span>Run discovery pipeline</span>
              <span className="text-xs text-slate-400">→</span>
            </Link>
            <Link
              href="/admin/tools/"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <span>Review tool data</span>
              <span className="text-xs text-slate-400">→</span>
            </Link>
            <Link
              href="/admin/content/"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <span>Edit content</span>
              <span className="text-xs text-slate-400">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
