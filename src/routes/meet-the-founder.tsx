import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { canonical } from "@/lib/site";

export const Route = createFileRoute("/meet-the-founder")({
  head: () => ({
    meta: [
      { title: "Meet Hassani Mfwangavo, Founder of MUST Market" },
      {
        name: "description",
        content:
          "The story behind MUST Market, the student-built marketplace and campus food service for Mbeya University of Science and Technology.",
      },
      { property: "og:title", content: "Meet Hassani Mfwangavo, Founder of MUST Market" },
      {
        property: "og:description",
        content: "Why a MUST student built a marketplace for campus.",
      },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: canonical("/meet-the-founder") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical("/meet-the-founder") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Hassani Mfwangavo",
          jobTitle: "Founder",
          url: canonical("/meet-the-founder"),
          worksFor: {
            "@type": "Organization",
            name: "MUST Market",
            url: canonical("/"),
          },
          affiliation: {
            "@type": "CollegeOrUniversity",
            name: "Mbeya University of Science and Technology",
          },
        }),
      },
    ],
  }),
  component: MeetTheFounder,
});


function MeetTheFounder() {
  const [showCoffeeThanks, setShowCoffeeThanks] = useState(false);

  useEffect(() => {
    if (showCoffeeThanks) {
      const timer = setTimeout(() => setShowCoffeeThanks(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showCoffeeThanks]);

  return (
    <div className="min-h-screen bg-[#042f2e] text-white font-sans antialiased relative pb-12">
      {/* Sehemu ya Picha Kubwa ya Juu (Kama ya Benji kwenye 1000160359_2.png) */}
      <div className="relative w-full h-[480px] md:h-[550px] overflow-hidden">
        <img
          src="https://i.ibb.co/YF6Bm1t8/IMG-20251111-WA0067-1.jpg"
          alt="Hassani Mfwangavo"
          className="w-full h-full object-cover object-center"
        />

        {/* Gradient Overlay inayofanya picha ififie kuingia kwenye background ya kijani ya mradi wako */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#042f2e] via-[#042f2e]/60 to-transparent"></div>

        {/* Kitufe cha Kurudi Nyuma kilichopo juu ya picha */}
        <div className="absolute top-6 left-4 z-20">
          <Link
            to="/market"
            className="inline-flex items-center gap-2 text-xs text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Rudi Nyumbani
          </Link>
        </div>

        {/* Jina na Cheo juu ya Picha (Chini kabisa ya Picha kabla haijaisha) */}
        <div className="absolute bottom-0 inset-x-0 text-center px-4 pb-4 flex flex-col items-center space-y-2">
          <div className="flex items-center gap-1.5 justify-center">
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
              Hassani Mfwangavo
            </h1>
            {/* Nembo ya Verified ya Bluu kama ya Benji */}
            <svg className="h-5 w-5 text-blue-500 fill-current drop-shadow-md" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <p className="text-sm text-teal-300 font-medium tracking-wide drop-shadow-sm">
            Founder & Lead Developer of MUST Market
          </p>
          <p className="text-xs text-white/70 max-w-xs drop-shadow-sm">
            Mbeya University of Science and Technology (MUST)
          </p>
        </div>
      </div>

      {/* Pop-up ya Uhuishaji wa Kahawa (Smiling Animation) */}
      {showCoffeeThanks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm bg-black/50 animate-fade-in">
          <div className="bg-[#0b4744] border border-teal-400/30 p-8 rounded-3xl text-center max-w-xs w-full shadow-2xl transform animate-scale-up">
            <div className="text-6xl mb-4 animate-bounce">😊</div>
            <h3 className="text-xl font-bold text-white mb-2">Thanks for Coffee!</h3>
            <p className="text-teal-100/80 text-sm leading-relaxed">
              Ukarimu wako unasaidia kuongeza nguvu ya kuandika kodi na kuboresha MUST Market kila
              siku! 🚀☕
            </p>
          </div>
        </div>
      )}

      {/* Sehemu ya Content inayofuata chini ya picha kubwa */}
      <div className="max-w-md mx-auto px-4 mt-6 flex flex-col items-center space-y-6">
        {/* LOGO HALISI ZA SOCIAL MEDIA (Zote ni icons rasmi nyeupe bila background kama za Benji) */}
        <div className="flex items-center justify-center gap-5 py-2 w-full">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/mrhm_ai?igsh=MW9tbDY1azZ0bzQ4dQ=="
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white hover:scale-110 transition-all"
          >
            <svg className="h-6 w-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@mrhm_ai2?_r=1&_t=ZS-97s9tFIxrIf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white hover:scale-110 transition-all"
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.15 1.13 1.14 2.69 1.76 4.27 1.84v3.83a8.1 8.1 0 0 1-4.71-1.75v7.45a7.35 7.35 0 0 1-2.22 5.25A7.43 7.43 0 0 1 10.15 23a7.43 7.43 0 0 1-5.27-2.17 7.35 7.35 0 0 1-2.17-5.26 7.35 7.35 0 0 1 2.17-5.26A7.43 7.43 0 0 1 10.15 8.1c.04 0 .08.01.12.01v3.9a3.52 3.52 0 0 0-2.48 1.05 3.42 3.42 0 0 0-.99 2.47c0 .93.37 1.83 1.01 2.47a3.55 3.55 0 0 0 4.96 0c.64-.64 1.01-1.54 1.01-2.47V0h-1.26z"></path>
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/hassani-mfwangavo-5ab7373a7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white hover:scale-110 transition-all"
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/share/196sZmikW4/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white hover:scale-110 transition-all"
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
            </svg>
          </a>

          {/* Threads */}
          <a
            href="https://www.threads.com/@mrhm_ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white hover:scale-110 transition-all"
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path d="M12.186 14.64c-1.804 0-2.923-1.002-2.923-2.616 0-1.633 1.13-2.646 2.953-2.646 1.775 0 2.87 1.002 2.899 2.616 0 1.634-1.122 2.646-2.929 2.646zm.059-7.228c-3.155 0-5.11 1.83-5.11 4.673 0 2.887 2.022 4.615 5.14 4.615 1.583 0 2.973-.448 3.753-1.162l.067-.066.027.088c.189.62.664 1.066 1.306 1.066.242 0 .47-.054.67-.16l.128-.066v-1.424l-.1.05a1.861 1.861 0 0 1-.84.205c-.44 0-.696-.24-.813-.76l-.117-.503.418-.216c1.238-.636 2.059-1.922 2.059-3.412 0-2.88-2.125-4.948-6.522-4.948zm5.021 5.029c0 .99-.512 1.845-1.348 2.276l-.374.19.11.396c.264.953.513 1.933.286 2.929-.256 1.055-1.12 1.815-2.203 1.934-2.457.257-4.665-.894-5.632-2.922a7.319 7.319 0 0 1-.77-3.238c0-2.27 1.488-3.71 3.918-3.71 2.373 0 3.86 1.425 3.912 3.657l.006.183.183.007c.506.015.865.345.865.83v-.132z"></path>
            </svg>
          </a>
        </div>

        {/* Kadi Kuu ya Maelezo Halisi ya MUST Market (Inalingana kabisa na duka lako) */}
        <div className="w-full bg-[#0b4744]/90 border border-teal-500/20 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-teal-300 tracking-wide">Kuhusu MUST Market 💙</h2>
            <p className="text-sm text-teal-50/90 leading-relaxed font-normal">
              MUST Market ilizaliwa kutokana na uhitaji halisi wa wanafunzi kupata vifaa vya masomo,
              
              
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <h2 className="text-lg font-bold text-teal-300 tracking-wide">Maono Yetu</h2>
            <p className="text-sm text-teal-50/90 leading-relaxed font-normal">
              Kurahisisha maisha ya chuo kwa kuondoa vikwazo vya kupata mahitaji muhimu, na kuwapa
              wanafunzi nafasi ya kujitengenezea kipato kupitia biashara zao ndogo ndogo wakiwa
              campus.
            </p>
          </div>

          <div className="pt-2">
            <a
              href="https://wa.me/255674044676"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center bg-white text-[#042f2e] font-bold text-sm py-3.5 rounded-2xl hover:bg-teal-50 transition-colors shadow-lg"
            >
              Wasiliana Nami Direct WhatsApp 👇
            </a>
          </div>
        </div>

        {/* Kitufe cha Buy Me A Coffee chenye Interactive Smiling Animation */}
        <a
          href="https://snippe.me/p/5sPlR2bcsm"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#0b4744]/50 border border-teal-500/30 hover:border-teal-400 py-3.5 rounded-full text-xs font-semibold text-teal-200 hover:text-white transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2"
        >
          Buy me a coffee ☕
        </a>
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
