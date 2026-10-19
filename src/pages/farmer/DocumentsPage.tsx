import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { DocumentItem } from "../../types";
import { Sidebar } from "../../components/common/Sidebar";
import { StatusBadge } from "../../components/common/StatusBadge";
import { useLanguage } from "../../context/LanguageContext";
import {
  UploadFile as UploadIcon,
  Delete as DeleteIcon,
  Description as DocIcon,
  CheckCircle as CheckIcon,
  Visibility as ViewIcon
} from "@mui/icons-material";

const DOC_TYPES = [
  "Land Ownership Document (Patta / Chitta)",
  "Village Adangal / Cultivation Certificate",
  "Aadhaar Card",
  "Bank Passbook (Front Page with IFSC)",
  "Community Certificate (SC/ST/MBC/BC)",
  "Income Certificate",
  "Soil Health Card",
  "Tractor / Machinery Registration"
];

export const DocumentsPage: React.FC = () => {
  const { language, t, tTerm } = useLanguage();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState(DOC_TYPES[0]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMyDocuments();
      if (res.data.success) {
        setDocuments(res.data.data.documents);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load uploaded documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError(language === "ta" ? "தயவுசெய்து பதிவேற்ற ஒரு கோப்பைத் தேர்ந்தெடுக்கவும்." : "Please choose a file to upload.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadSuccess(null);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("documentType", documentType);

      const res = await api.uploadDocument(formData);
      if (res.data.success) {
        setUploadSuccess(language === "ta" ? "அதிகாரி சரிபார்ப்பிற்காக ஆவணம் வெற்றிகரமாக பதிவேற்றப்பட்டது." : "Document uploaded successfully for officer verification.");
        setSelectedFile(null);
        fetchDocs();
      }
    } catch (err: any) {
      setError(err.message || (language === "ta" ? "ஆவணத்தை பதிவேற்ற முடியவில்லை." : "Failed to upload document."));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm(language === "ta" ? "இந்த ஆவணத்தை நிச்சயமாக நீக்க விரும்புகிறீர்களா?" : "Are you sure you want to delete this document?")) return;
    try {
      await api.deleteDocument(docId);
      fetchDocs();
    } catch (err: any) {
      setError(err.message || (language === "ta" ? "ஆவணத்தை நீக்க முடியவில்லை." : "Failed to delete document."));
    }
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen flex flex-col md:flex-row">
      <Sidebar type="FARMER" />

      <main className="flex-1 p-4 md:p-8 max-w-5xl">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6">
          <h1 className="text-2xl font-bold text-[#003366]">
            {language === "ta" ? "உழவர் ஆவணங்கள் காப்பகம்" : "Farmer Document Repository"}
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            {language === "ta"
              ? "உங்கள் பட்டா/சிட்டா, ஆதார் மற்றும் வங்கிக் கணக்கு புத்தகத்தை பாதுகாப்பாக பதிவேற்றவும். திட்ட ஒப்புதலின் போது வட்டார வேளாண்மை அலுவலரால் இவை சரிபார்க்கப்படும்."
              : "Upload and securely store your Patta/Chitta, Aadhaar, and Bank Passbook. Attached documents are verified by the Block Agricultural Officer during scheme approval."}
          </p>
        </div>

        {uploadSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded text-xs mb-6">
            {uploadSuccess}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-xs mb-6">
            {error}
          </div>
        )}

        {/* Upload Card */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-8">
          <h2 className="text-sm font-bold text-[#003366] uppercase tracking-wider mb-4 border-b border-neutral-200 pb-2 flex items-center gap-2">
            <UploadIcon fontSize="small" />
            <span>{language === "ta" ? "புதிய சரிபார்ப்பு ஆவணத்தை பதிவேற்றுக" : "Upload New Verification Document"}</span>
          </h2>

          <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs items-end">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                {language === "ta" ? "ஆவண வகை *" : "Document Type *"}
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full border border-neutral-300 rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#003366]"
              >
                {DOC_TYPES.map((dt) => (
                  <option key={dt} value={dt}>
                    {language === "ta" ? tTerm(dt) : dt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                {language === "ta" ? "கோப்பைத் தேர்ந்தெடுக்கவும் (PDF, JPG, PNG 10MB வரை) *" : "Select File (PDF, JPG, PNG up to 10MB) *"}
              </label>
              <input
                type="file"
                required
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-xs bg-white"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full bg-[#003366] hover:bg-blue-900 text-white font-bold py-2 px-4 rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <UploadIcon fontSize="small" />
                <span>
                  {uploading
                    ? (language === "ta" ? "பதிவேற்றப்படுகிறது..." : "Uploading...")
                    : (language === "ta" ? "ஆவணத்தை பதிவேற்றுக" : "Upload Document")}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 font-bold text-sm text-neutral-800">
            {language === "ta" ? `பதிவேற்றப்பட்ட ஆவணங்கள் (${documents.length})` : `Uploaded Documents (${documents.length})`}
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              {language === "ta" ? "பதிவேற்றப்பட்ட ஆவணங்கள் ஏற்றப்படுகின்றன..." : "Loading uploaded documents..."}
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              {language === "ta" ? "இதுவரை ஆவணங்கள் எதுவும் பதிவேற்றப்படவில்லை. திட்ட ஒப்புதல்களை விரைவுபடுத்த உங்கள் பட்டா/சிட்டாவை பதிவேற்றவும்." : "No documents uploaded yet. Upload your Patta/Chitta to expedite scheme approvals."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-semibold">
                  <tr>
                    <th className="p-3.5">{language === "ta" ? "ஆவண எண்" : "Document ID"}</th>
                    <th className="p-3.5">{language === "ta" ? "வகை" : "Type"}</th>
                    <th className="p-3.5">{language === "ta" ? "கோப்பு பெயர்" : "File Name"}</th>
                    <th className="p-3.5">{language === "ta" ? "பதிவேற்றப்பட்ட தேதி" : "Uploaded Date"}</th>
                    <th className="p-3.5">{language === "ta" ? "சரிபார்ப்பு நிலை" : "Verification"}</th>
                    <th className="p-3.5 text-right">{language === "ta" ? "செயல்கள்" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {documents.map((doc) => (
                    <tr key={doc._id} className="hover:bg-neutral-50">
                      <td className="p-3.5 font-mono text-[#003366] font-bold">
                        {doc.documentId}
                      </td>
                      <td className="p-3.5 font-medium text-neutral-900">
                        {language === "ta" ? tTerm(doc.documentType) : doc.documentType}
                      </td>
                      <td className="p-3.5 text-neutral-600">
                        {doc.fileName}
                      </td>
                      <td className="p-3.5 text-neutral-500">
                        {new Date(doc.uploadedAt).toLocaleDateString(language === "ta" ? "ta-IN" : "en-IN")}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={doc.verificationStatus} />
                      </td>
                      <td className="p-3.5 text-right space-x-3">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#003366] font-bold hover:underline"
                        >
                          {language === "ta" ? "கோப்பைக் காண்க" : "View File"}
                        </a>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="text-red-700 font-medium hover:underline cursor-pointer"
                        >
                          {language === "ta" ? "நீக்குக" : "Delete"}
                        </button>
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
