import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { api } from "../../services/api";
import { Sidebar } from "../../components/common/Sidebar";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  Recommend as SchemeIcon,
  Description as AppIcon,
  CheckCircle as ApprovedIcon,
  HourglassEmpty as PendingIcon,
  ArrowForward as ArrowIcon,
  Tune as TuneIcon,
  UploadFile as DocIcon,
  FactCheck as EligibilityIcon
} from "@mui/icons-material";

export const FarmerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language, tTerm } = useLanguage();

  const [stats, setStats] = useState({
    recommendedCount: 0,
    totalApplications: 0,
    approvedApplications: 0,
    pendingApplications: 0
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await api.getFarmerDashboardSummary();
        if (res.data.success) {
          setStats(res.data.data.stats);
          setRecentApplications(res.data.data.recentApplications || []);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen flex flex-col md:flex-row items-start">
      <Sidebar type="FARMER" />

      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#2E7D32] uppercase tracking-wider">
                {language === "ta" ? "உழவர் கட்டுப்பாட்டு மையம்" : "Farmer Self-Service Portal"}
              </span>
              <h1 className="text-2xl font-bold text-[#003366] mt-0.5">
                {language === "ta" ? `வணக்கம், ${user?.fullName}` : `Welcome, ${user?.fullName}`}
              </h1>
              <p className="text-xs text-neutral-600 mt-1">
                {language === "ta" ? "மாவட்டம்: " : "District: "}
                <strong>{language === "ta" ? tTerm(user?.district || "Tamil Nadu") : (user?.district || "Tamil Nadu")}</strong>
                {" • "}
                {language === "ta" ? "விவசாயி பதிவு எண்: " : "Farmer Registration ID: "}
                <span className="font-mono text-[#003366] font-semibold">{user?.farmerRegistrationId || "TN-REG-DEMO"}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                to="/farmer/profile"
                className="bg-white hover:bg-neutral-50 text-[#003366] border border-[#003366] px-3.5 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                <TuneIcon style={{ fontSize: 16 }} />
                <span>{language === "ta" ? "சுயவிவரத்தை திருத்து" : "Update Farm Profile"}</span>
              </Link>
            </div>
          </div>

          {/* Farmer Farm Profile Summary Bar */}
          <div className="mt-5 pt-4 border-t border-neutral-200 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 text-xs">
            <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
              <span className="text-neutral-500 block">
                {language === "ta" ? "நில அளவு" : "Land Size"}
              </span>
              <strong className="text-neutral-900 text-sm">
                {user?.landSize ? `${user.landSize} ${language === "ta" ? "ஏக்கர்" : "Acres"}` : (language === "ta" ? "குறிப்பிடப்படவில்லை" : "Not specified")}
              </strong>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
              <span className="text-neutral-500 block">
                {language === "ta" ? "விவசாயி வகை" : "Classification"}
              </span>
              <strong className="text-[#003366] text-sm">
                {user?.farmerType
                  ? language === "ta"
                    ? tTerm(user.farmerType).includes("விவசாயி")
                      ? tTerm(user.farmerType)
                      : `${tTerm(user.farmerType)} விவசாயி`
                    : user.farmerType.toLowerCase().includes("farmer")
                    ? user.farmerType
                    : `${user.farmerType} Farmer`
                  : language === "ta"
                  ? "பொது விவசாயி"
                  : "General Farmer"}
              </strong>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
              <span className="text-neutral-500 block">
                {language === "ta" ? "முக்கிய பயிர்" : "Primary Crop"}
              </span>
              <strong className="text-neutral-900 text-sm">
                {user?.cropType ? (language === "ta" ? tTerm(user.cropType) : user.cropType) : (language === "ta" ? "குறிப்பிடப்படவில்லை" : "Not specified")}
              </strong>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
              <span className="text-neutral-500 block">
                {language === "ta" ? "விவசாய முறை" : "Farming Type"}
              </span>
              <strong className="text-neutral-900 text-sm">
                {user?.farmingType ? (language === "ta" ? tTerm(user.farmingType) : user.farmingType) : (language === "ta" ? "பொது விவசாயம்" : "General Farming")}
              </strong>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200 col-span-2 sm:col-span-1">
              <span className="text-neutral-500 block">
                {language === "ta" ? "ஆண்டு வருமானம்" : "Annual Income"}
              </span>
              <strong className="text-neutral-900 text-sm">
                {user?.annualIncome ? `₹${Number(user.annualIncome).toLocaleString("en-IN")}` : (language === "ta" ? "குறிப்பிடப்படவில்லை" : "Not specified")}
              </strong>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 font-semibold block">
                {language === "ta" ? "பரிந்துரைக்கப்பட்ட திட்டங்கள்" : "Recommended Schemes"}
              </span>
              <span className="text-2xl font-bold text-[#003366] mt-1 block">
                {stats.recommendedCount}
              </span>
              <Link to="/recommendations" className="text-[11px] text-[#2E7D32] hover:underline font-semibold mt-1 inline-block">
                {language === "ta" ? "திட்டங்களை காண்க →" : "View Recommendations →"}
              </Link>
            </div>
            <div className="p-3 bg-blue-50 text-[#003366] rounded-full">
              <SchemeIcon />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 font-semibold block">
                {language === "ta" ? "மொத்த விண்ணப்பங்கள்" : "Total Applications"}
              </span>
              <span className="text-2xl font-bold text-neutral-900 mt-1 block">
                {stats.totalApplications}
              </span>
              <Link to="/farmer/applications" className="text-[11px] text-neutral-600 hover:underline font-semibold mt-1 inline-block">
                {language === "ta" ? "விண்ணப்பங்களை நிர்வகிக்க →" : "Manage Applications →"}
              </Link>
            </div>
            <div className="p-3 bg-neutral-100 text-neutral-700 rounded-full">
              <AppIcon />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 font-semibold block">
                {language === "ta" ? "ஒப்புதல் பெற்ற திட்டங்கள்" : "Approved Schemes"}
              </span>
              <span className="text-2xl font-bold text-green-700 mt-1 block">
                {stats.approvedApplications}
              </span>
              <span className="text-[11px] text-neutral-500 mt-1 block">
                {language === "ta" ? "மானியங்கள் விடுவிக்கப்பட்டவை" : "Subsidies Disbursed"}
              </span>
            </div>
            <div className="p-3 bg-green-50 text-green-700 rounded-full">
              <ApprovedIcon />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 font-semibold block">
                {language === "ta" ? "நிலுவையில் உள்ளவை / ஆய்வில்" : "Pending / In Review"}
              </span>
              <span className="text-2xl font-bold text-amber-700 mt-1 block">
                {stats.pendingApplications}
              </span>
              <span className="text-[11px] text-neutral-500 mt-1 block">
                {language === "ta" ? "கள ஆய்வு நிலை" : "Field Verification Stage"}
              </span>
            </div>
            <div className="p-3 bg-amber-50 text-amber-700 rounded-full">
              <PendingIcon />
            </div>
          </div>
        </div>

        {/* Quick Action Hub */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-8">
          <h2 className="text-base font-bold text-[#003366] mb-4">
            {language === "ta" ? "விரைவு சேவைகள் & செயல்பாடுகள்" : "Quick Actions & Services"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <Link
              to="/recommendations"
              className="p-4 rounded border border-neutral-200 hover:border-[#003366] hover:bg-blue-50/50 transition flex items-center gap-3"
            >
              <EligibilityIcon className="text-[#003366]" />
              <div>
                <strong className="block text-neutral-900 font-bold">
                  {language === "ta" ? "தகுதி சரிபார்ப்பு" : "Check Eligibility"}
                </strong>
                <span className="text-neutral-500">
                  {language === "ta" ? "AI பரிந்துரை மாதிரியை இயக்கவும்" : "Run the AI recommendation model"}
                </span>
              </div>
            </Link>

            <Link
              to="/farmer/documents"
              className="p-4 rounded border border-neutral-200 hover:border-[#003366] hover:bg-blue-50/50 transition flex items-center gap-3"
            >
              <DocIcon className="text-[#2E7D32]" />
              <div>
                <strong className="block text-neutral-900 font-bold">
                  {language === "ta" ? "ஆவணங்களை பதிவேற்றுக" : "Upload Documents"}
                </strong>
                <span className="text-neutral-500">
                  {language === "ta" ? "பட்டா, சிட்டா, ஆதார் & வங்கிக் கணக்கு" : "Patta, Chitta, Aadhaar & Passbook"}
                </span>
              </div>
            </Link>

            <Link
              to="/farmer/profile"
              className="p-4 rounded border border-neutral-200 hover:border-[#003366] hover:bg-blue-50/50 transition flex items-center gap-3"
            >
              <TuneIcon className="text-amber-700" />
              <div>
                <strong className="block text-neutral-900 font-bold">
                  {language === "ta" ? "சுயவிவரத்தை புதுப்பிக்க" : "Update Profile"}
                </strong>
                <span className="text-neutral-500">
                  {language === "ta" ? "நில அளவு, பயிர் அல்லது மாவட்டத்தை மாற்றவும்" : "Change land size, crop, or district"}
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Applications Section */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#003366]">
              {language === "ta" ? "சமீபத்திய விண்ணப்பங்கள்" : "Recent Applications"}
            </h2>
            <Link
              to="/farmer/applications"
              className="text-xs font-semibold text-[#003366] hover:underline"
            >
              {language === "ta" ? "அனைத்து விண்ணப்பங்களையும் பார்க்க →" : "View All Applications →"}
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              <p>{language === "ta" ? "நீங்கள் இதுவரை எந்த திட்டத்திற்கும் விண்ணப்பிக்கவில்லை." : "You haven't submitted any scheme applications yet."}</p>
              <Link
                to="/recommendations"
                className="mt-3 inline-block bg-[#2E7D32] text-white px-4 py-2 rounded font-semibold text-xs"
              >
                {language === "ta" ? "விண்ணப்பிக்க பரிந்துரைக்கப்பட்ட திட்டங்களை காண்க" : "Browse Recommended Schemes to Apply"}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-semibold">
                  <tr>
                    <th className="p-3.5">{language === "ta" ? "விண்ணப்ப எண்" : "Application ID"}</th>
                    <th className="p-3.5">{language === "ta" ? "திட்டத்தின் பெயர்" : "Scheme Name"}</th>
                    <th className="p-3.5">{language === "ta" ? "தேதி" : "Date"}</th>
                    <th className="p-3.5">{language === "ta" ? "நிலை" : "Status"}</th>
                    <th className="p-3.5 text-right">{language === "ta" ? "செயல்" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {recentApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-neutral-50">
                      <td className="p-3.5 font-mono text-[#003366] font-semibold">
                        {app.applicationId}
                      </td>
                      <td className="p-3.5 font-medium text-neutral-900">
                        {language === "ta" && app.schemeNameTamil ? app.schemeNameTamil : app.schemeName}
                      </td>
                      <td className="p-3.5 text-neutral-500">
                        {new Date(app.submittedDate).toLocaleDateString(language === "ta" ? "ta-IN" : "en-IN")}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          to={`/farmer/applications/${app._id}`}
                          className="text-[#003366] font-semibold hover:underline"
                        >
                          {language === "ta" ? "விவரங்கள்" : "Details"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
