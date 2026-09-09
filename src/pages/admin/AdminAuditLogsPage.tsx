import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Sidebar } from "../../components/common/Sidebar";
import { Security as SecurityIcon, History as LogIcon } from "@mui/icons-material";

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const res = await api.getAuditLogs();
        if (res.data.success) {
          setLogs(res.data.data.logs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen flex flex-col md:flex-row">
      <Sidebar type="ADMIN" />

      <main className="flex-1 p-4 md:p-8 max-w-7xl">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6">
          <div className="flex items-center gap-2 mb-1">
            <SecurityIcon className="text-[#003366]" />
            <h1 className="text-2xl font-bold text-[#003366]">
              Government Security Audit Trail
            </h1>
          </div>
          <p className="text-xs text-neutral-600">
            Immutable log of all administrative actions, scheme updates, document verifications, and subsidy approval decisions.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 font-bold text-sm text-[#003366]">
            System Action Log ({logs.length} Events)
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              Loading audit trail...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              No audit logs recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-semibold">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Admin User</th>
                    <th className="p-3.5">Target Entity</th>
                    <th className="p-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-mono">
                  {logs.map((log: any) => (
                    <tr key={log._id} className="hover:bg-neutral-50">
                      <td className="p-3.5 text-neutral-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3.5 font-bold text-[#003366]">
                        {log.action}
                      </td>
                      <td className="p-3.5 text-neutral-700">
                        {log.adminId?.fullName || "Officer / System"}
                      </td>
                      <td className="p-3.5 text-neutral-600">
                        {log.targetEntity} ({log.targetId ? log.targetId.substring(0, 8) : "N/A"})
                      </td>
                      <td className="p-3.5 text-neutral-600 font-sans text-xs">
                        {JSON.stringify(log.details)}
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
