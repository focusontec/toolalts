"use client";

import { useState } from "react";

interface PaginatedListProps<T> {
  items: T[];
  pageSize?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

function PaginationControls({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (n: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-xs text-slate-500">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function PaginatedList<T>({ items, pageSize = 10, renderItem }: PaginatedListProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / pageSize);
  const start = (page - 1) * pageSize;
  const visible = items.slice(start, start + pageSize);

  return (
    <div>
      <div className="space-y-4">
        {visible.map((item, i) => renderItem(item, start + i))}
      </div>
      <PaginationControls page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}

interface PaginatedTableProps<T> {
  items: T[];
  pageSize?: number;
  columns: string[];
  renderRow: (item: T, index: number) => React.ReactNode;
}

export function PaginatedTable<T>({ items, pageSize = 15, columns, renderRow }: PaginatedTableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / pageSize);
  const start = (page - 1) * pageSize;
  const visible = items.slice(start, start + pageSize);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {visible.map((item, i) => renderRow(item, start + i))}
        </tbody>
      </table>
      <PaginationControls page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
