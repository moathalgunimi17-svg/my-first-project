"use client";

import { Moon, Sun, Languages } from "lucide-react";
import { useApp } from "./providers";

export function ThemeToggle() {
  const { theme, toggleTheme } = useApp();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="btn-ghost size-9 !p-0"
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function LanguageToggle() {
  const { locale, setLocale } = useApp();
  return (
    <button
      onClick={() => setLocale(locale === "en" ? "ar" : "en")}
      aria-label="Switch language"
      className="btn-ghost h-9 px-3 text-xs"
    >
      <Languages className="size-4" />
      {locale === "en" ? "عربي" : "EN"}
    </button>
  );
}
