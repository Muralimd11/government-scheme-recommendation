import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TamilNaduEmblem } from "./Emblem";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Language as LangIcon,
  AccountCircle as UserIcon,
  Agriculture as AgriIcon,
  Notifications as NotifIcon,
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon
} from "@mui/icons-material";

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, isAdmin, isFarmer, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ta" : "en");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { label: t("home"), path: "/" },
    { label: t("schemes"), path: "/schemes" },
    { label: t("checkEligibility"), path: "/eligibility" },
    { label: t("about"), path: "/about" },
    { label: t("help"), path: "/help" }
  ];

  return (
    <header className="w-full bg-white border-b border-neutral-200 sticky top-0 z-50">
      {/* Top Government Strip */}
      <div className="bg-[#003366] text-white text-xs px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold tracking-wide">
              {language === "ta" ? "தமிழ்நாடு அரசு" : "GOVERNMENT OF TAMIL NADU"}
            </span>
            <span className="hidden sm:inline text-neutral-300">|</span>
            <span className="hidden sm:inline text-neutral-200">
              {language === "ta"
                ? "வேளாண்மை மற்றும் உழவர் நலத்துறை"
                : "Department of Agriculture & Farmers Welfare"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-neutral-200">
              {t("helplineText")}
            </span>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 bg-[#2E7D32] hover:bg-green-700 text-white px-2.5 py-0.5 rounded text-xs font-medium cursor-pointer transition"
              title="Change Language"
            >
              <LangIcon style={{ fontSize: 14 }} />
              {language === "en" ? "தமிழ்" : "English"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo & Portal Identity */}
        <Link to="/" className="flex items-center gap-3 group">
          <TamilNaduEmblem size={52} />
          <div className="flex flex-col">
            <span className="text-[#003366] font-bold text-lg leading-tight group-hover:text-blue-900 transition">
              {language === "ta"
                ? "உழவர் நலத்திட்ட பரிந்துரை தளம்"
                : "TN Farmer Schemes AI"}
            </span>
            <span className="text-neutral-600 text-xs font-medium">
              {language === "ta"
                ? "செயற்கை நுண்ணறிவு அடிப்படையிலான அரசு நலத்திட்டங்கள்"
                : "AI-Powered Government Scheme Recommendation System"}
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded text-sm font-medium transition ${
                  isActive
                    ? "text-[#003366] bg-blue-50 font-semibold"
                    : "text-neutral-700 hover:text-[#003366] hover:bg-neutral-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth Buttons / Profile */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                to={isAdmin ? "/admin/dashboard" : "/farmer/dashboard"}
                className="flex items-center gap-1.5 bg-blue-50 text-[#003366] hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded text-sm font-medium transition"
              >
                <DashboardIcon style={{ fontSize: 18 }} />
                <span>{isAdmin ? "Admin Portal" : t("dashboard")}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-neutral-600 hover:text-red-700 px-2.5 py-1.5 text-sm transition"
                title="Logout"
              >
                <LogoutIcon style={{ fontSize: 18 }} />
                <span>{t("logout")}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-[#003366] hover:bg-neutral-100 px-3 py-1.5 rounded text-sm font-semibold border border-[#003366] transition"
              >
                {t("login")}
              </Link>
              <Link
                to="/register"
                className="bg-[#2E7D32] hover:bg-green-800 text-white px-3.5 py-1.5 rounded text-sm font-semibold shadow-sm transition"
              >
                {t("register")}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-neutral-700 hover:text-[#003366] focus:outline-none"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded text-base font-medium text-neutral-800 hover:bg-blue-50 hover:text-[#003366]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-neutral-200">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <Link
                  to={isAdmin ? "/admin/dashboard" : "/farmer/dashboard"}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center bg-[#003366] text-white py-2 rounded font-medium"
                >
                  {isAdmin ? "Admin Portal" : t("dashboard")}
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-center text-red-700 py-2 font-medium"
                >
                  {t("logout")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2 border border-[#003366] text-[#003366] rounded font-medium"
                >
                  {t("login")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2 bg-[#2E7D32] text-white rounded font-medium"
                >
                  {t("register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
