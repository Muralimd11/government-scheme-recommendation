import React from "react";

export const TamilNaduEmblem: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Tamil Nadu Government Emblem"
    >
      {/* Outer Circle Ring */}
      <circle cx="50" cy="50" r="46" stroke="#003366" strokeWidth="3" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="42" stroke="#2E7D32" strokeWidth="1" fill="none" strokeDasharray="3 2" />

      {/* Srivilliputhur Gopuram Tower silhouette */}
      {/* Base */}
      <rect x="30" y="68" width="40" height="8" rx="1" fill="#003366" />
      {/* Mid tier 1 */}
      <polygon points="32,68 35,56 65,56 68,68" fill="#2E7D32" />
      {/* Mid tier 2 */}
      <polygon points="36,56 39,44 61,44 64,56" fill="#003366" />
      {/* Mid tier 3 */}
      <polygon points="40,44 42,34 58,34 60,44" fill="#2E7D32" />
      {/* Top tower tier */}
      <polygon points="43,34 45,26 55,26 57,34" fill="#003366" />
      {/* Kalasam pinnacles */}
      <circle cx="46" cy="23" r="1.5" fill="#F9A825" />
      <circle cx="50" cy="21" r="2" fill="#F9A825" />
      <circle cx="54" cy="23" r="1.5" fill="#F9A825" />

      {/* Gateway entrance */}
      <path d="M 45 76 A 5 5 0 0 1 55 76 Z" fill="#FFFFFF" />

      {/* Ashoka Stambha top emblem */}
      <rect x="47" y="14" width="6" height="4" fill="#003366" />

      {/* Garland Laurel Wreaths */}
      <path
        d="M 18 50 C 18 70 32 84 50 84 C 68 84 82 70 82 50"
        stroke="#2E7D32"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
