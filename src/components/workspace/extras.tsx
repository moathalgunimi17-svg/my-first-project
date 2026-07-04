"use client";

import { useMemo, useState } from "react";
import {
  BookMarked,
  User,
  MapPin,
  CalendarDays,
  Sigma,
  Hash,
  Lightbulb,
  FileSpreadsheet,
  Mic,
  Clapperboard,
  Waypoints,
  CalendarClock,
  Play,
  Pause,
} from "lucide-react";
import type { StudyDocument, Term } from "@/lib/types";

/* ---------------- Key Terms ---------------- */

const kindMeta: Record<Term["kind"], { icon: typeof User; label: string; cls: string }> = {
  concept: { icon: Lightbulb, label: "Concept", cls: "bg-brand-500/12 text-brand-500" },
  keyword: { icon: Hash, label: "Keyword", cls: "bg-violet-500/12 text-violet-500" },
  person: { icon: User, label: "Person", cls: "bg-emerald-500/12 text-emerald-500" },
  location: { icon: MapPin, label: "Location", cls: "bg-cyan-500/12 text-cyan-500" },
  date: { icon: CalendarDays, label: "Date", cls: "bg-amber-500/12 text-amber-500" },
  formula: { icon: Sigma, label: "Formula", cls: "bg-rose-500/12 text-rose-500" },
};

export function KeyTerms({ terms }: { terms: Term[] }) {
  const [kind, setKind] = useState<"all" | Term["kind"]>("all");
  const filtered = useMemo(
    () => (kind === "all" ? terms : terms.filter((t) => t.kind === kind)),
    [terms, kind]
  );
  const kinds = [...new Set(terms.map((t) => t.kind))];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setKind("all")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${kind === "all" ? "bg-brand-500/15 text-brand-500 ring-1 ring-brand-500/40" : "text-slate-500 hover:bg-slate-500/10"}`}
        >
          All
        </button>
        {kinds.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${kind === k ? "bg-brand-500/15 text-brand-500 ring-1 ring-brand-500/40" : "text-slate-500 hover:bg-slate-500/10"}`}
          >
            {kindMeta[k].label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((t) => {
          const meta = kindMeta[t.kind];
          const Icon = meta.icon;
          return (
            <div key={t.term} className="card card-hover p-5">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.cls}`}>
                  <Icon className="size-3" /> {meta.label}
                </span>
                <span className="text-[11px] font-medium text-slate-400">p. {t.citation.page}</span>
              </div>
              <p className="mt-3 font-semibold">{t.term}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t.definition}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Timeline ---------------- */

export function Timeline({ doc }: { doc: StudyDocument }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative space-y-8 border-s-2 border-brand-500/30 ps-8">
        {doc.timeline.map((ev, i) => (
          <div key={ev.year} className="animate-fade-up relative" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="absolute -start-[41px] top-1 grid size-5 place-items-center rounded-full border-2 border-brand-500 bg-(--background)">
              <span className="size-1.5 rounded-full bg-brand-500" />
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/12 px-3 py-1 text-xs font-bold text-brand-500">
              <CalendarClock className="size-3" /> {ev.year}
            </span>
            <h3 className="mt-2 font-semibold">{ev.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{ev.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Tables ---------------- */

export function ExtractedTables({ doc }: { doc: StudyDocument }) {
  const exportCsv = (i: number) => {
    const t = doc.tables[i];
    const csv = [t.columns.join(","), ...t.rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `${t.title.toLowerCase().replace(/\W+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {doc.tables.map((t, i) => (
        <div key={t.title} className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-(--border-subtle) px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="size-4.5 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="text-[11px] text-slate-500">Detected on page {t.page}</p>
              </div>
            </div>
            <button onClick={() => exportCsv(i)} className="btn-ghost h-8 px-3 text-xs">Export CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--border-subtle) text-start text-xs uppercase tracking-wide text-slate-500">
                  {t.columns.map((c) => (
                    <th key={c} className="px-5 py-3 text-start font-semibold">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-(--border-subtle) last:border-0 hover:bg-brand-500/4">
                    {row.map((cell, ci) => (
                      <td key={ci} className={`px-5 py-3 ${ci === 0 ? "font-medium" : "text-slate-600 dark:text-slate-400"}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- AI Studio (podcast / video / graph / study plan) ---------------- */

export function AiStudio({ doc }: { doc: StudyDocument }) {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(37);

  return (
    <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
      {/* Podcast */}
      <div className="card p-6">
        <span className="grid size-11 place-items-center rounded-xl bg-rose-500/12 text-rose-500"><Mic className="size-5.5" /></span>
        <h3 className="mt-4 font-semibold">AI Podcast</h3>
        <p className="mt-1 text-sm text-slate-500">A two-voice conversation walking through this document&apos;s summary.</p>
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="btn-primary size-11 !p-0"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="size-4.5" /> : <Play className="size-4.5" />}
          </button>
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={100}
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{Math.floor((position / 100) * 18)}:{String(Math.floor((((position / 100) * 18) % 1) * 60)).padStart(2, "0")}</span>
              <span>18:00</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-slate-400">
          {playing ? "Playing episode: “Deep Learning in 18 minutes”…" : "Episode ready — generated from the detailed summary."}
        </p>
      </div>

      {/* Video summary */}
      <div className="card p-6">
        <span className="grid size-11 place-items-center rounded-xl bg-violet-500/12 text-violet-500"><Clapperboard className="size-5.5" /></span>
        <h3 className="mt-4 font-semibold">AI Video Summary</h3>
        <p className="mt-1 text-sm text-slate-500">A 3-minute animated explainer built from the mind map and key points.</p>
        <div className="mt-5 grid aspect-video place-items-center rounded-xl bg-gradient-to-br from-brand-950 to-violet-950 text-white">
          <div className="text-center">
            <span className="mx-auto grid size-12 cursor-pointer place-items-center rounded-full bg-white/15 backdrop-blur transition hover:scale-105">
              <Play className="size-5" />
            </span>
            <p className="mt-2 text-xs text-white/70">deep-learning-explainer.mp4 · 3:04</p>
          </div>
        </div>
      </div>

      {/* Knowledge graph */}
      <div className="card p-6">
        <span className="grid size-11 place-items-center rounded-xl bg-cyan-500/12 text-cyan-500"><Waypoints className="size-5.5" /></span>
        <h3 className="mt-4 font-semibold">Knowledge Graph</h3>
        <p className="mt-1 text-sm text-slate-500">
          {doc.terms.length} concepts linked by {doc.terms.length * 2 + 3} relations extracted from the text.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {doc.terms.slice(0, 6).map((t) => (
            <span key={t.term} className="rounded-full border border-cyan-500/30 bg-cyan-500/8 px-3 py-1 text-xs font-medium text-cyan-600 dark:text-cyan-400">
              {t.term}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-400">Open the Mind Map tab for the interactive view.</p>
      </div>

      {/* Study plan */}
      <div className="card p-6">
        <span className="grid size-11 place-items-center rounded-xl bg-emerald-500/12 text-emerald-500"><BookMarked className="size-5.5" /></span>
        <h3 className="mt-4 font-semibold">Study Mode</h3>
        <p className="mt-1 text-sm text-slate-500">Auto plan for {doc.pages} pages, sized to a 14-day deadline.</p>
        <ul className="mt-4 space-y-2.5 text-sm">
          {[
            ["Days 1–4", "Foundations: perceptron → backpropagation (ch. 1–4)"],
            ["Days 5–8", "Architectures: CNNs, RNNs (ch. 5–8) + 40 flashcards"],
            ["Days 9–11", "Transformers & attention (ch. 9–10) + quiz"],
            ["Days 12–14", "Scaling laws review + full mock exam"],
          ].map(([when, what]) => (
            <li key={when} className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0 rounded-md bg-emerald-500/12 px-2 py-0.5 text-[11px] font-bold text-emerald-500">{when}</span>
              <span className="text-slate-600 dark:text-slate-400">{what}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
