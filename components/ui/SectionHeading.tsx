import React from "react";
import type { SectionHeadingProps } from "@/types";

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  title,
  description,
  align = "left",
  action,
  className = "",
}) => {
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  }[align];

  return (
    <div className={`flex flex-col ${alignmentClasses} max-w-3xl ${className}`}>
      {badge && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 font-mono text-xs tracking-wider text-blue-400 uppercase">
          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-blue-400" />
          <span>{badge}</span>
        </div>
      )}

      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            {title}
          </h2>
          {description && (
            <p className="font-body mt-2 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
              {description}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
};
