"use client";

import Link from "next/link";
import { Bookmark, Sparkles, Layers, History } from "lucide-react";

const bookmarks = [
  { title: "Why depth matters — feature composition", kind: "Summary section", icon: Sparkles, doc: "Deep Learning: Foundations", when: "Saved 2 days ago" },
  { title: "Attention replaced recurrence flashcard", kind: "Flashcard", icon: Layers, doc: "Deep Learning: Foundations", when: "Saved 3 days ago" },
  { title: "2012 — AlexNet wins ImageNet", kind: "Timeline event", icon: History, doc: "Deep Learning: Foundations", when: "Saved 1 week ago" },
  { title: "Scaling laws key point", kind: "Key point", icon: Sparkles, doc: "Deep Learning: Foundations", when: "Saved 2 weeks ago" },
];

export default function BookmarksPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight">Bookmarks & favorites</h1>
      <p className="mt-1 text-sm text-slate-500">Everything you starred across your library.</p>

      <div className="mt-8 space-y-3">
        {bookmarks.map(({ title, kind, icon: Icon, doc, when }) => (
          <Link key={title} href="/dashboard/documents/demo-deep-learning" className="card card-hover flex items-center gap-4 p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-500/12 text-amber-500">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{kind} · {doc} · {when}</p>
            </div>
            <Bookmark className="size-4 shrink-0 fill-amber-400 text-amber-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
