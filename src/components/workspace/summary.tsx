"use client";

import { useState } from "react";
import { Quote, ListChecks, FileDown } from "lucide-react";
import type { StudyDocument, SummaryType } from "@/lib/types";

const summaryTypes: { id: SummaryType; label: string }[] = [
  { id: "quick", label: "Quick" },
  { id: "detailed", label: "Detailed" },
  { id: "executive", label: "Executive" },
  { id: "academic", label: "Academic" },
  { id: "business", label: "Business" },
  { id: "bullet", label: "Bullet" },
  { id: "children", label: "Kid-friendly" },
  { id: "technical", label: "Technical" },
  { id: "simple", label: "Simple" },
];

function CitationChip({ page, snippet }: { page: number; snippet: string }) {
  return (
    <span className="group relative ms-1.5 inline-flex cursor-help items-center rounded-md bg-brand-500/10 px-1.5 py-0.5 align-middle text-[11px] font-semibold text-brand-500">
      p. {page}
      <span className="pointer-events-none absolute bottom-full start-0 z-20 mb-2 w-72 rounded-xl border border-(--border-subtle) bg-(--surface-strong) p-3 text-xs font-normal leading-relaxed text-slate-600 opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 dark:text-slate-300">
        <Quote className="mb-1 size-3 text-brand-500" />
        “{snippet}”
      </span>
    </span>
  );
}

export function Summary({ doc }: { doc: StudyDocument }) {
  const [type, setType] = useState<SummaryType>("detailed");

  const exportMarkdown = () => {
    const md = [
      `# ${doc.title} — Summary`,
      "",
      ...doc.summarySections.flatMap((s) => [`## ${s.heading}`, "", `${s.content} *(p. ${s.citation.page})*`, ""]),
      "## Key points",
      "",
      ...doc.keyPoints.map((k) => `- ${k.text} *(p. ${k.citation.page})*`),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    a.download = "summary.md";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {summaryTypes.map((s) => (
            <button
              key={s.id}
              onClick={() => setType(s.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                type === s.id
                  ? "bg-brand-500/15 text-brand-500 ring-1 ring-brand-500/40"
                  : "text-slate-500 hover:bg-slate-500/10"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button onClick={exportMarkdown} className="btn-ghost h-8 px-3 text-xs">
          <FileDown className="size-3.5" /> Markdown
        </button>
      </div>

      <div className="space-y-4">
        {doc.summarySections.map((s, i) => (
          <section key={s.heading} className="card animate-fade-up p-6" style={{ animationDelay: `${i * 70}ms` }}>
            <h3 className="font-semibold">{s.heading}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {type === "children" ? s.content.replace(/parameterized function/g, "recipe with knobs") : s.content}
              <CitationChip page={s.citation.page} snippet={s.citation.snippet} />
            </p>
          </section>
        ))}
      </div>

      <section className="card p-6">
        <h3 className="flex items-center gap-2 font-semibold">
          <ListChecks className="size-4.5 text-brand-500" /> Key points
        </h3>
        <ul className="mt-4 space-y-3">
          {doc.keyPoints.map((k) => (
            <li key={k.text} className="flex items-start gap-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gradient-to-r from-brand-500 to-violet-500" />
              <span>
                {k.text}
                <CitationChip page={k.citation.page} snippet={k.citation.snippet} />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
