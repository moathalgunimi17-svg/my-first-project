"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  BrainCircuit,
  UploadCloud,
  Sparkles,
  Network,
  Layers,
  MessageSquareText,
  Mic,
  Clapperboard,
  GraduationCap,
  FlaskConical,
  Quote,
  ChevronDown,
  FileText,
  Languages,
  Timer,
  Check,
} from "lucide-react";
import { useApp } from "@/components/providers";
import { LanguageToggle, ThemeToggle } from "@/components/top-controls";

const features = [
  { icon: Sparkles, title: "9 summary styles", desc: "Quick, executive, academic, technical, children-friendly and more — every claim linked to its source page." },
  { icon: Network, title: "Interactive mind maps", desc: "Zoom, drag, and collapse an auto-generated knowledge map. Export PNG, SVG, or PDF." },
  { icon: Layers, title: "Flashcards & quizzes", desc: "Spaced-repetition cards and MCQ / true-false / fill-blank quizzes, generated at three difficulty levels." },
  { icon: MessageSquareText, title: "Chat with your files", desc: "Ask about chapter 4, compare sections, translate a paragraph — answers come only from your document." },
  { icon: Mic, title: "AI podcast & video", desc: "Turn any summary into a natural-voice podcast or a short explainer video." },
  { icon: Languages, title: "Every language", desc: "Auto-detects the input language and outputs in any language you choose — German in, Arabic out." },
  { icon: Timer, title: "Built for huge files", desc: "2 GB uploads, thousands of pages, resumable transfers and streamed background processing." },
  { icon: GraduationCap, title: "Study & Teacher modes", desc: "Auto study plans sized to your deadline; slide decks, homework, and question banks for teachers." },
  { icon: FlaskConical, title: "Research mode", desc: "Upload several papers, chat across all of them, and extract points of agreement and conflict." },
];

const plans = [
  {
    name: "Free", price: "$0", period: "forever",
    items: ["5 documents / month", "50 MB per file", "Summaries & flashcards", "AI chat (100 messages)"],
    cta: "Start free", featured: false,
  },
  {
    name: "Pro", price: "$16", period: "per month",
    items: ["Unlimited documents", "2 GB per file · OCR & scans", "Mind maps, podcast & video", "Multi-document chat", "All export formats"],
    cta: "Go Pro", featured: true,
  },
  {
    name: "Team", price: "$49", period: "per month",
    items: ["Everything in Pro", "Shared workspaces", "Teacher & Research modes", "Developer API access", "Priority support"],
    cta: "Start Team trial", featured: false,
  },
];

const faqs = [
  { q: "Which file types are supported?", a: "PDF, DOC/DOCX, TXT, RTF, Markdown, PowerPoint, Excel, CSV, images with text (OCR), scanned PDFs, and ZIP archives containing multiple files — up to 2 GB each." },
  { q: "Does it work in my language?", a: "Yes. MindFlow auto-detects the document language and supports every UTF-8 language. You choose the output language independently — upload in German, study in Arabic." },
  { q: "Will the AI make things up?", a: "The chat and summaries are grounded strictly in your document. Every statement carries a smart citation linking back to the exact page, so you can verify anything in one click." },
  { q: "How are very large files handled?", a: "Uploads are chunked and resumable. Processing streams in the background with a live progress indicator — a 2,000-page book never freezes your browser." },
  { q: "Is my data secure?", a: "Files are encrypted at rest, scanned for malware on upload, and served through signed URLs. You can delete any document permanently at any time." },
];

const testimonials = [
  { name: "Sarah K.", role: "Medical student, Toronto", text: "I fed it a 900-page pathology textbook and had exam-ready flashcards the same evening. The citations mean I never have to wonder if the AI invented something." },
  { name: "Dr. Amin R.", role: "Lecturer, Cairo University", text: "Teacher mode builds my slide decks and question banks straight from the course reader — in Arabic. It gives me back hours every single week." },
  { name: "Jonas M.", role: "PhD researcher, Berlin", text: "Research mode across six papers surfaced a methodological disagreement I had completely missed. That alone shaped my literature review." },
];

export default function LandingPage() {
  const { t } = useApp();
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const goToDemo = useCallback(() => {
    router.push("/dashboard/documents/demo-deep-learning");
  }, [router]);

  return (
    <div className="relative overflow-x-clip">
      {/* Animated background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[860px] -translate-x-1/2 rounded-full bg-brand-600/25 blur-[140px] animate-pulse-soft" />
        <div className="absolute top-[30%] -left-40 h-[420px] w-[420px] rounded-full bg-violet-600/20 blur-[120px] animate-float-slow" />
        <div className="absolute top-[52%] -right-32 h-[380px] w-[380px] rounded-full bg-accent-500/15 blur-[110px] animate-float" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(120,130,180,0.14)_1px,transparent_0)] [background-size:28px_28px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50">
        <div className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/30">
              <BrainCircuit className="size-5" />
            </span>
            MindFlow <span className="gradient-text">AI</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-slate-600 dark:text-slate-300 md:flex">
            <a href="#features" className="transition hover:text-brand-500">{t.nav_features}</a>
            <a href="#pricing" className="transition hover:text-brand-500">{t.nav_pricing}</a>
            <a href="#faq" className="transition hover:text-brand-500">{t.nav_faq}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Link href="/login" className="btn-ghost hidden h-9 px-4 text-sm sm:inline-flex">{t.nav_signin}</Link>
            <Link href="/dashboard" className="btn-primary h-9 px-4 text-sm">{t.nav_getstarted}</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-20 text-center sm:pt-28">
        <span className="animate-fade-up glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-brand-500">
          <Sparkles className="size-3.5" /> {t.hero_badge}
        </span>
        <h1 className="animate-fade-up mt-6 max-w-3xl text-balance text-5xl font-bold leading-[1.06] tracking-tight sm:text-6xl md:text-7xl" style={{ animationDelay: "80ms" }}>
          {t.tagline.split(" ").slice(0, -2).join(" ")}{" "}
          <span className="gradient-text">{t.tagline.split(" ").slice(-2).join(" ")}</span>
        </h1>
        <p className="animate-fade-up mt-6 max-w-2xl text-pretty text-lg text-slate-600 dark:text-slate-300" style={{ animationDelay: "160ms" }}>
          Upload a textbook, paper, report, or scan — in any language — and MindFlow turns it
          into summaries, mind maps, flashcards, quizzes, a podcast, and a chat that answers
          from your pages only.
        </p>

        {/* Interactive upload area */}
        <div
          role="button"
          tabIndex={0}
          onClick={goToDemo}
          onKeyDown={(e) => e.key === "Enter" && goToDemo()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); goToDemo(); }}
          className={`animate-fade-up group mt-12 w-full max-w-2xl cursor-pointer rounded-3xl border-2 border-dashed p-10 transition-all duration-300 ${
            dragOver
              ? "scale-[1.02] border-brand-500 bg-brand-500/10 shadow-2xl shadow-brand-600/25"
              : "border-slate-300/70 bg-white/40 hover:border-brand-400 hover:bg-brand-500/5 dark:border-slate-600/60 dark:bg-slate-900/30"
          }`}
          style={{ animationDelay: "240ms" }}
        >
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-xl shadow-brand-600/35 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
            <UploadCloud className="size-8" />
          </div>
          <p className="mt-5 text-lg font-semibold">{t.drop_title}</p>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{t.drop_sub}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {["PDF", "DOCX", "PPTX", "XLSX", "OCR", "ZIP"].map((f) => (
              <span key={f} className="rounded-full border border-slate-300/60 px-2.5 py-1 dark:border-slate-600/60">{f}</span>
            ))}
          </div>
        </div>

        <div className="animate-fade-up mt-8 flex flex-col items-center gap-3 sm:flex-row" style={{ animationDelay: "320ms" }}>
          <Link href="/dashboard" className="btn-primary h-12 px-7 text-base">
            <UploadCloud className="size-5" /> {t.hero_cta}
          </Link>
          <button onClick={goToDemo} className="btn-ghost h-12 px-7 text-base">
            <FileText className="size-5" /> {t.hero_demo}
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          One upload. <span className="gradient-text">Every study tool.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-slate-600 dark:text-slate-300">
          MindFlow runs a full AI pipeline on every file — OCR, structure detection,
          semantic chunking, embeddings, and a knowledge graph — so each tool is grounded
          in the actual content.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card card-hover p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-500/10 text-brand-500">
                <Icon className="size-5.5" />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo strip */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="card overflow-hidden bg-gradient-to-br from-brand-600 to-violet-700 p-10 text-white sm:p-14">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h3 className="text-2xl font-bold sm:text-3xl">See it on a real 312-page textbook</h3>
              <p className="mt-3 text-white/85">
                The live demo workspace shows summaries with page citations, an interactive
                mind map, flashcards, a quiz, a timeline, extracted tables, and document chat —
                all generated from one PDF.
              </p>
            </div>
            <button onClick={goToDemo} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-white px-7 font-semibold text-brand-700 shadow-xl transition hover:-translate-y-0.5">
              <Clapperboard className="size-5" /> Open live demo
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Loved by people who read a lot</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((tm) => (
            <figure key={tm.name} className="card card-hover flex flex-col p-6">
              <Quote className="size-6 text-brand-500/60" />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                “{tm.text}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-bold text-white">
                  {tm.name[0]}
                </span>
                <div>
                  <p className="text-sm font-semibold">{tm.name}</p>
                  <p className="text-xs text-slate-500">{tm.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Simple pricing</h2>
        <p className="mt-4 text-center text-slate-600 dark:text-slate-300">Start free. Upgrade when your library grows.</p>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`card relative flex flex-col p-7 ${
                p.featured
                  ? "border-brand-500/60 shadow-2xl shadow-brand-600/20 ring-1 ring-brand-500/40"
                  : "card-hover"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600 to-violet-600 px-3 py-1 text-[11px] font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="font-semibold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-tight">{p.price}</span>
                <span className="text-sm text-slate-500">{p.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {p.items.map((it) => (
                  <li key={it} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-500" />
                    <span className="text-slate-600 dark:text-slate-300">{it}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`${p.featured ? "btn-primary" : "btn-ghost"} mt-7 h-11 w-full text-sm`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked</h2>
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-start font-medium"
              >
                {f.q}
                <ChevronDown className={`size-4 shrink-0 text-slate-400 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: openFaq === i ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-(--border-subtle)">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2 font-semibold text-(--foreground)">
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-violet-600 text-white">
              <BrainCircuit className="size-4" />
            </span>
            MindFlow AI
          </div>
          <p>© 2026 MindFlow AI. Understand any document in minutes.</p>
          <div className="flex gap-5">
            <a href="#features" className="transition hover:text-brand-500">Features</a>
            <a href="#pricing" className="transition hover:text-brand-500">Pricing</a>
            <Link href="/dashboard" className="transition hover:text-brand-500">App</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
