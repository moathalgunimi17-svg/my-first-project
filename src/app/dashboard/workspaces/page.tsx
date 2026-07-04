"use client";

import Link from "next/link";
import { FolderKanban, Users, FileText, Plus } from "lucide-react";

const workspaces = [
  { name: "Medical Finals 2026", members: 4, docs: 18, color: "from-brand-600 to-violet-600", updated: "Updated 2h ago" },
  { name: "ML Research Group", members: 7, docs: 42, color: "from-cyan-500 to-brand-600", updated: "Updated yesterday" },
  { name: "History Thesis", members: 1, docs: 9, color: "from-amber-500 to-rose-500", updated: "Updated 4 days ago" },
];

export default function WorkspacesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
          <p className="mt-1 text-sm text-slate-500">Shared libraries where teams study together.</p>
        </div>
        <button className="btn-primary h-10 px-5 text-sm"><Plus className="size-4" /> New workspace</button>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((w) => (
          <Link key={w.name} href="/dashboard/documents/demo-deep-learning" className="card card-hover overflow-hidden">
            <div className={`h-20 bg-gradient-to-br ${w.color}`} />
            <div className="p-5">
              <span className="-mt-11 grid size-12 place-items-center rounded-xl border border-(--border-subtle) bg-(--surface-strong) shadow-lg">
                <FolderKanban className="size-5 text-brand-500" />
              </span>
              <h2 className="mt-3 font-semibold">{w.name}</h2>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Users className="size-3.5" /> {w.members}</span>
                <span className="flex items-center gap-1"><FileText className="size-3.5" /> {w.docs} docs</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">{w.updated}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
