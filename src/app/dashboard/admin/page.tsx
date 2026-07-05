"use client";

import { Users, Activity, HardDrive, Cpu, ScrollText, Wand2 } from "lucide-react";

const metrics = [
  { label: "Active users", value: "12,481", delta: "+8.2% this month", icon: Users },
  { label: "Documents processed (30d)", value: "94,302", delta: "+14.5%", icon: Activity },
  { label: "Storage used", value: "18.4 TB", delta: "62% of quota", icon: HardDrive },
  { label: "AI tokens (30d)", value: "2.1B", delta: "$12,940 spend", icon: Cpu },
];

const recentUsers = [
  { name: "Sarah K.", email: "sarah@uni.ca", plan: "Pro", docs: 34, joined: "Jun 12" },
  { name: "Amin R.", email: "amin@cairo.edu", plan: "Team", docs: 121, joined: "May 28" },
  { name: "Jonas M.", email: "jonas@hu-berlin.de", plan: "Pro", docs: 56, joined: "May 3" },
  { name: "Lina T.", email: "lina@kaist.kr", plan: "Free", docs: 4, joined: "Jul 1" },
];

const systemLogs = [
  { level: "info", msg: "OCR worker pool scaled to 12 instances", time: "12:41" },
  { level: "warn", msg: "Vector index p95 latency 340ms (threshold 300ms)", time: "12:22" },
  { level: "info", msg: "Nightly embedding compaction completed (4.2M chunks)", time: "03:00" },
  { level: "error", msg: "Upload resumption failed for job 8f3a — retried OK", time: "01:17" },
];

const prompts = [
  { name: "summary.detailed", version: "v14", updated: "2 days ago" },
  { name: "chat.grounded", version: "v9", updated: "5 days ago" },
  { name: "quiz.generator", version: "v11", updated: "1 week ago" },
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin panel</h1>
        <p className="mt-1 text-sm text-slate-500">Platform health, users, and AI operations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, delta, icon: Icon }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{label}</span>
              <Icon className="size-4 text-brand-500" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{delta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Users */}
        <div className="card overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between border-b border-(--border-subtle) px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Users className="size-4 text-brand-500" /> Recent users</h2>
            <button className="btn-ghost h-8 px-3 text-xs">Manage all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-start font-semibold">User</th>
                  <th className="px-5 py-3 text-start font-semibold">Plan</th>
                  <th className="px-5 py-3 text-start font-semibold">Docs</th>
                  <th className="px-5 py-3 text-start font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.email} className="border-t border-(--border-subtle) hover:bg-brand-500/4">
                    <td className="px-5 py-3">
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        u.plan === "Team" ? "bg-violet-500/12 text-violet-500" : u.plan === "Pro" ? "bg-brand-500/12 text-brand-500" : "bg-slate-500/12 text-slate-500"
                      }`}>{u.plan}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{u.docs}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Logs + prompts */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><ScrollText className="size-4 text-brand-500" /> System logs</h2>
            <ul className="mt-4 space-y-3 font-mono text-xs">
              {systemLogs.map((l) => (
                <li key={l.msg} className="flex items-start gap-2.5">
                  <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                    l.level === "error" ? "bg-rose-500/15 text-rose-500" : l.level === "warn" ? "bg-amber-500/15 text-amber-500" : "bg-slate-500/15 text-slate-500"
                  }`}>{l.level}</span>
                  <span className="text-slate-600 dark:text-slate-400">{l.msg}</span>
                  <span className="ms-auto shrink-0 text-slate-400">{l.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Wand2 className="size-4 text-brand-500" /> Prompt management</h2>
            <ul className="mt-4 space-y-2.5">
              {prompts.map((p) => (
                <li key={p.name} className="flex items-center justify-between rounded-xl border border-(--border-subtle) px-4 py-2.5 text-sm">
                  <div>
                    <p className="font-mono text-xs font-medium">{p.name}</p>
                    <p className="text-[11px] text-slate-500">{p.version} · {p.updated}</p>
                  </div>
                  <button className="btn-ghost h-8 px-3 text-xs">Edit</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
