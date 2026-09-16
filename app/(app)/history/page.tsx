"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Download,
  KeyRound,
  Globe,
  Mail,
  FileWarning,
  Trash2,
  Shield,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { DashboardCard, ThreatBadge } from "@/components";
import { useSecurity } from "@/lib/context/SecurityContext";
import type { ApiResponse, FullAuditReport } from "@/types";

export default function HistoryPage() {
  const {
    recentScans,
    clearHistory,
    cyberHealthScore,
    healthBreakdown,
    threatLevel,
    confidenceScore,
    recommendations,
    isCloudConnected,
    refreshFromDatabase,
  } = useSecurity();
  const [filterType, setFilterType] = useState<string>("all");
  const [filterThreat, setFilterThreat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const filteredScans = useMemo(() => {
    return recentScans.filter((scan) => {
      if (filterType !== "all" && scan.type !== filterType) return false;
      if (filterThreat !== "all" && scan.threatLevel !== filterThreat)
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesInput = scan.input.toLowerCase().includes(q);
        const matchesResult = scan.result.toLowerCase().includes(q);
        const matchesDetails = scan.details?.toLowerCase().includes(q) ?? false;
        const matchesReasons =
          scan.reasons?.some((r) => r.toLowerCase().includes(q)) ?? false;
        if (
          !matchesInput &&
          !matchesResult &&
          !matchesDetails &&
          !matchesReasons
        ) {
          return false;
        }
      }

      return true;
    });
  }, [recentScans, filterType, filterThreat, searchQuery]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "password":
        return <KeyRound className="h-4 w-4 text-blue-400" />;
      case "url":
        return <Globe className="h-4 w-4 text-purple-400" />;
      case "email":
        return <Mail className="h-4 w-4 text-indigo-400" />;
      case "malware":
        return <FileWarning className="h-4 w-4 text-cyan-400" />;
      default:
        return <History className="h-4 w-4 text-slate-400" />;
    }
  };

  const handleExportJson = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "aggregate",
          recentScans,
          cyberHealthScore,
          healthBreakdown,
          threatLevel,
          confidenceScore,
          recommendations,
        }),
      });

      const json: ApiResponse<FullAuditReport> = await res.json();
      const exportData = json.success && json.data ? json.data : recentScans;

      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `securenet_ai_audit_log_${Date.now()}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch {
      setExportError("Network error fetching report from /api/report.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-blue-400 uppercase">
              Forensics & Compliance
            </span>
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isCloudConnected
                  ? "bg-emerald-400 shadow-[0_0_8px_#10b981]"
                  : "bg-blue-500"
              }`}
            />
            <span className="font-mono text-[11px] text-slate-400">
              {isCloudConnected
                ? "Supabase Cloud: Synced"
                : "Local Telemetry Active"}
            </span>
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
              <History className="h-6 w-6" />
            </div>
            <span>Scan History & Audit Trail</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            Complete timeline of all credential audits, website heuristic
            evaluations, and email phishing inspections.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={async () => {
              setIsSyncing(true);
              try {
                await refreshFromDatabase();
              } finally {
                setIsSyncing(false);
              }
            }}
            disabled={isSyncing}
            className="glass-panel inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-300 transition-all hover:border-blue-500/30 hover:text-white active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-blue-400" : ""}`}
            />
            <span>Sync DB</span>
          </button>

          {recentScans.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="glass-panel inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-400 transition-all hover:border-red-500/30 hover:text-red-400 active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear History</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportJson}
            disabled={recentScans.length === 0 || isExporting}
            className="glass-panel inline-flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-medium text-slate-300 transition-all hover:border-blue-500/30 hover:text-white active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>{isExporting ? "Compiling..." : "Export JSON"}</span>
          </button>
        </div>
      </div>

      {exportError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{exportError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
          {/* Scan Type Filter */}
          <div className="glass-panel flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.08] p-1">
            {[
              { id: "all", label: "All Scans" },
              { id: "password", label: "Passwords" },
              { id: "url", label: "Websites" },
              { id: "email", label: "Emails" },
              { id: "malware", label: "Binaries" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-all ${
                  filterType === tab.id
                    ? "border border-blue-500/40 bg-blue-600/30 font-semibold text-blue-300 shadow-sm"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search target, domain, result..."
              className="font-body h-9 w-full rounded-xl border border-white/10 bg-slate-900/60 pr-3 pl-9 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Threat Level Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-slate-400">
            Threat Level:
          </span>
          {["all", "safe", "low", "medium", "high", "critical"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterThreat(lvl)}
              className={`rounded-md border px-2.5 py-0.5 font-mono text-[10px] tracking-wider uppercase transition-all ${
                filterThreat === lvl
                  ? "border-white/30 bg-white/10 font-bold text-white"
                  : "border-white/[0.06] bg-transparent text-slate-400 hover:text-white"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Trail List */}
      <DashboardCard
        title="Session Telemetry Log"
        subtitle={`Showing ${filteredScans.length} of ${recentScans.length} total event records`}
      >
        {filteredScans.length === 0 ? (
          /* Empty State */
          <div className="space-y-4 py-16 text-center">
            <div className="glass-panel mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 text-slate-600">
              <Shield className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-base font-semibold text-white">
                No Scan Records Found
              </h3>
              <p className="font-body mx-auto max-w-sm text-xs text-slate-400">
                No events match your selected filters. Run a scan in any module
                to record real-time telemetry.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href="/url-checker"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500"
              >
                <span>Launch Website Scanner</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="-mx-4 divide-y divide-white/[0.06] sm:-mx-6">
            {filteredScans.map((scan) => (
              <div
                key={scan.id}
                className="flex flex-col justify-between gap-3 p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:px-6"
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0 rounded-xl border border-white/[0.08] bg-slate-900/80 p-2">
                    {getTypeIcon(scan.type)}
                  </div>

                  <div className="max-w-xl space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-heading text-sm font-semibold text-white">
                        {scan.result}
                      </h4>
                      <ThreatBadge
                        level={scan.threatLevel}
                        size="sm"
                        pulse={false}
                      />
                      <span className="py-0.2 rounded border border-purple-500/20 bg-purple-500/10 px-1.5 font-mono text-[10px] text-purple-300">
                        {scan.confidence}% conf
                      </span>
                    </div>

                    <div className="truncate font-mono text-xs text-blue-400">
                      {scan.input}
                    </div>

                    {scan.details && (
                      <p className="font-body text-xs leading-relaxed text-slate-400">
                        {scan.details}
                      </p>
                    )}

                    {scan.reasons && scan.reasons.length > 0 && (
                      <div className="font-body space-y-0.5 pt-0.5 text-[11px] text-slate-500">
                        {scan.reasons.slice(0, 2).map((r, i) => (
                          <div key={i} className="truncate">
                            &bull; {r}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-1 font-mono text-[11px] text-slate-400 sm:flex-col sm:items-end sm:justify-center">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>{scan.timestamp}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase">
                    ID: {scan.id.substring(0, 16)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
