import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Dictionary, type Language } from "@/utils/translations";

const STORAGE_KEY = "must-market-language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored === "en" || stored === "sw") setLanguageState(stored);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next: Language = prev === "en" ? "sw" : "en";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, toggleLanguage, t: translations[language] }),
    [language, setLanguage, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: "en" as Language,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: translations.en,
    } satisfies LanguageContextValue;
  }
  return ctx;
}
