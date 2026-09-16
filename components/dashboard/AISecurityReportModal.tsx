"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  X,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { ThreatBadge } from "@/components";
import type { AISecurityReport } from "@/types";

interface AISecurityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AISecurityReport | null;
}

export const AISecurityReportModal: React.FC<AISecurityReportModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const handleCopy = () => {
    const text = `SECURENET AI SECURITY REPORT
Target: ${report.target}
Type: ${report.scanType.toUpperCase()}
Threat Level: ${report.threatLevel.toUpperCase()}
Confidence: ${report.confidenceScore}%
Generated: ${report.timestamp}

EXECUTIVE SUMMARY:
${report.threatSummary}

WHY RESULT WAS GENERATED:
${report.whyGenerated.map((r, i) => `${i + 1}. ${r}`).join("\n")}

RECOMMENDED ACTIONS:
${report.recommendedActions.map((a, i) => `[ ] ${i + 1}. ${a}`).join("\n")}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(report, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `securenet_ai_report_${report.scanType}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="glass-panel relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-blue-500/30 p-6 shadow-2xl shadow-blue-500/10 sm:p-8"
        >
          {/* Top Bar Header */}
          <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold tracking-wider text-blue-400 uppercase">
                  Autonomous SecOps Brief
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-slate-300 uppercase">
                  {report.scanType}
                </span>
              </div>

              <h2 className="font-heading flex items-center gap-2.5 text-xl font-bold text-white sm:text-2xl">
                <FileText className="h-5 w-5 text-blue-400" />
                <span>AI Security Investigation Report</span>
              </h2>

              <p className="max-w-md truncate font-mono text-xs text-slate-400">
                Target:{" "}
                <span className="font-semibold text-blue-300">
                  {report.target}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
              <div className="font-mono text-[10px] text-slate-400">
                THREAT LEVEL
              </div>
              <div className="mt-1">
                <ThreatBadge
                  level={report.threatLevel}
                  size="md"
                  pulse={report.threatLevel === "critical"}
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
              <div className="font-mono text-[10px] text-slate-400">
                AI CONFIDENCE
              </div>
              <div className="font-mono text-lg font-bold text-purple-300">
                {report.confidenceScore}%
              </div>
            </div>

            <div className="col-span-2 rounded-xl border border-white/[0.06] bg-slate-900/60 p-3 sm:col-span-1">
              <div className="font-mono text-[10px] text-slate-400">
                TIMESTAMP
              </div>
              <div className="font-mono text-sm font-semibold text-slate-200">
                {report.timestamp}
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-blue-400 uppercase">
              <Sparkles className="h-4 w-4" />
              <span>Executive Threat Summary</span>
            </div>

            <div className="font-body rounded-xl border border-blue-500/20 bg-blue-950/20 p-4 text-xs leading-relaxed text-slate-200 sm:text-sm">
              {report.threatSummary}
            </div>
          </div>

          {/* Why Result Was Generated */}
          <div className="mt-6 space-y-2.5">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-amber-400 uppercase">
              <AlertTriangle className="h-4 w-4" />
              <span>Why This Result Was Generated (Heuristic Findings)</span>
            </div>

            <div className="space-y-2">
              {report.whyGenerated.map((item, idx) => (
                <div
                  key={idx}
                  className="font-body flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-slate-900/50 p-3 text-xs text-slate-300"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-mono text-[10px] font-bold text-amber-300">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="mt-6 space-y-2.5">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-emerald-400 uppercase">
              <Shield className="h-4 w-4" />
              <span>Recommended Remediation Protocol</span>
            </div>

            <div className="space-y-2">
              {report.recommendedActions.map((action, idx) => (
                <div
                  key={idx}
                  className="font-body flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-xs text-emerald-200"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="leading-relaxed">{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 font-mono text-xs text-slate-300 transition-colors hover:border-white/20 hover:text-white"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 font-mono text-xs text-slate-300 transition-colors hover:border-white/20 hover:text-white"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-blue-600 px-5 py-2 font-mono text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95"
            >
              Close Brief
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
