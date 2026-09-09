import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import { TamilNaduEmblem } from "../components/common/Emblem";
import { HowToReg as RegisterIcon } from "@mui/icons-material";

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

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    preferredLanguage: "en",
    district: "Thanjavur",
    farmerStatus: "Owner",
    landOwnership: "Owned",
    landSize: 2.5,
    cropType: "Paddy",
    socialCategory: "MBC",
    annualIncome: 120000
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
                className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003366]"
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
                className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003366]"
              />
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
                className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003366]"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
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
                className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003366]"
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
                className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003366]"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                {t("landSize")} *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.landSize}
                onChange={(e) => setFormData({ ...formData, landSize: Number(e.target.value) })}
                className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003366]"
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
                {t("socialCategory")} *
              </label>
              <select
                value={formData.socialCategory}
                onChange={(e) => setFormData({ ...formData, socialCategory: e.target.value })}
                className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
              >
                <option value="MBC">MBC / DNC</option>
                <option value="OBC">BC / OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                {t("annualIncome")}
              </label>
              <input
                type="number"
                step="5000"
                value={formData.annualIncome}
                onChange={(e) => setFormData({ ...formData, annualIncome: Number(e.target.value) })}
                className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003366]"
              />
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
