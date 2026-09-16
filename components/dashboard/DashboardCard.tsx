import React from "react";
import type { DashboardCardProps } from "@/types";

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className = "",
  hoverGlow = true,
}) => {
  return (
    <div
      className={`glass-panel group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 sm:p-6 ${
        hoverGlow ? "glass-panel-hover" : ""
      } ${className}`}
    >
      {/* Subtle top ambient glow */}
      <div className="pointer-events-none absolute -top-12 left-1/2 h-24 w-48 -translate-x-1/2 rounded-full bg-blue-500/10 blur-2xl transition-all duration-500 group-hover:bg-blue-500/20" />

      {/* Header if title or icon provided */}
      {(title || Icon || action) && (
        <div className="relative z-10 mb-4 flex items-start justify-between gap-4 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400 transition-colors group-hover:border-blue-500/40 group-hover:text-blue-300">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="font-heading text-base font-semibold tracking-tight text-white sm:text-lg">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="font-body mt-0.5 text-xs text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
