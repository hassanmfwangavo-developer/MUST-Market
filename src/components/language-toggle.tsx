import { useLanguage } from "@/context/LanguageContext";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={`Switch language, current ${language === "en" ? "English" : "Swahili"}`}
      className={`group relative inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border bg-surface-2 p-0.5 text-[11px] font-bold shadow-soft transition-transform hover:-translate-y-0.5 sm:text-xs ${className}`}
    >
      <span
        className={`rounded-full px-2 py-1 transition-colors ${
          language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        EN
      </span>
      <span
        className={`rounded-full px-2 py-1 transition-colors ${
          language === "sw" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        SW
      </span>
    </button>
  );
}
