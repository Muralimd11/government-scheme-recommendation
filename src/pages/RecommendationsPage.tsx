import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import { RecommendationResult } from "../types";
import {
  Psychology as AIIcon,
  Verified as VerifiedIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  Tune as TuneIcon,
  Refresh as RefreshIcon,
  Description as DocIcon
} from "@mui/icons-material";

export const RecommendationsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [govFilter, setGovFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"match" | "name">("match");

  useEffect(() => {
    // 1. Try to load from session storage
    const stored = sessionStorage.getItem("last_recommendations");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecommendations(parsed.recommendations || []);
        setFarmerProfile(parsed.farmerProfile || null);
        return;
      } catch (e) {
        // Fallback
      }
    }

    // 2. If user is authenticated, fetch recommendations using their saved profile
    if (isAuthenticated) {
      setLoading(true);
      api.getRecommendations({})
        .then((res) => {
          if (res.data.success) {
            setRecommendations(res.data.data.recommendations || []);
            setFarmerProfile(res.data.data.farmerProfile || null);
          }
        })
        .catch((err) => {
          setError(err.message || "Failed to load recommendations.");
        })
        .finally(() => setLoading(false));
    } else {
      // If not authenticated and no session, redirect to eligibility form
      navigate("/eligibility");
    }
  }, [isAuthenticated, navigate]);

  const filtered = recommendations
    .filter((r) => {
      if (govFilter === "All") return true;
      return r.governmentLevel === govFilter;
    })
    .sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore;
      return a.schemeName.localeCompare(b.schemeName);
    });

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Summary Banner */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AIIcon className="text-[#2E7D32]" />
                <h1 className="text-2xl font-bold text-[#003366]">
                  {language === "ta"
                    ? "விவசாயிகளுக்கான தனிப்பயனாக்கப்பட்ட அரசு நலத்திட்ட பரிந்துரைகள்"
                    : "AI Scheme Recommendations"}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600">
                {language === "ta"
                  ? `${recommendations.length} அரசு நலத்திட்டங்கள் உங்கள் சுயவிவரத்தின் அடிப்படையில் தகுதி பெற்றுள்ளன.`
                  : `Found ${recommendations.length} eligible government welfare schemes ranked by AI match score.`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/eligibility")}
                className="flex items-center gap-1.5 px-4 py-2 border border-[#003366] text-[#003366] rounded text-xs font-semibold hover:bg-blue-50 transition cursor-pointer"
              >
                <TuneIcon fontSize="small" />
                <span>Edit Farming Profile</span>
              </button>
            </div>
          </div>

          {/* Profile Quick Snapshot */}
          {farmerProfile && (
            <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
              <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-neutral-500 block">District</span>
                <strong className="text-neutral-900">{farmerProfile.district || "TN"}</strong>
              </div>
              <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-neutral-500 block">Land Size</span>
                <strong className="text-neutral-900">{farmerProfile.landSize} Acres</strong>
              </div>
              <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-neutral-500 block">Crop</span>
                <strong className="text-neutral-900">{farmerProfile.cropType}</strong>
              </div>
              <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-neutral-500 block">Category</span>
                <strong className="text-[#003366]">{farmerProfile.farmerType} Farmer</strong>
              </div>
              <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-neutral-500 block">Irrigation</span>
                <strong className="text-neutral-900">{farmerProfile.irrigationType}</strong>
              </div>
              <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-neutral-500 block">Social Group</span>
                <strong className="text-neutral-900">{farmerProfile.socialCategory}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3 rounded-lg border border-neutral-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700">Filter Level:</span>
            {["All", "Tamil Nadu Government", "Central Government"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setGovFilter(lvl)}
                className={`px-3 py-1 rounded transition cursor-pointer ${
                  govFilter === lvl
                    ? "bg-[#003366] text-white font-semibold"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-neutral-300 rounded px-2 py-1 bg-white text-neutral-800"
            >
              <option value="match">Highest Match Score</option>
              <option value="name">Scheme Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Recommendations Cards List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#003366] border-t-transparent mb-3" />
            <p className="text-sm text-neutral-600">Running AI Eligibility Evaluation...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded text-center">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded p-8 text-center text-neutral-600">
            <p className="text-base font-semibold">No schemes match the selected level filter.</p>
            <button
              onClick={() => setGovFilter("All")}
              className="mt-3 px-4 py-1.5 bg-[#003366] text-white rounded text-xs"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((scheme, idx) => (
              <div
                key={scheme.schemeId || idx}
                className="bg-white rounded-lg border border-neutral-200 shadow-xs hover:border-[#003366] transition overflow-hidden"
              >
                <div className="p-6">
                  {/* Top Row: Match Score + Govt Level */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {/* Match Score Badge */}
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-900 border border-green-300 px-3 py-1 rounded-full text-xs font-bold">
                        <VerifiedIcon style={{ fontSize: 16 }} className="text-green-700" />
                        <span>{scheme.matchScore}% Match</span>
                      </span>

                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                          scheme.governmentLevel === "Tamil Nadu Government"
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-blue-50 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {scheme.governmentLevel}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-neutral-500">
                      Code: {scheme.schemeId}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-[#003366] mb-1">
                    {language === "ta" && scheme.schemeNameTamil ? scheme.schemeNameTamil : scheme.schemeName}
                  </h2>
                  {language === "en" && scheme.schemeNameTamil && (
                    <p className="text-xs text-neutral-500 mb-2">{scheme.schemeNameTamil}</p>
                  )}

                  <p className="text-xs text-neutral-600 mb-4 font-medium">
                    Department: {scheme.department}
                  </p>

                  {/* Benefits Box */}
                  <div className="bg-green-50/60 border border-green-200 rounded p-3 mb-4">
                    <p className="text-xs text-neutral-800 leading-relaxed font-medium">
                      <strong className="text-[#2E7D32]">Scheme Benefits: </strong>
                      {scheme.benefits}
                    </p>
                  </div>

                  {/* Transparent Why Recommended Breakdown */}
                  <div className="mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2 flex items-center gap-1.5">
                      <CheckIcon style={{ fontSize: 16 }} className="text-[#2E7D32]" />
                      <span>{t("whyRecommended")} (Eligibility Breakdown):</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {scheme.whyRecommended.map((reason, rIdx) => (
                        <div
                          key={rIdx}
                          className="flex items-start gap-2 p-2 bg-neutral-50 rounded border border-neutral-200"
                        >
                          <CheckIcon style={{ fontSize: 14 }} className="text-green-600 shrink-0 mt-0.5" />
                          <span className="text-neutral-700">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Required Documents Chips */}
                  {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 && (
                    <div className="mb-4 text-xs">
                      <span className="text-neutral-500 block mb-1 font-semibold">Required Documents:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {scheme.requiredDocuments.map((doc, dIdx) => (
                          <span
                            key={dIdx}
                            className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[11px] border border-neutral-200"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                    <Link
                      to={`/schemes/${scheme.schemeId}`}
                      className="text-xs font-bold text-[#003366] hover:underline"
                    >
                      {t("viewDetails")}
                    </Link>

                    <div className="flex items-center gap-3">
                      {scheme.officialWebsite && (
                        <a
                          href={scheme.officialWebsite}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-neutral-600 hover:text-neutral-900"
                        >
                          Official Portal
                        </a>
                      )}
                      <Link
                        to={`/farmer/applications/new?schemeId=${scheme.schemeId}`}
                        className="bg-[#2E7D32] hover:bg-green-800 text-white font-bold px-5 py-2 rounded text-xs shadow-sm transition flex items-center gap-1.5"
                      >
                        <span>{t("applyNow")}</span>
                        <ArrowIcon style={{ fontSize: 14 }} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
