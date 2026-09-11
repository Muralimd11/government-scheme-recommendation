import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import { TamilNaduEmblem } from "../components/common/Emblem";
import {
  ALL_TN_DISTRICTS,
  getBlocksForDistrict,
  getVillagesForBlock
} from "../data/tamilNaduLocations";
import { HowToReg as RegisterIcon, Lock as LockIcon } from "@mui/icons-material";

const CROPS = [
  "Paddy", "Sugarcane", "Banana", "Coconut", "Cotton", "Millets",
  "Pulses", "Vegetables", "Flowers", "Groundnut", "Spices", "Oilseeds"
];

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    age: 45,
    gender: "Male",
    socialCategory: "MBC",
    password: "",
    confirmPassword: "",
    preferredLanguage: "en",
    district: "Thanjavur",
    block: "Thanjavur",
    village: "Vallam",
    farmerStatus: "Owner",
    landOwnership: "Owned",
    landSize: 2.5,
    cropType: "Paddy",
    annualIncome: 120000
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic blocks and villages for selected district
  const availableBlocks = useMemo(() => {
    return getBlocksForDistrict(formData.district);
  }, [formData.district]);

  const availableVillages = useMemo(() => {
    return getVillagesForBlock(formData.district, formData.block);
  }, [formData.district, formData.block]);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    const blocks = getBlocksForDistrict(newDistrict);
    const newBlock = blocks[0]?.name || `${newDistrict} Central`;
    const villages = getVillagesForBlock(newDistrict, newBlock);
    setFormData((prev) => ({
      ...prev,
      district: newDistrict,
      block: newBlock,
      village: villages[0] || "Gramam 1"
    }));
  };

  const handleBlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBlock = e.target.value;
    const villages = getVillagesForBlock(formData.district, newBlock);
    setFormData((prev) => ({
      ...prev,
      block: newBlock,
      village: villages[0] || "Gramam 1"
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.register({
        ...formData,
        role: "FARMER",
        age: Number(formData.age),
        landSize: Number(formData.landSize),
        annualIncome: Number(formData.annualIncome)
      });

      if (res.data.success) {
        const { token, user } = res.data.data;
        login(token, user);
        navigate("/farmer/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check the entered information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen py-10 px-4">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-lg border border-neutral-200 p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <TamilNaduEmblem size={52} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#003366]">
            {language === "ta" ? "விவசாயி புதிய கணக்கு பதிவு" : "Farmer Portal Registration"}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Government of Tamil Nadu • Agriculture & Farmers Welfare Department
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal & Identity Information */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <span className="font-bold text-xs uppercase tracking-wider text-[#003366]">
                1. {language === "ta" ? "தனிநபர் மற்றும் அடையாள விவரங்கள்" : "Personal & Identity Details"}
              </span>
              <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                <LockIcon style={{ fontSize: 13 }} />
                <span>Locked in Profile</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  {t("fullName")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="As printed on Aadhaar"
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  {t("mobileNumber")} *
                </label>
                <input
                  type="tel"
                  required
                  pattern="[6-9][0-9]{9}"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  {language === "ta" ? "வயது (ஆண்டுகள்)" : "Age (Years)"} *
                </label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  placeholder="e.g. 45"
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  {language === "ta" ? "பாலினம்" : "Gender"} *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="Male">Male (ஆண்)</option>
                  <option value="Female">Female (பெண்)</option>
                  <option value="Other">Other (இதர)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  {t("socialCategory")} *
                </label>
                <select
                  value={formData.socialCategory}
                  onChange={(e) => setFormData({ ...formData, socialCategory: e.target.value })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="MBC">MBC / DNC (மிகவும் பிற்படுத்தப்பட்டோர்)</option>
                  <option value="OBC">BC / OBC (பிற்படுத்தப்பட்டோர்)</option>
                  <option value="SC">SC (ஆதிதிராவிடர்)</option>
                  <option value="ST">ST (பழங்குடியினர்)</option>
                  <option value="General">General / OC</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  {t("emailAddress")} (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="farmer@example.com"
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Administrative Location Jurisdiction */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <span className="font-bold text-xs uppercase tracking-wider text-[#003366]">
                2. {language === "ta" ? "அரசு இருப்பிட எல்லை விவரங்கள்" : "Administrative Location Jurisdiction"}
              </span>
              <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                <LockIcon style={{ fontSize: 13 }} />
                <span>Locked in Profile</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  {t("district")} *
                </label>
                <select
                  value={formData.district}
                  onChange={handleDistrictChange}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366] font-medium"
                >
                  {ALL_TN_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  {language === "ta" ? "வட்டாரம் / தாலுகா" : "Block / Taluk"} *
                </label>
                <select
                  value={formData.block}
                  onChange={handleBlockChange}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366] font-medium"
                >
                  {availableBlocks.map((b) => (
                    <option key={b.id || b.name} value={b.name}>
                      {b.name} {b.nameTamil ? `(${b.nameTamil})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  {language === "ta" ? "வருவாய் கிராமம்" : "Revenue Village"} *
                </label>
                <select
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366] font-medium"
                >
                  {availableVillages.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {language === "ta"
                ? "இருப்பிடம் மற்றும் தாலுகா விபரங்கள் திட்ட தகுதி கணக்கீட்டிற்கு நிரந்தரமாக பதிவு செய்யப்படும்."
                : "Jurisdiction details are permanently bound to your registry account to compute district-level scheme quotas."}
            </p>
          </div>

          {/* Section 3: Farm Baseline */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="pb-2 mb-3 border-b border-slate-200">
              <span className="font-bold text-xs uppercase tracking-wider text-[#003366]">
                3. {language === "ta" ? "பண்ணை மற்றும் நில விவரங்கள்" : "Land & Agriculture Baseline"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  {t("landSize")} (Acres) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={formData.landSize}
                  onChange={(e) => setFormData({ ...formData, landSize: Number(e.target.value) })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
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
                <label className="block font-semibold text-neutral-700 mb-1">
                  {t("annualIncome")} (₹) *
                </label>
                <input
                  type="number"
                  step="5000"
                  required
                  value={formData.annualIncome}
                  onChange={(e) => setFormData({ ...formData, annualIncome: Number(e.target.value) })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2E7D32] hover:bg-green-800 text-white font-bold py-2.5 px-4 rounded text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <RegisterIcon fontSize="small" />
              )}
              <span>Create Farmer Account</span>
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-600">
          Already registered?{" "}
          <Link to="/login" className="text-[#003366] font-bold hover:underline">
            Login to your account
          </Link>
        </div>
      </div>
    </div>
  );
};
