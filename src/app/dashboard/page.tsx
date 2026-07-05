"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useApp } from "@/components/providers";
import { recentDocuments } from "@/lib/demo-data";
import { listStoredDocuments, saveDocument } from "@/lib/document-store";
import type { StudyDocument } from "@/lib/types";

const stats = [
  { label: "Documents processed", value: "24", delta: "+6 this week", icon: FileText },
  { label: "Flashcards mastered", value: "312", delta: "+48 this week", icon: Layers },
  { label: "Chat questions asked", value: "189", delta: "+31 this week", icon: MessageSquareText },
  { label: "Study streak", value: "11 days", delta: "personal best", icon: TrendingUp },
];

const processingStages = [
  "Uploading file…",
  "Extracting text…",
  "Detecting language & structure…",
  "Generating summary, flashcards, quiz & mind map…",
  "Almost there — building your workspace…",
];

type Phase = "idle" | "processing" | "error";

export default function DashboardPage() {
  const { t } = useApp();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [stage, setStage] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [myDocs, setMyDocs] = useState<StudyDocument[]>([]);

  useEffect(() => {
    // localStorage is client-only, so the library list hydrates after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMyDocs(listStoredDocuments());
  }, []);

  const handleFile = async (file: File) => {
    if (phase === "processing") return;
    setPhase("processing");
    setErrorMsg("");
    setStage(0);

    // Advance stage messages while the server extracts + generates.
    const ticker = setInterval(
      () => setStage((s) => Math.min(s + 1, processingStages.length - 1)),
      4000
    );

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Upload failed. Please try again.");
      saveDocument(data.document as StudyDocument);
      router.push(`/dashboard/documents/${data.document.id}`);
    } catch (err) {
      setPhase("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      clearInterval(ticker);
    }
  };

  const openPicker = () => phase !== "processing" && inputRef.current?.click();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back 👋</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your library, study progress, and AI tools — all in one place.
        </p>
      </div>

      {/* Upload zone */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md,.markdown"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => e.key === "Enter" && openPicker()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={`animate-fade-up cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          dragOver
            ? "scale-[1.01] border-brand-500 bg-brand-500/10"
            : "border-slate-300/70 hover:border-brand-400 hover:bg-brand-500/5 dark:border-slate-600/60"
        }`}
        style={{ animationDelay: "60ms" }}
      >
        {phase === "processing" ? (
          <div className="mx-auto max-w-md">
            <Loader2 className="mx-auto size-8 animate-spin text-brand-500" />
            <p className="mt-3 text-sm font-medium">{processingStages[stage]}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-500/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-[width] duration-700"
                style={{ width: `${((stage + 1) / processingStages.length) * 90}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Large documents can take a minute — the AI reads the whole file.
            </p>
          </div>
        ) : (
          <>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/30">
              <UploadCloud className="size-6" />
            </span>
            <p className="mt-3 font-semibold">{t.drop_title}</p>
            <p className="mt-1 text-xs text-slate-500">PDF, DOCX, TXT, Markdown — up to 25 MB in this version</p>
            {phase === "error" && (
              <p className="mx-auto mt-4 flex max-w-lg items-start justify-center gap-2 rounded-xl bg-rose-500/10 px-4 py-3 text-start text-xs leading-relaxed text-rose-500">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {errorMsg}
              </p>
            )}
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

      {/* Your uploads */}
      {myDocs.length > 0 && (
        <section className="animate-fade-up">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <FileText className="size-4.5 text-brand-500" /> Your documents
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {myDocs.map((doc) => (
              <Link
                key={doc.id}
                href={`/dashboard/documents/${doc.id}`}
                className="card card-hover group flex items-center gap-4 p-5"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-500">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{doc.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {doc.fileType} · {doc.pages} pages · {doc.language} ·{" "}
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-slate-400 transition group-hover:text-brand-500" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Demo library */}
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
