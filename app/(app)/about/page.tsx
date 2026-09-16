"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  Cpu,
  Lock,
  Zap,
  Globe,
  Mail,
  KeyRound,
  FileWarning,
  ArrowRight,
  Sparkles,
  Server,
  Layers,
} from "lucide-react";
import { DashboardCard, ThreatBadge } from "@/components";

export default function AboutPage() {
  return (
    <div className="space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-blue-400 uppercase">
              Platform Architecture & Mission
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <ThreatBadge level="safe" label="Zero-Trust Edge" size="sm" />
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
              <Shield className="h-6 w-6" />
            </div>
            <span>About SecureNet AI</span>
          </h1>
          <p className="font-body mt-1 max-w-3xl text-sm text-slate-400">
            Autonomous cybersecurity companion delivering proactive heuristic
            defense, cryptographic entropy verification, and unified SecOps
            telemetry.
          </p>
        </div>

        <Link
          href="/reports"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-purple-500"
        >
          <span>View Audit Report</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Hero Mission Statement Card */}
      <div className="glass-panel relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-purple-950/20 to-slate-950/70 p-6 sm:p-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1 font-mono text-xs text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Core Philosophy</span>
          </div>

          <h2 className="font-heading text-xl font-bold text-white sm:text-2xl lg:text-3xl">
            Democratizing Enterprise-Grade Cyber Telemetry for Every Digital
            Asset
          </h2>

          <p className="font-body text-sm leading-relaxed text-slate-300 sm:text-base">
            Modern cyber threats exploit the disconnect between complex
            enterprise security tools and everyday digital workflows. SecureNet
            AI bridges this gap by placing deep algorithmic inspection directly
            on the edge. From credential entropy calculation to NLP phishing
            detection and double-extension static payload analysis, every
            inspection executes instantaneously with complete cryptographic
            privacy.
          </p>
        </div>

        <div className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl" />
      </div>

      {/* Key Architectural Pillars (4 Pillars) */}
      <div className="space-y-4">
        <div className="font-mono text-xs font-semibold tracking-wider text-blue-400 uppercase">
          Defense Foundation
        </div>
        <h3 className="font-heading text-xl font-bold text-white">
          The 4-Pillar Security Framework
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Pillar 1 */}
          <div className="glass-panel space-y-3 rounded-2xl border border-white/[0.08] p-5 transition-all hover:border-blue-500/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <h4 className="font-heading text-base font-bold text-white">
              1. Credential Entropy
            </h4>
            <p className="font-body text-xs leading-relaxed text-slate-400">
              Calculates informational Shannon entropy and GPU brute-force
              resistance, comparing structures against over 10 billion breached
              passwords.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="glass-panel space-y-3 rounded-2xl border border-white/[0.08] p-5 transition-all hover:border-purple-500/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
              <Globe className="h-5 w-5" />
            </div>
            <h4 className="font-heading text-base font-bold text-white">
              2. Domain PhishShield
            </h4>
            <p className="font-body text-xs leading-relaxed text-slate-400">
              Analyzes punycode homoglyphs, high-risk TLDs, IP hostnames, and
              deceptive authentication keywords to intercept credential
              harvesting.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="glass-panel space-y-3 rounded-2xl border border-white/[0.08] p-5 transition-all hover:border-indigo-500/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
              <Mail className="h-5 w-5" />
            </div>
            <h4 className="font-heading text-base font-bold text-white">
              3. Email Vector Heuristics
            </h4>
            <p className="font-body text-xs leading-relaxed text-slate-400">
              Parses conversational coercion, artificial urgency cues, sender
              domain spoofing, and wire-transfer lures with sentence-level
              highlighting.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="glass-panel space-y-3 rounded-2xl border border-white/[0.08] p-5 transition-all hover:border-cyan-500/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
              <FileWarning className="h-5 w-5" />
            </div>
            <h4 className="font-heading text-base font-bold text-white">
              4. Static Binary Inspection
            </h4>
            <p className="font-body text-xs leading-relaxed text-slate-400">
              Computes local SHA-256 hashes, detects double-extension droppers
              (.pdf.exe), weaponized macros, and malicious compressed archives.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy & Zero-Trust Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardCard
          title="Zero-Trust Edge Privacy"
          subtitle="Why your data remains 100% confidential"
          icon={Lock}
        >
          <div className="font-body space-y-3 text-xs leading-relaxed text-slate-300">
            <p>
              Unlike legacy cloud scanners that upload confidential documents
              and passwords to remote corporate servers, SecureNet AI operates
              on a strict{" "}
              <strong className="text-white">Zero Data Transmission</strong>{" "}
              policy.
            </p>
            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
                <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <span>
                  <strong className="text-white">Web Crypto API:</strong>{" "}
                  SHA-256 hash generation runs natively inside your browser
                  sandbox.
                </span>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
                <Server className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                <span>
                  <strong className="text-white">
                    Local Heuristic Matrices:
                  </strong>{" "}
                  Pattern matching, dictionary searches, and scoring algorithms
                  are bundled into optimized client bundles.
                </span>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
                <Layers className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>
                  <strong className="text-white">
                    Session Storage Isolation:
                  </strong>{" "}
                  Telemetry logs exist only within your active browser session
                  and can be cleared with one click.
                </span>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Technology Stack & Specifications"
          subtitle="Production-grade engineering standards"
          icon={Zap}
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
              <span className="text-slate-400">Framework</span>
              <span className="font-bold text-white">
                Next.js 16 (App Router)
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
              <span className="text-slate-400">Language & Typing</span>
              <span className="font-bold text-blue-400">
                TypeScript 5 Strict
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
              <span className="text-slate-400">Styling & Theme</span>
              <span className="font-bold text-purple-400">
                Tailwind CSS (Dark Futuristic)
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
              <span className="text-slate-400">Motion & Feedback</span>
              <span className="font-bold text-emerald-400">
                Framer Motion & Reactive State
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
              <span className="text-slate-400">Cryptography</span>
              <span className="font-bold text-cyan-400">
                W3C Web Crypto Subtle API
              </span>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
