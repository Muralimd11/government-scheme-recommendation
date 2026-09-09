import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  FactCheck as EligibilityIcon,
  Recommend as RecommendIcon,
  Description as ApplicationIcon,
  UploadFile as DocumentIcon,
  Notifications as NotificationIcon,
  HelpOutlined as HelpIcon,
  People as FarmersIcon,
  AccountTree as SchemesIcon,
  VerifiedUser as VerifyIcon,
  BarChart as AnalyticsIcon,
  Assessment as ReportsIcon,
  History as AuditIcon,
  ExitToApp as LogoutIcon
} from "@mui/icons-material";

interface SidebarProps {
  type: "FARMER" | "ADMIN";
}

export const Sidebar: React.FC<SidebarProps> = ({ type }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const farmerNavItems = [
    { label: t("dashboard"), path: "/farmer/dashboard", icon: <DashboardIcon fontSize="small" /> },
    { label: t("myProfile"), path: "/farmer/profile", icon: <PersonIcon fontSize="small" /> },
    { label: t("checkEligibility"), path: "/farmer/eligibility", icon: <EligibilityIcon fontSize="small" /> },
    { label: language === "ta" ? "பரிந்துரைக்கப்பட்ட திட்டங்கள்" : "Recommended Schemes", path: "/recommendations", icon: <RecommendIcon fontSize="small" /> },
    { label: t("applications"), path: "/farmer/applications", icon: <ApplicationIcon fontSize="small" /> },
    { label: t("documents"), path: "/farmer/documents", icon: <DocumentIcon fontSize="small" /> },
    { label: t("notifications"), path: "/farmer/notifications", icon: <NotificationIcon fontSize="small" /> },
    { label: t("help"), path: "/help", icon: <HelpIcon fontSize="small" /> }
  ];

  const adminNavItems = [
    { label: "Admin Dashboard", path: "/admin/dashboard", icon: <DashboardIcon fontSize="small" /> },
    { label: "Farmer Management", path: "/admin/farmers", icon: <FarmersIcon fontSize="small" /> },
    { label: "Scheme Management", path: "/admin/schemes", icon: <SchemesIcon fontSize="small" /> },
    { label: "Document Verification", path: "/admin/documents", icon: <VerifyIcon fontSize="small" /> },
    { label: "Analytics & ML", path: "/admin/analytics", icon: <AnalyticsIcon fontSize="small" /> },
    { label: "Notifications Broadcast", path: "/admin/notifications", icon: <NotificationIcon fontSize="small" /> },
    { label: "Government Reports", path: "/admin/reports", icon: <ReportsIcon fontSize="small" /> },
    { label: "System Audit Logs", path: "/admin/audit-logs", icon: <AuditIcon fontSize="small" /> }
  ];

  const items = type === "ADMIN" ? adminNavItems : farmerNavItems;

  return (
    <aside className="w-full md:w-64 bg-white border-r border-neutral-200 flex flex-col shrink-0 min-h-[calc(100vh-120px)]">
      {/* User Mini Card */}
      <div className="p-4 border-b border-neutral-200 bg-neutral-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-base">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-neutral-900 truncate">
              {user?.fullName || "User"}
            </p>
            <p className="text-xs text-neutral-500 truncate">
              {type === "ADMIN" ? "Agricultural Officer" : user?.district ? `${user.district}, TN` : "Tamil Nadu"}
            </p>
          </div>
        </div>
        {user?.farmerRegistrationId && (
          <div className="mt-2 text-[11px] bg-blue-50 text-[#003366] px-2 py-0.5 rounded border border-blue-200 font-mono">
            ID: {user.farmerRegistrationId}
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="p-2 space-y-1 flex-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition ${
                isActive
                  ? "bg-[#003366] text-white font-semibold shadow-xs"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-[#003366]"
              }`}
            >
              <span className={isActive ? "text-white" : "text-neutral-500"}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-3 border-t border-neutral-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded font-medium transition cursor-pointer"
        >
          <LogoutIcon fontSize="small" />
          <span>{t("logout")}</span>
        </button>
      </div>
    </aside>
  );
};
