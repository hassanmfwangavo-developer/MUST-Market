import { useEffect } from "react";

declare global {
  interface Window {
    google?: { translate?: { TranslateElement: new (opts: unknown, el: string) => void } };
    googleTranslateElementInit?: () => void;
  }
}

export function GoogleTranslate() {
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,sw",
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };

    const s = document.createElement("script");
    s.id = "google-translate-script";
    s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <div className="fixed right-3 top-3 z-40 rounded-full border border-border bg-surface/90 px-2 py-1 shadow-soft backdrop-blur-md">
      <div id="google_translate_element" className="gtranslate-widget" />
    </div>
  );
}
