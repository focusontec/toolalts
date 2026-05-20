import fs from "fs";
import path from "path";
import Link from "next/link";
import type { ToolStatus } from "@/lib/types";
import { ToolsFilter } from "./tools-filter";

export const dynamic = "force-dynamic";

function readTools(): any[] {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "tools.json"), "utf-8"));
  } catch {
    return [];
  }
}

function StatusBadge({ status }: { status: ToolStatus }) {
  const styles: Record<ToolStatus, string> = {
    active: "bg-emerald-50 text-emerald-700",
    draft: "bg-amber-50 text-amber-700",
    hidden: "bg-slate-100 text-slate-500",
    removed: "bg-red-50 text-red-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}

export default function ToolsPage() {
  const tools = readTools();
  const counts = {
    all: tools.length,
    active: tools.filter((t) => t.status === "active").length,
    draft: tools.filter((t) => t.status === "draft").length,
    hidden: tools.filter((t) => t.status === "hidden").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tools</h1>
          <p className="mt-1 text-sm text-slate-500">
            {counts.all} total · {counts.active} active · {counts.draft} draft · {counts.hidden} hidden
          </p>
        </div>
      </div>

      <ToolsFilter tools={tools} />
    </div>
  );
}
