"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, BookOpenCheck } from "lucide-react";
import { useApp } from "@/components/providers";
import type { ChatMessage, StudyDocument } from "@/lib/types";

const suggestions = [
  "Explain chapter 4 for a beginner",
  "What is the book's conclusion?",
  "Compare CNNs and transformers",
  "Find all definitions of attention",
  "Translate the key points to Arabic",
];

export function DocumentChat({ doc }: { doc: StudyDocument }) {
  const { t } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    setBusy(true);

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: question };
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: doc.id,
          messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m))
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Something went wrong reaching the AI service. Please try again." }
            : m
        )
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card mx-auto flex h-[600px] max-w-3xl flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-(--border-subtle) px-5 py-3.5">
        <span className="grid size-8 place-items-center rounded-lg bg-brand-500/12 text-brand-500">
          <BookOpenCheck className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">Chat with “{doc.title}”</p>
          <p className="text-[11px] text-slate-500">Answers are grounded in this document only</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/25">
              <Sparkles className="size-6" />
            </span>
            <p className="mt-4 font-semibold">Ask anything about this document</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Summaries, explanations, comparisons, translations — every answer cites the source pages.
            </p>
            <div className="mt-5 flex max-w-md flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-(--border-subtle) px-3.5 py-1.5 text-xs text-slate-600 transition hover:border-brand-500/50 hover:text-brand-500 dark:text-slate-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/25"
                  : "border border-(--border-subtle) bg-(--surface)"
              }`}
            >
              {m.content || (
                <span className="flex gap-1 py-1">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex items-center gap-2 border-t border-(--border-subtle) p-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.ask_placeholder}
          disabled={busy}
          className="h-11 flex-1 rounded-full border border-(--border-subtle) bg-(--surface) px-5 text-sm outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="btn-primary size-11 !p-0 disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="flip-x size-4.5" />
        </button>
      </form>
    </div>
  );
}
