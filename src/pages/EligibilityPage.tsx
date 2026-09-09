import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import {
  FactCheck as CheckIcon,
  Agriculture as AgriIcon,
  Person as PersonIcon,
  AccountBalanceWallet as MoneyIcon,
  Groups as GroupIcon,
  CheckCircle as VerifyIcon,
  Psychology as AIIcon,
  HelpOutlined as HelpIcon
} from "@mui/icons-material";

const TN_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
  "Vellore", "Viluppuram", "Virudhunagar"
];

const CROPS = [
  "Paddy", "Sugarcane", "Banana", "Coconut", "Cotton", "Millets",
  "Pulses", "Vegetables", "Flowers", "Groundnut", "Spices", "Oilseeds"
];

export const EligibilityPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    age: user?.age || 42,
    gender: user?.gender || "Male",
    district: user?.district || "Thanjavur",
    state: "Tamil Nadu",
    farmerStatus: user?.farmerStatus || "Owner",
    landOwnership: user?.landOwnership || "Owned",
    landSize: user?.landSize !== undefined ? user.landSize : 3.5,
    landType: user?.landType || "Wet Land (Nanjai)",
    cropType: user?.cropType || "Paddy",
    farmingType: user?.farmingType || "Conventional",
    irrigationType: user?.irrigationType || "Canal",
    farmerType: user?.farmerType || "Small",
    annualIncome: user?.annualIncome || 120000,
    socialCategory: user?.socialCategory || "MBC",
    livestockOwnership: user?.livestockOwnership || false,
    horticultureActivity: user?.horticultureActivity || false,
    machineryOwnership: user?.machineryOwnership || false,
    declaration: true
  });

  // Pre-populate if user logs in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        age: user.age || prev.age,
        gender: user.gender || prev.gender,
        district: user.district || prev.district,
        landSize: user.landSize !== undefined ? user.landSize : prev.landSize,
        cropType: user.cropType || prev.cropType,
        farmerType: user.farmerType || prev.farmerType,
        annualIncome: user.annualIncome || prev.annualIncome,
        socialCategory: user.socialCategory || prev.socialCategory
      }));
    }
  }, [user]);

  // Handle auto-classification of farmer type based on land size
  const handleLandSizeChange = (size: number) => {
    let calculatedType: "Marginal" | "Small" | "Medium" | "Large" = "Small";
    if (size <= 2.5) {
      calculatedType = "Marginal";
    } else if (size <= 5.0) {
      calculatedType = "Small";
    } else if (size <= 10.0) {
      calculatedType = "Medium";
    } else {
      calculatedType = "Large";
    }
    setFormData((prev) => ({
      ...prev,
      landSize: size,
      farmerType: calculatedType
    }));
  };

  // Quick Preset Profiles for seamless instant testing
  const loadPreset = (presetName: string) => {
    if (presetName === "paddy") {
      setFormData({
        fullName: "Muthuvel K",
        age: 45,
        gender: "Male",
        district: "Thanjavur",
        state: "Tamil Nadu",
        farmerStatus: "Owner",
        landOwnership: "Owned",
        landSize: 3.0,
        landType: "Wet Land (Nanjai)",
        cropType: "Paddy",
        farmingType: "Conventional",
        irrigationType: "Canal",
        farmerType: "Small",
        annualIncome: 140000,
        socialCategory: "MBC",
        livestockOwnership: true,
        horticultureActivity: false,
        machineryOwnership: false,
        declaration: true
      });
    } else if (presetName === "horticulture") {
      setFormData({
        fullName: "Kavitha Selvam",
        age: 38,
        gender: "Female",
        district: "Dindigul",
        state: "Tamil Nadu",
        farmerStatus: "Owner",
        landOwnership: "Owned",
        landSize: 1.8,
        landType: "Garden Land (Thottam)",
        cropType: "Vegetables",
        farmingType: "Organic",
        irrigationType: "Drip / Sprinkler",
        farmerType: "Marginal",
        annualIncome: 95000,
        socialCategory: "OBC",
        livestockOwnership: true,
        horticultureActivity: true,
        machineryOwnership: false,
        declaration: true
      });
    } else if (presetName === "dryland") {
      setFormData({
        fullName: "Arumugam P",
        age: 52,
        gender: "Male",
        district: "Ramanathapuram",
        state: "Tamil Nadu",
        farmerStatus: "Owner",
        landOwnership: "Owned",
        landSize: 4.5,
        landType: "Dry Land (Punjai)",
        cropType: "Pulses",
        farmingType: "Conventional",
        irrigationType: "Rainfed",
        farmerType: "Small",
        annualIncome: 80000,
        socialCategory: "SC",
        livestockOwnership: false,
        horticultureActivity: false,
        machineryOwnership: false,
        declaration: true
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.declaration) {
      setError("Please check the declaration box to proceed.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.getRecommendations(formData);
      if (res.data.success) {
        // Save results to session storage for seamless reload and view
        sessionStorage.setItem("last_recommendations", JSON.stringify(res.data.data));
        navigate("/recommendations");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate scheme recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex items-center gap-3 mb-2">
            <AIIcon className="text-[#2E7D32]" style={{ fontSize: 32 }} />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#003366]">
              {language === "ta" ? "விவசாயி தகுதி சரிபார்த்தல் & AI பரிந்துரை" : "Scheme Eligibility Assessment"}
            </h1>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {language === "ta"
              ? "உங்கள் விவசாய நிலம், பயிர், மாவட்டம் மற்றும் வருமான விவரங்களை உள்ளிட்டு, தமிழ்நாடு மற்றும் மத்திய அரசின் தகுதியான நலத்திட்டங்களை உடனடியாக அறியுங்கள்."
              : "Enter your farming profile below. Our two-stage eligibility engine applies official government conditions and Scikit-learn Random Forest model ranking to match relevant schemes."}
          </p>

          {/* Quick Preset Buttons */}
          <div className="mt-5 pt-4 border-t border-neutral-200">
            <span className="text-xs font-bold text-neutral-700 block mb-2">
              Quick Demo Fill:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadPreset("paddy")}
                className="bg-blue-50 hover:bg-blue-100 text-[#003366] border border-blue-200 px-3 py-1 rounded text-xs font-medium cursor-pointer transition"
              >
                Paddy Farmer (Thanjavur, 3 Ac)
              </button>
              <button
                type="button"
                onClick={() => loadPreset("horticulture")}
                className="bg-green-50 hover:bg-green-100 text-[#2E7D32] border border-green-200 px-3 py-1 rounded text-xs font-medium cursor-pointer transition"
              >
                Horticulture (Dindigul, 1.8 Ac)
              </button>
              <button
                type="button"
                onClick={() => loadPreset("dryland")}
                className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1 rounded text-xs font-medium cursor-pointer transition"
              >
                Dryland Pulses (Ramnad, 4.5 Ac)
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded text-sm mb-6">
            {error}
          </div>
        )}

        {/* Multi-Section Eligibility Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal Information */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-[#003366] mb-4 flex items-center gap-2 border-b border-neutral-200 pb-2">
              <PersonIcon fontSize="small" />
              <span>1. {t("personalInfo")}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  {t("fullName")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Farmer name as per Aadhaar"
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  min={18}
                  max={95}
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  {t("district")} *
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  {TN_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  State
                </label>
                <input
                  type="text"
                  disabled
                  value="Tamil Nadu"
                  className="w-full border border-neutral-200 rounded px-3 py-2 text-sm bg-neutral-100 text-neutral-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Agricultural Information */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-[#003366] mb-4 flex items-center gap-2 border-b border-neutral-200 pb-2">
              <AgriIcon fontSize="small" />
              <span>2. {t("agriInfo")}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  Farmer Status *
                </label>
                <select
                  value={formData.farmerStatus}
                  onChange={(e) => setFormData({ ...formData, farmerStatus: e.target.value as any })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="Owner">Land Owner (பட்டா நில உரிமையாளர்)</option>
                  <option value="Tenant">Tenant Cultivator (குத்தகை உழவர்)</option>
                  <option value="Sharecropper">Sharecropper (வாரம் சாகுபடியாளர்)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  Land Ownership Type *
                </label>
                <select
                  value={formData.landOwnership}
                  onChange={(e) => setFormData({ ...formData, landOwnership: e.target.value as any })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="Owned">Solely Owned</option>
                  <option value="Shared">Joint / Family Patta</option>
                  <option value="Leased">Registered Lease</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  {t("landSize")} *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  required
                  value={formData.landSize}
                  onChange={(e) => handleLandSizeChange(Number(e.target.value))}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                />
                <span className="text-[11px] text-neutral-500 mt-0.5 block">
                  Category: <strong className="text-[#003366]">{formData.farmerType} Farmer</strong>
                </span>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  Land Classification *
                </label>
                <select
                  value={formData.landType}
                  onChange={(e) => setFormData({ ...formData, landType: e.target.value })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="Wet Land (Nanjai)">Wet Land (நஞ்சை)</option>
                  <option value="Dry Land (Punjai)">Dry Land (புஞ்சை)</option>
                  <option value="Garden Land (Thottam)">Garden Land (தோட்டம்)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  {t("cropType")} *
                </label>
                <select
                  value={formData.cropType}
                  onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  {CROPS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  {t("farmingType")} *
                </label>
                <select
                  value={formData.farmingType}
                  onChange={(e) => setFormData({ ...formData, farmingType: e.target.value })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="Conventional">Conventional / Chemical</option>
                  <option value="Organic">Certified Organic Farming</option>
                  <option value="Natural">ZBNF / Natural Farming</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  {t("irrigationType")} *
                </label>
                <select
                  value={formData.irrigationType}
                  onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="Canal">Canal Irrigation (கால்வாய்)</option>
                  <option value="Well / Borewell">Open Well / Borewell (கிணறு)</option>
                  <option value="Drip / Sprinkler">Micro Irrigation (சொட்டு நீர்)</option>
                  <option value="Rainfed">Rainfed / Monsoon (மானாவாரி)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3 & 4: Financial & Social Category */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-[#003366] mb-4 flex items-center gap-2 border-b border-neutral-200 pb-2">
              <MoneyIcon fontSize="small" />
              <span>3. Financial & Social Category</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  {t("annualIncome")} *
                </label>
                <input
                  type="number"
                  min="0"
                  max="10000000"
                  step="5000"
                  required
                  value={formData.annualIncome}
                  onChange={(e) => setFormData({ ...formData, annualIncome: Number(e.target.value) })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                />
                <span className="text-[11px] text-neutral-500 mt-0.5 block">
                  Family annual income from all sources
                </span>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  {t("socialCategory")} *
                </label>
                <select
                  value={formData.socialCategory}
                  onChange={(e) => setFormData({ ...formData, socialCategory: e.target.value as any })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="MBC">MBC / DNC</option>
                  <option value="OBC">BC / OBC</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="General">General / OC</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Additional Agricultural Details */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-[#003366] mb-4 flex items-center gap-2 border-b border-neutral-200 pb-2">
              <VerifyIcon fontSize="small" />
              <span>4. {t("additionalAgriInfo")}</span>
            </h2>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 p-2 rounded hover:bg-neutral-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.livestockOwnership}
                  onChange={(e) => setFormData({ ...formData, livestockOwnership: e.target.checked })}
                  className="w-4 h-4 rounded text-[#003366]"
                />
                <span className="text-neutral-800 font-medium">
                  {t("livestockQuestion")} (Cows, Buffaloes, Goats, Sheep, Poultry)
                </span>
              </label>

              <label className="flex items-center gap-3 p-2 rounded hover:bg-neutral-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.horticultureActivity}
                  onChange={(e) => setFormData({ ...formData, horticultureActivity: e.target.checked })}
                  className="w-4 h-4 rounded text-[#003366]"
                />
                <span className="text-neutral-800 font-medium">
                  {t("horticultureQuestion")} (Coconut, Banana, Mango, Spices, Flowers, Veggies)
                </span>
              </label>

              <label className="flex items-center gap-3 p-2 rounded hover:bg-neutral-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.machineryOwnership}
                  onChange={(e) => setFormData({ ...formData, machineryOwnership: e.target.checked })}
                  className="w-4 h-4 rounded text-[#003366]"
                />
                <span className="text-neutral-800 font-medium">
                  {t("machineryQuestion")} (Tractor, Power Tiller, Transplanter, Harvester)
                </span>
              </label>
            </div>
          </div>

          {/* Section 6: Declaration & Submit */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs">
            <label className="flex items-start gap-3 cursor-pointer text-xs mb-6">
              <input
                type="checkbox"
                required
                checked={formData.declaration}
                onChange={(e) => setFormData({ ...formData, declaration: e.target.checked })}
                className="w-4 h-4 rounded text-[#003366] mt-0.5"
              />
              <span className="text-neutral-700 leading-relaxed font-medium">
                {t("declarationText")}
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2E7D32] hover:bg-green-800 text-white font-bold py-3.5 px-6 rounded text-base shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Evaluating Government Schemes via AI...</span>
                </>
              ) : (
                <>
                  <AIIcon />
                  <span>{t("submitEligibility")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
