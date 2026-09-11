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
    ...(!isFarmer ? [{ label: t("checkEligibility"), path: "/eligibility" }] : []),
    ...(isFarmer ? [{ label: language === "ta" ? "பரிந்துரைகள்" : "Recommendations", path: "/recommendations" }] : [])
  ];

  return (
    <header className="w-full bg-white border-b border-neutral-200 sticky top-0 z-50">
      {/* Top Government Strip */}
      <div className="bg-[#003366] text-white text-xs px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-wider text-amber-300">
              {language === "ta" ? "உழவர் தோழன் (FARMERS FRIEND)" : "FARMERS FRIEND"}
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
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Logo & Portal Identity */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <TamilNaduEmblem size={50} />
          <div className="flex flex-col">
            <span className="text-[#003366] font-black text-lg leading-tight group-hover:text-blue-900 transition flex items-center gap-2">
              <span>{language === "ta" ? "உழவர் தோழன்" : "FARMERS FRIEND"}</span>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                AI
              </span>
            </span>
            <span className="text-neutral-600 text-xs font-medium">
              {language === "ta"
                ? "விவசாயிகளுக்கான உழவர் நலத்திட்ட வழிகாட்டி"
                : "Tamil Nadu Farmer Scheme Recommendation Portal"}
            </span>
          </div>
        </Link>

        {/* Right: Consolidated Navigation Bar & Action Controls */}
        <div className="hidden lg:flex items-center gap-4 ml-auto">
          {/* Navigation Links moved to the right */}
          <nav className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/90">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    isActive
                      ? "text-[#003366] bg-white shadow-xs font-semibold border border-slate-200"
                      : "text-slate-700 hover:text-[#003366] hover:bg-slate-200/70"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="h-6 w-px bg-slate-200" />

          {/* Profile / Auth Controls */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-800 max-w-[130px] truncate">
                  {user.fullName || (isAdmin ? "Admin Officer" : "Farmer")}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  {user.role}
                </span>
              </div>

              <Link
                to={isAdmin ? "/admin/dashboard" : "/farmer/dashboard"}
                className="flex items-center gap-1.5 bg-[#003366] hover:bg-blue-900 text-white px-3.5 py-2 rounded-lg text-sm font-semibold shadow-xs transition"
              >
                <DashboardIcon style={{ fontSize: 18 }} />
                <span>{isAdmin ? "Admin Portal" : t("dashboard")}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center text-slate-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg text-sm transition"
                title="Logout"
              >
                <LogoutIcon style={{ fontSize: 18 }} />
                <span className="sr-only">{t("logout")}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="text-[#003366] hover:bg-slate-50 px-3.5 py-1.5 rounded-lg text-sm font-semibold border border-slate-300 transition"
              >
                {t("login")}
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 bg-[#2E7D32] hover:bg-green-800 text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow-xs transition"
              >
                <AgriIcon style={{ fontSize: 18 }} />
                <span>{t("register")}</span>
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
