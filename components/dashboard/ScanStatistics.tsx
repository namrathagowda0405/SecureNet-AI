"use client";

import React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Globe,
  Mail,
  FileWarning,
} from "lucide-react";
import type { ScanRecord } from "@/types";

interface ScanStatisticsProps {
  scans: ScanRecord[];
}

export const ScanStatistics: React.FC<ScanStatisticsProps> = ({ scans }) => {
  const totalScans = scans.length;
  const safeCount = scans.filter(
    (s) => s.threatLevel === "safe" || s.threatLevel === "low"
  ).length;
  const dangerousCount = scans.filter(
    (s) => s.threatLevel === "high" || s.threatLevel === "critical"
  ).length;
  const mediumCount = scans.filter((s) => s.threatLevel === "medium").length;

  const safePercent =
    totalScans > 0 ? Math.round((safeCount / totalScans) * 100) : 100;
  const dangerousPercent =
    totalScans > 0 ? Math.round((dangerousCount / totalScans) * 100) : 0;
  const mediumPercent =
    totalScans > 0 ? Math.round((mediumCount / totalScans) * 100) : 0;

  // Breakdown by module
  const passwordScans = scans.filter((s) => s.type === "password").length;
  const urlScans = scans.filter((s) => s.type === "url").length;
  const emailScans = scans.filter((s) => s.type === "email").length;
  const fileScans = scans.filter((s) => s.type === "malware").length;

  // Distribution tiers
  const tiers = [
    {
      level: "Safe",
      count: scans.filter((s) => s.threatLevel === "safe").length,
      color: "bg-emerald-500",
      textColor: "text-emerald-400",
    },
    {
      level: "Low",
      count: scans.filter((s) => s.threatLevel === "low").length,
      color: "bg-blue-500",
      textColor: "text-blue-400",
    },
    {
      level: "Elevated",
      count: mediumCount,
      color: "bg-amber-500",
      textColor: "text-amber-400",
    },
    {
      level: "High",
      count: scans.filter((s) => s.threatLevel === "high").length,
      color: "bg-orange-500",
      textColor: "text-orange-400",
    },
    {
      level: "Critical",
      count: scans.filter((s) => s.threatLevel === "critical").length,
      color: "bg-red-500",
      textColor: "text-red-400",
    },
  ];

  return (
    <div className="glass-panel space-y-6 rounded-2xl border border-white/[0.08] p-5 sm:p-6">
      {/* Header Metric Row */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="font-mono text-[10px] font-semibold tracking-wider text-blue-400 uppercase">
            Telemetry Aggregation
          </div>
          <h3 className="font-heading text-lg font-bold text-white sm:text-xl">
            Scan Analytics & Threat Distribution
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-blue-500/20 bg-blue-950/40 px-3.5 py-1.5 text-right font-mono">
            <span className="text-[10px] text-slate-400">TOTAL SCANS</span>
            <div className="text-base font-bold text-white sm:text-lg">
              {totalScans}
            </div>
          </div>
        </div>
      </div>

      {/* Safe vs Dangerous Ratio Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span className="font-semibold">Clean / Low: {safeCount}</span>
            <span className="text-slate-500">({safePercent}%)</span>
          </div>

          {mediumCount > 0 && (
            <div className="text-amber-400">
              <span>Elevated: {mediumCount}</span>
              <span className="text-slate-500"> ({mediumPercent}%)</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-red-400">
            <span className="text-slate-500">({dangerousPercent}%)</span>
            <span className="font-semibold">
              High / Critical: {dangerousCount}
            </span>
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>

        {/* Stacked Comparative Bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-900 p-[1px]">
          <div
            style={{ width: `${safePercent}%` }}
            className="h-full bg-emerald-500 transition-all duration-500"
            title={`Safe: ${safePercent}%`}
          />
          <div
            style={{ width: `${mediumPercent}%` }}
            className="h-full bg-amber-500 transition-all duration-500"
            title={`Elevated: ${mediumPercent}%`}
          />
          <div
            style={{ width: `${dangerousPercent}%` }}
            className="h-full bg-red-500 transition-all duration-500"
            title={`Dangerous: ${dangerousPercent}%`}
          />
        </div>
      </div>

      {/* Threat Distribution Grid */}
      <div className="space-y-2.5">
        <div className="font-mono text-[11px] text-slate-400 uppercase">
          Threat Severity Breakdown
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {tiers.map((t) => {
            const pct =
              totalScans > 0 ? Math.round((t.count / totalScans) * 100) : 0;
            return (
              <div
                key={t.level}
                className="space-y-1.5 rounded-xl border border-white/[0.06] bg-slate-900/60 p-3 text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${t.color}`} />
                  <span className="font-heading text-xs font-semibold text-slate-300">
                    {t.level}
                  </span>
                </div>
                <div className={`font-mono text-base font-bold ${t.textColor}`}>
                  {t.count}
                </div>
                <div className="font-mono text-[10px] text-slate-500">
                  {pct}% share
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown Chips */}
      <div className="border-t border-white/[0.06] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-xs text-slate-400">
            Vector Coverage:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-950/30 px-2.5 py-1 font-mono text-xs text-blue-300">
              <KeyRound className="h-3 w-3" />
              <span>Passwords: {passwordScans}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-950/30 px-2.5 py-1 font-mono text-xs text-purple-300">
              <Globe className="h-3 w-3" />
              <span>Websites: {urlScans}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-950/30 px-2.5 py-1 font-mono text-xs text-indigo-300">
              <Mail className="h-3 w-3" />
              <span>Emails: {emailScans}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-950/30 px-2.5 py-1 font-mono text-xs text-cyan-300">
              <FileWarning className="h-3 w-3" />
              <span>Files: {fileScans}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
