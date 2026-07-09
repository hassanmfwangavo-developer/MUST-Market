import { Link } from "@tanstack/react-router";
import { MessageSquare, Shield, FileText, User } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#042f2e] text-white border-t border-teal-500/10 py-8 px-4 mt-auto">
      <div className="max-w-md mx-auto flex flex-col items-center space-y-4 text-center">
        
        {/* Jina la Brand kwa Juu */}
        <div className="text-xs font-bold tracking-widest text-teal-400 uppercase mb-1">
          MUST Market
        </div>

        {/* Viungo (Links) kwa mpangilio rasmi ulioueleza */}
        <div className="flex flex-col space-y-2.5 w-full text-sm font-medium">
          
          {/* 1. Meet the Founder */}
          <Link 
            to="/meet-the-founder" 
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-950/30 border border-teal-500/5 hover:border-teal-400/20 hover:text-teal-300 transition-colors"
          >
            <User className="h-4 w-4 text-teal-400" />
            Meet the Founder
          </Link>

          {/* 2. Privacy Policy */}
          <Link 
            to="/privacy" 
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-950/30 border border-teal-500/5 hover:border-teal-400/20 hover:text-teal-300 transition-colors"
          >
            <Shield className="h-4 w-4 text-teal-400" />
            Privacy Policy
          </Link>

          {/* 3. Terms of Service */}
          <Link 
            to="/terms" 
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-950/30 border border-teal-500/5 hover:border-teal-400/20 hover:text-teal-300 transition-colors"
          >
            <FileText className="h-4 w-4 text-teal-400" />
            Terms & Conditions
          </Link>

          {/* 4. Feedback and Suggestions (Inapeleka WhatsApp yako moja kwa moja kwa urahisi) */}
          <a 
            href="https://wa.me/255674044676?text=Habari%20Hassani,%20nina%20maoni/ushauri%20kuhusu%20MUST%20Market"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-950/30 border border-teal-500/5 hover:border-teal-400/20 hover:text-teal-300 transition-colors"
          >
            <MessageSquare className="h-4 w-4 text-teal-400" />
            Feedback and Suggestions
          </a>
          
        </div>

        {/* Haki Miliki (Copyright) ya chini kabisa */}
        <div className="text-[11px] text-teal-200/40 pt-4 tracking-wide">
          &copy; {new Date().getFullYear()} MUST Market. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
