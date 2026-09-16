"use client";

import React, { useState, useEffect } from "react";
import {
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { DashboardCard, ThreatBadge } from "@/components";
import { useSecurity } from "@/lib/context/SecurityContext";
import { analyzePassword } from "@/lib/scanners/passwordScanner";
import type { ApiResponse, PasswordScanResponse } from "@/types";

export default function PasswordCheckerPage() {
  const { addScanRecord, cyberHealthScore } = useSecurity();
  const [password, setPassword] = useState("Cyb3r-G@te#2026!Str0ng");
  const [showPassword, setShowPassword] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  // Backend API states
  const [result, setResult] = useState<PasswordScanResponse>(() =>
    analyzePassword("Cyb3r-G@te#2026!Str0ng")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live real-time analysis via backend API
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
          signal: controller.signal,
        });
        const json: ApiResponse<PasswordScanResponse> = await res.json();
        if (isMounted) {
          if (json.success && json.data) {
            setResult(json.data);
          } else {
            setError(json.error || "Password evaluation failed.");
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (isMounted) {
          setError("Unable to connect to password verification service.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchAnalysis, 150);
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [password]);

  // Sync to global state
  const handleCommitScan = () => {
    if (!password.trim() || !result) return;

    addScanRecord({
      type: "password",
      input:
        password.length > 3
          ? `${password.substring(0, 2)}***${password.slice(-1)}`
          : "***",
      result:
        result.score === 100
          ? "Excellent Cryptographic Passphrase"
          : result.score >= 86
            ? "Very Strong Entropy Credential"
            : result.score >= 71
              ? "Strong Passphrase"
              : result.score >= 51
                ? "Moderate Entropy Credential"
                : "Vulnerable / Low Entropy Password",
      threatLevel: result.threatLevel,
      confidence: result.confidence,
      details: `Score: ${result.score}/100 (${result.strengthLabel}). Entropy: ${result.entropy} bits. Crack time: ${result.crackTime}.`,
      reasons: result.suggestions,
      metadata: {
        score: result.score,
        strengthLabel: result.strengthLabel,
        entropy: result.entropy,
      },
    });

    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2500);
  };

  // Color mapping for score meter across 6 cybersecurity tiers
  const getScoreColor = (s: number) => {
    if (s === 100) return "from-emerald-400 via-cyan-400 to-purple-400";
    if (s >= 86) return "from-emerald-500 to-teal-400";
    if (s >= 71) return "from-blue-500 to-cyan-400";
    if (s >= 51) return "from-amber-400 to-yellow-400";
    if (s >= 31) return "from-orange-500 to-amber-500";
    return "from-red-600 to-rose-500";
  };

  const getStrengthBadgeClass = (label: string) => {
    switch (label) {
      case "Excellent":
        return "border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-purple-500/20 text-cyan-300 shadow-sm shadow-cyan-500/20";
      case "Very Strong":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
      case "Strong":
        return "border-blue-500/30 bg-blue-500/10 text-blue-300";
      case "Medium":
        return "border-amber-500/30 bg-amber-500/10 text-amber-300";
      case "Weak":
        return "border-orange-500/30 bg-orange-500/10 text-orange-300";
      default:
        return "border-red-500/30 bg-red-500/10 text-red-300";
    }
  };

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
            <ThreatBadge level={result.threatLevel} size="sm" />
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
              <KeyRound className="h-6 w-6" />
            </div>
            <span>Password Analyzer</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            Live client-side entropy evaluation and dictionary screening.
            Passwords are never sent over the network.
          </p>
        </div>

        {/* Live Cyber Health Score Pill */}
        <div className="glass-panel flex items-center gap-3 rounded-xl border border-white/10 px-4 py-2">
          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400">CYBER HEALTH</div>
            <div className="text-sm font-bold text-emerald-400">
              {cyberHealthScore} / 100
            </div>
          </div>
          <div className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
        </div>
      </div>

      {/* Main Interactive Scanner Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Input Box + Real-time Indicators */}
        <div className="space-y-6 lg:col-span-8">
          <DashboardCard
            title="Live Credential Inspection Console"
            subtitle="Type or paste to calculate entropy, brute-force resistance, and complexity checks"
          >
            <div className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password or passphrase to inspect..."
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-900/80 pr-32 pl-4 font-mono text-sm text-white placeholder-slate-500 transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:outline-none"
                />

                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  {isLoading && (
                    <div className="flex items-center gap-1 px-2 font-mono text-[11px] text-blue-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="hidden sm:inline">Analyzing...</span>
                    </div>
                  )}

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
                    onClick={handleCommitScan}
                    disabled={!result || isLoading}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 ${
                      hasSaved
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-500"
                    }`}
                  >
                    {hasSaved ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Recorded!</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5" />
                        <span>Record Scan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Strength Meter Bar */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">
                      Strength Score:{" "}
                      <strong className="text-white">
                        {result ? `${result.score}/100` : "--/100"}
                      </strong>
                    </span>
                    {result && (
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getStrengthBadgeClass(
                          result.strengthLabel
                        )}`}
                      >
                        {result.strengthLabel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Threat Verdict:</span>
                    <ThreatBadge
                      level={result?.threatLevel || "safe"}
                      size="sm"
                      pulse={false}
                    />
                  </div>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800 p-[1px]">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(
                      result ? result.score : 0
                    )} shadow-[0_0_12px_rgba(37,99,235,0.4)] transition-all duration-300`}
                    style={{
                      width: `${Math.max(4, result ? result.score : 4)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Checkbox Matrix: 7 Checks */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 sm:grid-cols-4">
                {[
                  {
                    label: "12+ Characters",
                    met: result?.checks.minLength ?? false,
                  },
                  {
                    label: "Uppercase (A-Z)",
                    met: result?.checks.hasUppercase ?? false,
                  },
                  {
                    label: "Lowercase (a-z)",
                    met: result?.checks.hasLowercase ?? false,
                  },
                  {
                    label: "Numbers (0-9)",
                    met: result?.checks.hasNumber ?? false,
                  },
                  {
                    label: "Special Symbols",
                    met: result?.checks.hasSpecial ?? false,
                  },
                  {
                    label: "No Repetition",
                    met: result?.checks.noRepeated ?? false,
                  },
                  {
                    label: "Not In Breaches",
                    met: result?.checks.notCommon ?? false,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 rounded-xl border p-2.5 font-mono text-xs transition-colors ${
                      item.met
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-white/[0.06] bg-slate-900/40 text-slate-500"
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

          {/* Metric Cards (Crack Time, Entropy, Confidence) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="glass-panel rounded-xl border border-white/[0.08] p-4">
              <div className="mb-1 font-mono text-xs text-slate-400">
                Crack Time Estimate
              </div>
              <div className="truncate font-mono text-base font-bold text-white sm:text-lg">
                {result ? result.crackTime : "Calculating..."}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                100B guesses/sec benchmark
              </div>
            </div>

            <div className="glass-panel rounded-xl border border-white/[0.08] p-4">
              <div className="mb-1 font-mono text-xs text-slate-400">
                Informational Entropy
              </div>
              <div className="font-mono text-base font-bold text-blue-400 sm:text-lg">
                {result ? `${result.entropy} Bits` : "-- Bits"}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {result && result.entropy >= 65
                  ? "Cryptographically solid"
                  : "Under safe threshold"}
              </div>
            </div>

            <div className="glass-panel rounded-xl border border-white/[0.08] p-4">
              <div className="mb-1 font-mono text-xs text-slate-400">
                Engine Confidence
              </div>
              <div className="font-mono text-base font-bold text-purple-300 sm:text-lg">
                {result ? `${result.confidence}%` : "--%"}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Deterministic rule matrix
              </div>
            </div>
          </div>

          {/* Recommendations / Suggestions List */}
          <DashboardCard
            title="AI Security Suggestions"
            subtitle="Tailored steps to elevate your credential posture"
          >
            <div className="space-y-2.5">
              {(result?.suggestions || []).map((suggestion, idx) => (
                <div
                  key={idx}
                  className="font-body flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-950/20 p-3 text-xs text-slate-300"
                >
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>

        {/* Right Column: Security Guidance */}
        <div className="space-y-5 lg:col-span-4">
          <DashboardCard
            title="Passphrase Best Practices"
            subtitle="Recommended authentication strategies"
          >
            <div className="font-body space-y-4 text-xs leading-relaxed text-slate-300">
              <div className="space-y-1 rounded-xl border border-blue-500/20 bg-blue-950/30 p-3.5">
                <div className="flex items-center gap-1.5 font-semibold text-blue-300">
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                  <span>The Diceware Protocol</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Connecting four random words creates over 70 bits of entropy
                  while remaining human-memorable without confusing character
                  swaps.
                </p>
              </div>

              <div className="space-y-1 rounded-xl border border-purple-500/20 bg-purple-950/30 p-3.5">
                <div className="flex items-center gap-1.5 font-semibold text-purple-300">
                  <Lock className="h-4 w-4 text-purple-400" />
                  <span>Zero-Knowledge Vaults</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Store unique passphrases in an end-to-end encrypted password
                  manager protected by biometric authentication and hardware
                  keys.
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
