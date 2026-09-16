"use client";

import React, { useState } from "react";
import {
  Mail,
  Zap,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { DashboardCard, ThreatBadge, ScanningModal } from "@/components";
import { useSecurity } from "@/lib/context/SecurityContext";
import { analyzeEmail } from "@/lib/scanners/emailScanner";
import type { ApiResponse, EmailScanResponse } from "@/types";

const SAMPLE_EMAILS = [
  {
    name: "Phishing: Account Suspension",
    content: `From: security-alert@micros0ft-support.biz
Subject: Final Notice: Account suspended within 24 hours

Dear Customer,

We detected unauthorized access to your account. Action required immediately! You must click here to verify your account and confirm your password before your access is terminated.

Please update your billing and authenticate identity right now.
See invoice attached for reference.`,
  },
  {
    name: "Phishing: Wire / Lottery Lure",
    content: `From: claims-dept@global-lottery-rewards.xyz
Subject: Congratulations! You won a $1,500,000 cash bonus reward

Dear Beneficiary,

Congratulations! You have won our exclusive offer cash prize. Click here to verify your identity and enter your credentials to claim your reward immediately!`,
  },
  {
    name: "Clean: Scheduled Maintenance",
    content: `From: ops@securenet.ai
Subject: Scheduled Platform Maintenance: Saturday 02:00 UTC

Hello Team,

This is a routine notice that our edge telemetry nodes will undergo planned infrastructure maintenance this Saturday. No action is required on your end, and all autonomous shield policies remain active.

Best regards,
SecureNet Operations`,
  },
];

export default function EmailCheckerPage() {
  const { addScanRecord, recentScans, cyberHealthScore } = useSecurity();
  const [emailText, setEmailText] = useState(SAMPLE_EMAILS[0].content);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<EmailScanResponse | null>(() =>
    analyzeEmail(SAMPLE_EMAILS[0].content)
  );
  const [error, setError] = useState<string | null>(null);

  const executeScan = async (text: string, recordToGlobal = true) => {
    if (!text.trim()) return;

    setIsScanning(true);
    setError(null);
    setScanStep(0);

    const step1 = setTimeout(() => setScanStep(1), 300);
    const step2 = setTimeout(() => setScanStep(2), 600);

    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailText: text }),
      });
      const json: ApiResponse<EmailScanResponse> = await res.json();

      if (json.success && json.data) {
        const scanResult = json.data;
        setResult(scanResult);

        if (recordToGlobal) {
          addScanRecord({
            type: "email",
            input:
              text.split("\n")[0]?.substring(0, 45) || "Suspicious Message",
            result:
              scanResult.phishingProbability >= 70
                ? "High Probability Phishing Intercepted"
                : scanResult.phishingProbability >= 35
                  ? "Suspicious Social Engineering Indicators"
                  : "Clean Message - No Phishing Vectors",
            threatLevel: scanResult.threatLevel,
            confidence: scanResult.confidenceScore,
            details: `Phishing Probability: ${scanResult.phishingProbability}%. ${scanResult.suspiciousSentences.length} suspicious sentences flagged.`,
            reasons: scanResult.suspiciousSentences,
            metadata: {
              phishingProbability: scanResult.phishingProbability,
            },
          });
        }
      } else {
        setError(json.error || "Email analysis failed.");
      }
    } catch {
      setError("Network error connecting to /api/email service.");
    } finally {
      clearTimeout(step1);
      clearTimeout(step2);
      setIsScanning(false);
    }
  };

  const handleScan = () => {
    executeScan(emailText, true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Scanning Feedback Modal */}
      <ScanningModal
        isOpen={isScanning}
        title="Natural Language & Phishing Vector Analysis"
        target="Email Message Payload"
        steps={[
          "Inspecting RFC Envelope & Sender Authenticity",
          "Evaluating Psychological Urgency & Coercion Keywords",
          "Scanning Hyperlinks & Attachment Signatures",
          "Synthesizing Phishing Probability Score",
        ]}
        activeStep={scanStep}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-blue-400 uppercase">
              Communication Security
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <ThreatBadge level="safe" label="NLP Engine Active" size="sm" />
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
              <Mail className="h-6 w-6" />
            </div>
            <span>Email Phishing Scanner</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            Detect social engineering coercion, sender header spoofing,
            credential harvesting phrases, and deceptive hyperlinks.
          </p>
        </div>

        {/* Live Cyber Health Score Pill */}
        <div className="glass-panel flex items-center gap-3 rounded-xl border border-white/10 px-4 py-2">
          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400">CYBER HEALTH</div>
            <div className="text-sm font-bold text-purple-400">
              {cyberHealthScore} / 100
            </div>
          </div>
          <div className="h-2 w-2 animate-ping rounded-full bg-purple-400" />
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <DashboardCard
            title="Email Payload Inspection Console"
            subtitle="Paste headers and body or select a test sample below"
          >
            <div className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] text-slate-400">
                  Sample Templates:
                </span>
                {SAMPLE_EMAILS.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => setEmailText(sample.content)}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-slate-400 transition-all hover:bg-purple-500/15 hover:text-purple-300"
                  >
                    {sample.name}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                rows={8}
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Paste the email message or raw email headers here..."
                className="w-full resize-y rounded-xl border border-white/10 bg-slate-900/80 p-4 font-mono text-xs text-white placeholder-slate-500 transition-all focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 focus:outline-none"
              />

              <div className="flex items-center justify-between pt-2">
                <div className="font-mono text-[11px] text-slate-400">
                  {emailText.length} characters parsed
                </div>

                <button
                  type="button"
                  disabled={isScanning || !emailText.trim()}
                  onClick={handleScan}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 font-mono text-xs font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:from-blue-500 hover:to-purple-500 active:scale-95 disabled:opacity-60"
                >
                  <Zap className="h-4 w-4" />
                  <span>
                    {isScanning
                      ? "Evaluating Vectors..."
                      : "Analyze Phishing Vectors"}
                  </span>
                </button>
              </div>
            </div>
          </DashboardCard>

          {/* Detailed Analysis Result Card */}
          {result && (
            <DashboardCard
              title="Phishing Telemetry Verdict"
              subtitle="NLP Psychological & Heuristic Evaluation"
              action={<ThreatBadge level={result.threatLevel} size="md" />}
            >
              <div className="space-y-6">
                {/* Top Metrics Row */}
                <div
                  className={`flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center ${
                    result.phishingProbability >= 70
                      ? "border-red-500/30 bg-red-500/10 text-red-300"
                      : result.phishingProbability >= 35
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.phishingProbability >= 70 ? (
                      <ShieldAlert className="h-7 w-7 shrink-0 text-red-400" />
                    ) : result.phishingProbability >= 35 ? (
                      <AlertTriangle className="h-7 w-7 shrink-0 text-amber-400" />
                    ) : (
                      <ShieldCheck className="h-7 w-7 shrink-0 text-emerald-400" />
                    )}
                    <div>
                      <h4 className="font-heading text-base font-bold text-white">
                        Phishing Probability: {result.phishingProbability}%
                      </h4>
                      <p className="font-body text-xs text-slate-300">
                        {result.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4 text-right font-mono">
                    <div>
                      <div className="text-[10px] text-slate-400">
                        THREAT LEVEL
                      </div>
                      <div className="text-sm font-bold text-white uppercase">
                        {result.threatLevel}
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

                {/* Highlighted Suspicious Sentences */}
                {result.suspiciousSentences.length > 0 && (
                  <div>
                    <h4 className="font-heading mb-2.5 text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Flagged Coercive / Phishing Sentences (
                      {result.suspiciousSentences.length})
                    </h4>
                    <div className="space-y-2">
                      {result.suspiciousSentences.map((sentence, idx) => (
                        <div
                          key={idx}
                          className="font-body flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-200 shadow-sm"
                        >
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                          <span className="leading-relaxed">
                            &quot;{sentence}&quot;
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations Box */}
                <div className="space-y-1.5 rounded-xl border border-white/[0.06] bg-slate-900/60 p-4">
                  <div className="font-heading flex items-center gap-1.5 text-xs font-semibold tracking-wider text-blue-400 uppercase">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Mitigation Guidance</span>
                  </div>
                  <p className="font-body text-xs leading-relaxed text-slate-300">
                    {result.recommendation}
                  </p>
                </div>
              </div>
            </DashboardCard>
          )}
        </div>

        {/* Right Sidebar: Recent Email Scans from Global State */}
        <div className="space-y-6 lg:col-span-4">
          <DashboardCard
            title="Live Email Feed"
            subtitle="Recent messages evaluated"
          >
            <div className="space-y-3">
              {recentScans
                .filter((s) => s.type === "email")
                .slice(0, 5)
                .map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-slate-900/40 p-3"
                  >
                    <div className="truncate">
                      <div className="truncate font-mono text-xs text-white">
                        {msg.input}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {msg.timestamp} &bull; {msg.result}
                      </div>
                    </div>
                    <ThreatBadge
                      level={msg.threatLevel}
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
