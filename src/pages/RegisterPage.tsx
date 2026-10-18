import React, { useState, useMemo, useEffect } from "react";
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
    age: "" as string | number,
    gender: "",
    socialCategory: "",
    password: "",
    confirmPassword: "",
    preferredLanguage: "en",
    district: "",
    block: "",
    village: "",
    farmerStatus: "Owner",
    landOwnership: "Owned",
    landSize: "" as string | number,
    cropType: "",
    annualIncome: "" as string | number
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent browser password managers from auto-injecting credentials before user enters them
  useEffect(() => {
    const clearAutofill = () => {
      setFormData((prev) => ({
        ...prev,
        email: "",
        password: "",
        confirmPassword: ""
      }));
      const emailEl = document.getElementById("register_email_input") as HTMLInputElement | null;
      const passEl = document.getElementById("register_password_input") as HTMLInputElement | null;
      const confirmEl = document.getElementById("register_confirm_password_input") as HTMLInputElement | null;
      if (emailEl) emailEl.value = "";
      if (passEl) passEl.value = "";
      if (confirmEl) confirmEl.value = "";
    };

    clearAutofill();
    const t1 = setTimeout(clearAutofill, 50);
    const t2 = setTimeout(clearAutofill, 250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Dynamic blocks and villages for selected district
  const availableBlocks = useMemo(() => {
    if (!formData.district) return [];
    return getBlocksForDistrict(formData.district);
  }, [formData.district]);

  const availableVillages = useMemo(() => {
    if (!formData.district || !formData.block) return [];
    return getVillagesForBlock(formData.district, formData.block);
  }, [formData.district, formData.block]);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    if (!newDistrict) {
      setFormData((prev) => ({
        ...prev,
        district: "",
        block: "",
        village: ""
      }));
      return;
    }
    const blocks = getBlocksForDistrict(newDistrict);
    const newBlock = blocks[0]?.name || "";
    const villages = newBlock ? getVillagesForBlock(newDistrict, newBlock) : [];
    setFormData((prev) => ({
      ...prev,
      district: newDistrict,
      block: newBlock,
      village: villages[0] || ""
    }));
  };

  const handleBlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBlock = e.target.value;
    const villages = newBlock ? getVillagesForBlock(formData.district, newBlock) : [];
    setFormData((prev) => ({
      ...prev,
      block: newBlock,
      village: villages[0] || ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.district) {
      setError("Please select your District.");
      return;
    }
    if (!formData.cropType) {
      setError("Please select your Primary Crop.");
      return;
    }
    if (!formData.gender) {
      setError("Please select your Gender.");
      return;
    }
    if (!formData.socialCategory) {
      setError("Please select your Social Category.");
      return;
    }
    if (!formData.age || Number(formData.age) < 18) {
      setError("Please enter a valid age (18 years or older).");
      return;
    }
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
        landSize: Number(formData.landSize) || 0,
        annualIncome: Number(formData.annualIncome) || 0
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

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          {/* Decoy hidden inputs to prevent Chrome password manager from pre-populating credentials */}
          <input
            type="text"
            name="decoy_user_field"
            style={{ position: "absolute", opacity: 0, height: 0, width: 0, zIndex: -1, pointerEvents: "none" }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          <input
            type="password"
            name="decoy_pass_field"
            style={{ position: "absolute", opacity: 0, height: 0, width: 0, zIndex: -1, pointerEvents: "none" }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

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
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="e.g. 42"
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  {language === "ta" ? "பாலினம்" : "Gender"} *
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="" disabled>-- Select Gender (பாலினம்) --</option>
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
                  required
                  value={formData.socialCategory}
                  onChange={(e) => setFormData({ ...formData, socialCategory: e.target.value })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="" disabled>-- Select Social Category (பிரிவு) --</option>
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
                  id="register_email_input"
                  name="farmer_reg_email_field"
                  autoComplete="off"
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
                  id="register_password_input"
                  name="farmer_reg_new_pwd"
                  autoComplete="new-password"
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
                  id="register_confirm_password_input"
                  name="farmer_reg_confirm_pwd"
                  autoComplete="new-password"
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
                  required
                  value={formData.district}
                  onChange={handleDistrictChange}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366] font-medium"
                >
                  <option value="" disabled>-- Select District (மாவட்டம்) --</option>
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
                  required
                  value={formData.block}
                  onChange={handleBlockChange}
                  disabled={!formData.district}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366] font-medium disabled:bg-neutral-100"
                >
                  <option value="" disabled>-- Select Block / Taluk --</option>
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
                  required
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  disabled={!formData.block}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366] font-medium disabled:bg-neutral-100"
                >
                  <option value="" disabled>-- Select Revenue Village --</option>
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
                  onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                  placeholder="e.g. 2.5"
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  {t("cropType")} *
                </label>
                <select
                  required
                  value={formData.cropType}
                  onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="" disabled>-- Select Primary Crop (பயிர்) --</option>
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
                  onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                  placeholder="e.g. 100000"
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
