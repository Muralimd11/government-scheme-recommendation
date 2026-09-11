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
  const { t, language } = useLanguage();

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
    <div className="w-full bg-[#F5F5F5] min-h-screen flex flex-col md:flex-row">
      <Sidebar type="FARMER" />

      <main className="flex-1 p-4 md:p-8 max-w-6xl">
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
                District: <strong>{user?.district || "Tamil Nadu"}</strong> • Farmer Registration ID:{" "}
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
              <span className="text-neutral-500 block">Land Size</span>
              <strong className="text-neutral-900 text-sm">{user?.landSize} Acres</strong>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
              <span className="text-neutral-500 block">Classification</span>
              <strong className="text-[#003366] text-sm">{user?.farmerType} Farmer</strong>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
              <span className="text-neutral-500 block">Primary Crop</span>
              <strong className="text-neutral-900 text-sm">{user?.cropType}</strong>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
              <span className="text-neutral-500 block">Farming Type</span>
              <strong className="text-neutral-900 text-sm">{user?.farmingType}</strong>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200 col-span-2 sm:col-span-1">
              <span className="text-neutral-500 block">Annual Income</span>
              <strong className="text-neutral-900 text-sm">₹{user?.annualIncome?.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 font-semibold block">Recommended Schemes</span>
              <span className="text-2xl font-bold text-[#003366] mt-1 block">
                {stats.recommendedCount || 4}
              </span>
              <Link to="/recommendations" className="text-[11px] text-[#2E7D32] hover:underline font-semibold mt-1 inline-block">
                View Recommendations →
              </Link>
            </div>
            <div className="p-3 bg-blue-50 text-[#003366] rounded-full">
              <SchemeIcon />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 font-semibold block">Total Applications</span>
              <span className="text-2xl font-bold text-neutral-900 mt-1 block">
                {stats.totalApplications}
              </span>
              <Link to="/farmer/applications" className="text-[11px] text-neutral-600 hover:underline font-semibold mt-1 inline-block">
                Manage Applications →
              </Link>
            </div>
            <div className="p-3 bg-neutral-100 text-neutral-700 rounded-full">
              <AppIcon />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 font-semibold block">Approved Schemes</span>
              <span className="text-2xl font-bold text-green-700 mt-1 block">
                {stats.approvedApplications}
              </span>
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Subsidies Disbursed
              </span>
            </div>
            <div className="p-3 bg-green-50 text-green-700 rounded-full">
              <ApprovedIcon />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 font-semibold block">Pending / In Review</span>
              <span className="text-2xl font-bold text-amber-700 mt-1 block">
                {stats.pendingApplications}
              </span>
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Field Verification Stage
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
            Quick Actions & Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <Link
              to="/farmer/eligibility"
              className="p-4 rounded border border-neutral-200 hover:border-[#003366] hover:bg-blue-50/50 transition flex items-center gap-3"
            >
              <EligibilityIcon className="text-[#003366]" />
              <div>
                <strong className="block text-neutral-900 font-bold">Check Eligibility</strong>
                <span className="text-neutral-500">Run the AI recommendation model</span>
              </div>
            </Link>

            <Link
              to="/farmer/documents"
              className="p-4 rounded border border-neutral-200 hover:border-[#003366] hover:bg-blue-50/50 transition flex items-center gap-3"
            >
              <DocIcon className="text-[#2E7D32]" />
              <div>
                <strong className="block text-neutral-900 font-bold">Upload Documents</strong>
                <span className="text-neutral-500">Patta, Chitta, Aadhaar & Passbook</span>
              </div>
            </Link>

            <Link
              to="/farmer/profile"
              className="p-4 rounded border border-neutral-200 hover:border-[#003366] hover:bg-blue-50/50 transition flex items-center gap-3"
            >
              <TuneIcon className="text-amber-700" />
              <div>
                <strong className="block text-neutral-900 font-bold">Update Profile</strong>
                <span className="text-neutral-500">Change land size, crop, or district</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Applications Section */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#003366]">
              Recent Applications
            </h2>
            <Link
              to="/farmer/applications"
              className="text-xs font-semibold text-[#003366] hover:underline"
            >
              View All Applications →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              <p>You haven't submitted any scheme applications yet.</p>
              <Link
                to="/recommendations"
                className="mt-3 inline-block bg-[#2E7D32] text-white px-4 py-2 rounded font-semibold text-xs"
              >
                Browse Recommended Schemes to Apply
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-semibold">
                  <tr>
                    <th className="p-3.5">Application ID</th>
                    <th className="p-3.5">Scheme Name</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {recentApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-neutral-50">
                      <td className="p-3.5 font-mono text-[#003366] font-semibold">
                        {app.applicationId}
                      </td>
                      <td className="p-3.5 font-medium text-neutral-900">
                        {app.schemeName}
                      </td>
                      <td className="p-3.5 text-neutral-500">
                        {new Date(app.submittedDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          to={`/farmer/applications/${app._id}`}
                          className="text-[#003366] font-semibold hover:underline"
                        >
                          Details
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
