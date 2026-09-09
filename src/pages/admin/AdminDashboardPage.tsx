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
  BarChart as ChartIcon
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
              Real-time monitoring of scheme disbursement, farmer enrollment, and ML recommendation analytics.
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
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    State Submissions
                  </span>
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

            {/* Most Recommended Schemes by AI */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-8">
              <h3 className="text-sm font-bold text-[#003366] uppercase tracking-wider mb-4 flex items-center gap-2">
                <ChartIcon fontSize="small" />
                <span>AI Recommendation Frequency (Scikit-Learn Model Output)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {stats?.mostRecommended?.map((m: any, i: number) => (
                  <div key={i} className="p-4 rounded border border-neutral-200 bg-neutral-50">
                    <span className="text-neutral-500 block text-[11px]">Rank #{i + 1}</span>
                    <strong className="text-sm text-neutral-900 block my-1">{m.name}</strong>
                    <div className="flex justify-between text-neutral-600 mt-2 pt-2 border-t border-neutral-200">
                      <span>Times Suggested: <strong>{m.count}</strong></span>
                      <span>Avg Score: <strong className="text-green-700">{m.avgScore}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
