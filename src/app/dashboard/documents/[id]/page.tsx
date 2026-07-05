"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  FileText,
  Sparkles,
  Network,
  Layers,
  ListTodo,
  MessageSquareText,
  BookMarked,
  History,
  Table2,
  Wand2,
  Download,
  ChevronDown,
} from "lucide-react";
import { useApp } from "@/components/providers";
import { demoDocument } from "@/lib/demo-data";
import { getStoredDocument } from "@/lib/document-store";
import type { StudyDocument } from "@/lib/types";
import { Summary } from "@/components/workspace/summary";
import { MindMap } from "@/components/workspace/mind-map";
import { Flashcards } from "@/components/workspace/flashcards";
import { Quiz } from "@/components/workspace/quiz";
import { DocumentChat } from "@/components/workspace/chat";
import { AiStudio, ExtractedTables, KeyTerms, Timeline } from "@/components/workspace/extras";

type TabId =
  | "summary"
  | "mindmap"
  | "flashcards"
  | "quiz"
  | "chat"
  | "terms"
  | "timeline"
  | "tables"
  | "studio";

const exportFormats = ["PDF", "Word", "Markdown", "HTML", "JSON", "CSV", "Flashcards", "Quiz"];

function WorkspaceContent() {
  const { t } = useApp();
  const params = useSearchParams();
  const routeParams = useParams<{ id: string }>();
  const [doc, setDoc] = useState<StudyDocument>(demoDocument);
  const [tab, setTab] = useState<TabId>((params.get("tab") as TabId) || "summary");
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    // Uploaded documents live in localStorage (client-only), so they can
    // only be resolved after mount; the demo document is the SSR fallback.
    const stored = getStoredDocument(routeParams.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setDoc(stored);
  }, [routeParams.id]);

  const allTabs: { id: TabId; label: string; icon: typeof Sparkles }[] = [
    { id: "summary", label: t.tab_summary, icon: Sparkles },
    { id: "mindmap", label: t.tab_mindmap, icon: Network },
    { id: "flashcards", label: t.tab_flashcards, icon: Layers },
    { id: "quiz", label: t.tab_quiz, icon: ListTodo },
    { id: "chat", label: t.tab_chat, icon: MessageSquareText },
    { id: "terms", label: t.tab_terms, icon: BookMarked },
    { id: "timeline", label: t.tab_timeline, icon: History },
    { id: "tables", label: t.tab_tables, icon: Table2 },
    { id: "studio", label: t.tab_studio, icon: Wand2 },
  ];
  const tabs = allTabs.filter(({ id }) => {
    // Hide sections the document genuinely doesn't have (e.g. no
    // chronological events → no timeline, no detected tables → no tables).
    if (id === "timeline") return doc.timeline.length > 0;
    if (id === "tables") return doc.tables.length > 0;
    if (id === "flashcards") return doc.flashcards.length > 0;
    if (id === "quiz") return doc.quiz.length > 0;
    return true;
  });

  const activeTab: TabId = tabs.some((x) => x.id === tab) ? tab : "summary";

  return (
    <div className="mx-auto max-w-6xl">
      {/* Document header */}
      <div className="animate-fade-up flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/30">
            <FileText className="size-6" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">{doc.title}</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              {doc.fileType} · {doc.pages} pages · {(doc.sizeBytes / 1_000_000).toFixed(1)} MB · {doc.language} ·{" "}
              <span className="inline-flex items-center gap-1 text-emerald-500">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Ready
              </span>
            </p>
          </div>
        </div>

        <div className="relative">
          <button onClick={() => setExportOpen((o) => !o)} className="btn-primary h-10 px-5 text-sm">
            <Download className="size-4" /> {t.export}
            <ChevronDown className={`size-3.5 transition-transform ${exportOpen ? "rotate-180" : ""}`} />
          </button>
          {exportOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
              <div className="card absolute end-0 z-20 mt-2 w-48 overflow-hidden p-1.5 shadow-2xl">
                {exportFormats.map((f) => (
                  <button
                    key={f}
                    onClick={() => setExportOpen(false)}
                    className="block w-full rounded-lg px-3.5 py-2 text-start text-sm transition hover:bg-brand-500/10 hover:text-brand-500"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 -mx-4 mt-6 border-b border-(--border-subtle) bg-(--background)/85 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="flex gap-1 overflow-x-auto pb-px">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium transition ${
                activeTab === id ? "text-brand-500" : "text-slate-500 hover:text-(--foreground)"
              }`}
            >
              <Icon className="size-4" /> {label}
              {activeTab === id && (
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-brand-500 to-violet-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-fade-up py-8" key={`${doc.id}-${activeTab}`}>
        {activeTab === "summary" && <Summary doc={doc} />}
        {activeTab === "mindmap" && <MindMap root={doc.mindMap} />}
        {activeTab === "flashcards" && <Flashcards cards={doc.flashcards} />}
        {activeTab === "quiz" && <Quiz questions={doc.quiz} />}
        {activeTab === "chat" && <DocumentChat doc={doc} />}
        {activeTab === "terms" && <KeyTerms terms={doc.terms} />}
        {activeTab === "timeline" && <Timeline doc={doc} />}
        {activeTab === "tables" && <ExtractedTables doc={doc} />}
        {activeTab === "studio" && <AiStudio doc={doc} />}
      </div>
    </div>
  );
}

export default function DocumentWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="skeleton h-14 w-2/3" />
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-96 w-full" />
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
