import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { SchemeItem } from "../../types";
import { Sidebar } from "../../components/common/Sidebar";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  Refresh as RefreshIcon,
  Launch as LaunchIcon
} from "@mui/icons-material";

export const AdminSchemesPage: React.FC = () => {
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalSchemes, setTotalSchemes] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<SchemeItem | null>(null);
  const [formData, setFormData] = useState<Partial<SchemeItem>>({
    schemeId: "",
    schemeName: "",
    schemeNameTamil: "",
    governmentLevel: "Tamil Nadu Government",
    department: "Department of Agriculture",
    category: "Subsidy",
    description: "",
    benefits: "",
    landholdingMax: 5,
    cropTypes: ["Paddy", "Sugarcane"],
    applicableDistricts: ["All"],
    requiredDocuments: ["Patta / Chitta", "Aadhaar Card", "Bank Passbook"],
    officialWebsite: "https://www.tnagrisnet.tn.gov.in",
    status: "ACTIVE"
  });

  const [saving, setSaving] = useState(false);

  const fetchSchemes = async (pageNum = page, currentLimit = limit) => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: pageNum,
        limit: currentLimit,
        search: activeSearch.trim() || undefined
      };
      if (categoryFilter !== "All") params.category = categoryFilter;
      if (statusFilter !== "All") params.status = statusFilter;

      const res = await api.getSchemes(params);
      if (res.data?.success) {
        setSchemes(res.data.data.schemes || []);
        if (res.data.data.pagination) {
          setTotalSchemes(res.data.data.pagination.total || 0);
          setTotalPages(res.data.data.pagination.totalPages || 1);
          setPage(res.data.data.pagination.page || 1);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load government schemes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes(page, limit);
  }, [page, limit, categoryFilter, statusFilter, activeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setActiveSearch("");
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
  };

  const handleOpenCreate = () => {
    setEditingScheme(null);
    setFormData({
      schemeId: `TN-AGRI-SCHEME-${Date.now().toString().slice(-4)}`,
      schemeName: "",
      schemeNameTamil: "",
      governmentLevel: "Tamil Nadu Government",
      department: "Department of Agriculture",
      category: "Subsidy",
      description: "",
      benefits: "",
      landholdingMax: 5,
      cropTypes: ["Paddy"],
      applicableDistricts: ["All"],
      requiredDocuments: ["Patta / Chitta", "Aadhaar Card", "Bank Passbook"],
      officialWebsite: "https://www.tnagrisnet.tn.gov.in",
      status: "ACTIVE"
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (s: SchemeItem) => {
    setEditingScheme(s);
    setFormData({ ...s });
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete scheme: "${name}"?`)) return;
    try {
      await api.deleteScheme(id);
      fetchSchemes(page, limit);
    } catch (err: any) {
      alert(err.message || "Failed to delete scheme.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingScheme) {
        await api.updateScheme(editingScheme._id, formData);
      } else {
        await api.createScheme(formData);
      }
      setModalOpen(false);
      fetchSchemes(page, limit);
    } catch (err: any) {
      alert(err.message || "Failed to save scheme.");
    } finally {
      setSaving(false);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const startRecord = totalSchemes === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalSchemes);

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen flex flex-col md:flex-row">
      <Sidebar type="ADMIN" />

      <main className="flex-1 p-4 md:p-8 max-w-7xl">
        {/* Header Banner */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#003366] uppercase tracking-wider">
                State Agricultural Administration
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#003366] border border-blue-200">
                {totalSchemes} Schemes Total
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#003366]">
              Government Scheme Master Management
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Browse all 239 welfare schemes, update subsidy ceilings, eligibility guidelines, and departmental URLs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchSchemes(page, limit)}
              disabled={loading}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition"
              title="Refresh Schemes"
            >
              <RefreshIcon fontSize="small" className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="bg-[#2E7D32] hover:bg-green-800 text-white font-bold px-4 py-2 rounded text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <AddIcon fontSize="small" />
              <span>Add New Scheme</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs mb-6 space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-2.5 text-neutral-400" fontSize="small" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Scheme Name, Meaningful ID, or Department..."
                  className="w-full pl-9 pr-8 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:border-[#003366]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-[#003366] text-white px-5 py-2 rounded text-xs font-semibold hover:bg-blue-900 transition"
              >
                Search
              </button>
            </form>

            {/* Per-Page Selector */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 text-xs">
              <span className="text-neutral-500 font-medium">Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  setLimit(newLimit);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 border border-neutral-300 rounded bg-white text-xs font-semibold focus:outline-none focus:border-[#003366]"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
                <option value={250}>All (250)</option>
              </select>
            </div>
          </div>

          {/* Quick Category & Status Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 text-xs">
            <div className="flex items-center gap-1 text-neutral-500 mr-1">
              <FilterIcon fontSize="inherit" />
              <span className="font-semibold">Category:</span>
            </div>

            {["All", "Subsidy", "Irrigation Support", "Financial Assistance", "Crop Insurance", "Machinery Subsidy", "Horticulture", "Inputs & Seeds"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-[#003366] text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {cat}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <span className="text-neutral-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-2 py-1 border border-neutral-300 rounded bg-white text-[11px] font-medium"
              >
                <option value="All">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Schemes Table */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-xs text-neutral-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#003366] border-t-transparent mb-3" />
              <p>Loading scheme directory (Page {page} of {totalPages})...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-700 text-xs">{error}</div>
          ) : schemes.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              <p className="font-semibold text-neutral-700">No schemes found matching your search.</p>
              <button
                onClick={handleClearSearch}
                className="mt-2 text-[#003366] font-bold hover:underline"
              >
                Reset filters & search
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Meaningful Scheme ID</th>
                    <th className="py-3 px-4">Scheme Name & Details</th>
                    <th className="py-3 px-4">Govt Level</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {schemes.map((scheme) => (
                    <tr key={scheme._id} className="hover:bg-neutral-50 transition">
                      {/* Meaningful ID */}
                      <td className="py-3 px-4 align-top">
                        <span className="font-mono text-xs font-bold text-[#003366] bg-blue-50 px-2.5 py-1 rounded border border-blue-200 inline-block">
                          {scheme.schemeId}
                        </span>
                        {scheme.legacySchemeId && scheme.legacySchemeId !== scheme.schemeId && (
                          <span className="block text-[10px] text-neutral-400 font-mono mt-1" title="Original catalogue code">
                            Old: {scheme.legacySchemeId}
                          </span>
                        )}
                      </td>

                      {/* Scheme Name */}
                      <td className="py-3 px-4 max-w-sm align-top">
                        <span className="font-bold text-neutral-900 block text-xs leading-snug">
                          {scheme.schemeName}
                        </span>
                        {scheme.schemeNameTamil && (
                          <span className="text-[11px] text-neutral-500 block mt-0.5">
                            {scheme.schemeNameTamil}
                          </span>
                        )}
                        {scheme.benefits && (
                          <span className="text-[11px] text-neutral-600 line-clamp-1 mt-1 block">
                            {scheme.benefits}
                          </span>
                        )}
                      </td>

                      {/* Level */}
                      <td className="py-3 px-4 align-top">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            scheme.governmentLevel === "Tamil Nadu Government"
                              ? "bg-green-50 text-green-800 border border-green-200"
                              : "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {scheme.governmentLevel}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-neutral-600 truncate max-w-xs align-top">
                        {scheme.department}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-neutral-700 align-top">
                        <span className="px-2 py-0.5 bg-neutral-100 rounded text-[11px] font-medium">
                          {scheme.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 align-top">
                        <StatusBadge status={scheme.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right align-top whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {scheme.officialWebsite && (
                            <a
                              href={scheme.officialWebsite}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-neutral-400 hover:text-[#003366] rounded hover:bg-neutral-100"
                              title="Visit official portal"
                            >
                              <LaunchIcon fontSize="inherit" />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenEdit(scheme)}
                            className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-[#003366] font-bold rounded text-[11px] transition cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(scheme._id, scheme.schemeName)}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded text-[11px] transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls Footer */}
          {!loading && totalSchemes > 0 && (
            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-neutral-600">
                Showing <strong className="text-neutral-900">{startRecord}</strong> to{" "}
                <strong className="text-neutral-900">{endRecord}</strong> of{" "}
                <strong className="text-neutral-900">{totalSchemes}</strong> government schemes
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                  className="p-1.5 rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="First Page"
                >
                  <FirstPageIcon fontSize="small" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-1.5 rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <PrevIcon fontSize="small" />
                </button>

                {/* Page number buttons */}
                {getPageNumbers().map((pNum, idx) => {
                  if (pNum === "...") {
                    return (
                      <span key={`dots-${idx}`} className="px-2 py-1 text-neutral-400">
                        ...
                      </span>
                    );
                  }
                  const isCurrent = pNum === page;
                  return (
                    <button
                      key={`page-${pNum}`}
                      type="button"
                      onClick={() => handlePageChange(Number(pNum))}
                      className={`min-w-[28px] h-7 px-2 rounded text-xs font-bold border transition ${
                        isCurrent
                          ? "bg-[#003366] text-white border-[#003366]"
                          : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-1.5 rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <NextIcon fontSize="small" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page === totalPages}
                  className="p-1.5 rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Last Page"
                >
                  <LastPageIcon fontSize="small" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create / Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
                <h2 className="text-lg font-bold text-[#003366]">
                  {editingScheme ? "Edit Scheme Details" : "Register New Government Scheme"}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Meaningful Scheme Code / ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.schemeId}
                      onChange={(e) => setFormData({ ...formData, schemeId: e.target.value.toUpperCase() })}
                      placeholder="e.g. TN-AGRI-PM-KISAN"
                      className="w-full border border-neutral-300 rounded px-3 py-2 text-xs uppercase font-mono font-bold focus:outline-none focus:border-[#003366]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Government Level *
                    </label>
                    <select
                      value={formData.governmentLevel}
                      onChange={(e) => setFormData({ ...formData, governmentLevel: e.target.value as any })}
                      className="w-full border border-neutral-300 rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#003366]"
                    >
                      <option value="Tamil Nadu Government">Tamil Nadu Government</option>
                      <option value="Central Government">Central Government</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Scheme Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.schemeName}
                      onChange={(e) => setFormData({ ...formData, schemeName: e.target.value })}
                      className="w-full border border-neutral-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#003366]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Scheme Name (Tamil)
                    </label>
                    <input
                      type="text"
                      value={formData.schemeNameTamil || ""}
                      onChange={(e) => setFormData({ ...formData, schemeNameTamil: e.target.value })}
                      className="w-full border border-neutral-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#003366]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Department *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full border border-neutral-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#003366]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border border-neutral-300 rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#003366]"
                    >
                      {["Subsidy", "Irrigation Support", "Financial Assistance", "Crop Insurance", "Machinery Subsidy", "Horticulture", "Inputs & Seeds", "Organic Farming", "General"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Benefits & Subsidy Specifications *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    className="w-full border border-neutral-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#003366]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Scheme Overview / Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-neutral-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#003366]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Official Portal URL
                    </label>
                    <input
                      type="url"
                      value={formData.officialWebsite || ""}
                      onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
                      className="w-full border border-neutral-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#003366]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Max Landholding Ceiling (Acres, 0 for unlimited)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.landholdingMax ?? ""}
                      onChange={(e) => setFormData({ ...formData, landholdingMax: e.target.value === "" ? ("" as any) : Number(e.target.value) })}
                      className="w-full border border-neutral-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#003366]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-neutral-300 rounded font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-[#2E7D32] hover:bg-green-800 text-white rounded font-bold transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Scheme"}
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
export default AdminSchemesPage;
