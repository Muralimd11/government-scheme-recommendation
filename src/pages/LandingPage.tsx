import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import heroIllustration from "../assets/images/scheme_citizens_hero_1789015037268.jpg";
import {
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
  const { isAuthenticated, isFarmer } = useAuth();
  const navigate = useNavigate();

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
      link: "/recommendations",
      cta: language === "ta" ? "AI பரிந்துரை பெற" : "View Recommendations"
    },
    {
      title: language === "ta" ? "விவசாயி சுயவிவரம்" : "Farmer Profile & Attributes",
      desc: language === "ta" ? "உங்கள் பயிர், நிலம், மண் மற்றும் நலத்திட்ட விவரங்களை நிர்வகியுங்கள்." : "Keep your agricultural parameters, soil details, and livestock records up to date.",
      icon: <CheckIcon className="text-[#003366]" style={{ fontSize: 36 }} />,
      link: isAuthenticated ? (isFarmer ? "/farmer/profile" : "/admin/farmers") : "/login",
      cta: isAuthenticated ? (language === "ta" ? "சுயவிவரம் பார்க்க" : "View Profile") : (language === "ta" ? "உள்நுழைய" : "Login")
    },
    {
      title: t("service4Title"),
      desc: t("service4Desc"),
      icon: <TrackIcon className="text-[#2E7D32]" style={{ fontSize: 36 }} />,
      link: isAuthenticated ? "/farmer/applications" : "/login",
      cta: language === "ta" ? "நிலையை அறிய" : "Track Status"
    }
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
      <section className="bg-white border-b border-neutral-200 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Information, Action CTAs, and Verified Metrics */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                <VerifiedIcon style={{ fontSize: 15 }} className="text-emerald-700" />
                <span>
                  {language === "ta"
                    ? "தமிழ்நாடு அரசு • உழவர் நல சேவை"
                    : "GOVERNMENT OF TAMIL NADU • CITIZEN SERVICE"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#003366] leading-tight tracking-tight">
                {t("heroTitle")}
              </h1>

              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed max-w-2xl font-normal">
                {language === "ta"
                  ? "தமிழ்நாடு குடிமக்களுக்கான தனிப்பயனாக்கப்பட்ட AI பரிந்துரைகள். உங்கள் தகுதியை சில நிமிடங்களில் தமிழ் அல்லது ஆங்கிலத்தில் சரிபார்க்கவும்."
                  : "AI-powered personalized recommendations for Tamil Nadu citizens. Check your eligibility in minutes, in English or தமிழ்."}
              </p>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  to={isAuthenticated ? (isFarmer ? "/recommendations" : "/admin/dashboard") : "/eligibility"}
                  className="bg-[#003366] hover:bg-blue-900 text-white px-6 py-3.5 rounded-lg font-bold text-sm sm:text-base shadow-sm hover:shadow transition flex items-center gap-2"
                >
                  <span>{language === "ta" ? "தகுதியை சரிபார்க்க" : "Check Eligibility"}</span>
                  <ArrowIcon fontSize="small" />
                </Link>
                <Link
                  to="/schemes"
                  className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 px-6 py-3.5 rounded-lg font-bold text-sm sm:text-base transition"
                >
                  <span>{language === "ta" ? "மேலும் அறிய" : "Learn More"}</span>
                </Link>
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="text-[#003366] hover:underline px-3 py-2 text-sm font-semibold transition"
                  >
                    {t("login")} →
                  </Link>
                )}
              </div>

              {/* Verified Metrics Counter Bar */}
              <div className="pt-6 border-t border-neutral-200 grid grid-cols-3 gap-4 sm:gap-6 max-w-lg">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#003366]">380+</div>
                  <div className="text-xs sm:text-sm text-neutral-600 font-medium mt-0.5">
                    {language === "ta" ? "திட்டங்கள்" : "Schemes listed"}
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#003366]">38</div>
                  <div className="text-xs sm:text-sm text-neutral-600 font-medium mt-0.5">
                    {language === "ta" ? "மாவட்டங்கள்" : "Districts covered"}
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#003366]">1.2 L</div>
                  <div className="text-xs sm:text-sm text-neutral-600 font-medium mt-0.5">
                    {language === "ta" ? "பயனாளிகள்" : "Citizens assisted"}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Illustration Card Covering Whitespace */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md lg:max-w-none bg-white rounded-2xl border border-neutral-200/90 p-2.5 sm:p-3.5 shadow-md overflow-hidden group hover:shadow-lg transition">
                <img
                  src={heroIllustration}
                  alt="Tamil Nadu Government Scheme Beneficiaries and Citizens"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto rounded-xl object-cover"
                />
                <div className="mt-2.5 px-2 py-1 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                  <span className="flex items-center gap-1">
                    <VerifiedIcon style={{ fontSize: 13 }} className="text-emerald-600" />
                    <span>{language === "ta" ? "தமிழ்நாடு உழவர் நலத்துறை" : "Govt of Tamil Nadu • Citizen First"}</span>
                  </span>
                  <span className="text-neutral-400">AI Scheme Sahayam</span>
                </div>
              </div>
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
        <div className="bg-[#003366] text-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <SupportIcon style={{ fontSize: 44 }} className="text-green-400 shrink-0" />
            <div>
              <h3 className="text-xl font-bold">
                {language === "ta" ? "விவசாயிகளுக்கு உடனடி உதவி தேவையா?" : "Need Assistance with Scheme Eligibility?"}
              </h3>
              <p className="text-sm text-neutral-200 mt-1">
                {language === "ta"
                  ? "கிசான் அழைப்பு மையத்தின் இலவச எண்: 1800-180-1551 (24x7) அல்லது உழவன் உதவி எண் 155304 அணுகவும்."
                  : "Contact Kisan Call Centre Toll-Free 1800-180-1551 (24x7) or Uzhavan Helpline 155304 for immediate guidance."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#002244] border border-blue-900 px-5 py-3 rounded-lg text-sm text-neutral-200 shrink-0">
            <span className="text-xs uppercase tracking-wider text-green-400 font-semibold">Toll-Free 24x7:</span>
            <span className="text-white font-bold text-base">1800-180-1551</span>
          </div>
        </div>
      </section>
    </div>
  );
};
