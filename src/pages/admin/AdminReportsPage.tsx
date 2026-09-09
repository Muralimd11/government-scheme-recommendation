import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Sidebar } from "../../components/common/Sidebar";
import {
  Assessment as ReportIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon
} from "@mui/icons-material";

export const AdminReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<"applications" | "schemes" | "districts" | "verifications">("applications");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getReports({ type: reportType, format: "json" });
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleDownloadCSV = () => {
    const token = localStorage.getItem("tn_farmer_token");
    window.open(`/api/admin/reports?type=${reportType}&format=csv&token=${token}`, "_blank");
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen flex flex-col md:flex-row">
      <Sidebar type="ADMIN" />

      <main className="flex-1 p-4 md:p-8 max-w-7xl">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ReportIcon className="text-[#003366]" />
              <h1 className="text-2xl font-bold text-[#003366]">
                Government Scheme Disbursement Reports
              </h1>
            </div>
            <p className="text-xs text-neutral-600">
              Generate department audit schedules, CSV summaries, and district-level welfare scheme performance metrics.
            </p>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="bg-[#2E7D32] hover:bg-green-800 text-white font-bold px-4 py-2 rounded text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <DownloadIcon fontSize="small" />
            <span>Export Official CSV</span>
          </button>
        </div>

        {/* Report Selector */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs mb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-neutral-700 mr-2">Select Report Category:</span>
            {[
              { id: "applications", label: "Applications Audit Schedule" },
              { id: "schemes", label: "Scheme Performance & Adoption" },
              { id: "districts", label: "District-wise Beneficiary Count" },
              { id: "verifications", label: "Field Verification Backlog" }
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setReportType(r.id as any)}
                className={`px-3 py-1.5 rounded transition cursor-pointer font-semibold ${
                  reportType === r.id
                    ? "bg-[#003366] text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Report Preview */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center text-xs">
            <span className="font-bold text-[#003366] text-sm">
              Live Preview: {reportData?.reportTitle || "Report"}
            </span>
            <span className="text-neutral-500">
              Generated: {new Date(reportData?.generatedAt || Date.now()).toLocaleString("en-IN")}
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center text-xs text-neutral-500">
              Generating report dataset...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-700 text-xs">{error}</div>
          ) : !reportData || !reportData.rows || reportData.rows.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 text-xs">
              No data records available for this report type.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-700 border-b border-neutral-200 font-semibold">
                  <tr>
                    {Object.keys(reportData.rows[0] || {}).map((header) => (
                      <th key={header} className="p-3.5 capitalize">
                        {header.replace(/([A-Z])/g, " $1")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {reportData.rows.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-neutral-50">
                      {Object.values(row).map((val: any, vIdx: number) => (
                        <td key={vIdx} className="p-3.5 text-neutral-800">
                          {typeof val === "object" ? JSON.stringify(val) : String(val)}
                        </td>
                      ))}
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
