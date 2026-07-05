"use client";

import Link from "next/link";
import { useState } from "react";
import {
  UploadCloud,
  FileText,
  Sparkles,
  Layers,
  MessageSquareText,
  TrendingUp,
  Clock,
  Star,
  ArrowUpRight,
} from "lucide-react";
import { useApp } from "@/components/providers";
import { recentDocuments } from "@/lib/demo-data";

const stats = [
  { label: "Documents processed", value: "24", delta: "+6 this week", icon: FileText },
  { label: "Flashcards mastered", value: "312", delta: "+48 this week", icon: Layers },
  { label: "Chat questions asked", value: "189", delta: "+31 this week", icon: MessageSquareText },
  { label: "Study streak", value: "11 days", delta: "personal best", icon: TrendingUp },
];

export default function DashboardPage() {
  const { t } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulated resumable upload: real uploads stream chunks to the storage API.
  const simulateUpload = () => {
    if (uploading) return;
    setUploading(true);
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setUploading(false);
          return 100;
        }
        return p + Math.random() * 14;
      });
    }, 180);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back 👋</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your library, study progress, and AI tools — all in one place.
        </p>
      </div>

      {/* Upload zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={simulateUpload}
        onKeyDown={(e) => e.key === "Enter" && simulateUpload()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); simulateUpload(); }}
        className={`animate-fade-up cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          dragOver
            ? "scale-[1.01] border-brand-500 bg-brand-500/10"
            : "border-slate-300/70 hover:border-brand-400 hover:bg-brand-500/5 dark:border-slate-600/60"
        }`}
        style={{ animationDelay: "60ms" }}
      >
        {uploading ? (
          <div className="mx-auto max-w-md">
            <p className="text-sm font-medium">Uploading & processing…</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-500/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-[width] duration-200"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {progress < 40 ? "Streaming chunks…" : progress < 75 ? "Extracting text & running OCR…" : progress < 100 ? "Generating embeddings & mind map…" : "Done — document ready"}
            </p>
          </div>
        ) : (
          <>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/30">
              <UploadCloud className="size-6" />
            </span>
            <p className="mt-3 font-semibold">{t.drop_title}</p>
            <p className="mt-1 text-xs text-slate-500">{t.drop_sub}</p>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, delta, icon: Icon }, i) => (
          <div key={label} className="card card-hover animate-fade-up p-5" style={{ animationDelay: `${120 + i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{label}</span>
              <Icon className="size-4 text-brand-500" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-emerald-500">{delta}</p>
          </div>
        ))}
      </div>

      {/* Recent uploads */}
      <section className="animate-fade-up" style={{ animationDelay: "300ms" }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold"><Clock className="size-4.5 text-brand-500" /> {t.recent_uploads}</h2>
          <Link href="/dashboard/documents/demo-deep-learning" className="text-xs font-medium text-brand-500 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {recentDocuments.map((doc) => (
            <Link
              key={doc.id}
              href={`/dashboard/documents/demo-deep-learning`}
              className="card card-hover group flex items-center gap-4 p-5"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-500">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{doc.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {doc.type} · {doc.pages} pages · {doc.language} · {doc.uploadedAt}
                </p>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-slate-400 transition group-hover:text-brand-500" />
            </Link>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="animate-fade-up grid gap-4 md:grid-cols-3" style={{ animationDelay: "380ms" }}>
        {[
          { title: "Continue studying", desc: "Deep Learning — 68% of flashcards mastered", icon: Layers, href: "/dashboard/documents/demo-deep-learning?tab=flashcards" },
          { title: "Ask your library", desc: "Chat across all uploaded documents at once", icon: MessageSquareText, href: "/dashboard/documents/demo-deep-learning?tab=chat" },
          { title: "Favorites", desc: "4 bookmarked summaries and 12 starred cards", icon: Star, href: "/dashboard/bookmarks" },
        ].map(({ title, desc, icon: Icon, href }) => (
          <Link key={title} href={href} className="card card-hover p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-violet-500/10 text-violet-500">
              <Icon className="size-5" />
            </span>
            <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold">
              {title} <Sparkles className="size-3.5 text-brand-400" />
            </p>
            <p className="mt-1 text-xs text-slate-500">{desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
