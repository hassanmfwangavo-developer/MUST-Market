import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-white text-gray-900 border-t border-gray-100 py-10 px-6 mt-auto">
      <div className="max-w-md mx-auto flex flex-col space-y-8 text-left">
        
        {/* Sehemu ya SAFETY */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold tracking-widest text-gray-900 uppercase">
            SAFETY
          </h3>
          <div className="flex flex-col space-y-2.5 text-sm text-gray-500 font-normal">
            <Link to="/buyer-tips" className="hover:text-gray-900 transition-colors">
              Buyer tips
            </Link>
            <Link to="/seller-tips" className="hover:text-gray-900 transition-colors">
              Seller tips
            </Link>
            <Link to="/report-listing" className="hover:text-gray-900 transition-colors">
              Report a listing
            </Link>
            <Link to="/community-rules" className="hover:text-gray-900 transition-colors">
              Community rules
            </Link>
          </div>
        </div>

        {/* Sehemu ya ABOUT */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold tracking-widest text-gray-900 uppercase">
            ABOUT
          </h3>
          <div className="flex flex-col space-y-2.5 text-sm text-gray-500 font-normal">
            <Link to="/meet-the-founder" className="hover:text-gray-900 transition-colors">
              Meet the founder
            </Link>
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-gray-900 transition-colors">
              Terms
            </Link>
            <Link to="/feedback" className="hover:text-gray-900 transition-colors">
              Feedback & Suggestions
            </Link>
          </div>
        </div>

        {/* Sehemu ya Chini Kabisa: Copyright na Instagram pekee */}
        <div className="border-t border-gray-100 pt-6 flex flex-col items-center justify-center space-y-3 text-center">
          <p className="text-xs text-gray-500">
            &copy; 2026 MUST Market. Built by students, for students.
          </p>
          
          <div className="flex items-center justify-center text-gray-500">
            {/* Instagram Icon Pekee */}
            <a 
              href="https://www.instagram.com/mrhm_ai?igsh=MW9tbDY1azZ0bzQ4dQ==" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-gray-900 transition-colors"
            >
              <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
