import axios from "axios";

const API_BASE = "/api";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "An unexpected error occurred.";
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Auth
  register: (data: any) => apiClient.post("/auth/register", data),
  login: (data: any) => apiClient.post("/auth/login", data),
  getMe: () => apiClient.get("/auth/me"),
  forgotPassword: (data: any) => apiClient.post("/auth/forgot-password", data),

  // Schemes
  getSchemes: (params?: any) => apiClient.get("/schemes", { params }),
  getSchemeById: (id: string) => apiClient.get(`/schemes/${id}`),

  // Recommendations
  getRecommendations: (data: any) => apiClient.post("/recommendations", data),

  // Farmer
  getFarmerProfile: () => apiClient.get("/farmers/profile"),
  updateFarmerProfile: (data: any) => apiClient.put("/farmers/profile", data),
  getFarmerDashboardSummary: () => apiClient.get("/farmers/dashboard-summary"),

  // Applications
  createApplication: (data: any) => apiClient.post("/applications", data),
  getMyApplications: () => apiClient.get("/applications"),
  getApplicationById: (id: string) => apiClient.get(`/applications/${id}`),
  updateApplicationStatus: (id: string, data: { status: string; remarks: string }) =>
    apiClient.put(`/applications/${id}/status`, data),

  // Documents
  uploadDocument: (formData: FormData) =>
    apiClient.post("/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  getMyDocuments: () => apiClient.get("/documents"),
  deleteDocument: (id: string) => apiClient.delete(`/documents/${id}`),

  // Admin
  getAdminStats: () => apiClient.get("/admin/analytics"),
  getAdminFarmers: (params?: any) => apiClient.get("/admin/farmers", { params }),
  updateFarmerStatus: (id: string, accountStatus: string) =>
    apiClient.put(`/admin/farmers/${id}/status`, { accountStatus }),
  createScheme: (data: any) => apiClient.post("/admin/schemes", data),
  updateScheme: (id: string, data: any) => apiClient.put(`/admin/schemes/${id}`, data),
  deleteScheme: (id: string) => apiClient.delete(`/admin/schemes/${id}`),
  getAdminDocuments: (params?: any) => apiClient.get("/admin/documents", { params }),
  verifyDocument: (id: string, data: { verificationStatus: string; adminRemarks: string }) =>
    apiClient.put(`/admin/documents/${id}/verify`, data),
  getAdminReports: (params?: any) => apiClient.get("/admin/reports", { params }),
  getReports: (params?: any) => apiClient.get("/admin/reports", { params }),
  getAdminAuditLogs: () => apiClient.get("/admin/audit-logs"),
  getAuditLogs: () => apiClient.get("/admin/audit-logs"),

  // Notifications
  getNotifications: () => apiClient.get("/notifications"),
  createNotification: (data: any) => apiClient.post("/admin/notifications", data),
  markNotificationRead: (id: string) => apiClient.put(`/notifications/${id}/read`)
};
