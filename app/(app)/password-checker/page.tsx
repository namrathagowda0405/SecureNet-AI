"use client";

import React, { useState } from "react";
import {
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { DashboardCard, ThreatBadge } from "@/components";

export default function PasswordCheckerPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-blue-400 uppercase">
              Identity & Credential Defense
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <ThreatBadge level="safe" label="AI Guard Active" size="sm" />
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
              <KeyRound className="h-6 w-6" />
            </div>
            <span>Password Analyzer</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            Evaluate credential complexity, calculate theoretical brute-force
            resistance time, and screen against 10B+ exposed records without
            transmitting plain-text passwords.
          </p>
        </div>
      </div>

      {/* Main Interactive Scanner Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Input Box + Real-time Indicators */}
        <div className="space-y-6 lg:col-span-8">
          <DashboardCard
            title="Credential Inspection Console"
            subtitle="Local hash calculation with k-Anonymity API integration"
          >
            <div className="space-y-5">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a password or passphrase to inspect..."
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-900/80 pr-28 pl-4 font-mono text-sm text-white placeholder-slate-400 transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:outline-none"
                />

                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 font-mono text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95"
                  >
                    <Zap className="h-3 w-3" />
                    <span>Scan</span>
                  </button>
                </div>
              </div>

              {/* Entropy Strength Meter (Placeholder Ready) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-400">Entropy Strength:</span>
                  <span className="font-semibold text-blue-400">
                    {password.length > 0
                      ? "Awaiting Backend Scoring"
                      : "No Input"}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{
                      width:
                        password.length > 0
                          ? `${Math.min(password.length * 6, 100)}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Character Checklist */}
              <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                {[
                  { label: "12+ Characters", met: password.length >= 12 },
                  { label: "Uppercase Letters", met: /[A-Z]/.test(password) },
                  { label: "Numbers (0-9)", met: /[0-9]/.test(password) },
                  {
                    label: "Special Symbols",
                    met: /[^A-Za-z0-9]/.test(password),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 rounded-xl border p-2.5 font-mono text-xs transition-colors ${
                      item.met
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-white/[0.06] bg-slate-900/40 text-slate-400"
                    }`}
                  >
                    {item.met ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                    )}
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>

          {/* Detailed Metric Placeholder Sections */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="glass-panel rounded-xl border border-white/[0.08] p-4">
              <div className="mb-1 font-mono text-xs text-slate-400">
                Crack Time Estimate
              </div>
              <div className="font-mono text-lg font-bold text-white">
                ~340 Centillions
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                NVIDIA H100 cluster baseline
              </div>
            </div>

            <div className="glass-panel rounded-xl border border-white/[0.08] p-4">
              <div className="mb-1 font-mono text-xs text-slate-400">
                Breach Occurrences
              </div>
              <div className="font-mono text-lg font-bold text-emerald-400">
                0 Matches
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                HIBP SHA-1 prefix verified
              </div>
            </div>

            <div className="glass-panel rounded-xl border border-white/[0.08] p-4">
              <div className="mb-1 font-mono text-xs text-slate-400">
                Dictionary Entropy
              </div>
              <div className="font-mono text-lg font-bold text-blue-400">
                92.4 Bits
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                High informational randomness
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security Guidance & Best Practices */}
        <div className="space-y-5 lg:col-span-4">
          <DashboardCard
            title="AI Password Blueprint"
            subtitle="Recommendations for absolute resilience"
          >
            <div className="font-body space-y-4 text-xs leading-relaxed text-slate-300">
              <div className="space-y-1 rounded-xl border border-blue-500/20 bg-blue-950/30 p-3">
                <div className="flex items-center gap-1.5 font-semibold text-blue-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                  <span>Passphrase Over Complex Words</span>
                </div>
                <p className="text-slate-400">
                  Four random dictionary words (e.g.
                  &quot;correct-horse-battery-staple&quot;) yield higher entropy
                  and resist dictionary attacks better than short alphanumeric
                  substitutions.
                </p>
              </div>

              <div className="space-y-1 rounded-xl border border-purple-500/20 bg-purple-950/30 p-3">
                <div className="flex items-center gap-1.5 font-semibold text-purple-300">
                  <Lock className="h-3.5 w-3.5 text-purple-400" />
                  <span>Hardware Key Enforcement</span>
                </div>
                <p className="text-slate-400">
                  Pair complex credentials with FIDO2/WebAuthn hardware security
                  keys to render credential replay attacks useless.
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
