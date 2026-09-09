import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { api } from "../../services/api";
import { Sidebar } from "../../components/common/Sidebar";
import { Save as SaveIcon, CheckCircle as CheckIcon } from "@mui/icons-material";

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

export const FarmerProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    district: user?.district || "Thanjavur",
    age: user?.age || 45,
    gender: user?.gender || "Male",
    farmerStatus: user?.farmerStatus || "Owner",
    landOwnership: user?.landOwnership || "Owned",
    landSize: user?.landSize || 3.0,
    landType: user?.landType || "Wet Land (Nanjai)",
    cropType: user?.cropType || "Paddy",
    farmingType: user?.farmingType || "Conventional",
    irrigationType: user?.irrigationType || "Canal",
    farmerType: user?.farmerType || "Small",
    annualIncome: user?.annualIncome || 120000,
    socialCategory: user?.socialCategory || "MBC",
    livestockOwnership: user?.livestockOwnership || false,
    horticultureActivity: user?.horticultureActivity || false,
    machineryOwnership: user?.machineryOwnership || false
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);
      const res = await api.updateFarmerProfile(formData);
      if (res.data.success) {
        updateUser(res.data.data.farmer);
        setSuccessMsg("Farmer profile updated successfully.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen flex flex-col md:flex-row">
      <Sidebar type="FARMER" />

      <main className="flex-1 p-4 md:p-8 max-w-4xl">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6">
          <h1 className="text-2xl font-bold text-[#003366]">
            {language === "ta" ? "விவசாயி சுயவிவர மேலாண்மை" : "Farmer Profile Management"}
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            Keep your agricultural holding and demographic information updated to receive precise scheme matches.
          </p>
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded text-xs mb-4 flex items-center gap-2">
            <CheckIcon style={{ fontSize: 16 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs">
            <h2 className="text-sm font-bold text-[#003366] uppercase tracking-wider mb-4 border-b border-neutral-200 pb-2">
              1. Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Age</label>
                <input
                  type="number"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Gender</label>
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
                <label className="block font-semibold text-neutral-700 mb-1">District</label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  {TN_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Social Category</label>
                <select
                  value={formData.socialCategory}
                  onChange={(e) => setFormData({ ...formData, socialCategory: e.target.value as any })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="MBC">MBC / DNC</option>
                  <option value="OBC">OBC / BC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
          </div>

          {/* Farm Details */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs">
            <h2 className="text-sm font-bold text-[#003366] uppercase tracking-wider mb-4 border-b border-neutral-200 pb-2">
              2. Agricultural Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Land Size (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.landSize}
                  onChange={(e) => {
                    const size = Number(e.target.value);
                    const fType = size <= 2.5 ? "Marginal" : size <= 5.0 ? "Small" : size <= 10.0 ? "Medium" : "Large";
                    setFormData({ ...formData, landSize: size, farmerType: fType });
                  }}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Farmer Type</label>
                <input
                  type="text"
                  disabled
                  value={`${formData.farmerType} Farmer`}
                  className="w-full border border-neutral-200 rounded px-3 py-2 text-sm bg-neutral-100 text-neutral-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Primary Crop</label>
                <select
                  value={formData.cropType}
                  onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  {CROPS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Farming Type</label>
                <select
                  value={formData.farmingType}
                  onChange={(e) => setFormData({ ...formData, farmingType: e.target.value })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="Conventional">Conventional</option>
                  <option value="Organic">Organic</option>
                  <option value="Natural">Natural / ZBNF</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Irrigation Source</label>
                <select
                  value={formData.irrigationType}
                  onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="Canal">Canal</option>
                  <option value="Well / Borewell">Well / Borewell</option>
                  <option value="Drip / Sprinkler">Drip / Sprinkler</option>
                  <option value="Rainfed">Rainfed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Annual Income (₹)</label>
                <input
                  type="number"
                  step="5000"
                  required
                  value={formData.annualIncome}
                  onChange={(e) => setFormData({ ...formData, annualIncome: Number(e.target.value) })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003366]"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-200 space-y-2 text-xs">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.livestockOwnership}
                  onChange={(e) => setFormData({ ...formData, livestockOwnership: e.target.checked })}
                  className="w-4 h-4 text-[#003366]"
                />
                <span>Owns dairy livestock (Cows / Buffaloes / Sheep)</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.horticultureActivity}
                  onChange={(e) => setFormData({ ...formData, horticultureActivity: e.target.checked })}
                  className="w-4 h-4 text-[#003366]"
                />
                <span>Engaged in horticultural cultivation (Fruits / Veg / Spices)</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.machineryOwnership}
                  onChange={(e) => setFormData({ ...formData, machineryOwnership: e.target.checked })}
                  className="w-4 h-4 text-[#003366]"
                />
                <span>Owns tractors or agricultural machinery</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#003366] hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded text-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <SaveIcon fontSize="small" />
            <span>{loading ? "Saving Profile..." : "Save Profile Changes"}</span>
          </button>
        </form>
      </main>
    </div>
  );
};
