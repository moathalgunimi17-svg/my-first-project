"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  BrainCircuit,
  LayoutDashboard,
  FileText,
  FolderKanban,
  Bookmark,
  Settings,
  ShieldCheck,
  Search,
  Menu,
  X,
  HardDrive,
  Zap,
} from "lucide-react";
import { useApp } from "@/components/providers";
import { LanguageToggle, ThemeToggle } from "@/components/top-controls";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { t } = useApp();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = [
    { href: "/dashboard", label: t.dashboard, icon: LayoutDashboard },
    { href: "/dashboard/documents/demo-deep-learning", label: t.documents, icon: FileText },
    { href: "/dashboard/workspaces", label: t.workspaces, icon: FolderKanban },
    { href: "/dashboard/bookmarks", label: t.bookmarks, icon: Bookmark },
    { href: "/dashboard/settings", label: t.settings, icon: Settings },
    { href: "/dashboard/admin", label: t.admin, icon: ShieldCheck },
  ];

  const sidebar = (
    <div className="flex h-full flex-col gap-1 p-4">
      <Link href="/" className="mb-6 flex items-center gap-2.5 px-2 font-semibold tracking-tight">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/30">
          <BrainCircuit className="size-5" />
        </span>
        MindFlow <span className="gradient-text">AI</span>
      </Link>

      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-brand-500/12 text-brand-500"
                : "text-slate-600 hover:bg-slate-500/8 hover:text-(--foreground) dark:text-slate-300"
            }`}
          >
            <Icon className="size-4.5" /> {label}
          </Link>
        );
      })}

      <div className="mt-auto space-y-3 pt-6">
        <div className="card p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><HardDrive className="size-3.5" /> {t.storage}</span>
            <span>6.2 / 50 GB</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-500/15">
            <div className="h-full w-[12%] rounded-full bg-gradient-to-r from-brand-500 to-violet-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><Zap className="size-3.5" /> {t.ai_credits}</span>
            <span>1,840 / 2,500</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-500/15">
            <div className="h-full w-[73%] rounded-full bg-gradient-to-r from-amber-400 to-pink-500" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-e border-(--border-subtle) bg-(--surface-strong)/60 backdrop-blur-xl lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 start-0 w-72 bg-(--surface-strong) shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute end-3 top-4 p-2 text-slate-400">
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-(--border-subtle) bg-(--background)/75 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button onClick={() => setMobileOpen(true)} className="btn-ghost size-9 !p-0 lg:hidden" aria-label="Open menu">
              <Menu className="size-4.5" />
            </button>
            <div className="relative max-w-md flex-1">
              <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder={t.search}
                className="h-10 w-full rounded-full border border-(--border-subtle) bg-(--surface) ps-10 pe-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="ms-auto flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-bold text-white">
                M
              </span>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
