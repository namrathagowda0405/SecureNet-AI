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
} from "lucide-react";
import {
  DashboardCard,
  CyberScoreCard,
  ThreatBadge,
  SectionHeading,
} from "@/components";
import { useSecurity } from "@/lib/context/SecurityContext";

export default function DashboardPage() {
  const {
    cyberHealthScore,
    healthBreakdown,
    threatLevel,
    confidenceScore,
    recentScans,
    recommendations,
    resolveRecommendation,
  } = useSecurity();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
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
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-2 md:flex-row md:items-center md:justify-between">
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
            Real-time telemetry and heuristic defense active across all vector
            endpoints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
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

      {/* Live Statistics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {/* Total Scans Card */}
        <div className="glass-panel group relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 transition-all duration-300 hover:border-blue-500/30">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-slate-400">
            <span>Total Scans Logged</span>
            <span className="font-semibold text-blue-400">Active Session</span>
          </div>
          <div className="font-mono text-3xl font-bold tracking-tight text-white transition-colors group-hover:text-blue-300">
            {totalScans}
          </div>
          <p className="font-body mt-2 text-xs text-slate-400">
            Across passwords, URLs, emails & files
          </p>
          <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-transparent" />
        </div>

        {/* Threats Blocked Card */}
        <div className="glass-panel group relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 transition-all duration-300 hover:border-red-500/30">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-slate-400">
            <span>Threats Neutralized</span>
            <span className="font-semibold text-red-400">High / Critical</span>
          </div>
          <div className="font-mono text-3xl font-bold tracking-tight text-red-400">
            {threatsBlocked}
          </div>
          <p className="font-body mt-2 text-xs text-slate-400">
            Isolated before system compromise
          </p>
          <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-500/30 to-transparent" />
        </div>

        {/* Verified Clean Assets */}
        <div className="glass-panel group relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 transition-all duration-300 hover:border-emerald-500/30">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-slate-400">
            <span>Verified Clean Assets</span>
            <span className="font-semibold text-emerald-400">
              {totalScans > 0
                ? Math.round((cleanScans / totalScans) * 100)
                : 100}
              %
            </span>
          </div>
          <div className="font-mono text-3xl font-bold tracking-tight text-emerald-400">
            {cleanScans}
          </div>
          <p className="font-body mt-2 text-xs text-slate-400">
            Passed all neural heuristic checks
          </p>
          <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500/30 to-transparent" />
        </div>

        {/* Defense Confidence Metric */}
        <div className="glass-panel group relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 transition-all duration-300 hover:border-purple-500/30">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-slate-400">
            <span>Detection Confidence</span>
            <span className="font-semibold text-purple-300">Optimal</span>
          </div>
          <div className="font-mono text-3xl font-bold tracking-tight text-purple-300">
            {confidenceScore}%
          </div>
          <p className="font-body mt-2 text-xs text-slate-400">
            Deterministic rule heuristics engine
          </p>
          <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500/30 to-transparent" />
        </div>
      </div>

      {/* Main Core Section: Cyber Health Score + Threat Level + Confidence Score */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Large Circular Cyber Health Score (7 Cols) */}
        <div className="flex flex-col lg:col-span-7">
          <CyberScoreCard
            score={cyberHealthScore}
            maxScore={100}
            breakdown={healthBreakdown}
            threatLevel={threatLevel}
            description={`System posture rated ${healthBreakdown.category}. Dynamic 4-pillar index active.`}
            className="h-full"
          />
        </div>

        {/* Right Stack: Threat Level + AI Confidence Score (5 Cols) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Threat Level Widget */}
          <DashboardCard
            title="System Threat Level"
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
                Rule Matrix v2.0
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
                and RFC header verification.
              </p>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Lower Section: Security Recommendations + Recent Activity */}
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
    </div>
  );
}
