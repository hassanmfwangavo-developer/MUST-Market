import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Instagram, Facebook, Linkedin } from "lucide-react";

export const Route = createFileRoute("/meet-the-founder")({
  component: MeetTheFounder,
});

function MeetTheFounder() {
  const [showCoffeeThanks, setShowCoffeeThanks] = useState(false);

  // Kazi ya kufunga ujumbe wa shukrani ya kahawa baada ya sekunde 4
  useEffect(() => {
    if (showCoffeeThanks) {
      const timer = setTimeout(() => setShowCoffeeThanks(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showCoffeeThanks]);

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-foreground">
      
      {/* Kitufe cha Kurudi Nyuma */}
      <div className="max-w-md mx-auto mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors bg-muted/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-border"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Rudi Nyumbani
        </Link>
      </div>

      {/* Pop-up ya Uhuishaji wa Kahawa */}
      {showCoffeeThanks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm bg-black/40 animate-fade-in">
          <div className="bg-card border border-primary/40 p-8 rounded-3xl text-center max-w-xs w-full shadow-2xl transform animate-scale-up">
            <div className="text-6xl mb-4 animate-bounce">😊</div>
            <h3 className="text-xl font-bold text-foreground mb-2">Thanks for Coffee!</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Ukarimu wako unasaidia kuongeza nguvu ya kuandika kodi na kuboresha MUST Market kila siku! 🚀☕
            </p>
          </div>
        </div>
      )}

      {/* Muundo Mkuu wa Link-In-Bio */}
      <div className="max-w-md mx-auto flex flex-col items-center space-y-6">
        
        {/* Sehemu ya Profile na Picha Yako */}
        <div className="text-center flex flex-col items-center space-y-3 pt-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-600 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <img 
              src="https://i.ibb.co/YF6Bm1t8/IMG-20251111-WA0067-1.jpg" 
              alt="Hassani Mfwangavo" 
              className="relative h-28 w-28 rounded-full object-cover border-4 border-background shadow-xl bg-muted"
            />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Hassani Mfwangavo</h1>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Founder & Lead Developer
            </span>
            <p className="text-xs text-muted-foreground pt-1">Mbeya University of Science and Technology (MUST)</p>
          </div>
        </div>

        {/* Grid ya Mitandao yako ya Kijamii */}
        <div className="flex items-center justify-center gap-4 py-2">
          <a href="https://www.linkedin.com/in/hassani-mfwangavo-5ab7373a7" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-primary transition-colors" title="LinkedIn">
            <Linkedin className="h-4 w-4" />
          </a>
          <a href="https://www.instagram.com/mrhm_ai?igsh=MW9tbDY1azZ0bzQ4dQ==" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-primary transition-colors" title="Instagram">
            <Instagram className="h-4 w-4" />
          </a>
          <a href="https://www.facebook.com/share/196sZmikW4/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-primary transition-colors" title="Facebook">
            <Facebook className="h-4 w-4" />
          </a>
          <a href="https://www.tiktok.com/@mrhm_ai2?_r=1&_t=ZS-97s9tFIxrIf" target="_blank" rel="noopener noreferrer" className="text-xs font-black tracking-tighter border border-border bg-card h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" title="TikTok">
            TT
          </a>
          <a href="https://www.threads.com/@mrhm_ai" target="_blank" rel="noopener noreferrer" className="text-xs font-serif italic font-bold border border-border bg-card h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" title="Threads">
            Th
          </a>
        </div>

        {/* Kadi Kuu ya Maelezo ya MUST Market */}
        <div className="w-full bg-card border border-border/80 rounded-3xl p-6 shadow-soft backdrop-blur-md space-y-4">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-foreground tracking-wide">Kuhusu MUST Market 💙</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              MUST Market ilizaliwa kutokana na uhitaji halisi wa wanafunzi kupata vifaa vya masomo, 
              malazi, na vifaa vya kielektroniki kwa urahisi na usalama. Kama mwanafunzi mwenza, 
              niliona umuhimu wa kutengeneza jukwaa ambalo litawaunganisha wanafunzi wote wa MUST 
              kufanya biashara moja kwa moja bila madalali.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <h2 className="text-base font-bold text-foreground tracking-wide">Maono Yetu</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kurahisisha maisha ya chuo kwa kuondoa vikwazo vya kupata mahitaji muhimu, na kuwapa 
              wanafunzi nafasi ya kujitengenezea kipato kupitia biashara zao ndogo ndogo wakiwa campus.
            </p>
          </div>

          <div className="pt-4">
            <a 
              href="https://wa.me/255674044676"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center bg-primary text-primary-foreground font-bold text-sm py-3 rounded-2xl hover:opacity-90 transition-opacity shadow-md"
            >
              Wasiliana Nami WhatsApp 👇
            </a>
          </div>
        </div>

        {/* Kitufe cha Buy Me A Coffee */}
        <button 
          onClick={() => setShowCoffeeThanks(true)}
          className="w-full bg-card border border-border hover:border-primary/50 py-3.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-primary transition-all transform active:scale-95 shadow-sm flex items-center justify-center gap-2"
        >
          Buy me a coffee ☕
        </button>

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scale-up { animation: scaleUp 0.2s ease-out forwards; }
      `}</style>

    </div>
  );
}
