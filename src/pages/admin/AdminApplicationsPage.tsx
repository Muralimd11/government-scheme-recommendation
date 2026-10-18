import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { Sidebar } from "../../components/common/Sidebar";
import {
  Description as AppIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as PendingIcon,
  Launch as LaunchIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";

export const AdminApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminApplications({
        status: statusFilter,
        search: search.trim() || undefined
      });
      if (res.data?.success) {
        setApplications(res.data.data.applications || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load government scheme applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      setUpdatingId(appId);
      setSuccessMsg(null);
      const res = await api.updateAdminApplicationStatus(appId, {
        status: newStatus,
        adminRemarks: `Status updated to ${newStatus} by Agricultural Officer.`
      });
      if (res.data?.success) {
        setSuccessMsg(`Application status updated to ${newStatus} successfully.`);
        setApplications((prev) =>
          prev.map((a) => (a.applicationId === appId || a._id === appId ? { ...a, status: newStatus } : a))
        );
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-50 text-green-700 border-green-200";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      case "UNDER_VERIFICATION":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "SUBMITTED":
      default:
        return "bg-blue-50 text-[#003366] border-blue-200";
    }
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen flex flex-col md:flex-row">
      <Sidebar type="ADMIN" />

      <main className="flex-1 p-4 md:p-8 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#003366] uppercase tracking-wider">
              Department of Agriculture Administration
            </span>
            <h1 className="text-2xl font-bold text-[#003366] mt-0.5 flex items-center gap-2">
              <AppIcon className="text-[#003366]" />
              <span>Online Scheme Applications</span>
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Review, verify, and monitor applications submitted online by Tamil Nadu farmers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchApplications}
              disabled={loading}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition"
              title="Refresh"
            >
              <RefreshIcon fontSize="small" className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <Link
              to="/admin/dashboard"
              className="bg-[#003366] hover:bg-blue-900 text-white px-4 py-2 rounded text-xs font-bold transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 mb-6 bg-green-50 text-green-800 border border-green-200 rounded text-xs font-semibold flex items-center gap-2">
            <ApprovedIcon fontSize="small" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded text-xs mb-6">
            {error}
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-2.5 text-neutral-400" fontSize="small" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Application ID, Farmer Name, or Scheme..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:border-[#003366]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#003366] text-white rounded text-xs font-semibold hover:bg-blue-900 transition"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FilterIcon fontSize="small" className="text-neutral-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:border-[#003366] bg-white font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_VERIFICATION">Under Verification</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-xs text-neutral-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#003366] border-t-transparent mb-3" />
              <p>Loading online submissions...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              <AppIcon style={{ fontSize: 48 }} className="text-neutral-300 mb-2" />
              <p className="font-semibold text-neutral-700">No applications found matching criteria.</p>
              <p className="mt-1">When farmers apply for welfare schemes online, submissions will populate here in real time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-600 font-bold uppercase tracking-wider text-[11px] border-b border-neutral-200">
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Applicant Farmer</th>
                    <th className="py-3 px-4">Scheme Details</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4">Documents</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {applications.map((app) => {
                    const farmer = app.farmerId;
                    const scheme = app.schemeId;
                    const isUpdating = updatingId === app.applicationId || updatingId === app._id;

                    return (
                      <tr key={app._id} className="hover:bg-neutral-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-[#003366]">
                          {app.applicationId}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-neutral-900 block">
                            {farmer?.fullName || app.farmerName || "Registered Farmer"}
                          </span>
                          <span className="text-[11px] text-neutral-500 block">
                            {farmer?.district || "Tamil Nadu"} • {farmer?.mobile || "N/A"}
                          </span>
                          {farmer?.farmerRegistrationId && (
                            <span className="text-[10px] text-emerald-700 font-mono">
                              ID: {farmer.farmerRegistrationId}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <span className="font-bold text-neutral-900 block truncate" title={app.schemeName || scheme?.schemeName}>
                            {app.schemeName || scheme?.schemeName || "State Agricultural Scheme"}
                          </span>
                          <span className="text-[11px] text-neutral-500 block truncate">
                            {scheme?.department || "Department of Agriculture"}
                          </span>
                          {app.schemeCode && (
                            <span className="text-[10px] text-neutral-400 font-mono">
                              Code: {app.schemeCode}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-neutral-600">
                          {new Date(app.submittedDate || app.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[11px] font-semibold">
                            {app.documents?.length || 0} Attached
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-[11px] font-bold border ${getStatusBadge(app.status)}`}>
                            {app.status || "SUBMITTED"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {app.status !== "APPROVED" && (
                              <button
                                onClick={() => handleUpdateStatus(app.applicationId || app._id, "APPROVED")}
                                disabled={isUpdating}
                                className="px-2.5 py-1 bg-green-700 hover:bg-green-800 text-white rounded text-[11px] font-bold transition cursor-pointer"
                                title="Approve Scheme Subsidy"
                              >
                                Approve
                              </button>
                            )}
                            {app.status !== "UNDER_VERIFICATION" && (
                              <button
                                onClick={() => handleUpdateStatus(app.applicationId || app._id, "UNDER_VERIFICATION")}
                                disabled={isUpdating}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold transition cursor-pointer"
                                title="Mark Under Verification"
                              >
                                Verify
                              </button>
                            )}
                            {app.status !== "REJECTED" && (
                              <button
                                onClick={() => handleUpdateStatus(app.applicationId || app._id, "REJECTED")}
                                disabled={isUpdating}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold transition cursor-pointer"
                                title="Reject Application"
                              >
                                Reject
                              </button>
                            )}

                            {(scheme?.applicationUrl || scheme?.officialWebsite) && (
                              <a
                                href={scheme.applicationUrl || scheme.officialWebsite}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-neutral-500 hover:text-[#003366] rounded hover:bg-neutral-100 transition"
                                title="Visit Official Portal"
                              >
                                <LaunchIcon fontSize="inherit" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default AdminApplicationsPage;
