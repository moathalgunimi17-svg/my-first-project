"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";

const difficultyStyles = {
  easy: "bg-emerald-500/12 text-emerald-500",
  medium: "bg-amber-500/12 text-amber-500",
  hard: "bg-rose-500/12 text-rose-500",
} as const;

export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [fillDrafts, setFillDrafts] = useState<Record<string, string>>({});

  const score = useMemo(() => {
    let correct = 0;
    for (const q of questions) {
      if (!revealed.has(q.id)) continue;
      const a = answers[q.id];
      if (q.type === "fill_blank") {
        if (typeof a === "string" && a.trim().toLowerCase() === q.answerText?.toLowerCase()) correct++;
      } else if (a === q.answerIndex) correct++;
    }
    return { correct, total: revealed.size };
  }, [answers, revealed, questions]);

  const allDone = revealed.size === questions.length;

  const reveal = (q: QuizQuestion, answer: number | string) => {
    if (revealed.has(q.id)) return;
    setAnswers((prev) => ({ ...prev, [q.id]: answer }));
    setRevealed((prev) => new Set(prev).add(q.id));
  };

  const reset = () => {
    setAnswers({});
    setRevealed(new Set());
    setFillDrafts({});
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="card flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-amber-500/12 text-amber-500">
            <Trophy className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">
              Score: {score.correct} / {score.total || questions.length}
            </p>
            <p className="text-xs text-slate-500">
              {allDone ? "Quiz complete — nice work!" : `${questions.length - revealed.size} questions remaining`}
            </p>
          </div>
        </div>
        <button onClick={reset} className="btn-ghost h-9 px-4 text-xs">
          <RotateCcw className="size-3.5" /> Retake
        </button>
      </div>

      {questions.map((q, qi) => {
        const done = revealed.has(q.id);
        const userAnswer = answers[q.id];
        const isCorrect =
          q.type === "fill_blank"
            ? typeof userAnswer === "string" && userAnswer.trim().toLowerCase() === q.answerText?.toLowerCase()
            : userAnswer === q.answerIndex;

        return (
          <div key={q.id} className="card p-6">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold">
              <span className="text-slate-400">Q{qi + 1}</span>
              <span className={`rounded-full px-2.5 py-0.5 capitalize ${difficultyStyles[q.difficulty]}`}>{q.difficulty}</span>
              <span className="rounded-full bg-slate-500/10 px-2.5 py-0.5 uppercase tracking-wide text-slate-500">
                {q.type === "mcq" ? "Multiple choice" : q.type === "true_false" ? "True / False" : "Fill the blank"}
              </span>
            </div>
            <p className="font-medium leading-relaxed">{q.question}</p>

            {q.type === "fill_blank" ? (
              <div className="mt-4 flex gap-2">
                <input
                  value={fillDrafts[q.id] ?? ""}
                  disabled={done}
                  onChange={(e) => setFillDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && (fillDrafts[q.id] ?? "").trim() && reveal(q, fillDrafts[q.id])}
                  placeholder="Type your answer…"
                  className="h-11 flex-1 rounded-xl border border-(--border-subtle) bg-(--surface) px-4 text-sm outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
                />
                <button
                  onClick={() => (fillDrafts[q.id] ?? "").trim() && reveal(q, fillDrafts[q.id])}
                  disabled={done}
                  className="btn-primary h-11 px-5 text-sm disabled:opacity-50"
                >
                  Check
                </button>
              </div>
            ) : (
              <div className="mt-4 grid gap-2">
                {q.options?.map((opt, oi) => {
                  const chosen = userAnswer === oi;
                  const correct = q.answerIndex === oi;
                  return (
                    <button
                      key={opt}
                      onClick={() => reveal(q, oi)}
                      disabled={done}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-start text-sm transition ${
                        done && correct
                          ? "border-emerald-500/60 bg-emerald-500/10"
                          : done && chosen && !correct
                            ? "border-rose-500/60 bg-rose-500/10"
                            : done
                              ? "border-(--border-subtle) opacity-55"
                              : "border-(--border-subtle) hover:border-brand-500/50 hover:bg-brand-500/5"
                      }`}
                    >
                      {opt}
                      {done && correct && <CheckCircle2 className="size-4.5 text-emerald-500" />}
                      {done && chosen && !correct && <XCircle className="size-4.5 text-rose-500" />}
                    </button>
                  );
                })}
              </div>
            )}

            {done && (
              <div className={`mt-4 rounded-xl p-4 text-sm ${isCorrect ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                <p className="font-semibold">
                  {isCorrect ? "Correct!" : q.type === "fill_blank" ? `Not quite — the answer is “${q.answerText}”.` : "Not quite."}
                </p>
                <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
