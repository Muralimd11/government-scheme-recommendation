import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { TamilNaduEmblem } from "./Emblem";
import { PhoneInTalk as PhoneIcon } from "@mui/icons-material";

export const Footer: React.FC = () => {
  const { language } = useLanguage();

  return (
    <footer className="w-full bg-[#002244] text-neutral-300 text-sm mt-auto border-t-2 border-[#2E7D32]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Identity */}
          <div className="flex items-center gap-3">
            <TamilNaduEmblem size={38} />
            <div>
              <p className="text-white font-bold text-base leading-tight flex items-center gap-2">
                <span>{language === "ta" ? "உழவர் தோழன்" : "FARMERS FRIEND"}</span>
              </p>
              <p className="text-neutral-400 text-xs">
                {language === "ta"
                  ? "விவசாயிகளுக்கான அரசு நலத்திட்ட வழிகாட்டி"
                  : "AI-Powered Scheme Recommendation Portal for Farmers"}
              </p>
            </div>
          </div>

          {/* Helpline pill */}
          <div className="flex items-center gap-2 bg-[#001830] border border-neutral-700 px-3.5 py-1.5 rounded-full text-xs text-neutral-300">
            <PhoneIcon className="text-green-400" style={{ fontSize: 16 }} />
            <span>Kisan Toll-Free:</span>
            <span className="text-green-400 font-bold">1800-180-1551</span>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-4 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center text-[11px] text-neutral-400 gap-2">
          <p>© 2026 FARMERS FRIEND. All Rights Reserved.</p>
          <p>Agriculture & Farmers Welfare Department • Tamil Nadu</p>
        </div>
      </div>
    </footer>
  );
};

