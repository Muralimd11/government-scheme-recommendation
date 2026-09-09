import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { UserProfile } from "../../types";
import { Sidebar } from "../../components/common/Sidebar";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  Check as CheckIcon
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

export const AdminFarmersPage: React.FC = () => {
  const [farmers, setFarmers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [district, setDistrict] = useState("All");
  const [status, setStatus] = useState("All");
  const [farmerType, setFarmerType] = useState("All");

  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedFarmer, setSelectedFarmer] = useState<UserProfile | null>(null);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (district !== "All") params.district = district;
      if (status !== "All") params.status = status;
      if (farmerType !== "All") params.farmerType = farmerType;

      const res = await api.getAdminFarmers(params);
      if (res.data.success) {
        setFarmers(res.data.data.farmers);
        setPagination(res.data.data.pagination);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load farmers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, [pagination.page, district, status, farmerType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    fetchFarmers();
  };

  const handleStatusToggle = async (farmerId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
    if (!window.confirm(`Are you sure you want to set farmer account status to ${nextStatus}?`)) return;

    try {
      await api.updateFarmerStatus(farmerId, nextStatus);
      fetchFarmers();
      if (selectedFarmer && selectedFarmer._id === farmerId) {
        setSelectedFarmer({ ...selectedFarmer, accountStatus: nextStatus as any });
      }
    } catch (err: any) {
      alert(err.message || "Failed to update farmer status.");
    }
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen flex flex-col md:flex-row">
      <Sidebar type="ADMIN" />

      <main className="flex-1 p-4 md:p-8 max-w-7xl">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6">
          <h1 className="text-2xl font-bold text-[#003366]">
            State Farmer Registry & Management
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            Search, inspect land records, and manage verified cultivator accounts across Tamil Nadu districts.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs mb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, mobile, registration ID, or email..."
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-neutral-600 font-semibold mb-1">District</label>
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full border border-neutral-300 rounded px-2.5 py-1.5 bg-white"
              >
                {TN_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">Farmer Type</label>
              <select
                value={farmerType}
                onChange={(e) => {
                  setFarmerType(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full border border-neutral-300 rounded px-2.5 py-1.5 bg-white"
              >
                {["All", "Marginal", "Small", "Medium", "Large"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-600 font-semibold mb-1">Account Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full border border-neutral-300 rounded px-2.5 py-1.5 bg-white"
              >
                {["All", "ACTIVE", "DISABLED"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Farmers Table */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              Loading farmer records...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-700 text-xs">{error}</div>
          ) : farmers.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 text-xs">
              No farmers found matching query criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-semibold">
                  <tr>
                    <th className="p-3.5">Farmer ID</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Mobile</th>
                    <th className="p-3.5">District</th>
                    <th className="p-3.5">Land Size</th>
                    <th className="p-3.5">Crop</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {farmers.map((farmer) => (
                    <tr key={farmer._id} className="hover:bg-neutral-50">
                      <td className="p-3.5 font-mono text-[#003366] font-semibold">
                        {farmer.farmerRegistrationId || farmer._id.substring(0, 8)}
                      </td>
                      <td className="p-3.5 font-bold text-neutral-900">
                        {farmer.fullName}
                      </td>
                      <td className="p-3.5 text-neutral-600 font-mono">
                        {farmer.mobile}
                      </td>
                      <td className="p-3.5 text-neutral-700">
                        {farmer.district}
                      </td>
                      <td className="p-3.5 text-neutral-700">
                        {farmer.landSize} Acres ({farmer.farmerType})
                      </td>
                      <td className="p-3.5 text-neutral-700">
                        {farmer.cropType}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={farmer.accountStatus} />
                      </td>
                      <td className="p-3.5 text-right space-x-3">
                        <button
                          onClick={() => setSelectedFarmer(farmer)}
                          className="text-[#003366] font-bold hover:underline cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleStatusToggle(farmer._id, farmer.accountStatus)}
                          className={`font-semibold hover:underline cursor-pointer ${
                            farmer.accountStatus === "ACTIVE" ? "text-red-700" : "text-green-700"
                          }`}
                        >
                          {farmer.accountStatus === "ACTIVE" ? "Disable" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="p-3 border-t border-neutral-200 flex justify-between items-center text-xs">
              <span className="text-neutral-500">
                Showing {farmers.length} of {pagination.total} registered farmers
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  className="px-3 py-1 border border-neutral-300 rounded disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-2 py-1 text-neutral-700 font-semibold">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  className="px-3 py-1 border border-neutral-300 rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Farmer Full Details Modal */}
        {selectedFarmer && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
                <div>
                  <span className="font-mono text-neutral-500 text-[11px]">
                    ID: {selectedFarmer.farmerRegistrationId}
                  </span>
                  <h2 className="text-lg font-bold text-[#003366]">
                    {selectedFarmer.fullName}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedFarmer(null)}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded border border-neutral-200">
                  <div>
                    <span className="text-neutral-500 block">Mobile:</span>
                    <strong className="text-neutral-900">{selectedFarmer.mobile}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Email:</span>
                    <strong className="text-neutral-900">{selectedFarmer.email || "Not Provided"}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Age & Gender:</span>
                    <strong className="text-neutral-900">{selectedFarmer.age} Yrs / {selectedFarmer.gender}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Social Category:</span>
                    <strong className="text-neutral-900">{selectedFarmer.socialCategory}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded border border-neutral-200">
                  <div>
                    <span className="text-neutral-500 block">District:</span>
                    <strong className="text-neutral-900">{selectedFarmer.district}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Land Size:</span>
                    <strong className="text-neutral-900">{selectedFarmer.landSize} Acres ({selectedFarmer.farmerType})</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Crop Cultivated:</span>
                    <strong className="text-neutral-900">{selectedFarmer.cropType}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Irrigation Type:</span>
                    <strong className="text-neutral-900">{selectedFarmer.irrigationType}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Annual Income:</span>
                    <strong className="text-neutral-900">₹{selectedFarmer.annualIncome?.toLocaleString("en-IN")}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Account Status:</span>
                    <StatusBadge status={selectedFarmer.accountStatus} />
                  </div>
                </div>

                <div className="p-3 bg-blue-50/50 rounded border border-blue-200 space-y-1 text-[11px] text-neutral-700">
                  <p>• Livestock Ownership: <strong>{selectedFarmer.livestockOwnership ? "Yes" : "No"}</strong></p>
                  <p>• Horticulture Activity: <strong>{selectedFarmer.horticultureActivity ? "Yes" : "No"}</strong></p>
                  <p>• Farm Machinery: <strong>{selectedFarmer.machineryOwnership ? "Yes" : "No"}</strong></p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-200 flex justify-between items-center">
                <button
                  onClick={() => handleStatusToggle(selectedFarmer._id, selectedFarmer.accountStatus)}
                  className={`px-4 py-2 rounded font-bold text-white text-xs ${
                    selectedFarmer.accountStatus === "ACTIVE" ? "bg-red-700 hover:bg-red-800" : "bg-green-700 hover:bg-green-800"
                  }`}
                >
                  {selectedFarmer.accountStatus === "ACTIVE" ? "Disable Farmer Account" : "Activate Farmer Account"}
                </button>
                <button
                  onClick={() => setSelectedFarmer(null)}
                  className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 rounded font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
