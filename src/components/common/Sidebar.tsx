import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useSidebar } from "../../context/SidebarContext";
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Recommend as RecommendIcon,
  Description as ApplicationIcon,
  UploadFile as DocumentIcon,
  Notifications as NotificationIcon,
  People as FarmersIcon,
  AccountTree as SchemesIcon,
  VerifiedUser as VerifyIcon,
  Assessment as ReportsIcon,
  History as AuditIcon,
  ExitToApp as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from "@mui/icons-material";

interface SidebarProps {
  type: "FARMER" | "ADMIN";
}

export const Sidebar: React.FC<SidebarProps> = ({ type }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const farmerNavItems = [
    { label: t("dashboard"), path: "/farmer/dashboard", icon: <DashboardIcon fontSize="small" /> },
    { label: t("myProfile"), path: "/farmer/profile", icon: <PersonIcon fontSize="small" /> },
    { label: language === "ta" ? "பரிந்துரைக்கப்பட்ட திட்டங்கள்" : "Recommended Schemes", path: "/recommendations", icon: <RecommendIcon fontSize="small" /> },
    { label: language === "ta" ? "திட்டங்களை ஆராய்க" : "Explore Schemes", path: "/schemes", icon: <SchemesIcon fontSize="small" /> },
    { label: t("applications"), path: "/farmer/applications", icon: <ApplicationIcon fontSize="small" /> },
    { label: t("documents"), path: "/farmer/documents", icon: <DocumentIcon fontSize="small" /> },
    { label: t("notifications"), path: "/farmer/notifications", icon: <NotificationIcon fontSize="small" /> }
  ];

  const adminNavItems = [
    { label: "Admin Dashboard", path: "/admin/dashboard", icon: <DashboardIcon fontSize="small" /> },
    { label: "Online Applications", path: "/admin/applications", icon: <ApplicationIcon fontSize="small" /> },
    { label: "Farmer Management", path: "/admin/farmers", icon: <FarmersIcon fontSize="small" /> },
    { label: "Scheme Management", path: "/admin/schemes", icon: <SchemesIcon fontSize="small" /> },
    { label: "Document Verification", path: "/admin/documents", icon: <VerifyIcon fontSize="small" /> },
    { label: "Notifications Broadcast", path: "/admin/notifications", icon: <NotificationIcon fontSize="small" /> },
    { label: "Government Reports", path: "/admin/reports", icon: <ReportsIcon fontSize="small" /> },
    { label: "System Audit Logs", path: "/admin/audit-logs", icon: <AuditIcon fontSize="small" /> }
  ];

  const items = type === "ADMIN" ? adminNavItems : farmerNavItems;

  return (
    <aside
      className={`bg-[#002244] border-r border-[#001830] text-neutral-300 flex flex-col shrink-0 transition-all duration-300 ease-in-out md:sticky md:top-[65px] md:h-[calc(100vh-65px)] md:overflow-y-auto no-scrollbar z-40 shadow-sm ${
        isCollapsed ? "w-full md:w-16" : "w-full md:w-64"
      }`}
    >
      {/* Header & Collapse Toggle */}
      <div className="p-3 border-b border-neutral-800 bg-[#001830] flex items-center justify-between gap-2">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-[#003366] border border-neutral-700 text-white flex items-center justify-center font-bold text-base shrink-0">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                {user?.fullName || "User"}
              </p>
              <p className="text-xs text-neutral-400 truncate">
                {type === "ADMIN" ? "Agricultural Officer" : user?.district ? `${user.district}, TN` : "Tamil Nadu"}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="w-10 h-10 mx-auto rounded-full bg-[#003366] border border-neutral-700 text-white flex items-center justify-center font-bold text-base cursor-pointer shrink-0"
            title={`${user?.fullName || "User"} (${type})`}
            onClick={toggleSidebar}
          >
            {user?.fullName?.charAt(0) || "U"}
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded transition cursor-pointer shrink-0"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </button>
      </div>

      {!isCollapsed && user?.farmerRegistrationId && (
        <div className="px-4 py-1.5 bg-[#001428] border-b border-neutral-800 text-[11px] text-emerald-400 font-mono truncate">
          ID: {user.farmerRegistrationId}
        </div>
      )}

      {/* Navigation List */}
      <nav className={`p-2 space-y-1 flex-1 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
        {items.map((item) => {
          const isActive = location.pathname === item.path;

          if (isCollapsed) {
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition ${
                  isActive
                    ? "bg-[#2E7D32] text-white shadow-xs font-semibold"
                    : "text-neutral-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.icon}
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-[#2E7D32] text-white font-semibold shadow-xs"
                  : "text-neutral-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className={isActive ? "text-white" : "text-neutral-400"}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-3 border-t border-neutral-800">
        {isCollapsed ? (
          <button
            onClick={handleLogout}
            title={t("logout")}
            className="w-10 h-10 mx-auto flex items-center justify-center text-red-400 hover:bg-red-950/40 rounded-lg transition cursor-pointer"
          >
            <LogoutIcon fontSize="small" />
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-950/40 rounded font-medium transition cursor-pointer"
          >
            <LogoutIcon fontSize="small" />
            <span>{t("logout")}</span>
          </button>
        )}
      </div>
    </aside>
  );
};
