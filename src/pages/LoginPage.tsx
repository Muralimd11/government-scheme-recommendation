import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import { TamilNaduEmblem } from "../components/common/Emblem";
import {
  LockOutlined as LockIcon,
  PersonOutlined as PersonIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
  Login as LoginIcon
} from "@mui/icons-material";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent browser password manager from automatically filling credentials before user enters them
  useEffect(() => {
    const clearAutofill = () => {
      setIdentifier("");
      setPassword("");
      const idEl = document.getElementById("login_identifier_input") as HTMLInputElement | null;
      const passEl = document.getElementById("login_password_input") as HTMLInputElement | null;
      if (idEl) idEl.value = "";
      if (passEl) passEl.value = "";
    };
    clearAutofill();
    const t1 = setTimeout(clearAutofill, 50);
    const t2 = setTimeout(clearAutofill, 250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await api.login({ identifier, password });
      if (res.data.success) {
        const { token, user } = res.data.data;
        login(token, user);
        if (user.role === "ADMIN") {
          navigate("/admin/dashboard");
        } else {
          navigate("/farmer/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your mobile/email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: "FARMER_1" | "FARMER_2" | "ADMIN") => {
    if (role === "ADMIN") {
      setIdentifier("admin@tnagri.gov.in");
      setPassword("Admin@2026");
    } else if (role === "FARMER_1") {
      setIdentifier("9842100001");
      setPassword("Farmer@2026");
    } else if (role === "FARMER_2") {
      setIdentifier("9842100002");
      setPassword("Farmer@2026");
    }
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-neutral-200 p-6 sm:p-8 shadow-xs">
        {/* Emblem & Portal Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <TamilNaduEmblem size={56} />
          </div>
          <h1 className="text-xl font-bold text-[#003366]">
            {language === "ta" ? "அரசு உழவர் தளம் உள்நுழைவு" : "Farmer & Admin Portal Login"}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Department of Agriculture and Farmers Welfare, Govt of Tamil Nadu
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {/* Decoy hidden inputs to prevent Chrome password manager from pre-populating credentials */}
          <input
            type="text"
            name="decoy_login_user"
            style={{ position: "absolute", opacity: 0, height: 0, width: 0, zIndex: -1, pointerEvents: "none" }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          <input
            type="password"
            name="decoy_login_pass"
            style={{ position: "absolute", opacity: 0, height: 0, width: 0, zIndex: -1, pointerEvents: "none" }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Mobile Number or Email Address *
            </label>
            <div className="relative">
              <input
                type="text"
                id="login_identifier_input"
                name="farmer_login_identifier_field"
                autoComplete="off"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9842100001 or farmer@example.com"
                className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003366]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-neutral-700">
                Password *
              </label>
              <span className="text-[11px] text-[#003366] hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="login_password_input"
                name="farmer_login_pwd_field"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003366] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700"
              >
                {showPassword ? <HideIcon fontSize="small" /> : <ShowIcon fontSize="small" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#003366] hover:bg-blue-900 text-white font-bold py-2.5 px-4 rounded text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <LoginIcon fontSize="small" />
            )}
            <span>{t("login")}</span>
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div className="mt-6 pt-5 border-t border-neutral-200">
          <p className="text-xs font-bold text-neutral-600 mb-2 text-center">
            One-Click Test Accounts:
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("FARMER_1")}
              className="text-left p-2 rounded bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs text-neutral-800 transition"
            >
              🌾 <strong>Farmer Account 1</strong> (Mobile: 9842100001 / Farmer@2026)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("FARMER_2")}
              className="text-left p-2 rounded bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs text-neutral-800 transition"
            >
              🌱 <strong>Farmer Account 2</strong> (Mobile: 9842100002 / Farmer@2026)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("ADMIN")}
              className="text-left p-2 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs text-[#003366] transition"
            >
              🏛️ <strong>Agriculture Officer / Admin</strong> (admin@tnagri.gov.in / Admin@2026)
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center text-xs text-neutral-600">
          New cultivator?{" "}
          <Link to="/register" className="text-[#003366] font-bold hover:underline">
            Register as a Farmer
          </Link>
        </div>
      </div>
    </div>
  );
};
