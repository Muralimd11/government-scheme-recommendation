import React from "react";
import { useLanguage } from "../../context/LanguageContext";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useLanguage();

  let bgClass = "bg-neutral-100 text-neutral-800 border-neutral-300";
  let label = status;

  switch (status) {
    case "APPROVED":
    case "VERIFIED":
      bgClass = "bg-green-50 text-green-800 border-green-300 font-semibold";
      label = t("statusApproved");
      break;
    case "SUBMITTED":
      bgClass = "bg-blue-50 text-blue-800 border-blue-300";
      label = t("statusSubmitted");
      break;
    case "PENDING":
      bgClass = "bg-amber-50 text-amber-800 border-amber-300";
      label = t("statusPending");
      break;
    case "UNDER_VERIFICATION":
      bgClass = "bg-purple-50 text-purple-800 border-purple-300";
      label = t("statusUnderVerification");
      break;
    case "REJECTED":
      bgClass = "bg-red-50 text-red-800 border-red-300 font-semibold";
      label = t("statusRejected");
      break;
    case "CORRECTION_REQUIRED":
      bgClass = "bg-orange-50 text-orange-800 border-orange-300 font-semibold";
      label = t("statusCorrection");
      break;
    case "ACTIVE":
      bgClass = "bg-emerald-50 text-emerald-800 border-emerald-300";
      label = "Active";
      break;
    case "DISABLED":
      bgClass = "bg-neutral-100 text-neutral-600 border-neutral-300";
      label = "Disabled";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${bgClass} whitespace-nowrap`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {label}
    </span>
  );
};
