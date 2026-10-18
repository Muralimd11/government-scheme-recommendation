import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import { Sidebar } from "../components/common/Sidebar";
import { ApplySchemeModal } from "../components/common/ApplySchemeModal";
import { ALL_TN_DISTRICTS } from "../data/tamilNaduLocations";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  SlidersHorizontal,
  Sparkles,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Building
} from "lucide-react";

export const EligibilityPage: React.FC = () => {
  const { user, isAuthenticated, isFarmer, isAdmin } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [applyingScheme, setApplyingScheme] = useState<any | null>(null);

  // If unauthenticated: Quick criteria inputs
  const [quickCriteria, setQuickCriteria] = useState({
    district: "Thanjavur",
    landSize: 2.5,
    cropType: "Paddy",
    socialCategory: "OBC",
    irrigationType: "Canal",
    annualIncome: 120000
  });

  // What-if simulation parameters (if logged in)
  const [simulatedParams, setSimulatedParams] = useState({
    dripInstalled: false,
    solarPumpRequired: true,
    horticultureCrop: "None",
    organicFarming: false,
    livestockAdded: false
  });

  const [simulatedResults, setSimulatedResults] = useState<any[]>([]);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluated, setEvaluated] = useState(false);

  // If user is authenticated, run evaluation using their real profile or simulation
  const runEvaluation = async (simulate = false) => {
    try {
      setEvaluating(true);
      const payload = isAuthenticated && user
        ? {
          ...user,
          ...(simulate
            ? {
              dripAvailable: simulatedParams.dripInstalled ? "Yes" : "No",
              solarPumpInterest: simulatedParams.solarPumpRequired,
              horticultureActivity: simulatedParams.horticultureCrop !== "None",
              horticultureType: simulatedParams.horticultureCrop,
              organicCertified: simulatedParams.organicFarming,
              livestockOwnership: simulatedParams.livestockAdded
            }
            : {})
        }
        : {
          ...quickCriteria,
          landSize: Number(quickCriteria.landSize) || 0,
          annualIncome: Number(quickCriteria.annualIncome) || 0,
          farmerType: (Number(quickCriteria.landSize) || 0) <= 2.5 ? "Marginal" : (Number(quickCriteria.landSize) || 0) <= 5 ? "Small" : "Medium"
        };

      const res = await api.getRecommendations(payload);
      if (res.data?.success) {
        setSimulatedResults(res.data.data.recommendations || []);
        setEvaluated(true);
      }
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      runEvaluation(false);
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row items-start">
      {isAuthenticated && <Sidebar type={isAdmin ? "ADMIN" : "FARMER"} />}

      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto space-y-6 w-full">
        {/* Header Title */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full mb-2 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>STATUTORY SCHEME ELIGIBILITY AUDIT</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            {language === "ta" ? "அரசு நலத்திட்ட தகுதி சரிபார்ப்பு" : "Scheme Eligibility Audit & Simulator"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {language === "ta"
              ? "உங்கள் விவசாய அளவுருக்கள் மாநில மற்றும் மத்திய அரசு திட்டங்களின் அதிகாரப்பூர்வ விதிகளுடன் எவ்வாறு பொருந்துகின்றன என்பதை சரிபார்க்கவும்."
              : "Cross-reference farming parameters against official state and central eligibility guidelines."}
          </p>
        </div>

        {/* LOGGED-IN FARMER VIEW */}
        {isAuthenticated && user ? (
          <div className="space-y-6">
            {/* Active Verified Profile Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
                    {user.fullName ? user.fullName[0].toUpperCase() : "F"}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>{user.fullName || "Verified Farmer"}</span>
                      <span className="text-[11px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                        Active Profile
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Location: {user.village ? `${user.village}, ` : ""}{user.block ? `${user.block}, ` : ""}{user.district || "TN"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/farmer/profile"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{language === "ta" ? "சுயவிவரம் திருத்து" : "Edit 15-Point Profile"}</span>
                  </Link>
                  <Link
                    to="/recommendations"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                  >
                    <span>{language === "ta" ? "பரிந்துரைகள் பட்டியல்" : "View Recommendations"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Snapshot of Verified Profile */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Cultivable Land</span>
                  <strong className="text-slate-900 block font-semibold">
                    {user.cultivableArea ?? user.landSize ?? 2.5} Acres
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Primary Crop</span>
                  <strong className="text-slate-900 block font-semibold">{user.cropType || "Paddy"}</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Irrigation Source</span>
                  <strong className="text-slate-900 block font-semibold">{user.irrigationType || "Canal"}</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Farmer Category</span>
                  <strong className="text-emerald-800 block font-bold">
                    {user.farmerType || (Number(user.landSize || 2.5) <= 2.5 ? "Marginal" : Number(user.landSize || 2.5) <= 5 ? "Small" : "Medium/Large")}
                  </strong>
                </div>
              </div>
            </div>

            {/* WHAT-IF SIMULATOR (Adds Distinct Value to Eligibility Checker) */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    {language === "ta" ? "திட்ட தகுதி உருவகப்படுத்துதல் (What-If Simulator)" : "Simulate Farm Adjustments (What-If Analysis)"}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500">
                  Does not alter your permanent saved registration
                </span>
              </div>

              <p className="text-xs text-slate-600 mb-4">
                Explore how adopting new agricultural practices, micro-irrigation, or allied livestock would unlock additional high-subsidy government schemes:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-xs">
                <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulatedParams.dripInstalled}
                    onChange={(e) => setSimulatedParams({ ...simulatedParams, dripInstalled: e.target.checked })}
                    className="rounded text-emerald-700 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Install Micro-Irrigation (Drip / Sprinkler)</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulatedParams.organicFarming}
                    onChange={(e) => setSimulatedParams({ ...simulatedParams, organicFarming: e.target.checked })}
                    className="rounded text-emerald-700 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Adopt Certified Organic Farming</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulatedParams.livestockAdded}
                    onChange={(e) => setSimulatedParams({ ...simulatedParams, livestockAdded: e.target.checked })}
                    className="rounded text-emerald-700 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Add Dairy / Livestock Component</span>
                </label>
              </div>

              <button
                type="button"
                onClick={() => runEvaluation(true)}
                disabled={evaluating}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? "animate-spin" : ""}`} />
                <span>{evaluating ? "Simulating Scheme Rules..." : "Re-Calculate Simulated Eligibility"}</span>
              </button>
            </div>

            {/* Results Display */}
            {evaluated && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Eligibility Audit Results ({simulatedResults.filter((s) => s.isEligible !== false).length} Eligible Schemes)
                  </h3>
                  <Link
                    to="/recommendations"
                    className="text-xs font-bold text-emerald-800 hover:underline"
                  >
                    Open Recommendations Workspace →
                  </Link>
                </div>

                <div className="space-y-3">
                  {simulatedResults.map((scheme, idx) => {
                    const isEligible = scheme.isEligible !== false;
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${isEligible
                            ? "border-slate-200 bg-white"
                            : "border-amber-200 bg-amber-50/20"
                          }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {isEligible ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{scheme.matchScore}% Match • Eligible</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-800 font-bold">
                                <XCircle className="w-4 h-4 text-amber-700" />
                                <span>Ineligible</span>
                              </span>
                            )}
                            <span className="text-slate-500">[{scheme.schemeId}]</span>
                            <span className="text-slate-700 font-medium">{scheme.governmentLevel}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{scheme.schemeName}</h4>
                          <p className="text-slate-600 line-clamp-1">{scheme.benefits}</p>
                          {!isEligible && scheme.ineligibleReason && (
                            <p className="text-amber-900 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-1">
                              Reason: {scheme.ineligibleReason}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <Link
                            to={`/schemes/${scheme.schemeId}`}
                            className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            Guidelines
                          </Link>
                          {isEligible && (
                            <button
                              onClick={() => setApplyingScheme(scheme)}
                              className="px-3 py-1.5 bg-emerald-700 text-white rounded-md font-semibold hover:bg-emerald-800 cursor-pointer"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* GUEST / UNREGISTERED QUICK CHECKER */
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                {language === "ta" ? "விரைவு தகுதி கணக்கீடு (பதிவு தேவையில்லை)" : "Quick Scheme Eligibility Calculator (No Login Required)"}
              </h2>
              <p className="text-xs text-slate-600">
                Enter primary parameters below to preview matched schemes. To lock in permanent benefits and submit applications, create your official farmer profile.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">District</label>
                <select
                  value={quickCriteria.district}
                  onChange={(e) => setQuickCriteria({ ...quickCriteria, district: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  {ALL_TN_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cultivable Land (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={quickCriteria.landSize ?? ""}
                  onChange={(e) => setQuickCriteria({ ...quickCriteria, landSize: e.target.value === "" ? ("" as any) : Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Crop</label>
                <select
                  value={quickCriteria.cropType}
                  onChange={(e) => setQuickCriteria({ ...quickCriteria, cropType: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  <option value="Paddy">Paddy (நெல்)</option>
                  <option value="Sugarcane">Sugarcane (கரும்பு)</option>
                  <option value="Millets">Millets (சிறு தானியங்கள்)</option>
                  <option value="Pulses">Pulses (பருப்பு வகைகள்)</option>
                  <option value="Banana">Banana (வாழை)</option>
                  <option value="Coconut">Coconut (தென்னை)</option>
                  <option value="Cotton">Cotton (பருத்தி)</option>
                  <option value="Groundnut">Groundnut (நிலக்கடலை)</option>
                  <option value="Vegetables">Vegetables (காய்கறிகள்)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Social Category</label>
                <select
                  value={quickCriteria.socialCategory}
                  onChange={(e) => setQuickCriteria({ ...quickCriteria, socialCategory: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  <option value="OBC">BC / OBC</option>
                  <option value="MBC">MBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="General">General / OC</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Irrigation Source</label>
                <select
                  value={quickCriteria.irrigationType}
                  onChange={(e) => setQuickCriteria({ ...quickCriteria, irrigationType: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  <option value="Canal">Canal (வாய்க்கால்)</option>
                  <option value="Borewell">Borewell (ஆழ்துளை கிணறு)</option>
                  <option value="Open Well">Open Well (திறந்தவெளி கிணறு)</option>
                  <option value="Rainfed">Rainfed (மானாவாரி)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Annual Income (₹)</label>
                <input
                  type="number"
                  step="5000"
                  value={quickCriteria.annualIncome ?? ""}
                  onChange={(e) => setQuickCriteria({ ...quickCriteria, annualIncome: e.target.value === "" ? ("" as any) : Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => runEvaluation(false)}
                disabled={evaluating}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                {evaluating ? "Evaluating..." : "Check Eligible Schemes"}
              </button>

              <Link
                to="/register"
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
              >
                <span>Register for Permanent Farmer ID & Online Subsidies</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Guest Results */}
            {evaluated && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Preliminary Evaluation Matches ({simulatedResults.filter((s) => s.isEligible !== false).length} Eligible Schemes)
                </h3>
                <div className="space-y-3">
                  {simulatedResults.slice(0, 5).map((scheme, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs">
                      <div>
                        <strong className="text-slate-900 block">{scheme.schemeName}</strong>
                        <span className="text-slate-500">{scheme.department} • {scheme.matchScore}% Match</span>
                      </div>
                      <button
                        onClick={() => setApplyingScheme(scheme)}
                        className="px-3 py-1 bg-emerald-700 text-white rounded text-[11px] font-semibold hover:bg-emerald-800 shrink-0 cursor-pointer"
                      >
                        Apply Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <ApplySchemeModal
        isOpen={Boolean(applyingScheme)}
        onClose={() => setApplyingScheme(null)}
        scheme={applyingScheme}
      />
    </div>
  );
};

export default EligibilityPage;
