import { useEffect, useState } from "react";
import { Download, MoreVertical, Share } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallAppButton() {
  const { language } = useLanguage();
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [tip, setTip] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1));
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const onClick = async () => {
    if (deferred) {
      try {
        await deferred.prompt();
        await deferred.userChoice;
      } catch {
        setTip(true);
      }
      setDeferred(null);
    } else {
      setTip(true);
    }
  };

  return (
    <Dialog open={tip} onOpenChange={setTip}>
      <DialogTrigger asChild onClick={(event) => event.preventDefault()}>
      <Button
        type="button"
        onClick={onClick}
        aria-label={language === "sw" ? "Pakua App" : "Install App"}
        title={language === "sw" ? "Pakua App" : "Install App"}
        variant="outline"
        className="h-10 w-10 shrink-0 gap-1 rounded-full border-primary/30 bg-primary-soft p-0 text-[11px] font-bold text-primary shadow-soft hover:bg-primary-soft min-[420px]:w-auto min-[420px]:px-2.5 sm:text-xs"
      >
        <Download aria-hidden="true" />
        <span className="hidden min-[420px]:inline">{language === "sw" ? "Pakua App" : "Install App"}</span>
      </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
        <DialogHeader>
          <DialogTitle>{language === "sw" ? "Pakua MUST Market" : "Install MUST Market"}</DialogTitle>
          <DialogDescription>{language === "sw" ? "Ongeza MUST Market kwenye skrini yako ya nyumbani." : "Add MUST Market to your home screen."}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm leading-relaxed text-foreground">
          {(isIOS ? ["ios", "android"] : ["android", "ios"]).map((platform) => (
            <section key={platform} className="space-y-1">
              <h3 className="flex items-center gap-2 font-semibold">
                {platform === "ios" ? <Share className="h-4 w-4 text-primary" /> : <MoreVertical className="h-4 w-4 text-primary" />}
                {platform === "ios" ? "iPhone / Safari" : "Android / Chrome"}
              </h3>
              <p className="text-muted-foreground">{platform === "ios"
                ? "Gusa kitufe cha Share (⎕↑) chini kisha chagua 'Add to Home Screen'."
                : "Gusa nukta tatu (⋮) juu kulia kisha chagua 'Sakinisha App' / 'Add to Home screen'."}</p>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
