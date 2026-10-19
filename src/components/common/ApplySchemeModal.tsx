import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { api } from "../../services/api";
import { SchemeItem, DocumentItem } from "../../types";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Description as DocIcon,
  UploadFile as UploadIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Agriculture as AgriIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Launch as LaunchIcon,
  Lock as LockIcon,
  HelpOutlined as HelpIcon
} from "@mui/icons-material";

export interface ApplySchemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: SchemeItem | any | null;
  onSuccess?: (applicationId: string) => void;
}

export const ApplySchemeModal: React.FC<ApplySchemeModalProps> = ({
  isOpen,
  onClose,
  scheme,
  onSuccess
}) => {
  const { user, isAuthenticated, isFarmer, isAdmin, login } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  // Application State
  const [myDocs, setMyDocs] = useState<DocumentItem[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [remarks, setRemarks] = useState("");
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    applicationId: string;
    schemeName: string;
    submittedDate: string;
  } | null>(null);

  // Quick Inline Upload State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadDocType, setUploadDocType] = useState("Patta / Chitta Land Record");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Guest Quick Sign-in State
  const [authTab, setAuthTab] = useState<"login" | "demo">("login");
  const [mobileOrEmail, setMobileOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Reset and load user docs when modal opens
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccessResult(null);
      setSelectedDocs([]);
      setRemarks("");
      setShowUploadForm(false);
      setLoginError(null);
      return;
    }

    if (isAuthenticated && isFarmer) {
      fetchFarmerDocs();
    }
  }, [isOpen, isAuthenticated, isFarmer]);

  const fetchFarmerDocs = async () => {
    try {
      setLoadingDocs(true);
      const res = await api.getMyDocuments();
      if (res.data?.success) {
        const docs: DocumentItem[] = res.data.data.documents || [];
        setMyDocs(docs);
        // By default, pre-select all existing verified or available documents
        setSelectedDocs(docs.map((d) => d.documentId));
      }
    } catch (err: any) {
      console.error("Error loading farmer documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const toggleDocSelection = (docId: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  // Quick Document Upload directly from the modal
  const handleQuickUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("documentType", uploadDocType);
      formData.append("document", uploadFile);

      const res = await api.uploadDocument(formData);
      if (res.data?.success) {
        const newDoc: DocumentItem = res.data.data.document;
        setMyDocs((prev) => [newDoc, ...prev]);
        setSelectedDocs((prev) => [...prev, newDoc.documentId]);
        setUploadFile(null);
        setShowUploadForm(false);
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  // Submit Official Scheme Application
  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheme) return;

    try {
      setSubmitting(true);
      setError(null);

      const attachedDocs = myDocs
        .filter((d) => selectedDocs.includes(d.documentId))
        .map((d) => ({
          documentId: d.documentId,
          documentType: d.documentType,
          fileName: d.fileName,
          fileUrl: d.fileUrl
        }));

      const targetSchemeId = scheme._id || scheme.schemeId;
      const res = await api.createApplication({
        schemeId: targetSchemeId,
        schemeName: scheme.schemeName,
        schemeCode: scheme.schemeId || scheme.schemeCode,
        category: scheme.category,
        department: scheme.department,
        officialWebsite: scheme.officialWebsite,
        applicationUrl: scheme.applicationUrl,
        documents: attachedDocs,
        remarks: remarks.trim()
      });

      if (res.data?.success) {
        const app = res.data.data.application;
        const redirectUrl =
          res.data.data.redirectUrl ||
          scheme.applicationUrl ||
          scheme.officialWebsite ||
          "https://tnagrisnet.tn.gov.in";

        const result = {
          applicationId: app.applicationId,
          schemeName: app.schemeName,
          submittedDate: app.submittedDate || new Date().toISOString(),
          redirectUrl
        };
        setSuccessResult(result);
        if (onSuccess) {
          onSuccess(result.applicationId);
        }

        // Auto-redirect to official government portal
        if (redirectUrl) {
          try {
            window.open(redirectUrl, "_blank", "noopener,noreferrer");
          } catch (e) {
            console.warn("Could not auto-open redirect URL:", e);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit scheme application.");
    } finally {
      setSubmitting(false);
    }
  };

  // Inline Quick Login for Guests
  const handleQuickLogin = async (preset?: "FARMER_1" | "FARMER_2") => {
    setLoginLoading(true);
    setLoginError(null);

    let identifier = mobileOrEmail.trim();
    let pass = password.trim();

    if (preset === "FARMER_1") {
      identifier = "9842100001";
      pass = "Farmer@2026";
    } else if (preset === "FARMER_2") {
      identifier = "9842100002";
      pass = "Farmer@2026";
    }

    try {
      const res = await api.login({ identifier, password: pass });
      if (res.data?.success) {
        login(res.data.data.token, res.data.data.user);
      }
    } catch (err: any) {
      setLoginError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  if (!isOpen || !scheme) return null;

  const schemeTitle =
    language === "ta" && scheme.schemeNameTamil ? scheme.schemeNameTamil : scheme.schemeName;
  const deptName = scheme.department || "Agriculture & Farmers Welfare Department";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-[#002244] text-white p-5 border-b-2 border-[#2E7D32] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#003366] rounded-xl border border-neutral-700 text-green-400 shrink-0">
              <AgriIcon fontSize="medium" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700">
                  {scheme.governmentLevel ? (language === "ta" && scheme.governmentLevelTamil ? scheme.governmentLevelTamil : scheme.governmentLevel) : (language === "ta" ? "தமிழ்நாடு அரசு" : "Tamil Nadu Government")}
                </span>
                <span className="text-[11px] text-neutral-300 font-medium">
                  {scheme.category ? (language === "ta" && scheme.categoryTamil ? scheme.categoryTamil : scheme.category) : (language === "ta" ? "வேளாண் மானியம்" : "Agricultural Subsidy")}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1 leading-snug">
                {language === "ta" ? "திட்டத்திற்கான நேரடி விண்ணப்பம்" : "Apply for Government Scheme"}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs text-neutral-700">
          {/* Scheme Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#003366] leading-tight">
                  {schemeTitle}
                </h3>
                {scheme.schemeNameTamil && language !== "ta" && (
                  <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                    {scheme.schemeNameTamil}
                  </p>
                )}
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                {scheme.schemeId || "GOVT-SCHEME"}
              </span>
            </div>

            <p className="text-[11px] text-neutral-600">
              <strong>{language === "ta" ? "துறை:" : "Department:"}</strong> {language === "ta" && scheme.departmentTamil ? scheme.departmentTamil : deptName}
            </p>

            {(scheme.benefitsTamil || scheme.benefits) && (
              <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-[11px] leading-relaxed">
                <strong className="text-emerald-800 block mb-0.5 font-bold">
                  {language === "ta" ? "வழங்கப்படும் நன்மைகள் & மானியம்:" : "Scheme Financial Benefits & Subsidy:"}
                </strong>
                {language === "ta" && scheme.benefitsTamil ? scheme.benefitsTamil : scheme.benefits}
              </div>
            )}
          </div>

          {/* Success Screen */}
          {successResult ? (
            <div className="p-6 text-center space-y-4 bg-emerald-50/60 rounded-xl border border-emerald-200 animate-fadeIn">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircleIcon style={{ fontSize: 36 }} />
              </div>

              <div>
                <h3 className="text-base font-bold text-emerald-900">
                  {language === "ta" ? "விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!" : "Application Submitted Successfully!"}
                </h3>
                <p className="text-xs text-neutral-600 mt-1 max-w-md mx-auto">
                  Your application has been registered with the Tamil Nadu Agriculture Portal and queued for Village Administrative & Extension Officer verification.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-emerald-200 inline-block font-mono text-center">
                <span className="text-[11px] text-neutral-500 block">Official Application Reference ID:</span>
                <span className="text-base font-bold text-[#003366] tracking-wide">
                  {successResult.applicationId}
                </span>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-3">
                {(successResult as any).redirectUrl && (
                  <a
                    href={(successResult as any).redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-[#2E7D32] hover:bg-green-800 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-sm inline-flex items-center gap-1.5"
                  >
                    <span>Proceed to Official Government Department Portal</span>
                    <LaunchIcon style={{ fontSize: 15 }} />
                  </a>
                )}
                <button
                  onClick={() => {
                    onClose();
                    navigate("/farmer/applications");
                  }}
                  className="px-5 py-2.5 bg-[#003366] hover:bg-blue-900 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-sm"
                >
                  {language === "ta" ? "விண்ணப்ப நிலையை காண்க" : "Track in My Applications"}
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-lg text-xs transition cursor-pointer"
                >
                  {language === "ta" ? "மூடு" : "Close & Continue Browsing"}
                </button>
              </div>
            </div>
          ) : !isAuthenticated ? (
            /* GUEST USER: INLINE QUICK LOGIN */
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-3">
                <LockIcon className="text-amber-700 shrink-0 mt-0.5" style={{ fontSize: 18 }} />
                <div>
                  <h4 className="font-bold text-xs">
                    {language === "ta" ? "விவசாயி உள்நுழைவு தேவை" : "Farmer Account Authentication Required"}
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    To link your verified land patta, Aadhaar, and bank account for DBT subsidy disbursement, sign in with your farmer account.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex border-b border-slate-200 mb-4 text-xs font-semibold">
                  <button
                    onClick={() => setAuthTab("login")}
                    className={`pb-2 px-3 border-b-2 transition cursor-pointer ${
                      authTab === "login"
                        ? "border-[#2E7D32] text-[#2E7D32]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Farmer Sign In
                  </button>
                  <button
                    onClick={() => setAuthTab("demo")}
                    className={`pb-2 px-3 border-b-2 transition cursor-pointer ${
                      authTab === "demo"
                        ? "border-[#2E7D32] text-[#2E7D32]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    ⚡ Test Accounts
                  </button>
                </div>

                {loginError && (
                  <div className="p-2.5 mb-3 bg-red-50 text-red-800 border border-red-200 rounded text-xs font-medium">
                    {loginError}
                  </div>
                )}

                {authTab === "demo" ? (
                  <div className="space-y-2.5">
                    <p className="text-[11px] text-slate-600 mb-2">
                      Click below to immediately log in as a registered farmer and apply:
                    </p>
                    <button
                      type="button"
                      disabled={loginLoading}
                      onClick={() => handleQuickLogin("FARMER_1")}
                      className="w-full text-left p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs transition cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <strong className="block text-emerald-950 font-bold">
                          🌾 Demo Farmer 1 (Thanjavur - Paddy Cultivator)
                        </strong>
                        <span className="text-[11px] text-emerald-700">
                          ID: TN-FARM-2026-1001 • Patta & Aadhaar verified
                        </span>
                      </div>
                      <span className="px-2.5 py-1 bg-[#2E7D32] text-white rounded font-bold text-[11px]">
                        Apply as Farmer 1 →
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={loginLoading}
                      onClick={() => handleQuickLogin("FARMER_2")}
                      className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs transition cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <strong className="block text-blue-950 font-bold">
                          🌱 Demo Farmer 2 (Dindigul - Horticulture Farmer)
                        </strong>
                        <span className="text-[11px] text-blue-700">
                          ID: TN-FARM-2026-1002 • Small & Marginal Farmer
                        </span>
                      </div>
                      <span className="px-2.5 py-1 bg-[#003366] text-white rounded font-bold text-[11px]">
                        Apply as Farmer 2 →
                      </span>
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleQuickLogin();
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Mobile Number or Email
                      </label>
                      <input
                        type="text"
                        required
                        value={mobileOrEmail}
                        onChange={(e) => setMobileOrEmail(e.target.value)}
                        placeholder="e.g. 9842100001"
                        className="w-full border border-neutral-300 rounded-lg p-2 text-xs focus:outline-none focus:border-[#003366]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border border-neutral-300 rounded-lg p-2 text-xs focus:outline-none focus:border-[#003366]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-2.5 bg-[#2E7D32] hover:bg-green-800 text-white font-bold rounded-lg transition disabled:opacity-50 cursor-pointer"
                    >
                      {loginLoading ? "Authenticating..." : "Sign In & Proceed to Apply"}
                    </button>
                  </form>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-500">
                  New cultivator?{" "}
                  <Link
                    to="/register"
                    onClick={onClose}
                    className="text-[#003366] font-bold hover:underline"
                  >
                    Create official farmer profile →
                  </Link>
                </div>
              </div>
            </div>
          ) : isAdmin ? (
            /* ADMIN USER VIEW */
            <div className="p-6 text-center space-y-3 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-bold text-sm text-[#003366]">
                Officer Portal Notice
              </h4>
              <p className="text-xs text-neutral-600 max-w-md mx-auto">
                You are currently logged in with an Agricultural Extension Officer administrator account. Scheme applications are submitted by citizen farmers and reviewed in your verification queue.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  to="/admin/schemes"
                  onClick={onClose}
                  className="px-4 py-2 bg-[#003366] text-white rounded-lg font-bold text-xs"
                >
                  Manage Master Schemes
                </Link>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* AUTHENTICATED FARMER APPLICATION FORM */
            <form onSubmit={handleApplicationSubmit} className="space-y-4">
              {/* Applicant Profile Snapshot */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-[11px] font-bold text-[#003366] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <PersonIcon style={{ fontSize: 15 }} />
                  <span>Applicant Information</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div>
                    <span className="text-neutral-500 block">Cultivator Name:</span>
                    <strong className="text-neutral-900">{user?.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">District:</span>
                    <strong className="text-neutral-900">{user?.district || "Tamil Nadu"}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Farmer Reg ID:</span>
                    <strong className="text-[#003366] font-mono">{user?.farmerRegistrationId || "Registered"}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Land Size:</span>
                    <strong className="text-neutral-900">{user?.landSize ? `${user.landSize} Acres` : "Recorded in Patta"}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Primary Crop:</span>
                    <strong className="text-neutral-900">{user?.cropType || "General Cultivation"}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Category:</span>
                    <strong className="text-emerald-700">{user?.farmerType || "Small / Marginal"}</strong>
                  </div>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs flex items-start gap-2">
                  <WarningIcon style={{ fontSize: 16 }} className="text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Document Selection Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-800 flex items-center gap-1.5">
                    <DocIcon style={{ fontSize: 16 }} className="text-[#003366]" />
                    <span>Attach Verified Verification Documents:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="text-[11px] text-[#003366] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <UploadIcon style={{ fontSize: 14 }} />
                    <span>{showUploadForm ? "Hide Upload" : "+ Quick Upload New File"}</span>
                  </button>
                </div>

                {/* Inline Document Upload Form */}
                {showUploadForm && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2.5 animate-fadeIn">
                    <span className="font-bold text-[#003366] block text-[11px]">
                      Upload Supporting Document (Patta/Chitta, Aadhaar, Bank Passbook):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={uploadDocType}
                        onChange={(e) => setUploadDocType(e.target.value)}
                        className="p-1.5 bg-white border border-slate-300 rounded text-xs"
                      >
                        <option value="Patta / Chitta Land Record">Patta / Chitta Land Record</option>
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Bank Passbook Front Page">Bank Passbook Front Page</option>
                        <option value="Ration Card / Smart Card">Ration Card / Smart Card</option>
                        <option value="Crop Sowing Certificate">Crop Sowing Certificate</option>
                        <option value="Other Supporting Document">Other Supporting Document</option>
                      </select>

                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="p-1 bg-white border border-slate-300 rounded text-xs"
                      />
                    </div>

                    {uploadError && (
                      <p className="text-[11px] text-red-700">{uploadError}</p>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowUploadForm(false)}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={uploading || !uploadFile}
                        onClick={handleQuickUpload}
                        className="px-3 py-1 bg-[#003366] text-white rounded text-xs font-bold disabled:opacity-50 cursor-pointer"
                      >
                        {uploading ? "Uploading..." : "Save to My Profile"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Uploaded Documents List */}
                {loadingDocs ? (
                  <div className="p-4 text-center text-neutral-500">
                    Loading your registered documents...
                  </div>
                ) : myDocs.length === 0 ? (
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-600">
                    <p className="text-[11px]">
                      No documents currently uploaded to your profile. You can submit now, or click "+ Quick Upload New File" above to attach Patta/Chitta.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                    {myDocs.map((doc) => {
                      const isChecked = selectedDocs.includes(doc.documentId);
                      return (
                        <label
                          key={doc._id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition text-[11px] ${
                            isChecked ? "bg-white border border-[#2E7D32]/50 shadow-xs" : "hover:bg-neutral-100"
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleDocSelection(doc.documentId)}
                              className="rounded text-green-700 focus:ring-green-500 shrink-0"
                            />
                            <div className="truncate">
                              <span className="font-semibold text-neutral-800 block truncate">
                                {doc.documentType}
                              </span>
                              <span className="text-[10px] text-neutral-500 truncate block">
                                {doc.fileName}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono text-[#003366] bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                            {doc.verificationStatus}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Application Remarks */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Applicant Remarks / Land Details (Optional):
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Applying for 2.5 acres Samba paddy crop in survey number 142/B..."
                  className="w-full border border-neutral-300 rounded-lg p-2 text-xs focus:outline-none focus:border-[#003366]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-neutral-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-lg font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#2E7D32] hover:bg-green-800 text-white font-bold rounded-lg text-xs transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <SendIcon fontSize="small" />
                  <span>{submitting ? "Submitting Application..." : "Submit Official Application"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
