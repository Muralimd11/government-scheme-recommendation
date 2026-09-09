import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { TamilNaduEmblem } from "./Emblem";

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <footer className="w-full bg-[#002244] text-neutral-300 text-sm mt-auto border-t-4 border-[#2E7D32]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Government Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <TamilNaduEmblem size={44} />
              <div>
                <p className="text-white font-bold text-base leading-tight">
                  {language === "ta" ? "தமிழ்நாடு அரசு" : "Government of Tamil Nadu"}
                </p>
                <p className="text-neutral-400 text-xs">
                  {language === "ta"
                    ? "வேளாண்மை மற்றும் உழவர் நலத்துறை"
                    : "Agriculture & Farmers Welfare Department"}
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {language === "ta"
                ? "தமிழ்நாட்டு விவசாயிகளுக்கு அரசு நலத்திட்டங்களை வெளிப்படையான முறையில் வழங்கிட உருவாக்கப்பட்ட செயற்கை நுண்ணறிவு தளம்."
                : "Dedicated digital platform using machine learning to empower Tamil Nadu cultivators with personalized scheme recommendations."}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider border-b border-neutral-700 pb-1">
              {language === "ta" ? "முக்கிய இணைப்புகள்" : "Quick Services"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/schemes" className="hover:text-white transition">
                  {t("schemes")}
                </Link>
              </li>
              <li>
                <Link to="/eligibility" className="hover:text-white transition">
                  {t("checkEligibility")}
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">
                  {t("register")}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  {t("login")}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  {t("about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Official State Portals */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider border-b border-neutral-700 pb-1">
              {language === "ta" ? "அரசு இணையதளங்கள்" : "Official Portals"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.tn.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  Tamil Nadu State Portal (tn.gov.in)
                </a>
              </li>
              <li>
                <a
                  href="https://agritech.tnau.ac.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  TNAU Agritech Portal
                </a>
              </li>
              <li>
                <a
                  href="https://pmkisan.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  PM-KISAN National Portal
                </a>
              </li>
              <li>
                <a
                  href="https://tnhorticulture.tn.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  TN Horticulture Department
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Farmer Helpline */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider border-b border-neutral-700 pb-1">
              {language === "ta" ? "உழவர் உதவி மையங்கள்" : "Farmer Helplines"}
            </h4>
            <div className="space-y-2 text-xs text-neutral-300">
              <p>
                <span className="text-white font-medium">Kisan Call Centre:</span>{" "}
                <span className="text-green-400 font-bold">1800-180-1551</span> (Toll-Free, 24x7)
              </p>
              <p>
                <span className="text-white font-medium">TN Uzhavan Helpline:</span>{" "}
                <span className="text-green-400 font-bold">155304</span>
              </p>
              <p>
                <span className="text-white font-medium">Working Hours:</span> 06:00 AM to 10:00 PM (Mon-Sat)
              </p>
              <p className="text-neutral-400 text-[11px] pt-1">
                Content Owned and Maintained by Department of Agriculture and Farmers Welfare, Government of Tamil Nadu.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-neutral-700 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-400 gap-2">
          <p>© 2026 Government of Tamil Nadu. All Rights Reserved.</p>
          <div className="flex gap-4">
            <span>Website Policies</span>
            <span>Accessibility Statement</span>
            <span>Privacy Policy</span>
            <span>Help</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
