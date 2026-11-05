import { useState } from "react";
import { Download, Share } from "lucide-react";
import { toast } from "sonner";
import { takeInstallPrompt } from "@/lib/install-prompt";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function InstallAppButton() {
  const { language } = useLanguage();
  const [tip, setTip] = useState<"ios" | "browser" | null>(null);

  const onClick = async () => {
    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const inApp = /Instagram|FBAN|FBAV|WhatsApp|; wv\)/i.test(ua);
    const installed = window.mustMarketInstall?.installed ||
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone;
    if (installed) {
      toast.info(language === "sw" ? "MUST Market tayari imesakinishwa." : "MUST Market is already installed.");
      return;
    }
    const deferred = takeInstallPrompt();
    if (deferred) {
      try {
        // Call synchronously within the click gesture; never trigger on page load.
        await deferred.prompt();
        await deferred.userChoice;
      } catch {
        toast.info(language === "sw" ? "Chrome haijaweza kufungua usakinishaji. Tafadhali jaribu tena baadaye." : "Chrome could not open installation. Please try again later.");
      }
    } else if (isIOS || inApp) {
      setTip(isIOS ? "ios" : "browser");
    } else {
      toast.info(language === "sw"
        ? "Usakinishaji wa Chrome bado haujapatikana. Fungua tovuti iliyochapishwa katika Google Chrome; app inaweza pia kuwa tayari imesakinishwa."
        : "Chrome installation is not available yet. Open the published site in Google Chrome; the app may also already be installed.");
    }
  };

  return (
    <Dialog open={tip !== null} onOpenChange={(open) => { if (!open) setTip(null); }}>
      <Button
        type="button"
        onClick={onClick}
        aria-label={language === "sw" ? "Pakua App" : "Install App"}
        title={language === "sw" ? "Pakua App" : "Install App"}
        variant="outline"
        className="h-10 w-10 shrink-0 gap-1 rounded-full border-primary/30 bg-primary-soft p-0 text-[11px] font-bold text-primary shadow-soft hover:bg-primary-soft min-[420px]:w-auto min-[420px]:px-2.5 sm:text-xs"
      >
        <Download aria-hidden="true" />
        <span className="hidden min-[420px]:inline min-[1024px]:max-[1279px]:hidden">
          {language === "sw" ? "Pakua App" : "Install App"}
        </span>
      </Button>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
        <DialogHeader>
          <DialogTitle>{language === "sw" ? "Pakua MUST Market" : "Install MUST Market"}</DialogTitle>
          <DialogDescription>{language === "sw" ? "Ongeza MUST Market kwenye skrini yako ya nyumbani." : "Add MUST Market to your home screen."}</DialogDescription>
        </DialogHeader>
        <section className="space-y-2 text-sm leading-relaxed">
          <h3 className="flex items-center gap-2 font-semibold">
            {tip === "ios" && <Share className="h-4 w-4 text-primary" />}
            {tip === "ios" ? "iPhone / Safari" : "Google Chrome"}
          </h3>
          <p className="text-muted-foreground">{tip === "ios"
            ? language === "sw" ? "Fungua kwenye Safari, gusa Share (⎕↑) kisha chagua 'Add to Home Screen'." : "Open in Safari, tap Share (⎕↑), then choose 'Add to Home Screen'."
            : language === "sw" ? "Fungua tovuti hii kwenye Google Chrome, kisha bonyeza Pakua App." : "Open this site in Google Chrome, then tap Install App."}</p>
        </section>
      </DialogContent>
    </Dialog>
  );
}
