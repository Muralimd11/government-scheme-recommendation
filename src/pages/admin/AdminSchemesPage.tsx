import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { SchemeItem } from "../../types";
import { Sidebar } from "../../components/common/Sidebar";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon
} from "@mui/icons-material";

export const AdminSchemesPage: React.FC = () => {
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getSchemes({ limit: 100, search: searchTerm });
      if (res.data.success) {
        setSchemes(res.data.data.schemes);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load schemes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleOpenCreate = () => {
    setEditingScheme(null);
    setFormData({
      schemeId: `TN-SCHEME-${Math.floor(100 + Math.random() * 900)}`,
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
      officialWebsite: "https://www.tn.gov.in",
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
      fetchSchemes();
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
      fetchSchemes();
    } catch (err: any) {
      alert(err.message || "Failed to save scheme.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen flex flex-col md:flex-row">
      <Sidebar type="ADMIN" />

      <main className="flex-1 p-4 md:p-8 max-w-7xl">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#003366]">
              Government Scheme Master Management
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Add new schemes, update subsidy ceilings, eligibility criteria, and verified departmental portal URLs.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="bg-[#2E7D32] hover:bg-green-800 text-white font-bold px-4 py-2 rounded text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <AddIcon fontSize="small" />
            <span>Add New Scheme</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchSchemes();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search scheme name, department, or ID..."
                className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded text-xs focus:outline-none focus:border-[#003366]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#003366] text-white px-5 py-2 rounded text-xs font-semibold"
            >
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              Loading schemes...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-700 text-xs">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-semibold">
                  <tr>
                    <th className="p-3.5">Scheme ID</th>
                    <th className="p-3.5">Scheme Name</th>
                    <th className="p-3.5">Level</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {schemes.map((scheme) => (
                    <tr key={scheme._id} className="hover:bg-neutral-50">
                      <td className="p-3.5 font-mono text-[#003366] font-bold">
                        {scheme.schemeId}
                      </td>
                      <td className="p-3.5 font-medium text-neutral-900">
                        {scheme.schemeName}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            scheme.governmentLevel === "Tamil Nadu Government"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {scheme.governmentLevel}
                        </span>
                      </td>
                      <td className="p-3.5 text-neutral-600 truncate max-w-xs">
                        {scheme.department}
                      </td>
                      <td className="p-3.5 text-neutral-700">
                        {scheme.category}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={scheme.status} />
                      </td>
                      <td className="p-3.5 text-right space-x-3">
                        <button
                          onClick={() => handleOpenEdit(scheme)}
                          className="text-[#003366] font-bold hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(scheme._id, scheme.schemeName)}
                          className="text-red-700 font-bold hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                      Scheme Code / ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.schemeId}
                      onChange={(e) => setFormData({ ...formData, schemeId: e.target.value })}
                      className="w-full border border-neutral-300 rounded px-3 py-2 text-xs uppercase focus:outline-none focus:border-[#003366]"
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
                      {["Subsidy", "Irrigation", "Credit", "Insurance", "Mechanization", "Infrastructure", "Organic Farming"].map((c) => (
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
                      value={formData.landholdingMax}
                      onChange={(e) => setFormData({ ...formData, landholdingMax: Number(e.target.value) })}
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
