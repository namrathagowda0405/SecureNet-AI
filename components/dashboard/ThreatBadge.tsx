import React from "react";
import type { ThreatBadgeProps, ThreatLevel } from "@/types";

const THEME_CONFIG: Record<
  ThreatLevel,
  {
    bg: string;
    text: string;
    border: string;
    dot: string;
    defaultLabel: string;
  }
> = {
  safe: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
    defaultLabel: "SECURE",
  },
  low: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
    defaultLabel: "LOW RISK",
  },
  medium: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
    defaultLabel: "ELEVATED",
  },
  high: {
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    border: "border-orange-500/40",
    dot: "bg-orange-400",
    defaultLabel: "HIGH THREAT",
  },
  critical: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/50",
    dot: "bg-red-400",
    defaultLabel: "CRITICAL",
  },
};

export const ThreatBadge: React.FC<ThreatBadgeProps> = ({
  level,
  label,
  size = "md",
  pulse = true,
  className = "",
}) => {
  const config = THEME_CONFIG[level] || THEME_CONFIG.safe;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1.5",
    md: "px-2.5 py-1 text-xs gap-2",
    lg: "px-3.5 py-1.5 text-sm gap-2.5",
  }[size];

  const dotSize = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-mono font-semibold tracking-wider uppercase ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <span className="relative flex">
        <span className={`${dotSize} rounded-full ${config.dot}`} />
        {pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${config.dot} animate-ping opacity-75`}
          />
        )}
      </span>
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};
