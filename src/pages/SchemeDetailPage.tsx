import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { SchemeItem } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/common/Sidebar";
import { ApplySchemeModal } from "../components/common/ApplySchemeModal";
import {
  ArrowBack as BackIcon,
  Verified as VerifiedIcon,
  CheckCircle as CheckIcon,
  Description as DocIcon,
  Launch as LaunchIcon,
  InfoOutlined as InfoIcon,
  HelpOutlined as HelpIcon,
  Event as CalendarIcon,
  AccountBalance as GovIcon
} from "@mui/icons-material";

export const SchemeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language, tTerm, tText } = useLanguage();
  const { isAuthenticated, isAdmin } = useAuth();

  const [scheme, setScheme] = useState<SchemeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    async function loadScheme() {
      try {
        setLoading(true);
        if (!id) return;
        const res = await api.getSchemeById(id);
        if (res.data.success) {
          setScheme(res.data.data.scheme);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load scheme details.");
      } finally {
        setLoading(false);
      }
    }
    loadScheme();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#003366] border-t-transparent mb-3" />
        <p className="text-sm text-neutral-600">
          {language === "ta" ? "அரசு நலத்திட்டத்தின் விவரங்கள் ஏற்றப்படுகிறது..." : "Loading government scheme details..."}
        </p>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-red-700 font-semibold mb-4">
          {error || (language === "ta" ? "திட்டம் கிடைக்கவில்லை." : "Scheme not found.")}
        </p>
        <button
          onClick={() => navigate("/schemes")}
          className="px-4 py-2 bg-[#003366] text-white rounded text-sm font-semibold"
        >
          {language === "ta" ? "திட்டங்கள் பட்டியலுக்குத் திரும்புக" : "Back to Schemes List"}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen flex flex-col md:flex-row items-start">
      {isAuthenticated && <Sidebar type={isAdmin ? "ADMIN" : "FARMER"} />}
      <main className="flex-1 p-4 md:p-8 max-w-5xl w-full">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-[#003366] mb-4 font-semibold cursor-pointer"
        >
          <BackIcon style={{ fontSize: 16 }} />
          <span>{language === "ta" ? "முந்தைய பக்கத்திற்குச் செல்ல" : "Back to previous page"}</span>
        </button>

        {/* Scheme Header Card */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                  scheme.governmentLevel === "Tamil Nadu Government"
                    ? "bg-green-100 text-green-900 border border-green-300"
                    : "bg-blue-100 text-blue-900 border border-blue-300"
                }`}
              >
                {tTerm(scheme.governmentLevelTamil || scheme.governmentLevel)}
              </span>
              <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200">
                {tTerm(scheme.categoryTamil || scheme.category)}
              </span>
            </div>
            <span className="text-xs font-mono text-neutral-500">
              {language === "ta" ? "திட்ட எண்: " : "Scheme Code: "}{scheme.schemeId}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#003366] mb-2 leading-tight">
            {language === "ta" && scheme.schemeNameTamil ? scheme.schemeNameTamil : scheme.schemeName}
          </h1>
          {scheme.schemeNameTamil && language === "en" && (
            <p className="text-sm text-neutral-500 mb-3">{scheme.schemeNameTamil}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 pb-4 border-b border-neutral-200">
            <span className="flex items-center gap-1">
              <GovIcon style={{ fontSize: 16 }} className="text-[#003366]" />
              {tTerm(scheme.departmentTamil || scheme.department)}
            </span>
            <span className="flex items-center gap-1">
              <CalendarIcon style={{ fontSize: 16 }} className="text-neutral-500" />
              {language === "ta" ? "கடைசி தேதி: " : "Deadline: "}
              {scheme.applicationDeadline === "Ongoing / Per Financial Year" || !scheme.applicationDeadline
                ? (language === "ta" ? "நிதியாண்டு முழுவதும் செயல்படும்" : "Open throughout Financial Year")
                : scheme.applicationDeadline}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="bg-[#2E7D32] hover:bg-green-800 text-white font-bold px-6 py-2.5 rounded text-sm shadow-sm transition cursor-pointer"
            >
              {t("applyNow")}
            </button>

            {scheme.officialWebsite && (
              <a
                href={scheme.officialWebsite}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#003366] hover:underline font-semibold"
              >
                <span>{language === "ta" ? "துறையின் அதிகாரப்பூர்வ வலைத்தளம்" : "Visit Official Department Portal"}</span>
                <LaunchIcon style={{ fontSize: 14 }} />
              </a>
            )}
          </div>
        </div>

        {/* Benefits Card */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6">
          <h2 className="text-lg font-bold text-[#003366] mb-3 flex items-center gap-2">
            <VerifiedIcon className="text-[#2E7D32]" />
            <span>{language === "ta" ? "திட்ட பயன்கள் மற்றும் நிதி உதவி" : "Scheme Benefits & Financial Assistance"}</span>
          </h2>
          <div className="bg-green-50/70 border border-green-200 rounded p-4 text-sm text-neutral-800 leading-relaxed font-medium">
            {language === "ta" && scheme.benefitsTamil ? scheme.benefitsTamil : scheme.benefits}
          </div>
        </div>

        {/* Eligibility Criteria Breakdown */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6">
          <h2 className="text-lg font-bold text-[#003366] mb-4 flex items-center gap-2">
            <CheckIcon className="text-[#003366]" />
            <span>{language === "ta" ? "தகுதி நிபந்தனைகள்" : "Eligibility Conditions"}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
            <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
              <span className="font-semibold text-neutral-600 block">
                {language === "ta" ? "நில வரம்பு:" : "Landholding Ceiling:"}
              </span>
              <span className="text-sm font-bold text-neutral-800">
                {scheme.landholdingMax > 0
                  ? (language === "ta"
                      ? `${scheme.landholdingMin || 0} முதல் ${scheme.landholdingMax} ஏக்கர் வரை`
                      : `${scheme.landholdingMin || 0} to ${scheme.landholdingMax} Acres`)
                  : (language === "ta"
                      ? "அனைத்து நில பரப்பளவுகளுக்கும் பொருந்தும்"
                      : "No Maximum Land Limit (All landholding sizes)")}
              </span>
            </div>

            <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
              <span className="font-semibold text-neutral-600 block">
                {language === "ta" ? "பொருந்தும் விவசாயி வகைப்பாடு:" : "Applicable Farmer Classification:"}
              </span>
              <span className="text-sm font-bold text-neutral-800">
                {scheme.applicableFarmerTypes?.length
                  ? scheme.applicableFarmerTypes.map((f) => tTerm(f)).join(", ")
                  : (language === "ta" ? "அனைத்து விவசாயிகளும்" : "All Farmers")}
              </span>
            </div>

            <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
              <span className="font-semibold text-neutral-600 block">
                {language === "ta" ? "பொருந்தும் பயிர்கள்:" : "Eligible Crops:"}
              </span>
              <span className="text-sm font-bold text-neutral-800">
                {scheme.cropTypes?.length
                  ? scheme.cropTypes.map((c) => tTerm(c)).join(", ")
                  : (language === "ta" ? "அனைத்து பயிர்களும்" : "All Crops")}
              </span>
            </div>

            <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
              <span className="font-semibold text-neutral-600 block">
                {language === "ta" ? "இலக்கு மாவட்டங்கள்:" : "Target Districts:"}
              </span>
              <span className="text-sm font-bold text-neutral-800">
                {scheme.applicableDistricts?.includes("All")
                  ? (language === "ta" ? "தமிழ்நாட்டின் அனைத்து 38 மாவட்டங்களும்" : "All 38 Districts in Tamil Nadu")
                  : scheme.applicableDistricts.map((d) => tTerm(d)).join(", ")}
              </span>
            </div>
          </div>

          <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-700 mb-2">
            {language === "ta" ? "விரிவான தகுதி விதிகள்:" : "Detailed Eligibility Rules:"}
          </h3>
          <ul className="space-y-2 text-xs text-neutral-700">
            {scheme.eligibilityConditions?.map((cond, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckIcon style={{ fontSize: 16 }} className="text-green-600 shrink-0 mt-0.5" />
                <span>
                  {language === "ta" && scheme.eligibilityConditionsTamil?.[i]
                    ? scheme.eligibilityConditionsTamil[i]
                    : tText(cond)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Required Documents */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6">
          <h2 className="text-lg font-bold text-[#003366] mb-3 flex items-center gap-2">
            <DocIcon className="text-[#003366]" />
            <span>{language === "ta" ? "சரிபார்ப்புக்கு தேவையான ஆவணங்கள்" : "Required Documents for Verification"}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {scheme.requiredDocuments?.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded bg-neutral-50 border border-neutral-200"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 text-[#003366] flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <span className="font-medium text-neutral-800">
                  {language === "ta" && scheme.requiredDocumentsTamil?.[idx]
                    ? scheme.requiredDocumentsTamil[idx]
                    : tTerm(doc)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Application Process Guide */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-8">
          <h2 className="text-lg font-bold text-[#003366] mb-3">
            {language === "ta" ? "விண்ணப்ப சமர்ப்பிப்பு & சரிபார்ப்பு செயல்முறை" : "Application Submission & Verification Process"}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
            {language === "ta" && scheme.applicationProcessTamil
              ? scheme.applicationProcessTamil
              : tText(scheme.applicationProcess)}
          </p>

          <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-between">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="bg-[#2E7D32] hover:bg-green-800 text-white font-bold px-6 py-2.5 rounded text-sm shadow-sm transition cursor-pointer"
            >
              {language === "ta" ? "ஆன்லைனில் விண்ணப்பிக்க" : "Submit Application Online"}
            </button>
            <Link
              to="/schemes"
              className="text-xs font-semibold text-[#003366] hover:underline"
            >
              {language === "ta" ? "பிற திட்டங்களை உலாவ" : "Browse other schemes"}
            </Link>
          </div>
        </div>
      </main>

      <ApplySchemeModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        scheme={scheme}
      />
    </div>
  );
};
