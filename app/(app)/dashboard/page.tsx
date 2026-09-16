"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Clock,
  ArrowRight,
  Cpu,
  RefreshCw,
  FileWarning,
  KeyRound,
  Globe,
  Mail,
  Check,
  FileText,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  DashboardCard,
  CyberScoreCard,
  ThreatBadge,
  SectionHeading,
  ScanStatistics,
  ThreatIntelligenceFeed,
  AISecurityReportModal,
} from "@/components";
import { useSecurity } from "@/lib/context/SecurityContext";
import type { ApiResponse, FullAuditReport } from "@/types";

export default function DashboardPage() {
  const {
    cyberHealthScore,
    healthBreakdown,
    threatLevel,
    confidenceScore,
    recentScans,
    recommendations,
    resolveRecommendation,
    latestReport,
    threatAlerts,
  } = useSecurity();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setReportError(null);
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
      if (!json.success) {
        setReportError(json.error || "Failed to refresh telemetry report.");
      }
    } catch {
      setReportError("Network error synchronizing with /api/report.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Live calculated metrics
  const totalScans = recentScans.length;
  const cleanScans = recentScans.filter(
    (s) => s.threatLevel === "safe" || s.threatLevel === "low"
  ).length;
  const threatsBlocked = recentScans.filter(
    (s) => s.threatLevel === "high" || s.threatLevel === "critical"
  ).length;

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
        return <Shield className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-blue-400 uppercase">
              Autonomous Operations Center
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="font-mono text-[11px] text-slate-400">
              Live State Synchronized
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Security Overview
          </h1>
          <p className="font-body mt-1 text-sm text-slate-400">
            Real-time telemetry, heuristic defenses, and threat intelligence
            active across all endpoints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            className="glass-panel inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-mono text-xs font-medium text-slate-300 transition-all hover:border-blue-500/30 hover:text-white active:scale-95"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-400" : ""}`}
            />
            <span>Refresh State</span>
          </button>

          <Link
            href="/url-checker"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-purple-500 active:scale-95"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Launch Scanner</span>
          </Link>
        </div>
      </div>

      {reportError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{reportError}</span>
        </div>
      )}

      {/* Latest AI Security Report Notification Banner */}
      {latestReport && (
        <div className="glass-panel flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-purple-950/20 to-slate-950/60 p-4 shadow-lg shadow-blue-500/10 sm:flex-row sm:items-center sm:p-5">
          <div className="flex items-start gap-3 sm:items-center">
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/20 p-2.5 text-blue-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-300 uppercase">
                  Latest AI Security Investigation
                </span>
                <ThreatBadge level={latestReport.threatLevel} size="sm" />
                <span className="font-mono text-[10px] text-slate-400">
                  {latestReport.timestamp}
                </span>
              </div>
              <p className="font-body text-xs text-slate-300">
                Target:{" "}
                <span className="font-mono font-medium text-white">
                  {latestReport.target}
                </span>{" "}
                &bull; {latestReport.whyGenerated[0]}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-600/30 px-4 py-2 font-mono text-xs font-semibold text-blue-200 transition-all hover:border-blue-400 hover:bg-blue-600/50 hover:text-white active:scale-95"
          >
            <FileText className="h-4 w-4 text-blue-300" />
            <span>View Full AI Report</span>
          </button>
        </div>
      )}

      {/* Live Statistics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {/* Total Scans Card */}
        <div className="glass-panel group relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 transition-all duration-300 hover:border-blue-500/30">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-slate-400">
            <span>Total Scans Logged</span>
            <span className="font-semibold text-blue-400">Active Session</span>
          </div>
          <div className="font-mono text-3xl font-bold tracking-tight text-white">
            {totalScans}
          </div>
          <p className="font-body mt-2 text-xs text-slate-400">
            Telemetry recorded across all vector engines
          </p>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition-all duration-500 group-hover:bg-blue-500/20" />
        </div>

        {/* Clean Scans Rate */}
        <div className="glass-panel group relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 transition-all duration-300 hover:border-emerald-500/30">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-slate-400">
            <span>Clean Pass Rate</span>
            <span className="font-semibold text-emerald-400">
              {cleanScans} Verified
            </span>
          </div>
          <div className="font-mono text-3xl font-bold tracking-tight text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            {totalScans > 0 ? Math.round((cleanScans / totalScans) * 100) : 100}
            %
          </div>
          <p className="font-body mt-2 text-xs text-slate-400">
            Samples classified safe or low risk
          </p>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition-all duration-500 group-hover:bg-emerald-500/20" />
        </div>

        {/* High Risk Detections */}
        <div className="glass-panel group relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 transition-all duration-300 hover:border-red-500/30">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-slate-400">
            <span>Threats Intercepted</span>
            <span className="font-semibold text-red-400">Containment</span>
          </div>
          <div className="font-mono text-3xl font-bold tracking-tight text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.3)]">
            {threatsBlocked}
          </div>
          <p className="font-body mt-2 text-xs text-slate-400">
            High and critical severity threats identified
          </p>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-red-500/10 blur-2xl transition-all duration-500 group-hover:bg-red-500/20" />
        </div>

        {/* AI Engine Precision */}
        <div className="glass-panel group relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 transition-all duration-300 hover:border-purple-500/30">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-slate-400">
            <span>AI Precision</span>
            <span className="font-semibold text-purple-400">Deterministic</span>
          </div>
          <div className="font-mono text-3xl font-bold tracking-tight text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            {confidenceScore}%
          </div>
          <p className="font-body mt-2 text-xs text-slate-400">
            Weighted classification certainty
          </p>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl transition-all duration-500 group-hover:bg-purple-500/20" />
        </div>
      </div>

      {/* Cyber Health Score & Engine Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Scorecard (7 Cols) */}
        <div className="lg:col-span-7">
          <CyberScoreCard
            score={cyberHealthScore}
            threatLevel={threatLevel}
            breakdown={healthBreakdown}
            lastUpdated="Live sync"
          />
        </div>

        {/* Side Threat Level & Confidence (5 Cols) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Global Threat Level Widget */}
          <DashboardCard
            title="Global Threat Posture"
            subtitle="Calculated from your active telemetry"
            icon={Shield}
            action={<ThreatBadge level={threatLevel} size="sm" />}
            className="flex-1"
          >
            <div className="space-y-4">
              {/* Visual Multi-tier Threat Meter */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[
                  {
                    level: "safe",
                    label: "Safe",
                    color:
                      threatLevel === "safe"
                        ? "bg-emerald-500 shadow-[0_0_10px_#10b981]"
                        : "bg-slate-800",
                  },
                  {
                    level: "low",
                    label: "Low",
                    color:
                      threatLevel === "low"
                        ? "bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                        : "bg-slate-800",
                  },
                  {
                    level: "medium",
                    label: "Elevated",
                    color:
                      threatLevel === "medium"
                        ? "bg-amber-500 shadow-[0_0_10px_#f59e0b]"
                        : "bg-slate-800",
                  },
                  {
                    level: "high",
                    label: "High",
                    color:
                      threatLevel === "high"
                        ? "bg-orange-500 shadow-[0_0_10px_#f97316]"
                        : "bg-slate-800",
                  },
                  {
                    level: "critical",
                    label: "Critical",
                    color:
                      threatLevel === "critical"
                        ? "bg-red-500 shadow-[0_0_10px_#ef4444]"
                        : "bg-slate-800",
                  },
                ].map((tier) => (
                  <div key={tier.label} className="space-y-1.5 text-center">
                    <div
                      className={`h-2 rounded-full ${tier.color} transition-all`}
                    />
                    <span
                      className={`font-mono text-[10px] uppercase ${
                        tier.level === threatLevel
                          ? "font-bold text-white"
                          : "text-slate-600"
                      }`}
                    >
                      {tier.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 rounded-xl border border-blue-500/20 bg-blue-950/20 p-3.5 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Total Scans in Log:</span>
                  <span className="font-semibold text-white">{totalScans}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Clean Pass Rate:</span>
                  <span className="font-semibold text-emerald-400">
                    {totalScans > 0
                      ? Math.round((cleanScans / totalScans) * 100)
                      : 100}
                    %
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">High-Risk Detections:</span>
                  <span className="font-semibold text-red-400">
                    {threatsBlocked}
                  </span>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* AI Confidence Score Widget */}
          <DashboardCard
            title="AI Engine Confidence"
            subtitle="Classification precision across active rules"
            icon={Cpu}
            action={
              <span className="rounded-full border border-purple-500/30 bg-purple-500/20 px-2.5 py-1 font-mono text-xs text-purple-300">
                Rule Matrix v3.0
              </span>
            }
            className="flex-1"
          >
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-3xl font-bold text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                  {confidenceScore}%
                </span>
                <span className="font-mono text-xs text-slate-400">
                  Across {totalScans} evaluated samples
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidenceScore}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>

              <p className="font-body text-xs leading-relaxed text-slate-400">
                Deterministic entropy calculations, URL obfuscation heuristics,
                RFC header verification, and static payload analysis.
              </p>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Enhanced Scan Statistics & Threat Distribution (Phase 3 Requirement) */}
      <ScanStatistics scans={recentScans} />

      {/* Middle Section: Security Recommendations + Recent Activity */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Security Recommendations (7 Cols) */}
        <div className="space-y-4 lg:col-span-7">
          <SectionHeading
            badge="Remediation"
            title="Actionable Recommendations"
            description="Prioritized tasks generated from your active scan results to strengthen resilience."
          />

          <div className="space-y-3">
            {recommendations.slice(0, 4).map((rec) => (
              <div
                key={rec.id}
                className={`glass-panel flex flex-col justify-between gap-4 rounded-xl border p-4 transition-all duration-300 sm:flex-row sm:items-center sm:p-5 ${
                  rec.resolved
                    ? "border-emerald-500/30 bg-emerald-950/10 opacity-70"
                    : "border-white/[0.08] hover:border-blue-500/30"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-heading text-sm font-semibold text-white sm:text-base">
                      {rec.title}
                    </h4>
                    <ThreatBadge level={rec.impact} size="sm" pulse={false} />
                    {rec.scoreBoost && !rec.resolved && (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
                        +{rec.scoreBoost} PTS
                      </span>
                    )}
                  </div>
                  <p className="font-body max-w-xl text-xs leading-relaxed text-slate-400">
                    {rec.description}
                  </p>
                </div>

                <div className="shrink-0">
                  {rec.resolved ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                      <span>Remediated</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => resolveRecommendation(rec.id)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-purple-500 active:scale-95 sm:w-auto"
                    >
                      <span>{rec.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Recent Activity Feed (5 Cols) */}
        <div className="space-y-4 lg:col-span-5">
          <SectionHeading
            badge="Audit Trail"
            title="Live Incident Feed"
            description="Real-time timeline updated after every scan."
            action={
              <Link
                href="/history"
                className="flex items-center gap-1 font-mono text-xs text-blue-400 hover:text-blue-300"
              >
                <span>Full History</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />

          <div className="glass-panel space-y-3 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] p-4 sm:p-5">
            {recentScans.slice(0, 5).map((act) => (
              <div key={act.id} className="pt-3 first:pt-0">
                <div className="mb-1 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(act.type)}
                    <span className="font-heading text-sm font-semibold text-white">
                      {act.result}
                    </span>
                  </div>
                  <ThreatBadge
                    level={act.threatLevel}
                    size="sm"
                    pulse={act.threatLevel === "critical"}
                  />
                </div>

                <div className="mb-1 truncate font-mono text-xs text-blue-400">
                  {act.input}
                </div>

                {act.details && (
                  <p className="font-body mb-2 text-xs leading-tight text-slate-400">
                    {act.details}
                  </p>
                )}

                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>{act.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Threat Intelligence Section (Phase 3 Requirement) */}
      <ThreatIntelligenceFeed alerts={threatAlerts} />

      {/* Holographic AI Security Report Modal Dialog */}
      <AISecurityReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={latestReport}
      />
    </div>
  );
}
