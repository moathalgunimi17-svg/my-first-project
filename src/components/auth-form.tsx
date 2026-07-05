"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrainCircuit, Mail, Lock, ArrowRight } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Auth is wired for Supabase Auth in production; the demo signs straight in.
    setTimeout(() => router.push("/dashboard"), 700);
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-brand-600/25 blur-[130px]" />
        <div className="absolute bottom-0 -right-24 h-[320px] w-[320px] rounded-full bg-violet-600/20 blur-[110px]" />
      </div>

      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 font-semibold tracking-tight">
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/30">
            <BrainCircuit className="size-5.5" />
          </span>
          MindFlow <span className="gradient-text">AI</span>
        </Link>

        <div className="card animate-fade-up p-8">
          <h1 className="text-center text-xl font-bold">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-center text-sm text-slate-500">
            {mode === "login" ? "Sign in to your study library" : "Start understanding documents in minutes"}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2.5">
            {["Google", "Apple", "GitHub"].map((label) => (
              <button
                key={label}
                onClick={() => router.push("/dashboard")}
                className="btn-ghost h-11 rounded-xl! text-xs font-semibold"
                aria-label={`Continue with ${label}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-slate-400">
            <span className="h-px flex-1 bg-(--border-subtle)" /> or <span className="h-px flex-1 bg-(--border-subtle)" />
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            <div className="relative">
              <Mail className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="you@university.edu"
                className="h-12 w-full rounded-xl border border-(--border-subtle) bg-(--surface) ps-10.5 pe-4 text-sm outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="relative">
              <Lock className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={8}
                placeholder="Password"
                className="h-12 w-full rounded-xl border border-(--border-subtle) bg-(--surface) ps-10.5 pe-4 text-sm outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary h-12 w-full text-sm disabled:opacity-60">
              {loading ? "Signing in…" : mode === "login" ? "Sign in" : "Create account"}
              {!loading && <ArrowRight className="flip-x size-4" />}
            </button>
          </form>

          {mode === "login" && (
            <p className="mt-4 text-center">
              <button className="text-xs font-medium text-brand-500 hover:underline">Forgot password?</button>
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          {mode === "login" ? (
            <>No account? <Link href="/signup" className="font-medium text-brand-500 hover:underline">Sign up free</Link></>
          ) : (
            <>Already registered? <Link href="/login" className="font-medium text-brand-500 hover:underline">Sign in</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
