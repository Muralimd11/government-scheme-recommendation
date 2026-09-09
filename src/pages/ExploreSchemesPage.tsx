import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { SchemeItem } from "../types";
import { useLanguage } from "../context/LanguageContext";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Verified as VerifiedIcon,
  AttachMoney as MoneyIcon,
  Description as DocIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon
} from "@mui/icons-material";

const TN_DISTRICTS = [
  "All", "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
  "Vellore", "Viluppuram", "Virudhunagar"
];

const DEPARTMENTS = [
  "All",
  "Department of Agriculture",
  "Department of Horticulture and Plantation Crops",
  "Agricultural Engineering Department",
  "Department of Agricultural Marketing and Agri Business",
  "Ministry of Agriculture & Farmers Welfare, GoI"
];

const GOV_LEVELS = ["All", "Tamil Nadu Government", "Central Government"];
const CATEGORIES = ["All", "Subsidy", "Irrigation", "Credit", "Insurance", "Mechanization", "Infrastructure", "Organic Farming", "Marketing"];

export const ExploreSchemesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedGovLevel, setSelectedGovLevel] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");

  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedDept !== "All") params.department = selectedDept;
      if (selectedGovLevel !== "All") params.governmentLevel = selectedGovLevel;
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (selectedDistrict !== "All") params.district = selectedDistrict;

      const res = await api.getSchemes(params);
      if (res.data.success) {
        setSchemes(res.data.data.schemes);
        setPagination(res.data.data.pagination);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load government schemes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [pagination.page, selectedDept, selectedGovLevel, selectedCategory, selectedDistrict]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchSchemes();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDept("All");
    setSelectedGovLevel("All");
    setSelectedCategory("All");
    setSelectedDistrict("All");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#003366]">
            {language === "ta" ? "அரசு விவசாய நலத்திட்டங்கள்" : "Explore Government Schemes"}
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            {language === "ta"
              ? "தமிழ்நாடு மற்றும் மத்திய அரசுகளின் அதிகாரப்பூர்வ விவசாய திட்டங்கள், மானியங்கள் மற்றும் கடன் உதவிகள்."
              : "Official repository of Central and Tamil Nadu Government agricultural subsidies, welfare packages, and equipment assistance."}
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:border-[#003366]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#003366] hover:bg-blue-900 text-white px-6 py-2 rounded text-sm font-semibold transition cursor-pointer"
            >
              {t("searchBtn")}
            </button>
          </form>

          {/* Filter dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-neutral-600 font-semibold mb-1">
                {t("filterLevel")}
              </label>
              <select
                value={selectedGovLevel}
                onChange={(e) => {
                  setSelectedGovLevel(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full border border-neutral-300 rounded px-2.5 py-1.5 bg-white text-neutral-800"
              >
                {GOV_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">
                {t("filterDepartment")}
              </label>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full border border-neutral-300 rounded px-2.5 py-1.5 bg-white text-neutral-800"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full border border-neutral-300 rounded px-2.5 py-1.5 bg-white text-neutral-800"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">
                {t("filterDistrict")}
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full border border-neutral-300 rounded px-2.5 py-1.5 bg-white text-neutral-800"
              >
                {TN_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(selectedGovLevel !== "All" ||
            selectedDept !== "All" ||
            selectedCategory !== "All" ||
            selectedDistrict !== "All" ||
            searchTerm) && (
            <div className="flex justify-end pt-1">
              <button
                onClick={clearFilters}
                className="text-xs text-red-700 hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Schemes List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#003366] border-t-transparent mb-3" />
            <p className="text-sm text-neutral-600">Loading government schemes repository...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded text-center">
            {error}
          </div>
        ) : schemes.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded p-8 text-center text-neutral-600">
            <p className="text-base font-semibold">No schemes found matching your filter criteria.</p>
            <p className="text-xs mt-1">Try relaxing some filters or search for generic terms like "paddy", "irrigation", or "subsidy".</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-[#003366] text-white rounded text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme) => (
              <div
                key={scheme._id}
                className="bg-white rounded-lg border border-neutral-200 shadow-xs hover:border-[#003366] transition flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        scheme.governmentLevel === "Tamil Nadu Government"
                          ? "bg-green-100 text-green-900 border border-green-300"
                          : "bg-blue-100 text-blue-900 border border-blue-300"
                      }`}
                    >
                      {scheme.governmentLevel}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      {scheme.schemeId}
                    </span>
                  </div>

                  {/* Scheme Title */}
                  <h3 className="text-base font-bold text-[#003366] leading-snug mb-1">
                    {language === "ta" && scheme.schemeNameTamil ? scheme.schemeNameTamil : scheme.schemeName}
                  </h3>
                  {language === "en" && scheme.schemeNameTamil && (
                    <p className="text-xs text-neutral-500 mb-2">{scheme.schemeNameTamil}</p>
                  )}

                  {/* Department */}
                  <p className="text-xs text-neutral-600 mb-3 font-medium">
                    {scheme.department}
                  </p>

                  {/* Benefits summary */}
                  <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200 mb-4">
                    <p className="text-xs text-neutral-800 leading-relaxed font-medium line-clamp-2">
                      <span className="text-[#2E7D32] font-bold">Benefits: </span>
                      {scheme.benefits}
                    </p>
                  </div>

                  {/* Key eligibility tags */}
                  <div className="space-y-1.5 text-xs text-neutral-600">
                    <div className="flex items-center gap-1.5">
                      <CheckIcon style={{ fontSize: 14 }} className="text-green-600 shrink-0" />
                      <span>
                        Land Limit: {scheme.landholdingMax > 0 ? `Up to ${scheme.landholdingMax} Acres` : "No Upper Land Limit"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckIcon style={{ fontSize: 14 }} className="text-green-600 shrink-0" />
                      <span className="truncate">
                        Crops: {scheme.cropTypes.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
                  <Link
                    to={`/schemes/${scheme._id}`}
                    className="text-xs font-bold text-[#003366] hover:text-blue-900 transition"
                  >
                    {t("viewDetails")}
                  </Link>
                  <Link
                    to={`/farmer/applications/new?schemeId=${scheme._id}`}
                    className="bg-[#2E7D32] hover:bg-green-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded transition flex items-center gap-1"
                  >
                    <span>{t("applyNow")}</span>
                    <ArrowIcon style={{ fontSize: 14 }} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              className="px-3 py-1.5 border border-neutral-300 rounded text-xs disabled:opacity-40 disabled:cursor-not-allowed bg-white"
            >
              Previous
            </button>
            <span className="text-xs text-neutral-600">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} Schemes)
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              className="px-3 py-1.5 border border-neutral-300 rounded text-xs disabled:opacity-40 disabled:cursor-not-allowed bg-white"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
