import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { api } from "../../services/api";
import { Sidebar } from "../../components/common/Sidebar";
import {
  ALL_TN_DISTRICTS,
  getBlocksForDistrict,
  getVillagesForBlock
} from "../../data/tamilNaduLocations";
import {
  Save,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Sprout,
  Tractor,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  Trash2,
  Layers,
  Droplets,
  Zap,
  Award,
  FileText,
  CreditCard,
  Users,
  BookOpen,
  IndianRupee,
  MapPin,
  Landmark,
  Compass
} from "lucide-react";

interface PreviousBenefitItem {
  schemeId: string;
  schemeName: string;
  applicationStatus: string;
  year: number;
  benefitReceived: string;
}

const CROPS_LIST = [
  "Paddy", "Sugarcane", "Banana", "Coconut", "Cotton", "Millets (Ragi/Kambu/Cholam)",
  "Pulses (Black Gram/Green Gram)", "Groundnut", "Sesame (Gingelly)", "Vegetables",
  "Flowers (Jasmine/Marigold)", "Turmeric", "Spices", "Maize", "Other"
];

const SOIL_TYPES_LIST = [
  "Alluvial / Loamy (Delta Soil)",
  "Red Soil (செம்மண்)",
  "Black Soil (கரிசல் மண்)",
  "Clay Loam (களிமண்)",
  "Sandy Loam (மணல் கலந்த மண்)",
  "Laterite Soil (சரளை மண்)",
  "Coastal Saline Soil"
];

const SEASONS_LIST = [
  "Kuruvai (குறுவை - Summer/Kharif)",
  "Samba (சம்பா - Main Delta Season)",
  "Thaladi (தாளடி - Late Season)",
  "Navarai (நவரை - Spring Season)",
  "Perennial / Multi-Season"
];

const MACHINERY_OPTIONS = [
  "Tractor", "Power Tiller", "Rotavator", "Cultivator", "Harvester / Reaper",
  "Seed Drill", "Paddy Transplanter", "Power Sprayer", "Battery Operated Sprayer",
  "Post Hole Digger", "Chaff Cutter", "Other Agricultural Implements"
];

const INFRASTRUCTURE_OPTIONS = [
  "Greenhouse / Polyhouse", "Shade Net House", "Farm Pond", "Borewell Recharge Pit",
  "Drying Yard", "On-Farm Storage Shed", "Cold Storage Access", "Bio-Gas Unit"
];

const ASSISTANCE_OPTIONS = [
  "Crop Cultivation & Input Subsidy",
  "Certified Seeds & Planting Material",
  "Drip / Micro-Irrigation System",
  "Sprinkler Irrigation Equipment",
  "PM-KUSUM Solar Agricultural Pump",
  "Farm Machinery & Implements Subsidy",
  "Horticulture Development & Nursery",
  "Dairy & Cattle Welfare Support",
  "Goat / Sheep Farming Scheme",
  "Poultry Development Support",
  "Fisheries & Inland Aquaculture",
  "Organic & Natural Farming Certification",
  "Pradhan Mantri Fasal Bima Yojana (Crop Insurance)",
  "Kisan Credit Card / Interest Subvention Loan",
  "Post-Harvest Storage & Drying Facilities",
  "FPO / Market Linkage & Value Addition"
];

export const FarmerProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { language } = useLanguage();

  // Master scheme list for previous benefit dropdown
  const [availableSchemes, setAvailableSchemes] = useState<Array<{ schemeId: string; schemeName: string }>>([]);

  // Form State
  const [formData, setFormData] = useState({
    // Locked Identity
    fullName: user?.fullName || "",
    gender: user?.gender || "Male",
    age: user?.age || 45,
    socialCategory: user?.socialCategory || "OBC",
    differentlyAbled: Boolean(user?.differentlyAbled),

    // Location
    district: user?.district || "Thanjavur",
    block: user?.block || "Thanjavur",
    village: user?.village || "Vallam",

    // Land Ownership & Record Details
    landOwnershipType: (user?.landOwnershipType as any) || (user?.landOwnership === "Leased" ? "Leased Land" : user?.landOwnership === "Shared" ? "Sharecropper" : "Own Land"),
    landSize: user?.landSize ?? 2.5,
    cultivableArea: user?.cultivableArea ?? user?.landSize ?? 2.5,
    irrigatedArea: user?.irrigatedArea ?? 2.0,
    rainfedArea: user?.rainfedArea ?? 0.5,
    pattaAvailable: (user?.pattaAvailable as any) || "Yes",
    surveyRecordAvailable: (user?.surveyRecordAvailable as any) || "Yes",
    registeredLease: (user?.registeredLease as any) || "Not Applicable",
    leaseDuration: user?.leaseDuration || "",
    registrationStatus: (user?.registrationStatus as any) || "Registered",
    landType: user?.landType || "Wetland (Nanjai)",

    // Cropping Profile
    cropType: user?.cropType || "Paddy",
    secondaryCrop: user?.secondaryCrop || "Black Gram (Ulundu)",
    previousCrop: user?.previousCrop || "Sesame (Ellu)",
    primaryCropArea: user?.primaryCropArea ?? 2.0,
    secondaryCropArea: user?.secondaryCropArea ?? 0.5,
    cropsPerYear: user?.cropsPerYear ?? 2,
    sowingStatus: (user?.sowingStatus as any) || "Growing",
    croppingSeason: user?.croppingSeason || "Samba (சம்பா - Main Delta Season)",
    soilType: user?.soilType || "Alluvial / Loamy (Delta Soil)",
    farmingType: user?.farmingType || "Conventional",

    // Water & Irrigation Profile
    irrigationType: user?.irrigationType || "Canal",
    irrigationMethod: (user?.irrigationMethod as any) || "Flood",
    electricityAvailable: (user?.electricityAvailable as any) || "Yes",
    agriculturalElectricityConnection: (user?.agriculturalElectricityConnection as any) || "Yes",
    pumpType: (user?.pumpType as any) || "Electric",
    existingSolarPump: (user?.existingSolarPump as any) || "No",
    dripAvailable: (user?.dripAvailable as any) || "No",
    sprinklerAvailable: (user?.sprinklerAvailable as any) || "No",
    farmPondAvailable: (user?.farmPondAvailable as any) || "No",

    // Banking & DBT
    bankAccountAvailable: (user?.bankAccountAvailable as any) || "Yes",
    dbtEnabled: (user?.dbtEnabled as any) || "Yes",
    bankAccountType: (user?.bankAccountType as any) || "Individual",

    // Farm & Allied Activities
    dairyFarming: (user?.dairyFarming as any) || ((user?.cowCount ?? 0) > 0 ? "Yes" : "No"),
    cowCount: user?.cowCount ?? 0,
    goatSheepFarming: (user?.goatSheepFarming as any) || ((user?.goatCount ?? 0) > 0 ? "Yes" : "No"),
    goatCount: user?.goatCount ?? 0,
    poultryFarming: (user?.poultryFarming as any) || ((user?.poultryCount ?? 0) > 0 ? "Yes" : "No"),
    poultryCount: user?.poultryCount ?? 0,
    fisheries: (user?.fisheries as any) || "No",
    beekeeping: (user?.beekeeping as any) || "No",
    sericulture: (user?.sericulture as any) || "No",
    mushroomCultivation: (user?.mushroomCultivation as any) || "No",
    agroforestry: (user?.agroforestry as any) || "No",
    horticultureActivity: Boolean(user?.horticultureActivity),
    horticultureType: user?.horticultureType || "None",
    horticultureArea: user?.horticultureArea ?? 0,

    // Organic & Natural
    organicFarming: (user?.organicFarming as any) || (user?.organicCertified ? "Yes" : "No"),
    organicCertificationStatus: (user?.organicCertificationStatus as any) || (user?.organicCertified ? "Certified" : "Not Applicable"),
    naturalFarming: (user?.naturalFarming as any) || "No",

    // Machinery & Infrastructure
    machineryOwnership: Boolean(user?.machineryOwnership),
    machineryList: user?.machineryList || ["Power Sprayer"],
    infrastructureList: user?.infrastructureList || [],

    // Previous Government Benefits
    subsidyReceived: (user?.subsidyReceived as any) || "No",
    previouslyReceivedBenefit: (user?.previouslyReceivedBenefit as any) || "No",
    previouslyAppliedScheme: (user?.previouslyAppliedScheme as any) || "No",
    previousApplications: (user?.previousApplications as PreviousBenefitItem[]) || [],

    // Credit & Insurance
    activeKCC: (user?.activeKCC as any) || (user?.kisanCreditCard ? "Yes" : "No"),
    agriculturalLoan: (user?.agriculturalLoan as any) || "No",
    cropInsurance: (user?.cropInsurance as any) || "No",
    hasCropLoss: (user?.hasCropLoss as any) || "No",

    // Farmer Organizations
    memberFPO: (user?.memberFPO as any) || "No",
    memberFIG: (user?.memberFIG as any) || "No",
    memberSHG: (user?.memberSHG as any) || "No",
    memberJLG: (user?.memberJLG as any) || "No",

    // Training & Skills
    educationLevel: user?.educationLevel || "Higher Secondary (12th)",
    agriTrainingReceived: (user?.agriTrainingReceived as any) || "No",
    agriTrainingType: user?.agriTrainingType || "",
    skillTraining: (user?.skillTraining as any) || "No",

    // Income
    annualIncome: user?.annualIncome ?? 120000,
    agriculturalIncome: user?.agriculturalIncome ?? 95000,
    nonAgriculturalIncome: user?.nonAgriculturalIncome ?? 25000,

    // Assistance Required
    assistanceRequired: user?.assistanceRequired || ["Crop Cultivation & Input Subsidy", "Drip / Micro-Irrigation System"]
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState<number | null>(null);

  // Load available schemes for previous benefits dynamic picker
  useEffect(() => {
    async function loadSchemes() {
      try {
        const res = await api.getSchemes({ limit: 50 });
        if (res.data?.success && Array.isArray(res.data.data?.schemes)) {
          setAvailableSchemes(
            res.data.data.schemes.map((s: any) => ({
              schemeId: s.schemeId,
              schemeName: s.schemeName
            }))
          );
        }
      } catch (e) {
        console.warn("Could not fetch schemes list:", e);
      }
    }
    loadSchemes();
  }, []);

  // Sync with user state if updated externally
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        district: user.district || prev.district,
        block: user.block || prev.block,
        village: user.village || prev.village,
        age: user.age || prev.age,
        gender: user.gender || prev.gender,
        socialCategory: user.socialCategory || prev.socialCategory,
        differentlyAbled: Boolean(user.differentlyAbled),
        landSize: user.landSize ?? prev.landSize,
        cultivableArea: user.cultivableArea ?? user.landSize ?? prev.cultivableArea,
        annualIncome: user.annualIncome ?? prev.annualIncome
      }));
    }
  }, [user]);

  // Dependent block options
  const availableBlocks = useMemo(() => {
    return getBlocksForDistrict(formData.district);
  }, [formData.district]);

  // Dependent village options
  const availableVillages = useMemo(() => {
    return getVillagesForBlock(formData.district, formData.block);
  }, [formData.district, formData.block]);

  // Ensure block and village stay valid when district changes
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    const blocks = getBlocksForDistrict(newDistrict);
    const newBlock = blocks[0]?.name || `${newDistrict} Central`;
    const villages = getVillagesForBlock(newDistrict, newBlock);
    setFormData((prev) => ({
      ...prev,
      district: newDistrict,
      block: newBlock,
      village: villages[0] || "Gramam 1"
    }));
  };

  const handleBlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBlock = e.target.value;
    const villages = getVillagesForBlock(formData.district, newBlock);
    setFormData((prev) => ({
      ...prev,
      block: newBlock,
      village: villages[0] || "Gramam 1"
    }));
  };

  // Dynamic previous benefit item management
  const handleAddPreviousBenefit = () => {
    const defaultScheme = availableSchemes[0] || { schemeId: "TN-SCH-01", schemeName: "PM-KISAN" };
    const newItem: PreviousBenefitItem = {
      schemeId: defaultScheme.schemeId,
      schemeName: defaultScheme.schemeName,
      applicationStatus: "Approved",
      year: new Date().getFullYear() - 1,
      benefitReceived: "Direct Benefit Transfer (DBT)"
    };
    setFormData((prev) => ({
      ...prev,
      previouslyAppliedScheme: "Yes",
      previouslyReceivedBenefit: "Yes",
      previousApplications: [...prev.previousApplications, newItem]
    }));
  };

  const handleRemovePreviousBenefit = (index: number) => {
    setFormData((prev) => {
      const updated = [...prev.previousApplications];
      updated.splice(index, 1);
      return {
        ...prev,
        previousApplications: updated,
        previouslyAppliedScheme: updated.length > 0 ? "Yes" : "No"
      };
    });
  };

  const handleUpdatePreviousBenefit = (index: number, field: keyof PreviousBenefitItem, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.previousApplications];
      if (field === "schemeId") {
        const found = availableSchemes.find((s) => s.schemeId === value);
        updated[index] = {
          ...updated[index],
          schemeId: value,
          schemeName: found ? found.schemeName : value
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value
        };
      }
      return { ...prev, previousApplications: updated };
    });
  };

  // Toggle machinery checkbox
  const handleToggleMachinery = (item: string) => {
    setFormData((prev) => {
      const list = prev.machineryList.includes(item)
        ? prev.machineryList.filter((m) => m !== item)
        : [...prev.machineryList, item];
      return {
        ...prev,
        machineryList: list,
        machineryOwnership: list.length > 0
      };
    });
  };

  // Toggle infrastructure checkbox
  const handleToggleInfrastructure = (item: string) => {
    setFormData((prev) => {
      const list = prev.infrastructureList.includes(item)
        ? prev.infrastructureList.filter((i) => i !== item)
        : [...prev.infrastructureList, item];
      return {
        ...prev,
        infrastructureList: list
      };
    });
  };

  // Toggle assistance checkbox
  const handleToggleAssistance = (item: string) => {
    setFormData((prev) => {
      const list = prev.assistanceRequired.includes(item)
        ? prev.assistanceRequired.filter((a) => a !== item)
        : [...prev.assistanceRequired, item];
      return {
        ...prev,
        assistanceRequired: list
      };
    });
  };

  // Validation
  const validateForm = (): string | null => {
    if (Number(formData.cultivableArea) > Number(formData.landSize)) {
      return language === "ta"
        ? `பயிரிடக்கூடிய நிலம் (${formData.cultivableArea} ஏக்கர்) மொத்த நிலத்தை (${formData.landSize} ஏக்கர்) விட அதிகமாக இருக்கக்கூடாது.`
        : `Cultivable land area (${formData.cultivableArea} Ac) cannot exceed total land area (${formData.landSize} Ac).`;
    }

    if (Number(formData.irrigatedArea) + Number(formData.rainfedArea) > Number(formData.cultivableArea) + 0.05) {
      return language === "ta"
        ? `பாசன பரப்பு (${formData.irrigatedArea}) + மானாவாரி பரப்பு (${formData.rainfedArea}) பயிரிடக்கூடிய நிலத்தை (${formData.cultivableArea} ஏக்கர்) விட அதிகமாக இருக்கக்கூடாது.`
        : `Irrigated (${formData.irrigatedArea} Ac) + Rainfed (${formData.rainfedArea} Ac) area exceeds cultivable land area (${formData.cultivableArea} Ac).`;
    }

    if (Number(formData.primaryCropArea) > Number(formData.cultivableArea) + 0.05) {
      return language === "ta"
        ? `முதன்மை பயிர் சாகுபடி பரப்பு பயிரிடக்கூடிய நிலத்தை விட அதிகமாக இருக்கக்கூடாது.`
        : `Primary crop area (${formData.primaryCropArea} Ac) cannot exceed cultivable land area (${formData.cultivableArea} Ac).`;
    }

    if (Number(formData.landSize) <= 0) {
      return language === "ta" ? "நில அளவு 0 விட அதிகமாக இருக்க வேண்டும்." : "Total land size must be greater than 0.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      // Preserve registered values for immutable identity and location rows
      const {
        fullName,
        age,
        gender,
        socialCategory,
        differentlyAbled,
        district,
        block,
        village,
        ...savePayload
      } = formData;

      const finalPayload = {
        ...savePayload,
        fullName: user?.fullName || formData.fullName,
        age: user?.age ?? formData.age,
        gender: user?.gender || formData.gender,
        socialCategory: user?.socialCategory || formData.socialCategory,
        differentlyAbled: user?.differentlyAbled ?? formData.differentlyAbled,
        district: user?.district || formData.district,
        block: user?.block || formData.block,
        village: user?.village || formData.village
      };

      const res = await api.updateFarmerProfile(finalPayload);
      if (res.data?.success) {
        if (res.data.data?.farmer) {
          updateUser(res.data.data.farmer);
        }
        const total = res.data.data?.totalEligible ?? res.data.data?.recommendations?.length;
        setMatchCount(total);
        setSuccessMsg(
          language === "ta"
            ? `விவசாய சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது! ${total ?? 0} தகுதியான திட்டங்கள் கண்டறியப்பட்டன.`
            : `Profile successfully saved! Updated recommendations generated with ${total ?? 0} eligible schemes.`
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to save profile. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="farmer-profile-page" className="min-h-screen bg-slate-50 flex">
      <Sidebar type="FARMER" />

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto">
        {/* Official Header Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full mb-2 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>GOVERNMENT OF TAMIL NADU • DEPARTMENT OF AGRICULTURE</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {language === "ta" ? "விவசாயி சுயவிவரம் மற்றும் தகுதி தரவு" : "Farmer Profile & Eligibility Registry"}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {language === "ta"
                  ? "துல்லியமான அரசு திட்ட பரிந்துரைகளைப் பெற உங்கள் விவசாய மற்றும் பண்ணை விவரங்களைப் பூர்த்தி செய்யவும்."
                  : "Maintain an accurate profile for rule-based verification and intelligent scheme recommendations."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/recommendations"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg transition border border-slate-300"
              >
                <Award className="w-4 h-4 text-emerald-700" />
                <span>{language === "ta" ? "பரிந்துரைகள் பார்க்க" : "View Recommendations"}</span>
              </Link>
              <button
                type="submit"
                form="farmer-profile-form"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? (language === "ta" ? "சேமிக்கிறது..." : "Saving...") : (language === "ta" ? "சுயவிவரத்தை சேமி" : "Save Profile")}</span>
              </button>
            </div>
          </div>

          {/* Feedback banners */}
          {successMsg && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-start gap-3 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{successMsg}</p>
                {matchCount !== null && (
                  <div className="mt-2">
                    <Link
                      to="/recommendations"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
                    >
                      <span>{language === "ta" ? "உடனடியாக தகுதியான திட்டங்களைப் பார்க்கவும்" : "View eligible schemes matched to your updated profile"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded-lg flex items-start gap-3 text-red-900">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Profile Form */}
        <form id="farmer-profile-form" onSubmit={handleSubmit} className="space-y-6">

          {/* SECTION 1: PERSONAL & IDENTITY (NON-EDITABLE REGISTRATION DATA) */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {language === "ta" ? "தனிநபர் மற்றும் அடையாள விவரங்கள்" : "Personal & Identity Details"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {language === "ta"
                      ? "பதிவு செய்த போது பெறப்பட்ட அடையாள தரவுகள் (மாற்ற முடியாதவை)"
                      : "Identity verification records bound to farmer registration (Read-only)"}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-md border border-amber-200">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>{language === "ta" ? "பதிவு விவரம் • மாற்ற முடியாது" : "Registration Locked • Non-Editable"}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "முழு பெயர் (ஆதார் படி)" : "Full Name (as per record)"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={formData.fullName || user?.fullName || "Farmer"}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 cursor-not-allowed pr-8 font-medium select-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {language === "ta" ? "பதிவு செய்யப்பட்ட ஆதார் பெயர்" : "As registered on portal"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "பதிவு செய்யப்பட்ட அலைபேசி எண்" : "Registered Mobile Number"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={user?.mobile || "9876543210"}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 cursor-not-allowed pr-8 font-medium select-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {language === "ta" ? "OTP சரிபார்க்கப்பட்ட எண்" : "Verified registration mobile"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "வயது (ஆண்டுகள்)" : "Age (Years)"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={`${formData.age || user?.age || 45} ${language === "ta" ? "ஆண்டுகள்" : "Years"}`}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 cursor-not-allowed pr-8 font-medium select-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {language === "ta" ? "பதிவு செய்த வயது" : "As provided at registration"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "பாலினம்" : "Gender"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={`${formData.gender || user?.gender || "Male"} (${(formData.gender || user?.gender) === "Female" ? (language === "ta" ? "பெண்" : "Female") : (formData.gender || user?.gender) === "Other" ? (language === "ta" ? "இதர" : "Other") : (language === "ta" ? "ஆண்" : "Male")})`}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 cursor-not-allowed pr-8 font-medium select-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {language === "ta" ? "பதிவு செய்த பாலினம்" : "Non-editable registration field"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "சமூக பிரிவு" : "Social Category"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={`${formData.socialCategory || user?.socialCategory || "MBC"} (${(formData.socialCategory || user?.socialCategory) === "MBC" ? "மிகவும் பிற்படுத்தப்பட்டோர்" : (formData.socialCategory || user?.socialCategory) === "OBC" ? "பிற்படுத்தப்பட்டோர்" : (formData.socialCategory || user?.socialCategory) === "SC" ? "ஆதிதிராவிடர்" : (formData.socialCategory || user?.socialCategory) === "ST" ? "பழங்குடியினர்" : "General / OC"})`}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 cursor-not-allowed pr-8 font-medium select-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {language === "ta" ? "இடஒதுக்கீடு சரிபார்ப்பு தரவு" : "Community reservation tier"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "மாற்றுத்திறனாளி முன்னுரிமை" : "Special Welfare (Differently Abled)"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={formData.differentlyAbled ? (language === "ta" ? "ஆம் (5% முன்னுரிமை ஒதுக்கீடு)" : "Yes (5% Priority Allocation)") : (language === "ta" ? "இல்லை" : "No")}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 cursor-not-allowed pr-8 font-medium select-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {language === "ta" ? "மருத்துவ நல வாரிய பதிவு" : "Welfare priority status"}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2.5 text-xs text-slate-600">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {language === "ta"
                  ? "தனிநபர் மற்றும் அடையாள விவரங்கள் பதிவு செய்யும் போது அளித்த தரவுகளின் படி பூட்டப்பட்டுள்ளன. மாற்றங்களுக்கு உங்கள் வட்டார வேளாண்மை உதவி இயக்குநரை அணுகவும்."
                  : "Personal and identity rows are immutable to preserve registration integrity. To request official updates, please visit your Block Assistant Director of Agriculture."}
              </span>
            </div>
          </section>

          {/* SECTION 2: LOCATION DETAILS (NON-EDITABLE REGISTRATION DATA) */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {language === "ta" ? "இருப்பிட விவரங்கள்" : "Location Details"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {language === "ta"
                      ? "அரசு பதிவு செய்யப்பட்ட மாவட்டம், வட்டாரம் மற்றும் கிராமம் (மாற்ற முடியாதவை)"
                      : "Official district, block, and revenue village jurisdiction (Read-only)"}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-md border border-amber-200">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>{language === "ta" ? "இருப்பிடம் • மாற்ற முடியாது" : "Jurisdiction Locked • Non-Editable"}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "மாவட்டம்" : "District"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={formData.district || user?.district || "Thanjavur"}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 cursor-not-allowed pr-8 font-semibold select-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {language === "ta" ? "அரசு பதிவு மாவட்டம்" : "Registered district territory"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "வட்டாரம் / தாலுகா" : "Block / Taluk"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={formData.block || user?.block || "Thanjavur"}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 cursor-not-allowed pr-8 font-semibold select-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {language === "ta" ? "வேளாண் விரிவாக்க வட்டாரம்" : "Agricultural extension circle"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "வருவாய் கிராமம்" : "Revenue Village"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={formData.village || user?.village || "Vallam"}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 cursor-not-allowed pr-8 font-semibold select-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {language === "ta" ? "வருவாய் கிராம எல்லை" : "Revenue village boundary"}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2.5 text-xs text-slate-600">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {language === "ta"
                  ? "இருப்பிட எல்லை விவரங்கள் உங்கள் விவசாய கணக்கு பதிவோடு நிரந்தரமாக இணைக்கப்பட்டுள்ளன. மாவட்ட வாரியான மானிய ஒதுக்கீடுகள் இதன்படி மட்டுமே கணக்கிடப்படும்."
                  : "Location rows are non-editable and reflect the geographic jurisdiction selected upon account registration to calculate district quota allocations."}
              </span>
            </div>
          </section>

          {/* SECTION 3: LAND OWNERSHIP & LAND RECORD DETAILS */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  3
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {language === "ta" ? "நில உரிமை மற்றும் நில ஆவண விவரங்கள்" : "Land Ownership & Record Details"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {language === "ta" ? "பட்டா, சர்வே எண் மற்றும் சாகுபடி நில விவரங்கள்" : "Patta, Survey verification, and cultivable land area breakdown"}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                {Number(formData.landSize) <= 2.5
                  ? "Marginal Farmer (குறு விவசாயி)"
                  : Number(formData.landSize) <= 5.0
                  ? "Small Farmer (சிறு விவசாயி)"
                  : "Medium/Large Farmer"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "நில உரிமை வகை" : "Land Ownership Type"}
                </label>
                <select
                  value={formData.landOwnershipType}
                  onChange={(e) => setFormData({ ...formData, landOwnershipType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Own Land">Own Land (சொந்த நிலம்)</option>
                  <option value="Leased Land">Leased Land (குத்தகை நிலம்)</option>
                  <option value="Tenant Farmer">Tenant Farmer (குத்தகை விவசாயி)</option>
                  <option value="Sharecropper">Sharecropper (பங்கு சாகுபடியாளர்)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "மொத்த நில அளவு (ஏக்கர்)" : "Total Land Area (Acres)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.landSize}
                  onChange={(e) => setFormData({ ...formData, landSize: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "பயிரிடக்கூடிய நிலம் (ஏக்கர்)" : "Cultivable Land Area (Acres)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.cultivableArea}
                  onChange={(e) => setFormData({ ...formData, cultivableArea: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "நில வகை" : "Land Classification"}
                </label>
                <select
                  value={formData.landType}
                  onChange={(e) => setFormData({ ...formData, landType: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Wetland (Nanjai)">Wetland (நஞ்சை)</option>
                  <option value="Dryland (Punjai)">Dryland (புஞ்சை)</option>
                  <option value="Garden Land (Thottam)">Garden Land (தோட்டம்)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "பாசன நில பரப்பு (ஏக்கர்)" : "Irrigated Land Area (Acres)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.irrigatedArea}
                  onChange={(e) => setFormData({ ...formData, irrigatedArea: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "மானாவாரி பரப்பு (ஏக்கர்)" : "Rainfed Land Area (Acres)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.rainfedArea}
                  onChange={(e) => setFormData({ ...formData, rainfedArea: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "பட்டா ஆவணம் உள்ளதா?" : "Patta Available?"}
                </label>
                <select
                  value={formData.pattaAvailable}
                  onChange={(e) => setFormData({ ...formData, pattaAvailable: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Yes">Yes (ஆம் - கணினி பட்டா உள்ளது)</option>
                  <option value="No">No (இல்லை)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "புல எண் / வரைபடம் உள்ளதா?" : "Survey / Sub-division Record?"}
                </label>
                <select
                  value={formData.surveyRecordAvailable}
                  onChange={(e) => setFormData({ ...formData, surveyRecordAvailable: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Yes">Yes (சரிபார்க்கப்பட்டது)</option>
                  <option value="No">No (இல்லை)</option>
                </select>
              </div>

              {/* Conditional Lease Duration */}
              {["Leased Land", "Tenant Farmer", "Sharecropper"].includes(formData.landOwnershipType) && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === "ta" ? "பதிவு செய்யப்பட்ட குத்தகை ஒப்பந்தம்?" : "Registered Lease Agreement?"}
                    </label>
                    <select
                      value={formData.registeredLease}
                      onChange={(e) => setFormData({ ...formData, registeredLease: e.target.value as any })}
                      className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Yes">Yes (பதிவு செய்யப்பட்டது)</option>
                      <option value="No">No (வாய்மொழி ஒப்பந்தம்)</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === "ta" ? "குத்தகை காலம் (ஆண்டுகள்)" : "Lease Duration (Years)"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3 Years"
                      value={formData.leaseDuration}
                      onChange={(e) => setFormData({ ...formData, leaseDuration: e.target.value })}
                      className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* SECTION 4: CROPPING PROFILE */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                4
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {language === "ta" ? "பயிர்கள் மற்றும் சாகுபடி சுயவிவரம்" : "Cropping Profile"}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === "ta" ? "முதன்மை பயிர், சுழற்சி முறை மற்றும் மண் வகை" : "Primary crop, secondary crop, soil profile, and crop cycle"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "முதன்மை பயிர் (Primary Crop)" : "Primary Crop"}
                </label>
                <select
                  value={formData.cropType}
                  onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {CROPS_LIST.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "முதன்மை பயிர் பரப்பு (ஏக்கர்)" : "Primary Crop Area (Acres)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.primaryCropArea}
                  onChange={(e) => setFormData({ ...formData, primaryCropArea: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "இரண்டாம் நிலை பயிர்" : "Secondary Crop (Intercrop/Catch crop)"}
                </label>
                <select
                  value={formData.secondaryCrop}
                  onChange={(e) => setFormData({ ...formData, secondaryCrop: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">None (இல்லை)</option>
                  {CROPS_LIST.map((crop) => (
                    <option key={`sec-${crop}`} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "செயலில் உள்ள பருவம்" : "Active Cropping Season"}
                </label>
                <select
                  value={formData.croppingSeason}
                  onChange={(e) => setFormData({ ...formData, croppingSeason: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {SEASONS_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "மண் வகை" : "Soil Type"}
                </label>
                <select
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {SOIL_TYPES_LIST.map((soil) => (
                    <option key={soil} value={soil}>
                      {soil}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "விதைப்பு நிலை" : "Current Sowing Status"}
                </label>
                <select
                  value={formData.sowingStatus}
                  onChange={(e) => setFormData({ ...formData, sowingStatus: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Planned">Planned (திட்டமிடப்பட்டுள்ளது)</option>
                  <option value="Sown">Sown / Transplanted (விதைக்கப்பட்டது)</option>
                  <option value="Growing">Vegetative / Growing (வளர்ச்சி நிலை)</option>
                  <option value="Harvested">Harvesting Stage (அறுவடை நிலை)</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 5: WATER & IRRIGATION PROFILE */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                5
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {language === "ta" ? "நீர் மற்றும் பாசன சுயவிவரம்" : "Water & Irrigation Profile"}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === "ta" ? "பாசன ஆதாரம், மின் இணைப்பு மற்றும் சோலார் பம்ப் விவரங்கள்" : "Source, irrigation method, agricultural power connection, and solar pump details"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "பாசன ஆதாரம்" : "Irrigation Source"}
                </label>
                <select
                  value={formData.irrigationType}
                  onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                >
                  <option value="Canal">Canal (வாய்க்கால் பாசனம்)</option>
                  <option value="Borewell">Borewell (ஆழ்துளை கிணறு)</option>
                  <option value="Open Well">Open Well (திறந்தவெளி கிணறு)</option>
                  <option value="River / Tank">River / Tank (ஆறு / குளம் பாசனம்)</option>
                  <option value="Rainfed Only">Rainfed Only (மானாவாரி மட்டும்)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "பாசன முறை" : "Irrigation Method"}
                </label>
                <select
                  value={formData.irrigationMethod}
                  onChange={(e) => setFormData({ ...formData, irrigationMethod: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Flood">Flood Irrigation (வாய்க்கால் பாசனம்)</option>
                  <option value="Drip">Drip Irrigation (சொட்டு நீர் பாசனம்)</option>
                  <option value="Sprinkler">Sprinkler (தெளிப்பு நீர் பாசனம்)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "விவசாய இலவச மின் இணைப்பு உள்ளதா?" : "Agricultural Electricity Connection?"}
                </label>
                <select
                  value={formData.agriculturalElectricityConnection}
                  onChange={(e) => setFormData({ ...formData, agriculturalElectricityConnection: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Yes">Yes (TANGEDCO இலவச மின் இணைப்பு உள்ளது)</option>
                  <option value="No">No (இணைப்பு இல்லை)</option>
                  <option value="Don't Know">Waiting in Priority List</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "பம்ப் வகை" : "Pump Type Installed"}
                </label>
                <select
                  value={formData.pumpType}
                  onChange={(e) => setFormData({ ...formData, pumpType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Electric">Electric Submersible / Monobloc</option>
                  <option value="Diesel">Diesel Engine Pump</option>
                  <option value="Solar">Solar Powered Pump</option>
                  <option value="None">None (பம்ப்செட் இல்லை)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "தற்போது சோலார் பம்ப் உள்ளதா?" : "Existing Solar Agricultural Pump?"}
                </label>
                <select
                  value={formData.existingSolarPump}
                  onChange={(e) => setFormData({ ...formData, existingSolarPump: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="No">No (இல்லை - PM-KUSUM மானியம் தேவை)</option>
                  <option value="Yes">Yes (ஏற்கனவே உள்ளது)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "சொட்டு நீர் பாசனம் பொருத்தப்பட்டுள்ளதா?" : "Drip Irrigation Installed?"}
                </label>
                <select
                  value={formData.dripAvailable}
                  onChange={(e) => setFormData({ ...formData, dripAvailable: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="No">No (இல்லை - 100% மானியத்திற்கு தகுதியானவர்)</option>
                  <option value="Yes">Yes (ஏற்கனவே நிறுவப்பட்டுள்ளது)</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 6: BANKING & DBT (Zero Sensitive Info) */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                6
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {language === "ta" ? "வங்கி கணக்கு மற்றும் நேரடி பணப்பரிமாற்றம் (DBT)" : "Banking & Direct Benefit Transfer (DBT)"}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === "ta" ? "அரசு மானியம் பெற ஆதார் இணைக்கப்பட்ட வங்கி நிலை (ரகசிய எண்கள் கேட்கப்படாது)" : "Aadhaar-seeded bank account status (No sensitive PINs or account numbers collected)"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "வங்கி கணக்கு உள்ளதா?" : "Active Bank Account Available?"}
                </label>
                <select
                  value={formData.bankAccountAvailable}
                  onChange={(e) => setFormData({ ...formData, bankAccountAvailable: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Yes">Yes (செயலில் உள்ள வங்கி கணக்கு உள்ளது)</option>
                  <option value="No">No (வங்கி கணக்கு இல்லை)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "ஆதார் நேரடி பணப்பரிமாற்றம் (DBT Enabled)?" : "DBT Enabled (Aadhaar Seeded)?"}
                </label>
                <select
                  value={formData.dbtEnabled}
                  onChange={(e) => setFormData({ ...formData, dbtEnabled: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Yes">Yes (DBT இணைக்கப்பட்டுள்ளது)</option>
                  <option value="No">No (இணைக்கப்படவில்லை)</option>
                  <option value="Don't Know">Don't Know (தெரியவில்லை)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "வங்கி கணக்கு வகை" : "Bank Account Type"}
                </label>
                <select
                  value={formData.bankAccountType}
                  onChange={(e) => setFormData({ ...formData, bankAccountType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Individual">Individual Account (தனிநபர் கணக்கு)</option>
                  <option value="Joint">Joint Account (கூட்டு கணக்கு)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 7: FARM & ALLIED ACTIVITIES */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                7
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {language === "ta" ? "பண்ணை மற்றும் தொடர்புடைய செயல்பாடுகள்" : "Farm & Allied Activities"}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === "ta" ? "கால்நடை, பால் பண்ணை, கோழி வளர்ப்பு மற்றும் தோட்டக்கலை விவரங்கள்" : "Dairy cattle, goat/sheep, poultry, fisheries, and horticulture details"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Dairy */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  {language === "ta" ? "பால் பண்ணை (Dairy Cattle)?" : "Dairy Farming / Cattle?"}
                </label>
                <select
                  value={formData.dairyFarming}
                  onChange={(e) => setFormData({ ...formData, dairyFarming: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm mb-2"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
                {formData.dairyFarming === "Yes" && (
                  <div>
                    <span className="text-[11px] text-slate-600 font-medium">Cow / Buffalo Count:</span>
                    <input
                      type="number"
                      min="1"
                      value={formData.cowCount}
                      onChange={(e) => setFormData({ ...formData, cowCount: Number(e.target.value) })}
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-sm mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Goat/Sheep */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  {language === "ta" ? "ஆடு வளர்ப்பு (Goat / Sheep)?" : "Goat / Sheep Farming?"}
                </label>
                <select
                  value={formData.goatSheepFarming}
                  onChange={(e) => setFormData({ ...formData, goatSheepFarming: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm mb-2"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
                {formData.goatSheepFarming === "Yes" && (
                  <div>
                    <span className="text-[11px] text-slate-600 font-medium">Goat / Sheep Count:</span>
                    <input
                      type="number"
                      min="1"
                      value={formData.goatCount}
                      onChange={(e) => setFormData({ ...formData, goatCount: Number(e.target.value) })}
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-sm mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Poultry */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  {language === "ta" ? "கோழி வளர்ப்பு (Poultry)?" : "Poultry Birds?"}
                </label>
                <select
                  value={formData.poultryFarming}
                  onChange={(e) => setFormData({ ...formData, poultryFarming: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm mb-2"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
                {formData.poultryFarming === "Yes" && (
                  <div>
                    <span className="text-[11px] text-slate-600 font-medium">Number of Birds:</span>
                    <input
                      type="number"
                      min="1"
                      value={formData.poultryCount}
                      onChange={(e) => setFormData({ ...formData, poultryCount: Number(e.target.value) })}
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-sm mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Other Allied Activities */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "மீன் வளர்ப்பு (Fisheries)" : "Inland Fisheries / Aquaculture?"}
                </label>
                <select
                  value={formData.fisheries}
                  onChange={(e) => setFormData({ ...formData, fisheries: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes (பண்ணை குட்டை மீன் வளர்ப்பு)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "தேன் வளர்ப்பு (Beekeeping)" : "Beekeeping / Apiculture?"}
                </label>
                <select
                  value={formData.beekeeping}
                  onChange={(e) => setFormData({ ...formData, beekeeping: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "தோட்டக்கலை வகை" : "Horticulture Activity"}
                </label>
                <select
                  value={formData.horticultureType}
                  onChange={(e) => setFormData({ ...formData, horticultureType: e.target.value, horticultureActivity: e.target.value !== "None" })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  <option value="None">None (இல்லை)</option>
                  <option value="Vegetables">Vegetables (காய்கறிகள்)</option>
                  <option value="Fruits">Fruits (பழங்கள்)</option>
                  <option value="Flowers">Flowers (பூக்கள்)</option>
                  <option value="Spices">Spices / Plantation (வாசனை பயிர்கள்)</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 8: ORGANIC & NATURAL FARMING */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                8
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {language === "ta" ? "இயற்கை மற்றும் கரிம விவசாயம்" : "Organic & Natural Farming"}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === "ta" ? "PKVY மற்றும் இயற்கை வேளாண் சான்றிதழ் விவரங்கள்" : "PKVY scheme incentives and organic conversion status"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "கரிம விவசாய நடைமுறை" : "Practicing Organic Farming?"}
                </label>
                <select
                  value={formData.organicFarming}
                  onChange={(e) => setFormData({ ...formData, organicFarming: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="No">No (இல்லை - Conventional)</option>
                  <option value="Yes">Yes (செயல்படுத்தப்படுகிறது)</option>
                  <option value="Planning to Adopt">Planning to Adopt (தொடங்க திட்டம் உள்ளது)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "கரிம சான்றிதழ் நிலை" : "Organic Certification Status"}
                </label>
                <select
                  value={formData.organicCertificationStatus}
                  onChange={(e) => setFormData({ ...formData, organicCertificationStatus: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="Certified">Certified Organic (TNOCD / PGS-India சான்றளிக்கப்பட்டவர்)</option>
                  <option value="Under Conversion">Under Conversion (மாற்றத்தில் உள்ளது)</option>
                  <option value="Not Certified">Not Certified (சான்றிதழ் இல்லை)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "இயற்கை விவசாயம் (Zero Budget / Natural)" : "Natural Farming Practiced?"}
                </label>
                <select
                  value={formData.naturalFarming}
                  onChange={(e) => setFormData({ ...formData, naturalFarming: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes (ஜீவாமிர்தம் / இயற்கை உரம்)</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 9: FARM MACHINERY & INFRASTRUCTURE */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                9
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {language === "ta" ? "பண்ணை இயந்திரங்கள் மற்றும் உள்கட்டமைப்பு" : "Farm Machinery & Infrastructure Ownership"}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === "ta" ? "தற்போது உங்களிடம் உள்ள கருவிகள் மற்றும் பண்ணை உள்கட்டமைப்பு" : "Owned implements, power tillers, sprayers, and on-farm storage"}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <span className="block text-xs font-semibold text-slate-700 mb-2">
                {language === "ta" ? "பண்ணை கருவிகள் மற்றும் இயந்திரங்கள்:" : "Agricultural Machinery & Implements Owned:"}
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {MACHINERY_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                      formData.machineryList.includes(item)
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-medium"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.machineryList.includes(item)}
                      onChange={() => handleToggleMachinery(item)}
                      className="rounded text-emerald-700 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-2">
                {language === "ta" ? "பண்ணை உள்கட்டமைப்பு வசதிகள்:" : "On-Farm Infrastructure:"}
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {INFRASTRUCTURE_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                      formData.infrastructureList.includes(item)
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-medium"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.infrastructureList.includes(item)}
                      onChange={() => handleToggleInfrastructure(item)}
                      className="rounded text-emerald-700 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 10: PREVIOUS GOVERNMENT BENEFITS (With Master Scheme Picker) */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  10
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {language === "ta" ? "முந்தைய அரசு திட்ட நன்மைகள்" : "Previous Government Benefits Received"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {language === "ta" ? "முந்தைய 3 ஆண்டுகளில் பெறப்பட்ட மானியங்கள் மற்றும் திட்ட விவரங்கள்" : "Track previous subsidies to avoid duplicate exclusions"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddPreviousBenefit}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded border border-slate-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === "ta" ? "+ திட்டம் சேர்க்க" : "+ Add Previous Scheme"}</span>
              </button>
            </div>

            {formData.previousApplications.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-500">
                {language === "ta"
                  ? "முந்தைய திட்ட நன்மைகள் எதுவும் பதிவு செய்யப்படவில்லை. புதிய விண்ணப்பங்களுக்கு முன்னுரிமை கிடைக்கும்."
                  : "No previous scheme benefits logged. You have clean eligibility for new machinery and input subsidies."}
              </div>
            ) : (
              <div className="space-y-3">
                {formData.previousApplications.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row items-center gap-3">
                    <div className="flex-1 w-full">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Scheme Name (from Master Registry):</span>
                      <select
                        value={item.schemeId}
                        onChange={(e) => handleUpdatePreviousBenefit(idx, "schemeId", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium"
                      >
                        {availableSchemes.map((s) => (
                          <option key={s.schemeId} value={s.schemeId}>
                            [{s.schemeId}] {s.schemeName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full md:w-32">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Year:</span>
                      <input
                        type="number"
                        min="2018"
                        max={new Date().getFullYear()}
                        value={item.year}
                        onChange={(e) => handleUpdatePreviousBenefit(idx, "year", Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                    </div>

                    <div className="w-full md:w-36">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Status:</span>
                      <select
                        value={item.applicationStatus}
                        onChange={(e) => handleUpdatePreviousBenefit(idx, "applicationStatus", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      >
                        <option value="Approved">Benefit Received</option>
                        <option value="Submitted">Under Processing</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePreviousBenefit(idx)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition mt-4 md:mt-0"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION 11: CREDIT & INSURANCE DETAILS */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                11
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {language === "ta" ? "கடன் மற்றும் பயிர் காப்பீட்டு விவரங்கள்" : "Credit & Insurance Details"}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === "ta" ? "கிசான் கிரெடிட் கார்டு (KCC) மற்றும் பயிர் காப்பீடு நிலை" : "KCC loan subvention, active crop insurance, and previous crop loss history"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "செயலில் உள்ள கிசான் கிரெடிட் கார்டு (KCC)?" : "Active Kisan Credit Card (KCC)?"}
                </label>
                <select
                  value={formData.activeKCC}
                  onChange={(e) => setFormData({ ...formData, activeKCC: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="No">No (KCC அட்டை இல்லை - புதிய அட்டைக்கு தகுதி)</option>
                  <option value="Yes">Yes (செயலில் உள்ளது)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "பயிர் காப்பீடு செய்யப்பட்டுள்ளதா (PMFBY)?" : "PMFBY Crop Insurance Status?"}
                </label>
                <select
                  value={formData.cropInsurance}
                  onChange={(e) => setFormData({ ...formData, cropInsurance: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="No">Not Insured (காப்பீடு செய்யப்படவில்லை)</option>
                  <option value="Yes">Insured for Current Season (காப்பீடு செய்யப்பட்டது)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "முந்தைய பயிர் இழப்பு ஏற்பட்டதா?" : "Experienced Previous Crop Loss?"}
                </label>
                <select
                  value={formData.hasCropLoss}
                  onChange={(e) => setFormData({ ...formData, hasCropLoss: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="No">No (இழப்பில்லை)</option>
                  <option value="Yes">Yes (வறட்சி / புயல் / வெள்ள இழப்பு)</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 12: FARMER ORGANIZATIONS */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                12
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {language === "ta" ? "விவசாயி குழுக்கள் மற்றும் சங்கங்கள்" : "Farmer Organization Details"}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === "ta" ? "FPO, SHG அல்லது உழவர் உற்பத்தியாளர் குழு உறுப்பினர் விவரம்" : "FPO, FIG, and Self Help Group memberships for collective subsidy benefits"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "உழவர் உற்பத்தியாளர் நிறுவனம் (FPO) உறுப்பினர்?" : "FPO (Farmer Producer Org) Member?"}
                </label>
                <select
                  value={formData.memberFPO}
                  onChange={(e) => setFormData({ ...formData, memberFPO: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes (FPO உறுப்பினர் - முன்னுரிமை இணைப்பு)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "சுய உதவிக் குழு (SHG) உறுப்பினர்?" : "Self-Help Group (SHG) Member?"}
                </label>
                <select
                  value={formData.memberSHG}
                  onChange={(e) => setFormData({ ...formData, memberSHG: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "விவசாயி ஆர்வலர் குழு (FIG) உறுப்பினர்?" : "Farmer Interest Group (FIG)?"}
                </label>
                <select
                  value={formData.memberFIG}
                  onChange={(e) => setFormData({ ...formData, memberFIG: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 13: TRAINING & SKILLS */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                13
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {language === "ta" ? "பயிற்சி மற்றும் கல்வித்தகுதி" : "Training & Agricultural Skills"}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === "ta" ? "வேளாண் விரிவாக்க மைய பயிற்சி மற்றும் கல்வி தகுதி" : "KVK / ATMA agricultural training history"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "கல்வித் தகுதி" : "Education Level"}
                </label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  <option value="Primary (1-5)">Primary (1-5th)</option>
                  <option value="Secondary (10th)">Secondary (10th Standard)</option>
                  <option value="Higher Secondary (12th)">Higher Secondary (12th Standard)</option>
                  <option value="Graduate / Diploma">Graduate / Diploma</option>
                  <option value="Literate">Literate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "அரசு வேளாண் பயிற்சி பெற்றுள்ளீர்களா?" : "Agri Training Received (ATMA / KVK)?"}
                </label>
                <select
                  value={formData.agriTrainingReceived}
                  onChange={(e) => setFormData({ ...formData, agriTrainingReceived: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes (பயிற்சி பெறப்பட்டது)</option>
                </select>
              </div>

              {formData.agriTrainingReceived === "Yes" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === "ta" ? "பயிற்சி வகை" : "Training Topic / Type"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Organic inputs, Drip maintenance"
                    value={formData.agriTrainingType}
                    onChange={(e) => setFormData({ ...formData, agriTrainingType: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              )}
            </div>
          </section>

          {/* SECTION 14: AGRICULTURAL & HOUSEHOLD INCOME */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                14
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {language === "ta" ? "வேளாண் மற்றும் குடும்ப வருமானம்" : "Agricultural & Household Income"}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === "ta" ? "ஆண்டு குடும்ப வருமானம் மற்றும் வேளாண் வருமானப் பகிர்வு" : "Household annual income ceiling verification (distinct from agricultural income)"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "ஆண்டு மொத்த குடும்ப வருமானம் (₹)" : "Annual Household Income (₹)"}
                </label>
                <input
                  type="number"
                  step="5000"
                  min="10000"
                  value={formData.annualIncome}
                  onChange={(e) => setFormData({ ...formData, annualIncome: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Used to verify income ceilings under welfare schemes</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "வேளாண் வருமானம் (₹)" : "Estimated Agricultural Income (₹)"}
                </label>
                <input
                  type="number"
                  step="5000"
                  min="0"
                  value={formData.agriculturalIncome}
                  onChange={(e) => setFormData({ ...formData, agriculturalIncome: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "ta" ? "இதர / விவசாயம் சாரா வருமானம் (₹)" : "Non-Agricultural Income (₹)"}
                </label>
                <input
                  type="number"
                  step="5000"
                  min="0"
                  value={formData.nonAgriculturalIncome}
                  onChange={(e) => setFormData({ ...formData, nonAgriculturalIncome: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* SECTION 15: WHAT ASSISTANCE ARE YOU LOOKING FOR? (Preference Matching) */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                15
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {language === "ta" ? "நீங்கள் எந்த வகையான அரசு உதவியை எதிர்பார்க்கிறீர்கள்?" : "What Assistance Are You Looking For?"}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === "ta" ? "உங்கள் முன்னுரிமைகளுக்கு ஏற்ப திட்ட பரிந்துரைகள் வரிசைப்படுத்தப்படும்" : "Select domains of interest to boost matching priority for relevant schemes"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ASSISTANCE_OPTIONS.map((item) => (
                <label
                  key={item}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition ${
                    formData.assistanceRequired.includes(item)
                      ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.assistanceRequired.includes(item)}
                    onChange={() => handleToggleAssistance(item)}
                    className="rounded text-emerald-700 focus:ring-emerald-500 w-4 h-4 mt-0.5"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Form Actions Footer */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              {language === "ta"
                ? "சுயவிவரத்தை சேமித்தவுடன் உங்களின் அனைத்து தகுதியான அரசு திட்டங்களும் உடனடியாக புதுப்பிக்கப்படும்."
                : "Upon saving, our eligibility engine will automatically re-evaluate all state and central schemes for your farm."}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to="/recommendations"
                className="flex-1 sm:flex-none text-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg border border-slate-300 transition"
              >
                {language === "ta" ? "ரத்துசெய்" : "Cancel"}
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? (language === "ta" ? "சேமிக்கிறது..." : "Saving...") : (language === "ta" ? "சுயவிவரத்தை சேமி & பரிந்துரைகளைப் புதுப்பி" : "Save Profile & Refresh Matches")}</span>
              </button>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
};
export default FarmerProfilePage;
