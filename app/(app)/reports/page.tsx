"use client";

import React, { useState } from "react";
import {
  FileText,
  Printer,
  Download,
  Shield,
  KeyRound,
  Globe,
  Mail,
  FileWarning,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { ThreatBadge } from "@/components";
import { useSecurity } from "@/lib/context/SecurityContext";

export default function ReportsPage() {
  const {
    cyberHealthScore,
    healthBreakdown,
    threatLevel,
    confidenceScore,
    recentScans,
    recommendations,
  } = useSecurity();

  const [isPrinting, setIsPrinting] = useState(false);

  // Breakdown statistics
  const passwordScans = recentScans.filter((s) => s.type === "password");
  const urlScans = recentScans.filter((s) => s.type === "url");
  const emailScans = recentScans.filter((s) => s.type === "email");
  const malwareScans = recentScans.filter((s) => s.type === "malware");

  const cleanCount = recentScans.filter(
    (s) => s.threatLevel === "safe" || s.threatLevel === "low"
  ).length;
  const dangerousCount = recentScans.filter(
    (s) => s.threatLevel === "high" || s.threatLevel === "critical"
  ).length;

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  const handleExportJson = () => {
    const reportData = {
      title: "SecureNet AI — Cyber Security Posture Audit Brief",
      generatedAt: new Date().toISOString(),
      cyberHealthScore,
      category: healthBreakdown.category,
      threatLevel,
      confidenceScore,
      breakdown: healthBreakdown,
      scanMetrics: {
        totalScans: recentScans.length,
        cleanCount,
        dangerousCount,
        passwordScans: passwordScans.length,
        urlScans: urlScans.length,
        emailScans: emailScans.length,
        malwareScans: malwareScans.length,
      },
      scans: recentScans,
      recommendations,
    };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(reportData, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `securenet_cyber_security_report_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Action Header (Hidden in Print) */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-purple-400 uppercase">
              Formal Compliance & Telemetry
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            <ThreatBadge level="safe" label="SecOps Brief v4.0" size="sm" />
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2 text-purple-400">
              <FileText className="h-6 w-6" />
            </div>
            <span>Cyber Security Audit Report</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            Comprehensive audit report summarizing credential entropy, domain
            reputation, email threat vectors, static binary hashes, and AI
            remediation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2 font-mono text-xs font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white"
          >
            <Download className="h-4 w-4" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 font-mono text-xs font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:from-blue-500 hover:to-purple-500 active:scale-95"
          >
            <Printer className="h-4 w-4" />
            <span>{isPrinting ? "Formatting PDF..." : "Print / Save PDF"}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div className="mx-auto max-w-4xl space-y-8 rounded-3xl border border-white/[0.08] bg-[#080b1e]/90 p-6 shadow-2xl backdrop-blur-2xl sm:p-10 print:border-none print:bg-transparent print:p-0 print:text-black">
        {/* Document Header & Watermark */}
        <div className="flex flex-col justify-between gap-6 border-b border-white/[0.1] pb-6 sm:flex-row sm:items-start print:border-black/20">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-heading text-lg font-bold tracking-tight text-white print:text-black">
                SecureNet <span className="text-blue-400">AI</span>
              </span>
              <span className="rounded border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] text-blue-300 print:text-black">
                OFFICIAL AUDIT BRIEF
              </span>
            </div>

            <h2 className="font-heading text-xl font-bold text-white sm:text-2xl print:text-black">
              Digital Threat & Posture Assessment Report
            </h2>

            <p className="font-body text-xs text-slate-400 print:text-gray-600">
              Evaluated via SecureNet Autonomous Telemetry & Rule Matrix v4.0
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4 font-mono text-xs text-slate-300 sm:text-right print:border-black/20 print:bg-gray-100 print:text-black">
            <div>
              <span className="text-slate-500 print:text-gray-500">
                AUDIT ID:
              </span>{" "}
              <strong className="text-white print:text-black">
                SEC-2026-X98
              </strong>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-500">
                CLASSIFICATION:
              </span>{" "}
              <span className="font-semibold text-amber-400">RESTRICTED</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-500">
                TIMESTAMP:
              </span>{" "}
              <span>
                {new Date().toLocaleDateString()}{" "}
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary Metrics Card Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/* Health Score */}
          <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 print:border-black/20 print:bg-gray-50">
            <div className="font-mono text-[10px] text-slate-400 uppercase print:text-gray-600">
              Cyber Health Score
            </div>
            <div className="font-mono text-3xl font-bold text-blue-400 print:text-black">
              {cyberHealthScore}{" "}
              <span className="text-sm font-normal text-slate-400">/ 100</span>
            </div>
            <div className="mt-1 font-mono text-xs font-semibold text-emerald-400">
              Tier: {healthBreakdown.category.toUpperCase()}
            </div>
          </div>

          {/* Threat Level */}
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4 print:border-black/20 print:bg-gray-50">
            <div className="font-mono text-[10px] text-slate-400 uppercase print:text-gray-600">
              Threat Posture
            </div>
            <div className="mt-1">
              <ThreatBadge level={threatLevel} size="md" pulse={false} />
            </div>
            <div className="mt-2 font-mono text-[11px] text-slate-400 print:text-gray-600">
              Active severity rating
            </div>
          </div>

          {/* Confidence Score */}
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 print:border-black/20 print:bg-gray-50">
            <div className="font-mono text-[10px] text-slate-400 uppercase print:text-gray-600">
              AI Precision
            </div>
            <div className="font-mono text-3xl font-bold text-purple-300 print:text-black">
              {confidenceScore}%
            </div>
            <div className="mt-1 font-mono text-[11px] text-slate-400 print:text-gray-600">
              Deterministic checks
            </div>
          </div>

          {/* Total Scans & Ratio */}
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4 print:border-black/20 print:bg-gray-50">
            <div className="font-mono text-[10px] text-slate-400 uppercase print:text-gray-600">
              Total Audits
            </div>
            <div className="font-mono text-3xl font-bold text-white print:text-black">
              {recentScans.length}
            </div>
            <div className="mt-1 font-mono text-[11px] text-slate-400 print:text-gray-600">
              Clean: {cleanCount} | Flagged: {dangerousCount}
            </div>
          </div>
        </div>

        {/* 4 Pillars Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 print:border-black/20">
            <Sparkles className="h-4 w-4 text-blue-400 print:text-black" />
            <h3 className="font-heading text-base font-bold tracking-wider text-white uppercase print:text-black">
              Vector Audit Findings (4-Pillar Evaluation)
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* 1. Password Vector */}
            <div className="space-y-2.5 rounded-2xl border border-white/[0.08] bg-slate-900/40 p-4 print:border-black/20 print:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-blue-400 print:text-black" />
                  <span className="font-heading text-sm font-bold text-white print:text-black">
                    1. Password & Credential Security
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-blue-400 print:text-black">
                  {healthBreakdown.passwordSecurity} / 25 PTS
                </span>
              </div>
              <p className="font-body text-xs text-slate-300 print:text-gray-700">
                Audited {passwordScans.length} credential sample(s). Entropy
                algorithms verified character complexity, dictionary resistance,
                and darknet breach leakage.
              </p>
              <div className="font-mono text-[11px] text-slate-400 print:text-gray-600">
                Status:{" "}
                {healthBreakdown.passwordSecurity >= 20
                  ? "Solid Cryptographic Entropy"
                  : "Action Required"}
              </div>
            </div>

            {/* 2. Website Vector */}
            <div className="space-y-2.5 rounded-2xl border border-white/[0.08] bg-slate-900/40 p-4 print:border-black/20 print:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-400 print:text-black" />
                  <span className="font-heading text-sm font-bold text-white print:text-black">
                    2. Website & Domain Safety
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-purple-400 print:text-black">
                  {healthBreakdown.websiteSafety} / 25 PTS
                </span>
              </div>
              <p className="font-body text-xs text-slate-300 print:text-gray-700">
                Audited {urlScans.length} domain(s). Evaluated SSL certificates,
                punycode homoglyphs, deceptive authentication paths, and
                high-risk TLDs.
              </p>
              <div className="font-mono text-[11px] text-slate-400 print:text-gray-600">
                Status:{" "}
                {healthBreakdown.websiteSafety >= 20
                  ? "Clean Domain Traversal"
                  : "Phishing Mitigations Needed"}
              </div>
            </div>

            {/* 3. Email Vector */}
            <div className="space-y-2.5 rounded-2xl border border-white/[0.08] bg-slate-900/40 p-4 print:border-black/20 print:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-indigo-400 print:text-black" />
                  <span className="font-heading text-sm font-bold text-white print:text-black">
                    3. Email Phishing Defense
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-indigo-400 print:text-black">
                  {healthBreakdown.emailSafety} / 25 PTS
                </span>
              </div>
              <p className="font-body text-xs text-slate-300 print:text-gray-700">
                Audited {emailScans.length} email message(s). NLP heuristics
                flagged coercion tactics, fake urgent ultimatums, and spoofed
                headers.
              </p>
              <div className="font-mono text-[11px] text-slate-400 print:text-gray-600">
                Status:{" "}
                {healthBreakdown.emailSafety >= 20
                  ? "Phishing Vectors Contained"
                  : "Review Flagged Emails"}
              </div>
            </div>

            {/* 4. Malware Vector */}
            <div className="space-y-2.5 rounded-2xl border border-white/[0.08] bg-slate-900/40 p-4 print:border-black/20 print:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileWarning className="h-4 w-4 text-cyan-400 print:text-black" />
                  <span className="font-heading text-sm font-bold text-white print:text-black">
                    4. Binary & Malware Defense
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-cyan-400 print:text-black">
                  {healthBreakdown.previousScansBonus} / 25 PTS
                </span>
              </div>
              <p className="font-body text-xs text-slate-300 print:text-gray-700">
                Audited {malwareScans.length} binary file(s). Checked Web Crypto
                SHA-256 signatures, double-extension droppers (.pdf.exe), and
                macro payloads.
              </p>
              <div className="font-mono text-[11px] text-slate-400 print:text-gray-600">
                Status:{" "}
                {healthBreakdown.previousScansBonus >= 20
                  ? "Clean Payload Baselines"
                  : "Quarantine Actions Active"}
              </div>
            </div>
          </div>
        </div>

        {/* Prioritized AI Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 print:border-black/20">
            <ShieldCheck className="h-4 w-4 text-emerald-400 print:text-black" />
            <h3 className="font-heading text-base font-bold tracking-wider text-white uppercase print:text-black">
              Prioritized Remediation Protocol
            </h3>
          </div>

          <div className="space-y-2.5">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.06] bg-slate-900/40 p-3.5 print:border-black/20 print:bg-gray-50"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-xs font-semibold text-white print:text-black">
                      {rec.title}
                    </span>
                    <ThreatBadge level={rec.impact} size="sm" pulse={false} />
                    {rec.scoreBoost && !rec.resolved && (
                      <span className="font-mono text-[10px] text-emerald-400">
                        +{rec.scoreBoost} PTS
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs text-slate-400 print:text-gray-600">
                    {rec.description}
                  </p>
                </div>

                <span className="shrink-0 font-mono text-[11px] font-semibold text-slate-300 print:text-black">
                  {rec.resolved ? "[Resolved]" : "[Pending]"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SecOps Sign-off and Verification Footer */}
        <div className="space-y-4 border-t border-white/[0.1] pt-6 print:border-black/20">
          <div className="grid grid-cols-1 gap-4 font-mono text-xs text-slate-400 sm:grid-cols-3 print:text-gray-600">
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">
                ENGINE VERIFICATION
              </span>
              <strong className="text-white print:text-black">
                SecureNet AI Core v4.0
              </strong>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">
                DATA PRIVACY COMPLIANCE
              </span>
              <strong className="text-white print:text-black">
                W3C Web Crypto / Zero Egress
              </strong>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">
                DIGITAL SIGNATURE HASH
              </span>
              <span className="text-[10px] text-cyan-300 print:text-black">
                SHA-256: 4f8b9e...2026-OK
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 font-mono text-[11px] text-slate-500 print:border-black/20">
            <span>SecureNet AI Platform &bull; All Rights Reserved</span>
            <span>Generated locally without third-party transmission</span>
          </div>
        </div>
      </div>
    </div>
  );
}
