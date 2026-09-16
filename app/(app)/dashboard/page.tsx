"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Zap, Clock, ArrowRight, Cpu, RefreshCw } from "lucide-react";
import {
  DashboardCard,
  CyberScoreCard,
  ThreatBadge,
  RecommendationCard,
  SectionHeading,
} from "@/components";
import {
  DASHBOARD_STATS,
  RECENT_ACTIVITIES,
  RECOMMENDATIONS,
} from "@/lib/data";

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
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
              Live Threat Feed
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Security Overview
          </h1>
          <p className="font-body mt-1 text-sm text-slate-400">
            Real-time telemetry and AI-driven protection active across all
            vector endpoints.
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
            <span>Sync Telemetry</span>
          </button>

          <Link
            href="/url-checker"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-purple-500 active:scale-95"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Launch Deep Scan</span>
          </Link>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {DASHBOARD_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="glass-panel group relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 transition-all duration-300 hover:border-blue-500/30"
          >
            <div className="mb-2 flex items-center justify-between font-mono text-xs text-slate-400">
              <span>{stat.label}</span>
              {stat.change && (
                <span
                  className={`font-semibold ${
                    stat.trend === "up"
                      ? "text-emerald-400"
                      : stat.trend === "down"
                        ? "text-blue-400"
                        : "text-slate-300"
                  }`}
                >
                  {stat.change}
                </span>
              )}
            </div>

            <div className="font-mono text-3xl font-bold tracking-tight text-white transition-colors group-hover:text-blue-300">
              {stat.value}
            </div>

            {stat.subtext && (
              <p className="font-body mt-2 text-xs text-slate-400">
                {stat.subtext}
              </p>
            )}

            {/* Subtle bottom gradient bar */}
            <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-transparent transition-all group-hover:h-1" />
          </motion.div>
        ))}
      </div>

      {/* Main Core Section: Cyber Health Score + Threat Level + Confidence Score */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Large Circular Cyber Health Score (7 Cols) */}
        <div className="flex flex-col lg:col-span-7">
          <CyberScoreCard
            score={88}
            maxScore={100}
            status="SECURE & RESILIENT"
            threatLevel="safe"
            description="All telemetry matrices pass baseline security checks."
            className="h-full"
          />
        </div>

        {/* Right Stack: Threat Level + AI Confidence Score (5 Cols) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Threat Level Widget */}
          <DashboardCard
            title="Current Threat Level"
            subtitle="Autonomous heuristics verdict"
            icon={Shield}
            action={<ThreatBadge level="low" label="LOW RISK" size="sm" />}
            className="flex-1"
          >
            <div className="space-y-4">
              {/* Visual Multi-tier Threat Meter */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[
                  { label: "Safe", active: true, color: "bg-emerald-500" },
                  {
                    label: "Low",
                    active: true,
                    color: "bg-blue-500 shadow-[0_0_10px_#3b82f6]",
                  },
                  { label: "Elevated", active: false, color: "bg-slate-800" },
                  { label: "High", active: false, color: "bg-slate-800" },
                  { label: "Critical", active: false, color: "bg-slate-800" },
                ].map((tier) => (
                  <div key={tier.label} className="space-y-1.5 text-center">
                    <div
                      className={`h-2 rounded-full ${tier.color} transition-all`}
                    />
                    <span
                      className={`font-mono text-[10px] uppercase ${
                        tier.active
                          ? "font-semibold text-slate-200"
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
                  <span className="text-slate-400">Zero-Day Shield:</span>
                  <span className="font-semibold text-emerald-400">
                    Active & Monitoring
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Quarantine Gate:</span>
                  <span className="font-semibold text-slate-300">
                    0 Suspicious Sessions
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Active Firewall Rules:</span>
                  <span className="font-semibold text-blue-400">
                    412 Enforced
                  </span>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* AI Confidence Score Widget */}
          <DashboardCard
            title="AI Confidence Score"
            subtitle="Neural classification accuracy"
            icon={Cpu}
            action={
              <span className="rounded-full border border-purple-500/30 bg-purple-500/20 px-2.5 py-1 font-mono text-xs text-purple-300">
                v4.2 Heuristics
              </span>
            }
            className="flex-1"
          >
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-3xl font-bold text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                  99.4%
                </span>
                <span className="font-mono text-xs text-slate-400">
                  False Positive Ratio &lt; 0.02%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "99.4%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>

              <p className="font-body text-xs leading-relaxed text-slate-400">
                Trained on 450M+ verified security samples, including known
                phishing kits and zero-day memory exploits.
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
            title="Priority Recommendations"
            description="AI-generated hardening actions to elevate your defense posture score."
          />

          <div className="space-y-3">
            {RECOMMENDATIONS.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onAction={(id) => {
                  console.log("Action triggered for recommendation:", id);
                }}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity Feed (5 Cols) */}
        <div className="space-y-4 lg:col-span-5">
          <SectionHeading
            badge="Audit Trail"
            title="Recent Activity"
            description="Real-time incident log across all scanners."
            action={
              <Link
                href="/history"
                className="flex items-center gap-1 font-mono text-xs text-blue-400 hover:text-blue-300"
              >
                <span>View Full Log</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />

          <div className="glass-panel space-y-3 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] p-4 sm:p-5">
            {RECENT_ACTIVITIES.map((act) => (
              <div key={act.id} className="pt-3 first:pt-0">
                <div className="mb-1 flex items-start justify-between gap-3">
                  <div className="font-heading text-sm font-semibold text-white">
                    {act.title}
                  </div>
                  <ThreatBadge
                    level={act.severity}
                    size="sm"
                    pulse={act.severity === "critical"}
                  />
                </div>

                <div className="mb-1 truncate font-mono text-xs text-blue-400">
                  {act.target}
                </div>

                {act.details && (
                  <p className="font-body mb-2 text-xs leading-tight text-slate-400">
                    {act.details}
                  </p>
                )}

                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
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
