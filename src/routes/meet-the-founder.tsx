import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Instagram, Facebook, Linkedin, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/meet-the-founder")({
  component: MeetTheFounder,
});

function MeetTheFounder() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Kitufe cha Kurudi Nyuma */}
      <div className="max-w-3xl mx-auto mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Rudi Nyumbani
        </Link>
      </div>

      <div className="max-w-3xl mx-auto bg-card border border-border/60 rounded-3xl p-6 sm:p-10 shadow-soft backdrop-blur-md">
        
        {/* Sehemu ya Picha na Jina */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 border-b border-border/60 pb-8">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-emerald-600 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <img 
              src="https://i.imgur.com/vHqY7bE.jpeg" // Hii ni link ya picha yako yenye background ya ki-pro
              alt="Hassani Mfwangavo" 
              className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full object-cover border-2 border-background shadow-md bg-muted"
              onError={(e) => {
                // Kama Imgur ikizingua, mfumo unaweka avatar safi ya herufi 'HM' yenye background ya kijani ya ki-pro
                e.currentTarget.src = "https://api.dicebear.com/7.x/initials/svg?seed=HM&backgroundColor=0d9488";
              }}
            />
          </div>

          <div className="text-center sm:text-left space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Founder & Lead Developer
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Hassani Mfwangavo
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Mbeya University of Science and Technology (MUST)
            </p>
          </div>
        </div>

        {/* Maono na Hadithi ya Duka */}
        <div className="mt-8 space-y-6 text-foreground/90">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Kuhusu MUST Market</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              MUST Market ilizaliwa kutokana na uhitaji halisi wa wanafunzi kupata vifaa vya masomo, 
              malazi, na vifaa vya kielektroniki kwa urahisi na usalama. Kama mwanafunzi mwenza, 
              niliona umuhimu wa kutengeneza jukwaa ambalo litawaunganisha wanafunzi wote wa MUST 
              kufanya biashara moja kwa moja bila madalali.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Maono Yetu</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Kurahisisha maisha ya chuo kwa kuondoa vikwazo vya kupata mahitaji muhimu, na kuwapa 
              wanafunzi nafasi ya kujitengenezea kipato kupitia biashara zao ndogo ndogo wakiwa campus.
            </p>
          </div>

          {/* Vitufe vya Kuwasiliana na Social Media */}
          <div className="pt-6 border-t border-border/60">
            <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4 text-center sm:text-left">
              Wasiliana Nami Direct
            </h2>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              {/* WhatsApp Kitufe Kikuu */}
              <div className="flex justify-center sm:justify-start">
                <a 
                  href="https://wa.me/255674044676" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-md transform hover:-translate-y-0.5"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat WhatsApp
                </a>
              </div>
              
              {/* Mitandao Yako Halisi 5 Tu ya Kijamii */}
              <div className="flex flex-wrap justify-center gap-2">
                {/* LinkedIn */}
                <a 
                  href="https://www.linkedin.com/in/hassani-mfwangavo-5ab7373a7" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-border bg-muted/10 text-foreground hover:text-blue-600 hover:bg-muted/40 transition-all"
                  title="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>

                {/* Instagram */}
                <a 
                  href="https://www.instagram.com/mrhm_ai?igsh=MW9tbDY1azZ0bzQ4dQ==" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-border bg-muted/10 text-foreground hover:text-pink-600 hover:bg-muted/40 transition-all"
                  title="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>

                {/* Facebook */}
                <a 
                  href="https://www.facebook.com/share/196sZmikW4/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-border bg-muted/10 text-foreground hover:text-blue-500 hover:bg-muted/40 transition-all"
                  title="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>

                {/* TikTok */}
                <a 
                  href="https://www.tiktok.com/@mrhm_ai2?_r=1&_t=ZS-97s9tFIxrIf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-border bg-muted/10 text-foreground hover:text-cyan-500 hover:bg-muted/40 transition-all font-bold text-xs flex items-center justify-center h-9 w-9"
                  title="TikTok"
                >
                  TT
                </a>

                {/* Threads */}
                <a 
                  href="https://www.threads.com/@mrhm_ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-border bg-muted/10 text-foreground hover:text-foreground hover:bg-muted/40 transition-all font-bold text-xs flex items-center justify-center h-9 w-9"
                  title="Threads"
                >
                  Th
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
