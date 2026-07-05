"use client";

import { useState } from "react";
import { User, Globe, CreditCard, Shield, KeyRound, Bell, Copy, Check } from "lucide-react";
import { useApp } from "@/components/providers";
import { locales } from "@/lib/i18n";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "language", label: "Language", icon: Globe },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
  { id: "api", label: "API keys", icon: KeyRound },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;

type SectionId = (typeof sections)[number]["id"];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`h-6 w-11 rounded-full p-0.5 transition-colors ${on ? "bg-brand-500" : "bg-slate-400/40"}`}
    >
      <span className={`block size-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5 rtl:-translate-x-5" : ""}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { locale, setLocale } = useApp();
  const [section, setSection] = useState<SectionId>("profile");
  const [copied, setCopied] = useState(false);
  const [notifs, setNotifs] = useState({ processing: true, weekly: true, marketing: false });
  const [twoFa, setTwoFa] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText("mf_live_sk_9f2e…redacted").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row">
      <nav className="flex shrink-0 gap-1 overflow-x-auto lg:w-52 lg:flex-col">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              section === id ? "bg-brand-500/12 text-brand-500" : "text-slate-500 hover:bg-slate-500/8"
            }`}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </nav>

      <div className="min-w-0 flex-1 space-y-5">
        {section === "profile" && (
          <div className="card p-6">
            <h2 className="font-semibold">Profile</h2>
            <div className="mt-5 flex items-center gap-4">
              <span className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-xl font-bold text-white">M</span>
              <button className="btn-ghost h-9 px-4 text-xs">Change avatar</button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[["Full name", "MindFlow User"], ["Email", "you@example.com"]].map(([label, value]) => (
                <label key={label} className="block text-xs font-medium text-slate-500">
                  {label}
                  <input defaultValue={value} className="mt-1.5 h-11 w-full rounded-xl border border-(--border-subtle) bg-(--surface) px-4 text-sm text-(--foreground) outline-none focus:border-brand-500/60" />
                </label>
              ))}
            </div>
            <button className="btn-primary mt-5 h-10 px-5 text-sm">Save changes</button>
          </div>
        )}

        {section === "language" && (
          <div className="card p-6">
            <h2 className="font-semibold">Interface language</h2>
            <p className="mt-1 text-sm text-slate-500">Also sets the default output language for summaries and chat.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {locales.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLocale(l.code)}
                  className={`rounded-xl border px-4 py-3.5 text-start text-sm font-medium transition ${
                    locale === l.code ? "border-brand-500/60 bg-brand-500/10 text-brand-500" : "border-(--border-subtle) hover:border-brand-500/40"
                  }`}
                >
                  {l.label}
                  <span className="mt-0.5 block text-[11px] font-normal text-slate-500">{l.dir === "rtl" ? "Right-to-left" : "Left-to-right"}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {section === "billing" && (
          <div className="card p-6">
            <h2 className="font-semibold">Subscription</h2>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-brand-600/12 to-violet-600/12 p-5">
              <div>
                <p className="font-semibold">Pro plan</p>
                <p className="text-xs text-slate-500">$16/month · renews Aug 4, 2026</p>
              </div>
              <button className="btn-ghost h-9 px-4 text-xs">Manage</button>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              <p>Payment method: Visa •••• 4242</p>
              <p className="mt-1">AI credits reset monthly · 1,840 of 2,500 remaining</p>
            </div>
          </div>
        )}

        {section === "security" && (
          <div className="card space-y-5 p-6">
            <h2 className="font-semibold">Security</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Two-factor authentication</p>
                <p className="text-xs text-slate-500">Protect your account with an authenticator app.</p>
              </div>
              <Toggle on={twoFa} onChange={setTwoFa} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Change password</p>
                <p className="text-xs text-slate-500">Last changed 3 months ago.</p>
              </div>
              <button className="btn-ghost h-9 px-4 text-xs">Update</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Active sessions</p>
                <p className="text-xs text-slate-500">2 devices signed in.</p>
              </div>
              <button className="btn-ghost h-9 px-4 text-xs text-rose-500">Sign out all</button>
            </div>
          </div>
        )}

        {section === "api" && (
          <div className="card p-6">
            <h2 className="font-semibold">API keys</h2>
            <p className="mt-1 text-sm text-slate-500">Integrate MindFlow&apos;s document intelligence into your own apps.</p>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface) p-3.5 font-mono text-xs">
              <span className="flex-1 truncate">mf_live_sk_9f2e••••••••••••••••</span>
              <button onClick={copyKey} className="btn-ghost h-8 px-3 text-xs">
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <button className="btn-primary mt-4 h-10 px-5 text-sm">Generate new key</button>
          </div>
        )}

        {section === "notifications" && (
          <div className="card space-y-5 p-6">
            <h2 className="font-semibold">Notifications</h2>
            {(
              [
                ["processing", "Processing complete", "Email me when a large document finishes processing."],
                ["weekly", "Weekly study digest", "Progress summary and streak reminders."],
                ["marketing", "Product updates", "New features and tips."],
              ] as const
            ).map(([key, title, desc]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <Toggle on={notifs[key]} onChange={(v) => setNotifs((n) => ({ ...n, [key]: v }))} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
