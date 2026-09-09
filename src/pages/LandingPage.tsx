import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  Search as SearchIcon,
  Psychology as AIIcon,
  FactCheck as CheckIcon,
  TrackChanges as TrackIcon,
  Agriculture as AgriIcon,
  WaterDrop as WaterIcon,
  SolarPower as SolarIcon,
  AttachMoney as MoneyIcon,
  ArrowForward as ArrowIcon,
  Verified as VerifiedIcon,
  SupportAgent as SupportIcon,
  Campaign as AnnounceIcon
} from "@mui/icons-material";

export const LandingPage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [quickSearch, setQuickSearch] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/schemes?search=${encodeURIComponent(quickSearch.trim())}`);
    } else {
      navigate("/schemes");
    }
  };

  const services = [
    {
      title: t("service1Title"),
      desc: t("service1Desc"),
      icon: <AgriIcon className="text-[#003366]" style={{ fontSize: 36 }} />,
      link: "/schemes",
      cta: language === "ta" ? "திட்டங்களை பார்க்க" : "View Schemes"
    },
    {
      title: t("service2Title"),
      desc: t("service2Desc"),
      icon: <AIIcon className="text-[#2E7D32]" style={{ fontSize: 36 }} />,
      link: "/eligibility",
      cta: language === "ta" ? "AI பரிந்துரை பெற" : "Get AI Advice"
    },
    {
      title: t("service3Title"),
      desc: t("service3Desc"),
      icon: <CheckIcon className="text-[#003366]" style={{ fontSize: 36 }} />,
      link: "/eligibility",
      cta: language === "ta" ? "தகுதி சரிபார்க்க" : "Check Now"
    },
    {
      title: t("service4Title"),
      desc: t("service4Desc"),
      icon: <TrackIcon className="text-[#2E7D32]" style={{ fontSize: 36 }} />,
      link: "/farmer/applications",
      cta: language === "ta" ? "நிலையை அறிய" : "Track Status"
    }
  ];

  const popularTags = [
    { label: language === "ta" ? "நெல் சாகுபடி" : "Paddy Schemes", query: "paddy" },
    { label: language === "ta" ? "சொட்டு நீர் பாசனம்" : "Micro Irrigation", query: "irrigation" },
    { label: language === "ta" ? "சூரிய மின் மோட்டார்" : "Solar Pumps", query: "solar" },
    { label: language === "ta" ? "டிராக்டர் மானியம்" : "Farm Machinery", query: "mechanization" },
    { label: language === "ta" ? "தோட்டக்கலை" : "Horticulture", query: "horticulture" },
    { label: language === "ta" ? "பயிர் காப்பீடு" : "Crop Insurance", query: "insurance" }
  ];

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen">
      {/* Official Announcement Ticker */}
      <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 font-medium">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <AnnounceIcon fontSize="small" className="text-amber-700 shrink-0" />
          <span className="font-bold shrink-0">{language === "ta" ? "முக்கிய செய்தி:" : "Latest Advisory:"}</span>
          <p className="truncate">
            {language === "ta"
              ? "காவிரி டெல்டா குறுவை சிறப்பு தொகுப்பு 2026 மற்றும் சொட்டு நீர் பாசன மானியத்திற்கு விண்ணப்பங்கள் வரவேற்கப்படுகின்றன."
              : "Applications open for Kuruvai Special Package 2026 and PMKSY Micro-Irrigation 100% subsidy for Small/Marginal farmers."}
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white border-b border-neutral-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-[#2E7D32] border border-green-200 mb-4">
              <VerifiedIcon style={{ fontSize: 14 }} />
              {language === "ta" ? "தமிழ்நாடு அரசு உழவர் நலத்துறை" : "Tamil Nadu Agriculture & Farmers Welfare"}
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#003366] leading-tight mb-4">
              {t("heroTitle")}
            </h1>

            <p className="text-base sm:text-lg text-neutral-700 leading-relaxed mb-8">
              {t("heroSubtitle")}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link
                to="/eligibility"
                className="bg-[#2E7D32] hover:bg-green-800 text-white px-6 py-3.5 rounded font-bold text-base shadow-sm transition flex items-center gap-2"
              >
                <span>{t("checkEligibilityBtn")}</span>
                <ArrowIcon fontSize="small" />
              </Link>
              <Link
                to="/schemes"
                className="bg-white hover:bg-neutral-50 text-[#003366] border-2 border-[#003366] px-6 py-3.5 rounded font-bold text-base transition"
              >
                {t("exploreSchemesBtn")}
              </Link>
            </div>

            {/* Integrated Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-neutral-50 p-2 rounded-lg border border-neutral-300 max-w-2xl">
              <SearchIcon className="text-neutral-500 ml-2" />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full bg-transparent text-sm focus:outline-none px-2 text-neutral-900"
              />
              <button
                type="submit"
                className="bg-[#003366] hover:bg-blue-900 text-white px-5 py-2 rounded text-sm font-semibold transition shrink-0 cursor-pointer"
              >
                {t("searchBtn")}
              </button>
            </form>

            {/* Popular Search Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-neutral-600">
              <span className="font-semibold text-neutral-700">{language === "ta" ? "விரைவு தேடல்:" : "Popular Categories:"}</span>
              {popularTags.map((tag) => (
                <button
                  key={tag.query}
                  onClick={() => navigate(`/schemes?search=${tag.query}`)}
                  className="bg-white hover:bg-blue-50 text-[#003366] border border-neutral-300 px-2.5 py-1 rounded transition cursor-pointer"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Services Grid */}
      <section className="py-12 md:py-16 max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#003366] mb-3">
            {language === "ta" ? "விவசாயிகளுக்கான சேவைகள்" : "Key Farmer Services"}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600">
            {language === "ta"
              ? "அரசு நலத்திட்டங்களை கண்டறிந்து பயன்பெற உழவர்களுக்கான எளிய வழிகாட்டி."
              : "Discover, verify eligibility, receive AI recommendations, and track applications."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg p-6 border border-neutral-200 shadow-xs flex flex-col justify-between hover:border-[#003366] transition"
            >
              <div>
                <div className="mb-4">{svc.icon}</div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  {svc.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                  {svc.desc}
                </p>
              </div>

              <Link
                to={svc.link}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#003366] hover:text-blue-800 transition"
              >
                <span>{svc.cta}</span>
                <ArrowIcon fontSize="small" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose AI Recommendation Section */}
      <section className="bg-white border-y border-neutral-200 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="p-4 border-l-0 md:border-l-4 border-[#2E7D32]">
              <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                <WaterIcon className="text-[#2E7D32]" />
                <h4 className="font-bold text-base text-neutral-900">
                  {language === "ta" ? "100% சொட்டுநீர் பாசன மானியம்" : "100% Micro Irrigation Subsidy"}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600">
                {language === "ta"
                  ? "சிறு, குறு விவசாயிகளுக்கு முழு மானியத்தில் சொட்டுநீர் மற்றும் தெளிப்புநீர் பாசன கருவிகள்."
                  : "Complete financial coverage for small & marginal farmers to optimize water usage."}
              </p>
            </div>

            <div className="p-4 border-l-0 md:border-l-4 border-[#003366]">
              <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                <SolarIcon className="text-[#003366]" />
                <h4 className="font-bold text-base text-neutral-900">
                  {language === "ta" ? "முதலமைச்சரின் சூரிய பம்புசெட்" : "CM Solar Agricultural Pumps"}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600">
                {language === "ta"
                  ? "70% அரசு மானியத்தில் விவசாய கிணறுகளுக்கு ஆஃப்-கிரிட் சோலார் பம்புசெட்டுகள்."
                  : "Up to 70% state & central capital subsidy for standalone solar pumpsets."}
              </p>
            </div>

            <div className="p-4 border-l-0 md:border-l-4 border-amber-600">
              <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                <MoneyIcon className="text-amber-600" />
                <h4 className="font-bold text-base text-neutral-900">
                  {language === "ta" ? "நேரடி வங்கி பரிமாற்றம் (DBT)" : "Direct Benefit Transfer (DBT)"}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600">
                {language === "ta"
                  ? "அரசு நிதி உதவிகள் இடைத்தரகர் இன்றி நேரடியாக விவசாயியின் ஆதார் இணைக்கப்பட்ட வங்கிக் கணக்கில்."
                  : "All financial assistance credited directly to Aadhaar-linked farmer bank accounts."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Help & Grievance banner */}
      <section className="py-10 max-w-7xl mx-auto px-4">
        <div className="bg-[#003366] text-white rounded-lg p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <SupportIcon style={{ fontSize: 48 }} className="text-green-400 shrink-0" />
            <div>
              <h3 className="text-xl font-bold">
                {language === "ta" ? "விவசாயிகளுக்கு உடனடி உதவி தேவையா?" : "Need Assistance with Scheme Eligibility?"}
              </h3>
              <p className="text-sm text-neutral-200 mt-1">
                {language === "ta"
                  ? "கிசான் அழைப்பு மையத்தின் இலவச எண்: 1800-180-1551 அல்லது அருகிலுள்ள வேளாண் விரிவாக்க மையத்தை அணுகவும்."
                  : "Contact Kisan Call Centre Toll-Free 1800-180-1551 (24x7) or visit your Block Agricultural Extension Centre."}
              </p>
            </div>
          </div>
          <Link
            to="/help"
            className="bg-white text-[#003366] hover:bg-neutral-100 font-bold px-6 py-3 rounded text-sm shrink-0 transition"
          >
            {language === "ta" ? "அலுவலர் தொடர்பு விவரங்கள்" : "Contact Extension Officers"}
          </Link>
        </div>
      </section>
    </div>
  );
};
