import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "FARMER" | "ADMIN";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#003366] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/farmer/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
