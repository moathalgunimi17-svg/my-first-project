"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, Download } from "lucide-react";
import type { Flashcard } from "@/lib/types";

const difficultyStyles: Record<Flashcard["difficulty"], string> = {
  easy: "bg-emerald-500/12 text-emerald-500",
  medium: "bg-amber-500/12 text-amber-500",
  hard: "bg-rose-500/12 text-rose-500",
};

export function Flashcards({ cards }: { cards: Flashcard[] }) {
  const [filter, setFilter] = useState<"all" | Flashcard["difficulty"]>("all");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(1);

  const filtered = useMemo(
    () => (filter === "all" ? cards : cards.filter((c) => c.difficulty === filter)),
    [cards, filter]
  );
  const card = filtered[Math.min(index, filtered.length - 1)];

  const go = (dir: 1 | -1) => {
    setDirection(dir);
    setFlipped(false);
    setIndex((i) => (i + dir + filtered.length) % filtered.length);
  };

  const exportCards = () => {
    const csv = ["front,back,difficulty", ...cards.map((c) => `"${c.front.replaceAll('"', '""')}","${c.back.replaceAll('"', '""')}",${c.difficulty}`)].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "flashcards.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!card) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {(["all", "easy", "medium", "hard"] as const).map((d) => (
            <button
              key={d}
              onClick={() => { setFilter(d); setIndex(0); setFlipped(false); }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition ${
                filter === d
                  ? "bg-brand-500/15 text-brand-500 ring-1 ring-brand-500/40"
                  : "text-slate-500 hover:bg-slate-500/10"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <button onClick={exportCards} className="btn-ghost h-8 px-3 text-xs">
          <Download className="size-3.5" /> Export CSV
        </button>
      </div>

      <div className="perspective-1200 relative h-80">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={card.id}
            custom={direction}
            initial={{ opacity: 0, x: 60 * direction, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -60 * direction, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <button
              onClick={() => setFlipped((f) => !f)}
              className="preserve-3d relative h-full w-full text-start transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
            >
              {/* Front */}
              <div className="backface-hidden card absolute inset-0 flex flex-col p-8 shadow-xl shadow-brand-600/10">
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${difficultyStyles[card.difficulty]}`}>
                    {card.difficulty}
                  </span>
                  <span className="text-xs text-slate-400">Question</span>
                </div>
                <p className="flex flex-1 items-center justify-center text-balance px-4 text-center text-xl font-semibold leading-snug">
                  {card.front}
                </p>
                <p className="text-center text-xs text-slate-400">Click to reveal answer</p>
              </div>
              {/* Back */}
              <div className="backface-hidden rotate-y-180 card absolute inset-0 flex flex-col border-brand-500/40 bg-gradient-to-br from-brand-600/10 to-violet-600/10 p-8">
                <span className="text-xs font-medium text-brand-500">Answer</span>
                <p className="flex flex-1 items-center justify-center px-2 text-center text-base leading-relaxed">
                  {card.back}
                </p>
                <p className="text-center text-xs text-slate-400">Click to flip back</p>
              </div>
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button onClick={() => go(-1)} className="btn-ghost size-11 !p-0" aria-label="Previous card">
          <ChevronLeft className="flip-x size-5" />
        </button>
        <span className="min-w-20 text-center text-sm font-medium text-slate-500">
          {index + 1} / {filtered.length}
        </span>
        <button onClick={() => go(1)} className="btn-ghost size-11 !p-0" aria-label="Next card">
          <ChevronRight className="flip-x size-5" />
        </button>
        <button onClick={() => { setIndex(0); setFlipped(false); }} className="btn-ghost size-11 !p-0" aria-label="Restart">
          <RotateCcw className="size-4.5" />
        </button>
      </div>
    </div>
  );
}
