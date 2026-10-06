import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallAppButton() {
  const { language } = useLanguage();
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(true);
  const [tip, setTip] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    const ua = navigator.userAgent;
    setIsIOS(/iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1));
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!tip) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setTip(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [tip]);

  if (installed || (!deferred && !isIOS)) return null;

  const onClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferred(null);
    } else {
      setTip((v) => !v);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onClick}
        aria-label={language === "sw" ? "Pakua App" : "Install App"}
        className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary-soft px-2.5 py-1.5 text-[11px] font-bold text-primary shadow-soft transition-transform hover:-translate-y-0.5 sm:text-xs"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden min-[380px]:inline">{language === "sw" ? "Pakua App" : "Install App"}</span>
      </button>
      {tip && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-popover p-3 text-sm text-popover-foreground shadow-lg">
          <button
            type="button"
            onClick={() => setTip(false)}
            aria-label="Close"
            className="absolute right-2 top-2 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="pr-5">
            Gusa sehemu ya Share ⎕↑ kisha chagua 'Add to Home Screen'.
          </p>
        </div>
      )}
    </div>
  );
}
