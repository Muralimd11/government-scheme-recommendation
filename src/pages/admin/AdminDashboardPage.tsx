import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { Sidebar } from "../../components/common/Sidebar";
import {
  People as FarmersIcon,
  AccountTree as SchemesIcon,
  Description as AppIcon,
  VerifiedUser as VerifyIcon,
  CheckCircle as ApprovedIcon,
  TrendingUp as RateIcon,
  Warning as PendingIcon,
  Assessment as ReportsIcon,
  Launch as LaunchIcon
} from "@mui/icons-material";

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.getAdminStats();
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load admin analytics.");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const metrics = stats?.metrics || {
    totalFarmers: 0,
    totalSchemes: 0,
    totalApplications: 0,
    pendingVerification: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    approvalRate: 0
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen flex flex-col md:flex-row">
      <Sidebar type="ADMIN" />

      <main className="flex-1 p-4 md:p-8 max-w-7xl">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#003366] uppercase tracking-wider">
              Department of Agriculture Administration
            </span>
            <h1 className="text-2xl font-bold text-[#003366] mt-0.5">
              Agricultural Officer Dashboard
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Real-time monitoring of scheme disbursement, farmer enrollment, and state agricultural administration.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/admin/reports"
              className="bg-[#003366] hover:bg-blue-900 text-white px-4 py-2 rounded text-xs font-bold transition flex items-center gap-1.5"
            >
              <ReportsIcon style={{ fontSize: 16 }} />
              <span>Generate Reports</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-neutral-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#003366] border-t-transparent mb-3" />
            <p>Aggregating state agricultural statistics...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-800 rounded text-xs mb-6">
            {error}
          </div>
        ) : (
          <>
            {/* Top Metric Cards (6 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 font-semibold block">Enrolled Farmers</span>
                  <span className="text-2xl font-bold text-[#003366] mt-1 block">
                    {metrics.totalFarmers}
                  </span>
                  <Link to="/admin/farmers" className="text-[11px] text-[#003366] font-semibold hover:underline">
                    Manage Farmers →
                  </Link>
                </div>
                <div className="p-3 bg-blue-50 text-[#003366] rounded-full">
                  <FarmersIcon />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 font-semibold block">Active Schemes</span>
                  <span className="text-2xl font-bold text-[#2E7D32] mt-1 block">
                    {metrics.totalSchemes}
                  </span>
                  <Link to="/admin/schemes" className="text-[11px] text-[#2E7D32] font-semibold hover:underline">
                    View Schemes →
                  </Link>
                </div>
                <div className="p-3 bg-green-50 text-[#2E7D32] rounded-full">
                  <SchemesIcon />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 font-semibold block">Total Applications</span>
                  <span className="text-2xl font-bold text-neutral-900 mt-1 block">
                    {metrics.totalApplications}
                  </span>
                  <Link to="/admin/applications" className="text-[11px] text-[#003366] font-semibold hover:underline mt-1 block">
                    Manage Applications →
                  </Link>
                </div>
                <div className="p-3 bg-neutral-100 text-neutral-700 rounded-full">
                  <AppIcon />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 font-semibold block">Pending Verification</span>
                  <span className="text-2xl font-bold text-amber-700 mt-1 block">
                    {metrics.pendingVerification}
                  </span>
                  <Link to="/admin/documents" className="text-[11px] text-amber-700 font-semibold hover:underline">
                    Verify Documents →
                  </Link>
                </div>
                <div className="p-3 bg-amber-50 text-amber-700 rounded-full">
                  <PendingIcon />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 font-semibold block">Approved Subsidies</span>
                  <span className="text-2xl font-bold text-green-700 mt-1 block">
                    {metrics.approvedApplications}
                  </span>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Disbursed to Farmer Bank
                  </span>
                </div>
                <div className="p-3 bg-green-50 text-green-700 rounded-full">
                  <ApprovedIcon />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 font-semibold block">Approval Rate</span>
                  <span className="text-2xl font-bold text-[#003366] mt-1 block">
                    {metrics.approvalRate}%
                  </span>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Field Verification Ratio
                  </span>
                </div>
                <div className="p-3 bg-blue-50 text-[#003366] rounded-full">
                  <RateIcon />
                </div>
              </div>
            </div>

            {/* Recent Online Scheme Applications Section (Always visible by default) */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-base font-bold text-[#003366] flex items-center gap-2">
                    <AppIcon className="text-[#003366]" />
                    <span>Recent Online Scheme Applications</span>
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Live submissions submitted online by farmers awaiting verification and sanction.
                  </p>
                </div>
                <Link
                  to="/admin/applications"
                  className="text-xs font-bold text-[#003366] hover:underline"
                >
                  View All Submissions ({metrics.totalApplications}) →
                </Link>
              </div>

              {(!stats?.recentApplications || stats.recentApplications.length === 0) ? (
                <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-50 rounded border border-neutral-100">
                  <AppIcon style={{ fontSize: 36 }} className="text-neutral-300 mb-1" />
                  <p className="font-semibold text-neutral-700">No applications submitted yet.</p>
                  <p className="text-neutral-500 mt-0.5">Online applications submitted by farmers will appear here automatically.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-600 font-bold uppercase tracking-wider text-[11px] border-b border-neutral-200">
                        <th className="py-2.5 px-3">Application ID</th>
                        <th className="py-2.5 px-3">Applicant Farmer</th>
                        <th className="py-2.5 px-3">Scheme</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Submission Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {stats.recentApplications.map((app: any) => {
                        const statusColors: Record<string, string> = {
                          APPROVED: "bg-green-50 text-green-700 border-green-200",
                          REJECTED: "bg-red-50 text-red-700 border-red-200",
                          UNDER_VERIFICATION: "bg-amber-50 text-amber-700 border-amber-200",
                          SUBMITTED: "bg-blue-50 text-[#003366] border-blue-200"
                        };
                        const badgeStyle = statusColors[app.status] || "bg-blue-50 text-[#003366] border-blue-200";

                        return (
                          <tr key={app._id} className="hover:bg-neutral-50 transition">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#003366]">
                              {app.applicationId}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-neutral-900 block">
                                {app.farmerName}
                              </span>
                              <span className="text-[11px] text-neutral-500 block">
                                {app.district} • {app.farmerMobile}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 max-w-xs font-medium text-neutral-800 truncate" title={app.schemeName}>
                              {app.schemeName}
                            </td>
                            <td className="py-2.5 px-3 text-neutral-500 truncate max-w-[180px]">
                              {app.department}
                            </td>
                            <td className="py-2.5 px-3 text-neutral-600">
                              {new Date(app.submittedDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                              })}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeStyle}`}>
                                {app.status || "SUBMITTED"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <Link
                                to="/admin/applications"
                                className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-semibold text-[11px] transition inline-flex items-center gap-1"
                              >
                                <span>Review</span>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Visual Analytics Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* District Distribution */}
              <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-[#003366] uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Top Districts by Farmer Enrollment</span>
                  <span className="text-neutral-400 font-normal lowercase text-xs">live counts</span>
                </h3>

                <div className="space-y-3 text-xs">
                  {stats?.districtDistribution?.map((d: any) => {
                    const maxCount = Math.max(...stats.districtDistribution.map((x: any) => x.count), 1);
                    const pct = Math.round((d.count / maxCount) * 100);
                    return (
                      <div key={d.district}>
                        <div className="flex justify-between font-semibold mb-1 text-neutral-700">
                          <span>{d.district}</span>
                          <span>{d.count} Farmers</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2">
                          <div
                            className="bg-[#003366] h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Crop Distribution */}
              <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-[#003366] uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Primary Crop Distribution</span>
                  <span className="text-neutral-400 font-normal lowercase text-xs">acreage focus</span>
                </h3>

                <div className="space-y-3 text-xs">
                  {stats?.cropDistribution?.map((c: any) => {
                    const maxCount = Math.max(...stats.cropDistribution.map((x: any) => x.count), 1);
                    const pct = Math.round((c.count / maxCount) * 100);
                    return (
                      <div key={c.crop}>
                        <div className="flex justify-between font-semibold mb-1 text-neutral-700">
                          <span>{c.crop}</span>
                          <span>{c.count} Farmers</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2">
                          <div
                            className="bg-[#2E7D32] h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
