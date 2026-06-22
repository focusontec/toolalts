import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

interface WorkflowTask {
  id: string;
  title: string;
  type: "content" | "tool-review" | "seo-fix";
  slug: string;
  status: "todo" | "doing" | "done" | "skipped";
  priorityScore: number;
  source: string;
  reason: string;
  action: string;
  createdAt: string;
  dueAt: string;
}

interface Opportunity {
  slug: string;
  name: string;
  category: string;
  activeAlternativesCount: number;
  contentWords: number;
  priorityScore: number;
  reason: string;
  suggestedAction: string;
}

function readJson<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    content: "bg-sky-50 text-sky-700",
    "tool-review": "bg-amber-50 text-amber-700",
    "seo-fix": "bg-violet-50 text-violet-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[type] || "bg-slate-100 text-slate-600"}`}>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    todo: "bg-slate-100 text-slate-600",
    doing: "bg-sky-50 text-sky-700",
    done: "bg-emerald-50 text-emerald-700",
    skipped: "bg-slate-100 text-slate-400",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

export default function WorkflowPage() {
  const dataDir = path.join(process.cwd(), "data");
  const tasks = readJson<WorkflowTask[]>(path.join(dataDir, "workflow-tasks.json")) ?? [];
  const opportunities = readJson<Opportunity[]>(path.join(dataDir, "content-opportunities.json")) ?? [];

  const openTasks = tasks.filter((t) => t.status === "todo" || t.status === "doing");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Weekly Workflow</h1>
        <p className="mt-1 text-sm text-slate-500">
          Prioritized content and review tasks for this week
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Open Tasks</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{openTasks.length}</p>
          <p className="text-xs text-slate-400">to do this week</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Completed</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{doneTasks.length}</p>
          <p className="text-xs text-slate-400">tasks done</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Opportunities</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{opportunities.length}</p>
          <p className="text-xs text-slate-400">content gaps</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Top Priority</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {openTasks[0]?.priorityScore ?? "—"}
          </p>
          <p className="text-xs text-slate-400">{openTasks[0]?.slug ?? "no tasks"}</p>
        </div>
      </div>

      {/* Tasks Table */}
      {tasks.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">All Tasks</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Task</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Due</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks
                  .sort((a, b) => {
                    const order = { todo: 0, doing: 1, done: 2, skipped: 3 };
                    const sa = order[a.status as keyof typeof order] ?? 4;
                    const sb = order[b.status as keyof typeof order] ?? 4;
                    if (sa !== sb) return sa - sb;
                    return b.priorityScore - a.priorityScore;
                  })
                  .map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">{task.title}</p>
                        <p className="text-xs text-slate-400">{task.slug}</p>
                      </td>
                      <td className="px-4 py-3"><TypeBadge type={task.type} /></td>
                      <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                        {task.priorityScore}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{task.dueAt}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">{task.reason}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">No tasks yet.</p>
          <p className="mt-1 text-xs text-slate-400">
            Run <code className="rounded bg-slate-100 px-1 py-0.5">npm run workflow:plan</code> to generate weekly tasks.
          </p>
        </div>
      )}

      {/* Content Opportunities Top 10 */}
      {opportunities.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900">Content Opportunities — Top 10</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Tool</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Category</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Alts</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Words</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {opportunities.slice(0, 10).map((opp, i) => (
                  <tr key={opp.slug} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{opp.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{opp.category}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-600">{opp.activeAlternativesCount}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-600">{opp.contentWords}</td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-slate-900">{opp.priorityScore}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">{opp.suggestedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
