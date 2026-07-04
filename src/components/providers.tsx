"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { dictionaries, locales, type Dictionary, type Locale } from "@/lib/i18n";

type Theme = "light" | "dark";

interface AppContextValue {
  theme: Theme;
  toggleTheme: () => void;
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dictionary;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProviders({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    // One-time hydration from localStorage: SSR must render the defaults, so
    // the stored preference can only be applied after mount.
    const storedTheme = localStorage.getItem("mindflow-theme") as Theme | null;
    const storedLocale = localStorage.getItem("mindflow-locale") as Locale | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (storedTheme) setTheme(storedTheme);
    if (storedLocale) setLocaleState(storedLocale);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("mindflow-theme", theme);
  }, [theme]);

  useEffect(() => {
    const meta = locales.find((l) => l.code === locale)!;
    document.documentElement.lang = locale;
    document.documentElement.dir = meta.dir;
    localStorage.setItem("mindflow-locale", locale);
  }, [locale]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );
  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  return (
    <AppContext.Provider
      value={{ theme, toggleTheme, locale, setLocale, t: dictionaries[locale] }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProviders");
  return ctx;
}
