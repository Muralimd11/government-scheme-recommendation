import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import { RecommendationResult } from "../types";
import { Sidebar } from "../components/common/Sidebar";
import { ApplySchemeModal } from "../components/common/ApplySchemeModal";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  SlidersHorizontal,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Trees,
  Droplets,
  Layers,
  HelpCircle,
  FileCheck,
  Building
} from "lucide-react";
import { cleanBenefitSummary, parseRequiredDocuments } from "../utils/formatters";

export const RecommendationsPage: React.FC = () => {
  const { user, isAuthenticated, isFarmer, isAdmin } = useAuth();
  const { t, language, tTerm, tText } = useLanguage();
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination State (10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter States
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ELIGIBLE" | "INELIGIBLE">("ELIGIBLE");
  const [govFilter, setGovFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"match" | "name">("match");
  const [applyingScheme, setApplyingScheme] = useState<any | null>(null);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getRecommendations({});
      if (res.data?.success) {
        setRecommendations(res.data.data.recommendations || []);
        setFarmerProfile(res.data.data.farmerProfile || user);
      }
    } catch (err: any) {
      console.error("Recommendations error:", err);
      setError(err.message || "Failed to load recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Check session storage cache
    const stored = sessionStorage.getItem("last_recommendations");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.recommendations && parsed.recommendations.length > 0) {
          setRecommendations(parsed.recommendations);
          setFarmerProfile(parsed.farmerProfile || user);
          return;
        }
      } catch (e) {
        // Fallback to fetch
      }
    }

    if (isAuthenticated) {
      loadRecommendations();
    } else {
      navigate("/eligibility");
    }
  }, [isAuthenticated]);

  const activeProfile = farmerProfile || user;

  // Filter & Sort
  const filtered = recommendations
    .filter((r) => {
      // Status filter (Eligible vs Ineligible)
      const isEligible = r.isEligible !== false;
      if (statusFilter === "ELIGIBLE" && !isEligible) return false;
      if (statusFilter === "INELIGIBLE" && isEligible) return false;

      // Government level filter
      if (govFilter === "All") return true;
      return r.governmentLevel === govFilter;
    })
    .sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore;
      return a.schemeName.localeCompare(b.schemeName);
    });

  const totalEligible = recommendations.filter((r) => r.isEligible !== false).length;
  const totalIneligible = recommendations.filter((r) => r.isEligible === false).length;

  // Pagination Calculations (10 schemes per page)
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedSchemes = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, govFilter, sortBy]);

  const content = (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full mb-2 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RULE-BASED VERIFICATION & ML RE-RANKING</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {language === "ta"
                ? "விவசாயிகளுக்கான தனிப்பயனாக்கப்பட்ட அரசு நலத்திட்டங்கள்"
                : "Personalized Government Scheme Recommendations"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {language === "ta"
                ? `உங்கள் பதிவு செய்யப்பட்ட விவசாய சுயவிவரத்தின்படி ${totalEligible} திட்டங்கள் முழு தகுதி பெற்றுள்ளன.`
                : `Verified against official eligibility rules. Found ${totalEligible} schemes currently eligible for your farm.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadRecommendations}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition"
              title="Re-run Eligibility Evaluation"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{language === "ta" ? "புதுப்பி" : "Refresh"}</span>
            </button>
            <Link
              to="/farmer/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{language === "ta" ? "சுயவிவரத்தை திருத்து (15 பிரிவுகள்)" : "Edit Profile Attributes"}</span>
            </Link>
          </div>
        </div>

        {/* Snapshot of Active Farmer Parameters */}
        {activeProfile && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px]">
                {language === "ta" ? "இருப்பிடம்" : "Location"}
              </span>
              <strong className="text-slate-900 block truncate">
                {activeProfile.village ? `${tTerm(activeProfile.village)}, ` : ""}{tTerm(activeProfile.district || "Tamil Nadu")}
              </strong>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px]">
                {language === "ta" ? "பயிரிடக்கூடிய நிலம்" : "Cultivable Land"}
              </span>
              <strong className="text-slate-900 block">
                {activeProfile.cultivableArea ?? activeProfile.landSize} {language === "ta" ? "ஏக்கர்" : "Acres"} ({tTerm(activeProfile.landOwnershipType || "Own Land")})
              </strong>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px]">
                {language === "ta" ? "பயிர் & பருவம்" : "Crop & Season"}
              </span>
              <strong className="text-slate-900 block truncate">
                {tTerm(activeProfile.cropType)} • {activeProfile.croppingSeason ? tTerm(activeProfile.croppingSeason.split(" ")[0]) : (language === "ta" ? "சம்பா" : "Samba")}
              </strong>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px]">
                {language === "ta" ? "பாசன ஆதாரம்" : "Irrigation Source"}
              </span>
              <strong className="text-slate-900 block">
                {tTerm(activeProfile.irrigationType || "Canal")} ({tTerm(activeProfile.irrigationMethod || "Flood")})
              </strong>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px]">
                {language === "ta" ? "விவசாயி வகை" : "Farmer Category"}
              </span>
              <strong className="text-emerald-800 font-bold block">
                {tTerm(activeProfile.farmerType || (activeProfile.landSize <= 2.5 ? "Marginal" : activeProfile.landSize <= 5 ? "Small" : "Medium/Large"))}
              </strong>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px]">
                {language === "ta" ? "ஆண்டு வருமானம்" : "Annual Income"}
              </span>
              <strong className="text-slate-900 block">
                ₹{(activeProfile.annualIncome || 120000).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Switcher Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setStatusFilter("ELIGIBLE")}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${statusFilter === "ELIGIBLE"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-700 hover:text-slate-900"
              }`}
          >
            {language === "ta" ? `தகுதியானவை (${totalEligible})` : `Eligible (${totalEligible})`}
          </button>
          <button
            onClick={() => setStatusFilter("INELIGIBLE")}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${statusFilter === "INELIGIBLE"
                ? "bg-amber-700 text-white shadow-xs"
                : "text-slate-700 hover:text-slate-900"
              }`}
          >
            {language === "ta" ? `தகுதியில்லாதவை (${totalIneligible})` : `Ineligible (${totalIneligible})`}
          </button>
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${statusFilter === "ALL"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-700 hover:text-slate-900"
              }`}
          >
            {language === "ta" ? `அனைத்தும் (${recommendations.length})` : `All Evaluated (${recommendations.length})`}
          </button>
        </div>

        {/* Level & Sort Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">
              {language === "ta" ? "அரசு நிலை:" : "Jurisdiction:"}
            </span>
            <select
              value={govFilter}
              onChange={(e) => setGovFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 font-medium"
            >
              <option value="All">{language === "ta" ? "அனைத்து அரசுகள்" : "All Governments"}</option>
              <option value="Tamil Nadu Government">{language === "ta" ? "தமிழ்நாடு அரசு" : "Tamil Nadu State"}</option>
              <option value="Central Government">{language === "ta" ? "மத்திய அரசு" : "Central Government"}</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">
              {language === "ta" ? "வரிசைப்படுத்து:" : "Sort:"}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 font-medium"
            >
              <option value="match">{language === "ta" ? "அதிக பொருத்தம் முன்னுரிமை" : "Highest Priority Match"}</option>
              <option value="name">{language === "ta" ? "திட்டத்தின் பெயர் (A-Z)" : "Scheme Name (A-Z)"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scheme Cards List */}
      {loading ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-700 border-t-transparent mb-3" />
          <p className="text-sm font-semibold text-slate-700">Evaluating statutory eligibility rules...</p>
          <p className="text-xs text-slate-500 mt-1">Cross-referencing land size, cropping season, irrigation, and welfare categories</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-300 text-red-900 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <FileCheck className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {statusFilter === "INELIGIBLE"
              ? "Good news! No statutory disqualifications were found."
              : "No schemes match the selected filters."}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try switching to "All Evaluated" or adjust your government level filter.
          </p>
          <button
            onClick={() => {
              setStatusFilter("ALL");
              setGovFilter("All");
            }}
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedSchemes.map((scheme, idx) => {
            const isEligible = scheme.isEligible !== false;
            return (
              <div
                key={scheme.schemeId || idx}
                className={`bg-white rounded-xl border p-6 shadow-xs transition hover:shadow-sm ${isEligible
                    ? "border-slate-200 hover:border-emerald-600"
                    : "border-amber-200 bg-amber-50/20"
                  }`}
              >
                {/* Header Row: Score + Eligibility Tag + Jurisdiction */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {/* Eligibility Badge */}
                    {isEligible ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>
                          {language === "ta"
                            ? `${scheme.matchScore}% பொருத்தம் • முழு தகுதி`
                            : `${scheme.matchScore}% Match • Fully Eligible`}
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5 text-amber-700" />
                        <span>
                          {language === "ta"
                            ? "தற்போதைய சுயவிவரத்திற்கு தகுதியற்றது"
                            : "Ineligible for Current Profile"}
                        </span>
                      </span>
                    )}

                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${scheme.governmentLevel === "Tamil Nadu Government"
                          ? "bg-green-50 text-green-800 border-green-200"
                          : "bg-blue-50 text-blue-800 border-blue-200"
                        }`}
                    >
                      {tTerm(scheme.governmentLevelTamil || scheme.governmentLevel)}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-500 font-medium">
                    {language === "ta" ? "திட்ட எண்: " : "Scheme ID: "}{scheme.schemeId}
                  </span>
                </div>

                {/* Scheme Title */}
                <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-1">
                  {language === "ta" && scheme.schemeNameTamil ? scheme.schemeNameTamil : scheme.schemeName}
                </h2>
                {language === "en" && scheme.schemeNameTamil && (
                  <p className="text-xs text-slate-500 mb-2">{scheme.schemeNameTamil}</p>
                )}

                <p className="text-xs text-slate-600 font-medium mb-3">
                  {language === "ta" ? "துறை: " : "Department: "}
                  <span className="text-slate-800 font-semibold">
                    {tTerm(scheme.departmentTamil || scheme.department)}
                  </span>
                </p>

                {/* Benefits Banner (Clean & Concise Highlight) */}
                {(scheme.benefitsTamil || scheme.benefits) && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3.5 mb-4">
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      <strong className="text-emerald-900 font-bold">
                        {language === "ta" ? "திட்ட பயன்கள்: " : "Benefit Provision: "}
                      </strong>
                      {language === "ta" && scheme.benefitsTamil
                        ? scheme.benefitsTamil
                        : cleanBenefitSummary(scheme.benefits)}
                    </p>
                  </div>
                )}

                {/* Transparent Ineligible Reason (if not eligible) */}
                {!isEligible && (scheme.ineligibleReasonTamil || scheme.ineligibleReason) && (
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3.5 mb-4 flex items-start gap-2.5 text-xs text-amber-950">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block text-amber-900">
                        {language === "ta" ? "தகுதியின்மைக்கான அரசு விதிமுறை காரணம்:" : "Statutory Reason for Ineligibility:"}
                      </strong>
                      <span>
                        {language === "ta" && scheme.ineligibleReasonTamil
                          ? scheme.ineligibleReasonTamil
                          : tText(scheme.ineligibleReason || "")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Why Recommended / Met Criteria Breakdown */}
                {scheme.whyRecommended && scheme.whyRecommended.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        {language === "ta" ? "சரிபார்க்கப்பட்ட தகுதி நிபந்தனைகள்:" : "Evaluated Criteria Breakdown:"}
                      </span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {scheme.whyRecommended.map((reason, rIdx) => {
                        const tamilText = scheme.whyRecommendedTamil && scheme.whyRecommendedTamil[rIdx]
                          ? scheme.whyRecommendedTamil[rIdx]
                          : tText(reason);
                        return (
                          <div
                            key={rIdx}
                            className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-slate-700 font-medium">
                              {language === "ta" ? tamilText : reason}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Required Documents List */}
                {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 && (
                  <div className="mb-4 text-xs">
                    <span className="text-slate-500 font-semibold block mb-1">
                      {language === "ta" ? "தேவையான சரிபார்ப்பு ஆவணங்கள்:" : "Required Verification Documents:"}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {parseRequiredDocuments(scheme.requiredDocuments).map((doc, dIdx) => (
                        <span
                          key={dIdx}
                          className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-[11px] border border-slate-200 font-medium"
                        >
                          {tTerm(doc)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Action Bar */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    to={`/schemes/${scheme.schemeId}`}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
                  >
                    <span>
                      {language === "ta"
                        ? "முழு திட்ட வழிகாட்டுதல்கள் மற்றும் விதிகளைப் பார்க்க"
                        : "View Complete Scheme Guidelines & Rules"}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-3">
                    {scheme.officialWebsite && (
                      <a
                        href={scheme.officialWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-lg font-medium transition"
                      >
                        <span>{language === "ta" ? "அதிகாரப்பூர்வ தளம்" : "Official Portal"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {isEligible && (
                      <button
                        onClick={() => setApplyingScheme(scheme)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <span>{language === "ta" ? "ஆன்லைனில் விண்ணப்பிக்க" : "Apply Online"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls (10 schemes per page) */}
          {filtered.length > itemsPerPage && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mt-6">
              <span className="text-slate-600 font-medium">
                {language === "ta" ? (
                  <>
                    மதிப்பிடப்பட்ட <strong className="text-slate-900">{filtered.length}</strong> திட்டங்களில்{" "}
                    <strong className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</strong> முதல்{" "}
                    <strong className="text-slate-900">{Math.min(currentPage * itemsPerPage, filtered.length)}</strong> வரை காட்டப்படுகிறது
                  </>
                ) : (
                  <>
                    Showing <strong className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                    <strong className="text-slate-900">{Math.min(currentPage * itemsPerPage, filtered.length)}</strong> of{" "}
                    <strong className="text-slate-900">{filtered.length}</strong> evaluated schemes
                  </>
                )}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 350, behavior: "smooth" });
                  }}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{language === "ta" ? "முந்தைய" : "Previous"}</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .map((pageNum, index, arr) => {
                    const prev = arr[index - 1];
                    const showEllipsis = prev && pageNum - prev > 1;
                    return (
                      <React.Fragment key={pageNum}>
                        {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                        <button
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 350, behavior: "smooth" });
                          }}
                          className={`w-8 h-8 rounded-lg font-bold text-xs transition ${
                            currentPage === pageNum
                              ? "bg-emerald-700 text-white shadow-xs"
                              : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 350, behavior: "smooth" });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 transition"
                >
                  <span>{language === "ta" ? "அடுத்தது" : "Next"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row items-start">
      {isAuthenticated && <Sidebar type={isAdmin ? "ADMIN" : "FARMER"} />}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {content}
      </main>

      <ApplySchemeModal
        isOpen={Boolean(applyingScheme)}
        onClose={() => setApplyingScheme(null)}
        scheme={applyingScheme}
      />
    </div>
  );
};

export default RecommendationsPage;
