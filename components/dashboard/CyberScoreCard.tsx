"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { ThreatBadge } from "./ThreatBadge";
import type { CyberScoreCardProps } from "@/types";

export const CyberScoreCard: React.FC<CyberScoreCardProps> = ({
  score = 88,
  maxScore = 100,
  status,
  description = "Overall security posture is solid. Automated continuous heuristics active.",
  threatLevel = "safe",
  breakdown,
  lastUpdated = "Just now",
  className = "",
}) => {
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / maxScore) * circumference;

  // Defaults if breakdown not passed
  const b = breakdown || {
    overall: score,
    category:
      score >= 90
        ? "Excellent"
        : score >= 75
          ? "Good"
          : score >= 50
            ? "Average"
            : "Critical",
    passwordSecurity: Math.round((score / 100) * 25),
    websiteSafety: Math.round((score / 100) * 25),
    emailSafety: Math.round((score / 100) * 25),
    previousScansBonus: Math.round((score / 100) * 25),
  };

  const categoryConfig = {
    Excellent: {
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      label: "EXCELLENT POSTURE",
    },
    Good: {
      color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      label: "GOOD RESILIENCE",
    },
    Average: {
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      label: "AVERAGE EXPOSURE",
    },
    Critical: {
      color: "text-red-400 bg-red-500/10 border-red-500/30",
      label: "CRITICAL VULNERABILITY",
    },
  }[b.category] || {
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    label: "DEFENSE ACTIVE",
  };

  return (
    <div
      className={`glass-panel relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 ${className}`}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-60 w-60 rounded-full bg-blue-600/10 blur-3xl" />

      {/* Card Header */}
      <div className="z-10 mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <h3 className="font-heading text-lg font-semibold text-white">
              Cyber Health Score
            </h3>
          </div>
          <p className="font-body mt-0.5 text-xs text-slate-400">
            Continuous 4-pillar algorithmic defense index
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 font-mono text-xs font-semibold uppercase ${categoryConfig.color}`}
          >
            {b.category}
          </span>
          <ThreatBadge
            level={threatLevel}
            label={status || categoryConfig.label}
            size="sm"
          />
        </div>
      </div>

      {/* Circular Gauge and Metrics */}
      <div className="z-10 flex flex-col items-center justify-center gap-8 py-2 sm:flex-row">
        {/* Animated Radial SVG */}
        <div className="relative flex shrink-0 items-center justify-center">
          <svg className="h-48 w-48 -rotate-90 transform" viewBox="0 0 200 200">
            {/* Background Track */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="14"
              strokeDasharray="4 4"
            />

            {/* Glowing Accent Gradient */}
            <defs>
              <linearGradient
                id="scoreGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#22C55E" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Active Progress Arc */}
            <motion.circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="url(#scoreGradient)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              filter="url(#glow)"
            />
          </svg>

          {/* Center Numerical Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.span
              key={score}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="font-mono text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(37,99,235,0.5)] sm:text-5xl"
            >
              {score}
            </motion.span>
            <span className="font-mono text-xs font-semibold tracking-wider text-slate-400">
              / {maxScore} PTS
            </span>
          </div>
        </div>

        {/* 4-Pillar Sub-Metrics Breakdown (25 pts each) */}
        <div className="w-full flex-1 space-y-3 sm:w-auto">
          {/* Pillar 1: Passwords */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-slate-400">Password Security</span>
              <span className="font-semibold text-emerald-400">
                {b.passwordSecurity} / 25 PTS
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(b.passwordSecurity / 25) * 100}%` }}
                transition={{ duration: 1 }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
          </div>

          {/* Pillar 2: Websites */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-slate-400">Website & Phish Shield</span>
              <span className="font-semibold text-blue-400">
                {b.websiteSafety} / 25 PTS
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(b.websiteSafety / 25) * 100}%` }}
                transition={{ duration: 1, delay: 0.1 }}
                className="h-full rounded-full bg-blue-500"
              />
            </div>
          </div>

          {/* Pillar 3: Emails */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-slate-400">Email Phishing Safety</span>
              <span className="font-semibold text-purple-400">
                {b.emailSafety} / 25 PTS
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(b.emailSafety / 25) * 100}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full rounded-full bg-purple-500"
              />
            </div>
          </div>

          {/* Pillar 4: Previous Scans */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-slate-400">Clean Scans Record</span>
              <span className="font-semibold text-cyan-400">
                {b.previousScansBonus} / 25 PTS
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(b.previousScansBonus / 25) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full bg-cyan-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="z-10 mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="font-body truncate">{description}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-slate-500">
          <RefreshCw className="h-3 w-3" />
          <span>{lastUpdated}</span>
        </div>
      </div>
    </div>
  );
};
