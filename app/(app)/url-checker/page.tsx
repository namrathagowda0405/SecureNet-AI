"use client";

import React, { useState } from "react";
import {
  Globe,
  Search,
  Zap,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { DashboardCard, ThreatBadge, ScanningModal } from "@/components";
import { useSecurity } from "@/lib/context/SecurityContext";
import { analyzeUrl } from "@/lib/scanners/urlScanner";
import type { UrlAnalysisResult } from "@/types";

export default function UrlCheckerPage() {
  const { addScanRecord, recentScans, cyberHealthScore } = useSecurity();
  const [url, setUrl] = useState(
    "https://paypa1-security-auth-check.top/login"
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<UrlAnalysisResult | null>(() =>
    analyzeUrl("https://paypa1-security-auth-check.top/login")
  );

  const handleScan = () => {
    if (!url.trim()) return;

    setIsScanning(true);
    setScanStep(0);

    setTimeout(() => setScanStep(1), 300);
    setTimeout(() => setScanStep(2), 650);

    setTimeout(() => {
      const scanResult = analyzeUrl(url);
      setResult(scanResult);
      setIsScanning(false);

      // Record to global state
      addScanRecord({
        type: "url",
        input: url,
        result:
          scanResult.verdict === "Safe"
            ? `Verified Safe Domain (${scanResult.domain})`
            : `${scanResult.verdict} Phishing Pattern (${scanResult.domain})`,
        threatLevel: scanResult.threatLevel,
        confidence: scanResult.confidenceScore,
        details: `Risk Score: ${scanResult.riskScore}/100. Reasons: ${scanResult.reasons.length} flagged.`,
        reasons: scanResult.reasons,
        metadata: {
          riskScore: scanResult.riskScore,
          verdict: scanResult.verdict,
        },
      });
    }, 1000);
  };

  const sampleUrls = [
    "https://github.com",
    "https://paypal.com",
    "http://192.168.1.105/login-verify-account.php",
    "https://appleid.verify-support-auth.xyz/confirm",
    "https://update-security-billing--portal.top",
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Scanning Feedback Modal */}
      <ScanningModal
        isOpen={isScanning}
        title="Optical & Domain Heuristics Inspection"
        target={url}
        steps={[
          "Resolving DNS & Hostname Architecture",
          "Evaluating Character Encoding & Homographs",
          "Inspecting SSL/TLS Protocol & High-Risk TLDs",
          "Synthesizing PhishShield Verdict",
        ]}
        activeStep={scanStep}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-blue-400 uppercase">
              Web & Domain Defense
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <ThreatBadge level="safe" label="PhishShield Active" size="sm" />
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
              <Globe className="h-6 w-6" />
            </div>
            <span>Website Phishing Scanner</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            Heuristic inspection detecting deceptive domains, IP hostnames,
            punycode tricks, and credential phishing landing pages.
          </p>
        </div>

        {/* Live Cyber Health Score Pill */}
        <div className="glass-panel flex items-center gap-3 rounded-xl border border-white/10 px-4 py-2">
          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400">CYBER HEALTH</div>
            <div className="text-sm font-bold text-blue-400">
              {cyberHealthScore} / 100
            </div>
          </div>
          <div className="h-2 w-2 animate-ping rounded-full bg-blue-400" />
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <DashboardCard
            title="URL Inspection Console"
            subtitle="Input a web link or select from live test patterns below"
          >
            <div className="space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleScan();
                }}
                className="relative flex flex-col gap-2 sm:flex-row"
              >
                <div className="relative flex-1">
                  <Search className="absolute top-3.5 left-4 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example-domain.com/secure/login"
                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-900/80 pr-4 pl-12 font-mono text-sm text-white placeholder-slate-500 transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isScanning || !url.trim()}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 font-mono text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-purple-500 active:scale-95 disabled:opacity-60"
                >
                  <Zap className="h-4 w-4" />
                  <span>{isScanning ? "Analyzing..." : "Scan Domain"}</span>
                </button>
              </form>

              {/* Sample Test Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="font-mono text-[11px] text-slate-400">
                  Quick Test:
                </span>
                {sampleUrls.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setUrl(sample);
                    }}
                    className="max-w-xs truncate rounded-lg border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-slate-400 transition-all hover:bg-blue-500/10 hover:text-blue-300"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </DashboardCard>

          {/* Detailed Analysis Result Card */}
          {result && (
            <DashboardCard
              title="PhishShield Analysis Verdict"
              subtitle={`Target Domain: ${result.domain}`}
              action={<ThreatBadge level={result.threatLevel} size="md" />}
            >
              <div className="space-y-6">
                {/* Top Banner with Verdict */}
                <div
                  className={`flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center ${
                    result.verdict === "Dangerous"
                      ? "border-red-500/30 bg-red-500/10 text-red-300"
                      : result.verdict === "Suspicious"
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.verdict === "Dangerous" ? (
                      <ShieldAlert className="h-7 w-7 shrink-0 text-red-400" />
                    ) : result.verdict === "Suspicious" ? (
                      <AlertTriangle className="h-7 w-7 shrink-0 text-amber-400" />
                    ) : (
                      <ShieldCheck className="h-7 w-7 shrink-0 text-emerald-400" />
                    )}
                    <div>
                      <h4 className="font-heading text-base font-bold text-white">
                        Domain Verdict: {result.verdict.toUpperCase()}
                      </h4>
                      <p className="font-body text-xs text-slate-300">
                        {result.verdict === "Dangerous"
                          ? "Critical phishing or malicious impersonation vectors detected."
                          : result.verdict === "Suspicious"
                            ? "Elevated risk cues present. Exercise caution before entering data."
                            : "Clean protocol, verified structure, and authentic domain authority."}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4 text-right font-mono">
                    <div>
                      <div className="text-[10px] text-slate-400">
                        RISK SCORE
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          result.riskScore >= 60
                            ? "text-red-400"
                            : result.riskScore >= 30
                              ? "text-amber-400"
                              : "text-emerald-400"
                        }`}
                      >
                        {result.riskScore} / 100
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">
                        CONFIDENCE
                      </div>
                      <div className="text-lg font-bold text-purple-300">
                        {result.confidenceScore}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Check Tags */}
                <div>
                  <h4 className="font-heading mb-2.5 text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Heuristic Verification Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5 font-mono text-xs sm:grid-cols-3">
                    {[
                      { label: "HTTPS Secured", pass: result.checks.hasHttps },
                      {
                        label: "Safe URL Length",
                        pass: result.checks.validLength,
                      },
                      {
                        label: "Authenticated Hostname",
                        pass: result.checks.notIpAddress,
                      },
                      {
                        label: "Zero Suspicious Keywords",
                        pass: result.checks.noSuspiciousKeywords,
                      },
                      {
                        label: "Valid Subdomain Depth",
                        pass: result.checks.acceptableSubdomains,
                      },
                      {
                        label: "Clean Character Set",
                        pass: result.checks.noSuspiciousChars,
                      },
                    ].map((c) => (
                      <div
                        key={c.label}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 ${
                          c.pass
                            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
                            : "border-red-500/30 bg-red-500/10 text-red-400"
                        }`}
                      >
                        {c.pass ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                        )}
                        <span className="truncate">{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reasons Detected */}
                <div>
                  <h4 className="font-heading mb-2.5 text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Reasons & Indicator Details
                  </h4>
                  <div className="space-y-2">
                    {result.reasons.map((r, i) => (
                      <div
                        key={i}
                        className="font-body flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-slate-900/60 p-3 text-xs text-slate-300"
                      >
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DashboardCard>
          )}
        </div>

        {/* Right Sidebar: Recent URL Scans from Global State */}
        <div className="space-y-6 lg:col-span-4">
          <DashboardCard
            title="Live Scan Feed"
            subtitle="Latest URLs evaluated by PhishShield"
          >
            <div className="space-y-3">
              {recentScans
                .filter((s) => s.type === "url")
                .slice(0, 5)
                .map((site) => (
                  <div
                    key={site.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-slate-900/40 p-3"
                  >
                    <div className="truncate">
                      <div className="truncate font-mono text-xs text-white">
                        {site.input}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {site.timestamp} &bull; {site.confidence}% conf
                      </div>
                    </div>
                    <ThreatBadge
                      level={site.threatLevel}
                      size="sm"
                      pulse={false}
                    />
                  </div>
                ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
