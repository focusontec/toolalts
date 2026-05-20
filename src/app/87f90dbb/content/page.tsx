import fs from "fs";
import path from "path";
import Link from "next/link";

export const dynamic = "force-dynamic";

function getContentFiles(dir: string, type: string): { slug: string; type: string; title: string }[] {
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => {
        const slug = f.replace(/\.md$/, "");
        const raw = fs.readFileSync(path.join(dir, f), "utf-8");
        const titleMatch = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m);
        return {
          slug,
          type,
          title: titleMatch?.[1] || slug,
        };
      });
  } catch {
    return [];
  }
}

export default function ContentPage() {
  const contentDir = path.join(process.cwd(), "src", "content");

  const blogs = getContentFiles(path.join(contentDir, "blog"), "blog");
  const comparisons = getContentFiles(path.join(contentDir, "comparisons"), "comparisons");
  const reports = getContentFiles(path.join(contentDir, "reports"), "reports");

  const sections = [
    { label: "Blog Posts", items: blogs, type: "blog" },
    { label: "Comparison Articles", items: comparisons, type: "comparisons" },
    { label: "Verification Reports", items: reports, type: "reports" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Content</h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage blog posts, comparison articles, and verification reports.
      </p>

      <div className="mt-6 space-y-8">
        {sections.map((section) => (
          <div key={section.type}>
            <h2 className="text-lg font-semibold text-slate-900">
              {section.label} ({section.items.length})
            </h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {section.items.length === 0 ? (
                <p className="p-4 text-sm text-slate-400">No {section.label.toLowerCase()} found.</p>
              ) : (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Slug</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {section.items.map((item) => (
                      <tr key={item.slug} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.title}</td>
                        <td className="px-4 py-3 text-sm font-mono text-slate-500">{item.slug}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/content/${section.type}/${item.slug}/`}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
