import React, { useState, useEffect } from "react";
import { useSearchParams, useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import { ApplicationItem, SchemeItem, DocumentItem } from "../../types";
import { Sidebar } from "../../components/common/Sidebar";
import { StatusBadge } from "../../components/common/StatusBadge";
import { useLanguage } from "../../context/LanguageContext";
import {
  Add as AddIcon,
  Description as DocIcon,
  CheckCircle as CheckIcon,
  Timeline as TimelineIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  UploadFile as UploadIcon
} from "@mui/icons-material";

export const ApplicationsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { id: routeAppId } = useParams();
  const navigate = useNavigate();
  const { t, language, tTerm } = useLanguage();

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [myDocs, setMyDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Application Modal State
  const initialSchemeParam = searchParams.get("schemeId") || searchParams.get("scheme") || "";
  const [isApplying, setIsApplying] = useState(Boolean(initialSchemeParam));
  const [selectedSchemeId, setSelectedSchemeId] = useState(initialSchemeParam);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Application Detail Modal
  const [activeApp, setActiveApp] = useState<ApplicationItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [appRes, schemeRes, docRes] = await Promise.all([
        api.getMyApplications(),
        api.getSchemes({ limit: 100 }),
        api.getMyDocuments()
      ]);

      if (appRes.data.success) {
        const apps: ApplicationItem[] = appRes.data.data.applications;
        setApplications(apps);

        const targetAppId = routeAppId || searchParams.get("appId");
        if (targetAppId) {
          const found = apps.find(
            (a) => a._id === targetAppId || a.applicationId === targetAppId
          );
          if (found) setActiveApp(found);
        }
      }
      if (schemeRes.data.success) setSchemes(schemeRes.data.data.schemes);
      if (docRes.data.success) setMyDocs(docRes.data.data.documents);
    } catch (err: any) {
      setError(err.message || "Failed to load application data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedScheme = schemes.find((s) => s._id === selectedSchemeId || s.schemeId === selectedSchemeId);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchemeId) {
      setSubmitError(language === "ta" ? "தயவுசெய்து ஒரு அரசு திட்டத்தைத் தேர்ந்தெடுக்கவும்." : "Please select a government scheme.");
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitError(null);

      // Map selected docs
      const attachedDocs = myDocs
        .filter((d) => selectedDocs.includes(d.documentId))
        .map((d) => ({
          documentId: d.documentId,
          documentType: d.documentType,
          fileName: d.fileName,
          fileUrl: d.fileUrl
        }));

      const res = await api.createApplication({
        schemeId: selectedScheme?._id || selectedSchemeId,
        documents: attachedDocs
      });

      if (res.data.success) {
        setSubmitSuccess(
          language === "ta"
            ? `விண்ணப்பம் ${res.data.data.application.applicationId} வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!`
            : `Application ${res.data.data.application.applicationId} submitted successfully!`
        );
        setIsApplying(false);
        setSelectedSchemeId("");
        setSelectedDocs([]);
        loadData();
      }
    } catch (err: any) {
      setSubmitError(err.message || (language === "ta" ? "விண்ணப்பத்தை சமர்ப்பிக்க முடியவில்லை." : "Failed to submit application."));
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleDocSelection = (docId: string) => {
    if (selectedDocs.includes(docId)) {
      setSelectedDocs(selectedDocs.filter((id) => id !== docId));
    } else {
      setSelectedDocs([...selectedDocs, docId]);
    }
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen flex flex-col md:flex-row">
      <Sidebar type="FARMER" />

      <main className="flex-1 p-4 md:p-8 max-w-6xl">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#003366]">
              {language === "ta" ? "விவசாயி நலத்திட்ட விண்ணப்பங்கள்" : "My Scheme Applications"}
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              {language === "ta"
                ? "உங்கள் சமர்ப்பிக்கப்பட்ட நலத்திட்ட விண்ணப்பங்களின் முன்னேற்றம், அலுவலர் கருத்துகள் மற்றும் கள ஆய்வை கண்காணிக்கவும்."
                : "Track the progress, officer remarks, and field verification of your submitted scheme applications."}
            </p>
          </div>

          <button
            onClick={() => setIsApplying(true)}
            className="bg-[#2E7D32] hover:bg-green-800 text-white font-bold px-4 py-2 rounded text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <AddIcon fontSize="small" />
            <span>{language === "ta" ? "புதிய திட்டத்திற்கு விண்ணப்பிக்க" : "Apply for New Scheme"}</span>
          </button>
        </div>

        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded text-xs mb-6">
            {submitSuccess}
          </div>
        )}

        {/* Applications Table */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#003366] border-t-transparent mb-2" />
              <p className="text-xs text-neutral-500">
                {language === "ta" ? "விண்ணப்பங்கள் ஏற்றப்படுகின்றன..." : "Loading your applications..."}
              </p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-700 text-xs">{error}</div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 text-xs">
              <p className="text-sm font-semibold mb-2">
                {language === "ta" ? "விண்ணப்பங்கள் எதுவும் காணப்படவில்லை." : "No applications found."}
              </p>
              <p className="mb-4">
                {language === "ta" ? "நீங்கள் இதுவரை அரசு நலத்திட்டங்களுக்கு விண்ணப்பிக்கவில்லை." : "You have not submitted any government scheme applications yet."}
              </p>
              <button
                onClick={() => setIsApplying(true)}
                className="bg-[#003366] text-white px-4 py-2 rounded text-xs font-semibold"
              >
                {language === "ta" ? "இப்போது திட்டத்திற்கு விண்ணப்பிக்கவும்" : "Apply for a Scheme Now"}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-semibold">
                  <tr>
                    <th className="p-3.5">{language === "ta" ? "விண்ணப்ப எண்" : "Application ID"}</th>
                    <th className="p-3.5">{language === "ta" ? "திட்டத்தின் பெயர்" : "Scheme Name"}</th>
                    <th className="p-3.5">{language === "ta" ? "சமர்ப்பிக்கப்பட்ட தேதி" : "Submitted Date"}</th>
                    <th className="p-3.5">{language === "ta" ? "நிலை" : "Status"}</th>
                    <th className="p-3.5">{language === "ta" ? "சரிபார்ப்பு நிலை" : "Verification"}</th>
                    <th className="p-3.5 text-right">{language === "ta" ? "செயல்கள்" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-neutral-50">
                      <td className="p-3.5 font-mono text-[#003366] font-bold">
                        {app.applicationId}
                      </td>
                      <td className="p-3.5 font-medium text-neutral-900">
                        {language === "ta" && app.schemeNameTamil ? app.schemeNameTamil : app.schemeName}
                      </td>
                      <td className="p-3.5 text-neutral-500">
                        {new Date(app.submittedDate).toLocaleDateString(language === "ta" ? "ta-IN" : "en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="p-3.5">
                        <span className="text-[11px] font-medium text-neutral-600">
                          {language === "ta" ? tTerm(app.verificationStatus) : app.verificationStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setActiveApp(app)}
                          className="text-[#003366] font-bold hover:underline cursor-pointer"
                        >
                          {language === "ta" ? "காலவரிசையைக் காண்க" : "View Timeline"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: New Scheme Application */}
        {isApplying && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
                <h2 className="text-lg font-bold text-[#003366]">
                  {language === "ta" ? "அரசு திட்டத்திற்கு விண்ணப்பிக்க" : "Apply for Government Scheme"}
                </h2>
                <button
                  onClick={() => setIsApplying(false)}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  <CloseIcon />
                </button>
              </div>

              {submitError && (
                <div className="bg-red-50 text-red-800 p-3 rounded text-xs mb-4">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    {language === "ta" ? "திட்டத்தைத் தேர்ந்தெடுக்கவும் *" : "Select Scheme *"}
                  </label>
                  <select
                    required
                    value={selectedSchemeId}
                    onChange={(e) => setSelectedSchemeId(e.target.value)}
                    className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#003366]"
                  >
                    <option value="">{language === "ta" ? "-- அரசு திட்டத்தைத் தேர்வு செய்க --" : "-- Choose Government Scheme --"}</option>
                    {schemes.map((s) => (
                      <option key={s._id} value={s._id}>
                        {language === "ta" && s.schemeNameTamil ? s.schemeNameTamil : s.schemeName} ({language === "ta" ? tTerm(s.governmentLevel) : s.governmentLevel})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedScheme && (
                  <div className="p-4 bg-blue-50/50 border border-blue-200 rounded space-y-2">
                    <p className="font-bold text-[#003366] text-sm">
                      {language === "ta" && selectedScheme.schemeNameTamil ? selectedScheme.schemeNameTamil : selectedScheme.schemeName}
                    </p>
                    <p className="text-neutral-700">
                      <strong>{language === "ta" ? "நன்மைகள்: " : "Benefits: "}</strong>
                      {language === "ta" && selectedScheme.benefitsTamil ? selectedScheme.benefitsTamil : selectedScheme.benefits}
                    </p>
                    <div>
                      <strong className="block text-neutral-700 mb-1">
                        {language === "ta" ? "தேவையான ஆவணங்கள்:" : "Required Documents:"}
                      </strong>
                      <ul className="list-disc pl-5 space-y-0.5 text-neutral-600">
                        {selectedScheme.requiredDocuments?.map((doc, i) => (
                          <li key={i}>{language === "ta" ? tTerm(doc) : doc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Attach Uploaded Documents */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-semibold text-neutral-700">
                      {language === "ta" ? "உங்கள் காப்பகத்திலிருந்து தேவையான ஆவணங்களை இணைக்கவும்:" : "Attach Supporting Documents from Your Repository:"}
                    </label>
                    <Link
                      to="/farmer/documents"
                      target="_blank"
                      className="text-[#003366] hover:underline text-[11px] font-bold"
                    >
                      {language === "ta" ? "+ புதிய ஆவணத்தை பதிவேற்றுக" : "+ Upload New Document"}
                    </Link>
                  </div>

                  {myDocs.length === 0 ? (
                    <div className="p-3 bg-neutral-50 rounded border border-neutral-200 text-neutral-500">
                      {language === "ta"
                        ? "உங்கள் சுயவிவரத்தில் ஆவணங்கள் எதுவும் இல்லை. நீங்கள் இப்போதும் விண்ணப்பிக்கலாம், கள ஆய்வின் போது வட்டார வேளாண் அலுவலர் உங்கள் பட்டா/சிட்டாவை சரிபார்ப்பார்."
                        : "No documents found in your profile. You can still submit now and your Block Agricultural Extension Officer will verify your Patta/Chitta during field inspection."}
                    </div>
                  ) : (
                    <div className="space-y-2 border border-neutral-200 rounded p-3 bg-neutral-50">
                      {myDocs.map((doc) => (
                        <label
                          key={doc.documentId}
                          className="flex items-center gap-3 p-2 bg-white rounded border border-neutral-200 cursor-pointer hover:border-blue-300"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDocs.includes(doc.documentId)}
                            onChange={() => toggleDocSelection(doc.documentId)}
                            className="w-4 h-4 text-[#003366]"
                          />
                          <div className="flex-1">
                            <span className="font-bold text-neutral-800 block">
                              {language === "ta" ? tTerm(doc.documentType) : doc.documentType} ({doc.fileName})
                            </span>
                            <span className="text-[11px] text-neutral-500 font-mono">
                              {language === "ta" ? "எண்: " : "ID: "}{doc.documentId}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsApplying(false)}
                    className="px-4 py-2 border border-neutral-300 rounded font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    {language === "ta" ? "ரத்து செய்" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading || !selectedSchemeId}
                    className="px-6 py-2 bg-[#2E7D32] hover:bg-green-800 text-white rounded font-bold transition disabled:opacity-50"
                  >
                    {submitLoading
                      ? (language === "ta" ? "சமர்ப்பிக்கப்படுகிறது..." : "Submitting...")
                      : (language === "ta" ? "உறுதிசெய்து விண்ணப்பிக்க" : "Confirm & Submit Application")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Application Status Timeline & Verification Details */}
        {activeApp && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
                <div>
                  <span className="text-[11px] font-mono text-neutral-500">
                    {language === "ta" ? "விண்ணப்ப விவரங்கள்" : "Application Details"}
                  </span>
                  <h2 className="text-lg font-bold text-[#003366]">
                    {activeApp.applicationId}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveApp(null)}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-neutral-500 block">
                    {language === "ta" ? "விண்ணப்பிக்கப்பட்ட திட்டம்:" : "Scheme Applied:"}
                  </span>
                  <strong className="text-sm text-neutral-900">
                    {language === "ta" && activeApp.schemeNameTamil ? activeApp.schemeNameTamil : activeApp.schemeName}
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded border border-neutral-200">
                  <div>
                    <span className="text-neutral-500 block">
                      {language === "ta" ? "தற்போதைய நிலை:" : "Current Status:"}
                    </span>
                    <StatusBadge status={activeApp.status} />
                  </div>
                  <div>
                    <span className="text-neutral-500 block">
                      {language === "ta" ? "சரிபார்ப்பு நிலை:" : "Verification Status:"}
                    </span>
                    <strong className="text-neutral-800">
                      {language === "ta" ? tTerm(activeApp.verificationStatus) : activeApp.verificationStatus}
                    </strong>
                  </div>
                </div>

                {activeApp.adminRemarks && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900">
                    <strong>{language === "ta" ? "வேளாண் அலுவலரின் கருத்துக்கள்:" : "Agriculture Officer Remarks:"}</strong>
                    <p className="mt-1">{activeApp.adminRemarks}</p>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h3 className="font-bold text-[#003366] text-xs uppercase tracking-wider mb-3">
                    {language === "ta" ? "விண்ணப்ப வரலாறு & தணிக்கைப் பதிவு" : "Application History & Audit Log"}
                  </h3>
                  <div className="space-y-3 pl-2 border-l-2 border-blue-200 ml-2">
                    {activeApp.applicationHistory?.map((hist, i) => (
                      <div key={i} className="relative pl-4">
                        <div className="absolute -left-[13px] top-0.5 w-3 h-3 rounded-full bg-[#003366]" />
                        <p className="font-bold text-neutral-800">
                          {language === "ta" ? tTerm(hist.status) : hist.status} - <span className="font-normal text-neutral-500">{new Date(hist.timestamp).toLocaleString(language === "ta" ? "ta-IN" : "en-IN")}</span>
                        </p>
                        <p className="text-neutral-600 mt-0.5">{hist.remarks}</p>
                        <p className="text-[10px] text-neutral-400">
                          {language === "ta" ? "புதுப்பித்தவர்: " : "Updated by: "}{hist.updatedBy}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attached Documents */}
                {activeApp.documents && activeApp.documents.length > 0 && (
                  <div>
                    <h3 className="font-bold text-neutral-700 text-xs mb-2">
                      {language === "ta" ? "இணைக்கப்பட்ட ஆதார ஆவணங்கள்:" : "Attached Supporting Documents:"}
                    </h3>
                    <div className="space-y-1">
                      {activeApp.documents.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-neutral-50 rounded border border-neutral-200">
                          <span className="font-medium text-neutral-800">
                            {language === "ta" ? tTerm(d.documentType) : d.documentType}: {d.fileName}
                          </span>
                          <a
                            href={d.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#003366] font-bold hover:underline"
                          >
                            {language === "ta" ? "கோப்பைக் காண்க" : "View File"}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-200 text-right">
                <button
                  onClick={() => setActiveApp(null)}
                  className="px-4 py-2 bg-[#003366] text-white rounded font-semibold text-xs"
                >
                  {language === "ta" ? "மூடு" : "Close"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
