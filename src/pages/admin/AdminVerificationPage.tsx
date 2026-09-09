import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { DocumentItem } from "../../types";
import { Sidebar } from "../../components/common/Sidebar";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  VerifiedUser as VerifyIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Warning as CorrectionIcon,
  Close as CloseIcon,
  Visibility as ViewIcon
} from "@mui/icons-material";

export const AdminVerificationPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("PENDING");

  // Verify Action Modal
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [actionStatus, setActionStatus] = useState<"VERIFIED" | "REJECTED" | "CORRECTION_REQUIRED">("VERIFIED");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await api.getAdminDocuments(params);
      if (res.data.success) {
        setDocuments(res.data.data.documents);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load documents for verification.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [statusFilter]);

  const openVerifyModal = (doc: DocumentItem, status: "VERIFIED" | "REJECTED" | "CORRECTION_REQUIRED") => {
    setSelectedDoc(doc);
    setActionStatus(status);
    if (status === "VERIFIED") {
      setRemarks("Verified with Taluk e-Adangal and revenue records.");
    } else if (status === "REJECTED") {
      setRemarks("Survey number or Patta name mismatch with applicant profile.");
    } else {
      setRemarks("Please re-upload clear scanned copy showing full survey schedule.");
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    try {
      setSubmitting(true);
      await api.verifyDocument(selectedDoc._id, {
        verificationStatus: actionStatus,
        adminRemarks: remarks.trim()
      });
      setSelectedDoc(null);
      fetchDocs();
    } catch (err: any) {
      alert(err.message || "Failed to submit document verification.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen flex flex-col md:flex-row">
      <Sidebar type="ADMIN" />

      <main className="flex-1 p-4 md:p-8 max-w-7xl">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6">
          <div className="flex items-center gap-2 mb-1">
            <VerifyIcon className="text-[#003366]" />
            <h1 className="text-2xl font-bold text-[#003366]">
              Land & Identity Document Verification Desk
            </h1>
          </div>
          <p className="text-xs text-neutral-600">
            Agricultural Extension Officers can inspect uploaded Patta/Chitta, Aadhaar, and bank passbooks against Tamil Nadu Revenue Department databases.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 bg-white p-2 rounded-lg border border-neutral-200 text-xs">
          {["PENDING", "VERIFIED", "CORRECTION_REQUIRED", "REJECTED", "ALL"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded transition cursor-pointer font-semibold ${
                statusFilter === st
                  ? "bg-[#003366] text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              Loading verification queue...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-700 text-xs">{error}</div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              No documents in the selected queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-semibold">
                  <tr>
                    <th className="p-3.5">Document ID</th>
                    <th className="p-3.5">Farmer Name</th>
                    <th className="p-3.5">District</th>
                    <th className="p-3.5">Document Type</th>
                    <th className="p-3.5">Uploaded Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {documents.map((doc: any) => (
                    <tr key={doc._id} className="hover:bg-neutral-50">
                      <td className="p-3.5 font-mono text-[#003366] font-bold">
                        {doc.documentId}
                      </td>
                      <td className="p-3.5 font-semibold text-neutral-900">
                        {doc.farmerId?.fullName || "Farmer"}
                      </td>
                      <td className="p-3.5 text-neutral-700">
                        {doc.farmerId?.district || "TN"}
                      </td>
                      <td className="p-3.5 text-neutral-800">
                        {doc.documentType} ({doc.fileName})
                      </td>
                      <td className="p-3.5 text-neutral-500">
                        {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={doc.verificationStatus} />
                      </td>
                      <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-700 font-bold hover:underline mr-2"
                        >
                          View File
                        </a>

                        <button
                          onClick={() => openVerifyModal(doc, "VERIFIED")}
                          className="text-green-700 font-bold hover:underline cursor-pointer"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => openVerifyModal(doc, "CORRECTION_REQUIRED")}
                          className="text-amber-700 font-bold hover:underline cursor-pointer"
                        >
                          Correction
                        </button>

                        <button
                          onClick={() => openVerifyModal(doc, "REJECTED")}
                          className="text-red-700 font-bold hover:underline cursor-pointer"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Verification Action Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 text-xs">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
                <h2 className="text-base font-bold text-[#003366]">
                  Officer Decision: {actionStatus}
                </h2>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="mb-4 p-3 bg-neutral-50 rounded border border-neutral-200 space-y-1">
                <p><strong>Document:</strong> {selectedDoc.documentType}</p>
                <p><strong>File Name:</strong> {selectedDoc.fileName}</p>
                <p><strong>Applicant:</strong> {(selectedDoc as any).farmerId?.fullName}</p>
              </div>

              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Officer Verification Remarks *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:border-[#003366]"
                  />
                </div>

                <div className="pt-3 border-t border-neutral-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedDoc(null)}
                    className="px-4 py-2 border border-neutral-300 rounded font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-6 py-2 text-white font-bold rounded transition disabled:opacity-50 ${
                      actionStatus === "VERIFIED"
                        ? "bg-green-700 hover:bg-green-800"
                        : actionStatus === "REJECTED"
                        ? "bg-red-700 hover:bg-red-800"
                        : "bg-amber-700 hover:bg-amber-800"
                    }`}
                  >
                    {submitting ? "Processing..." : `Confirm ${actionStatus}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
