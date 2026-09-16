"use client";

import React, { useState } from "react";
import {
  FileWarning,
  UploadCloud,
  FileCode,
  Zap,
  Hash,
  AlertOctagon,
} from "lucide-react";
import { DashboardCard, ThreatBadge } from "@/components";

export default function FileCheckerPage() {
  const [fileHash, setFileHash] = useState("");

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-blue-400 uppercase">
              Binary & Payload Defense
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <ThreatBadge level="safe" label="DeepScan Ready" size="sm" />
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
              <FileWarning className="h-6 w-6" />
            </div>
            <span>Malware Scanner</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            Detect suspicious portable executables, obfuscated macros, trojan
            droppers, and ransomware signatures via local hash extraction and
            static telemetry heuristics.
          </p>
        </div>
      </div>

      {/* Main Drag-and-Drop Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <DashboardCard
            title="File Inspection Dropzone"
            subtitle="Files are processed locally or checked via cryptographic hashes"
          >
            <div className="space-y-6">
              {/* Dropzone Container */}
              <div className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 p-8 text-center transition-all duration-300 hover:border-blue-500/50 hover:bg-blue-950/10 sm:p-12">
                <div className="mb-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-blue-400 shadow-lg shadow-blue-500/10 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-300">
                  <UploadCloud className="h-10 w-10" />
                </div>

                <h3 className="font-heading text-lg font-bold text-white transition-colors group-hover:text-blue-300">
                  Drag and drop suspect file here
                </h3>
                <p className="font-body mt-1.5 max-w-sm text-xs text-slate-400">
                  Supports binaries, documents, archives, and scripts (.exe,
                  .dll, .pdf, .zip, .apk) up to 64MB.
                </p>

                <div className="mt-5">
                  <button
                    type="button"
                    className="rounded-xl border border-blue-500/30 bg-blue-600/20 px-5 py-2 font-mono text-xs font-semibold text-blue-300 transition-all hover:border-blue-400 hover:bg-blue-600/30"
                  >
                    Browse Files
                  </button>
                </div>
              </div>

              {/* Or Quick Hash Lookup */}
              <div className="pt-2">
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-mono text-xs tracking-wider text-slate-400 uppercase">
                    Or Search by Hash:
                  </span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>

                <div className="relative flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Hash className="absolute top-3.5 left-4 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={fileHash}
                      onChange={(e) => setFileHash(e.target.value)}
                      placeholder="Paste MD5, SHA-1, or SHA-256 hash string..."
                      className="h-11 w-full rounded-xl border border-white/10 bg-slate-900/80 pr-4 pl-11 font-mono text-xs text-white placeholder-slate-400 transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-mono text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>Lookup Hash</span>
                  </button>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Right Info Box */}
        <div className="space-y-5 lg:col-span-4">
          <DashboardCard
            title="Analysis Capabilities"
            subtitle="Static heuristic engines"
          >
            <div className="font-body space-y-3.5 text-xs text-slate-400">
              <div className="space-y-1 rounded-xl border border-white/[0.06] bg-slate-900/40 p-3">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <FileCode className="h-4 w-4 text-blue-400" />
                  <span>Entropy & Packing Analysis</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Detects UPX and custom cryptor obfuscation used to conceal
                  malicious payload logic.
                </p>
              </div>

              <div className="space-y-1 rounded-xl border border-white/[0.06] bg-slate-900/40 p-3">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <AlertOctagon className="h-4 w-4 text-purple-400" />
                  <span>Double Extension Detection</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Instantly flags spoofed file formats such as invoice.pdf.exe
                  or report.docx.vbs.
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
