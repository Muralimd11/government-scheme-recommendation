import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

// Public Pages
import { LandingPage } from "./pages/LandingPage";
import { ExploreSchemesPage } from "./pages/ExploreSchemesPage";
import { SchemeDetailPage } from "./pages/SchemeDetailPage";
import { EligibilityPage } from "./pages/EligibilityPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

// Farmer Pages
import { FarmerDashboardPage } from "./pages/farmer/FarmerDashboardPage";
import { FarmerProfilePage } from "./pages/farmer/FarmerProfilePage";
import { ApplicationsPage } from "./pages/farmer/ApplicationsPage";
import { DocumentsPage } from "./pages/farmer/DocumentsPage";
import { NotificationsPage } from "./pages/farmer/NotificationsPage";

// Admin Pages
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminFarmersPage } from "./pages/admin/AdminFarmersPage";
import { AdminSchemesPage } from "./pages/admin/AdminSchemesPage";
import { AdminVerificationPage } from "./pages/admin/AdminVerificationPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { AdminNotificationsPage } from "./pages/admin/AdminNotificationsPage";
import { AdminAuditLogsPage } from "./pages/admin/AdminAuditLogsPage";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#F5F5F5] text-neutral-900">
            <Header />
            <div className="flex-1 flex flex-col">
              <Routes>
                {/* Public & Common Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/schemes" element={<ExploreSchemesPage />} />
                <Route path="/schemes/:id" element={<SchemeDetailPage />} />
                <Route path="/eligibility" element={<EligibilityPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Farmer Routes */}
                <Route
                  path="/farmer/dashboard"
                  element={
                    <ProtectedRoute requiredRole="FARMER">
                      <FarmerDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/eligibility"
                  element={
                    <ProtectedRoute requiredRole="FARMER">
                      <EligibilityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/applications"
                  element={
                    <ProtectedRoute requiredRole="FARMER">
                      <ApplicationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/applications/new"
                  element={
                    <ProtectedRoute requiredRole="FARMER">
                      <ApplicationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/documents"
                  element={
                    <ProtectedRoute requiredRole="FARMER">
                      <DocumentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/profile"
                  element={
                    <ProtectedRoute requiredRole="FARMER">
                      <FarmerProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/notifications"
                  element={
                    <ProtectedRoute requiredRole="FARMER">
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/farmers"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminFarmersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/schemes"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminSchemesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/documents"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminVerificationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/notifications"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminNotificationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminAuditLogsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
