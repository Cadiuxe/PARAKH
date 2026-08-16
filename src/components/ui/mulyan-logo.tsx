import React from "react";

interface MulyanLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  taglineText?: string;
  className?: string;
  iconOnly?: boolean;
}

export function MulyanLogoIcon({
  className = "h-8 w-8",
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="MULYAN Icon"
    >
      <defs>
        <linearGradient id="mulyan-blue-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="mulyan-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Rounded squircle container with deep blue gradient */}
      <rect width="40" height="40" rx="10" fill="url(#mulyan-blue-grad)" />
      <rect
        x="0.5"
        y="0.5"
        width="39"
        height="39"
        rx="9.5"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1"
      />

      {/* White ascending bar chart representing growth and adaptive progression */}
      <rect x="9.5" y="22" width="4.5" height="10" rx="2" fill="#FFFFFF" fillOpacity="0.9" />
      <rect x="17.5" y="16" width="4.5" height="16" rx="2" fill="#FFFFFF" fillOpacity="0.95" />
      <rect x="25.5" y="11" width="4.5" height="21" rx="2" fill="#FFFFFF" />

      {/* Gold verification checkmark */}
      <path
        d="M10 21.5L16.5 28L30.5 12.5"
        stroke="#F59E0B"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#mulyan-shadow)"
      />
    </svg>
  );
}

export function MulyanLogo({
  size = "md",
  showTagline = true,
  taglineText = "POWERED BY PARAKH",
  className = "",
  iconOnly = false,
}: MulyanLogoProps) {
  const sizeMap = {
    sm: { iconSize: 28, textClass: "text-sm", tagClass: "text-[8px]", iconClass: "h-7 w-7" },
    md: { iconSize: 34, textClass: "text-base font-extrabold", tagClass: "text-[9px]", iconClass: "h-8.5 w-8.5" },
    lg: { iconSize: 42, textClass: "text-xl font-extrabold", tagClass: "text-[10px]", iconClass: "h-10 w-10" },
    xl: { iconSize: 52, textClass: "text-2xl font-black", tagClass: "text-[11px]", iconClass: "h-13 w-13" },
  };

  const currentSize = sizeMap[size];

  if (iconOnly) {
    return <MulyanLogoIcon size={currentSize.iconSize} className={`${currentSize.iconClass} ${className}`} />;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <MulyanLogoIcon size={currentSize.iconSize} className={currentSize.iconClass} />
      <div className="flex flex-col justify-center leading-tight">
        <span className={`${currentSize.textClass} tracking-tight text-zinc-100 font-bold`}>
          MULYAN
        </span>
        {showTagline && (
          <span className={`${currentSize.tagClass} font-semibold text-zinc-400 tracking-wider uppercase -mt-0.5`}>
            {taglineText}
          </span>
        )}
      </div>
    </div>
  );
}
