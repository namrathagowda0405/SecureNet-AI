"use client";

import React from "react";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { ThreatBadge } from "./ThreatBadge";
import type { RecommendationCardProps } from "@/types";

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`glass-panel group flex flex-col justify-between gap-4 rounded-xl border border-white/[0.08] p-4 transition-all duration-300 hover:border-blue-500/30 sm:flex-row sm:items-center sm:p-5 ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="shrink-0 rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-blue-400 transition-colors group-hover:border-blue-500/40 group-hover:bg-blue-500/20">
          <ShieldAlert className="h-5 w-5" />
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-heading text-sm font-semibold text-white transition-colors group-hover:text-blue-200 sm:text-base">
              {recommendation.title}
            </h4>
            <ThreatBadge
              level={recommendation.impact}
              size="sm"
              pulse={false}
            />
            {recommendation.scoreBoost && (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
                +{recommendation.scoreBoost} PTS
              </span>
            )}
          </div>
          <p className="font-body max-w-xl text-xs leading-relaxed text-slate-400 sm:text-sm">
            {recommendation.description}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:self-center">
        <button
          onClick={() => onAction?.(recommendation.id)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:from-blue-500 hover:to-purple-500 active:scale-95 sm:w-auto"
        >
          <span>{recommendation.actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
