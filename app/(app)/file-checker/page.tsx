"use client";

import React, { useState, useRef } from "react";
import {
  FileWarning,
  UploadCloud,
  FileCode,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Archive,
  Image as ImageIcon,
  Cpu,
} from "lucide-react";
import { DashboardCard, ThreatBadge, ScanningModal } from "@/components";
import { useSecurity } from "@/lib/context/SecurityContext";
import { analyzeFile } from "@/lib/scanners/fileScanner";
import type { MalwareAnalysisResult } from "@/types";

const SAMPLE_TEST_FILES = [
  {
    name: "Invoice_Q3_Financial_Audit.pdf.exe",
    size: 8192,
    type: "application/x-msdownload",
    label: "Double-Ext Dropper (Critical)",
  },
  {
    name: "Confidential_Executive_Payroll.docm",
    size: 64200,
    type: "application/vnd.ms-word.document.macroEnabled.12",
    label: "Weaponized Macro Doc (High)",
  },
  {
    name: "Urgent_Statement_Secure.zip",
    size: 245100,
    type: "application/zip",
    label: "Phishing Archive (High)",
  },
  {
    name: "Annual_Compliance_Audit_2026.pdf",
    size: 1420500,
    type: "application/pdf",
    label: "Clean Document (Safe)",
  },
  {
    name: "Corporate_Network_Diagram.png",
    size: 512000,
    type: "image/png",
    label: "Clean Media Asset (Safe)",
  },
];

export default function FileCheckerPage() {
  const { addScanRecord, recentScans, cyberHealthScore } = useSecurity();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [copiedHash, setCopiedHash] = useState(false);

  // Initial demo result
  const [result, setResult] = useState<MalwareAnalysisResult | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.endsWith(".pdf"))
      return <FileText className="h-5 w-5 text-red-400" />;
    if (lower.endsWith(".docx") || lower.endsWith(".docm"))
      return <FileCode className="h-5 w-5 text-blue-400" />;
    if (
      lower.endsWith(".zip") ||
      lower.endsWith(".rar") ||
      lower.endsWith(".7z")
    )
      return <Archive className="h-5 w-5 text-amber-400" />;
    if (
      lower.endsWith(".png") ||
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg")
    )
      return <ImageIcon className="h-5 w-5 text-emerald-400" />;
    return <FileWarning className="h-5 w-5 text-cyan-400" />;
  };

  const executeAnalysis = async (
    name: string,
    size: number,
    type?: string,
    buffer?: ArrayBuffer
  ) => {
    setSelectedFileName(name);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate file upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 25;
      });
    }, 80);

    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploading(false);
      setIsScanning(true);
      setScanStep(0);

      // Multi-step scanning progression
      setTimeout(() => setScanStep(1), 350);
      setTimeout(() => setScanStep(2), 700);

      setTimeout(async () => {
        const scanOutcome = await analyzeFile({
          name,
          size,
          type,
          buffer,
        });

        setResult(scanOutcome);
        setIsScanning(false);

        // Commit to global security state
        addScanRecord({
          type: "malware",
          input: scanOutcome.fileName,
          result: scanOutcome.verdict,
          threatLevel: scanOutcome.threatLevel,
          confidence: scanOutcome.confidenceScore,
          details: `Risk Score: ${scanOutcome.riskScore}/100. SHA-256: ${scanOutcome.fileHash.substring(0, 16)}...`,
          reasons: scanOutcome.indicators,
          metadata: {
            fileSize: scanOutcome.fileSize,
            fileHash: scanOutcome.fileHash,
            riskScore: scanOutcome.riskScore,
          },
        });
      }, 1100);
    }, 450);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        executeAnalysis(file.name, file.size, file.type, buffer);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        executeAnalysis(file.name, file.size, file.type, buffer);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Holographic Multi-stage Scanning Modal */}
      <ScanningModal
        isOpen={isScanning}
        title="Deep Payload Static Inspection"
        target={selectedFileName}
        steps={[
          "Validating MIME headers & boundary structure",
          "Computing SHA-256 hash & inspecting double extension masking",
          "Evaluating binary entropy, macro triggers & heuristic rules",
        ]}
        activeStep={scanStep}
      />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.docx,.docm,.zip,.rar,.7z,.exe,.bat,.cmd,.vbs,.ps1,.png,.jpg,.jpeg"
        className="hidden"
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              Binary & Payload Defense
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            <ThreatBadge level="safe" label="Static Engine Ready" size="sm" />
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-400">
              <FileWarning className="h-6 w-6" />
            </div>
            <span>Malware & Binary Scanner</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            Static heuristic inspection detecting trojan droppers, weaponized
            macros, double-extension evasion, and suspicious archives.
          </p>
        </div>

        {/* Live Cyber Health Score Pill */}
        <div className="glass-panel flex items-center gap-3 rounded-xl border border-white/10 px-4 py-2">
          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400">CYBER HEALTH</div>
            <div className="text-sm font-bold text-cyan-400">
              {cyberHealthScore} / 100
            </div>
          </div>
          <div className="h-2 w-2 animate-ping rounded-full bg-cyan-400" />
        </div>
      </div>

      {/* Main Drag & Drop + Analysis Console */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Dropzone & Analysis Results (8 Cols) */}
        <div className="space-y-6 lg:col-span-8">
          <DashboardCard
            title="File Inspection Dropzone"
            subtitle="Drag & drop or browse PDF, DOCX, ZIP, EXE, PNG, JPG (up to 64 MB)"
          >
            <div className="space-y-6">
              {/* Interactive Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 sm:p-12 ${
                  isDragging
                    ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                    : "border-white/10 hover:border-cyan-500/50 hover:bg-cyan-950/10"
                }`}
              >
                <div className="mb-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-cyan-400 shadow-lg shadow-cyan-500/10 transition-all duration-300 group-hover:scale-110 group-hover:text-cyan-300">
                  <UploadCloud className="h-10 w-10" />
                </div>

                <h3 className="font-heading text-lg font-bold text-white transition-colors group-hover:text-cyan-300">
                  Drag and drop suspect file here
                </h3>
                <p className="font-body mt-1.5 max-w-sm text-xs text-slate-400">
                  Supports PDF, DOCX, ZIP, EXE, PNG, JPG. Files are processed
                  locally via static telemetry heuristics.
                </p>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="rounded-xl border border-cyan-500/30 bg-cyan-600/20 px-5 py-2 font-mono text-xs font-semibold text-cyan-300 transition-all hover:border-cyan-400 hover:bg-cyan-600/30"
                  >
                    Browse Files
                  </button>
                </div>
              </div>

              {/* Upload Progress Bar (when active) */}
              {isUploading && (
                <div className="space-y-2 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4">
                  <div className="flex items-center justify-between font-mono text-xs text-slate-300">
                    <span>Reading & Hashing Payload: {selectedFileName}</span>
                    <span className="font-bold text-cyan-400">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Preset Sample Testing Buttons */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 uppercase">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Instant Test Benchmarks (Zero Risk):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_TEST_FILES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        executeAnalysis(sample.name, sample.size, sample.type)
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-slate-900/60 px-3 py-1.5 font-mono text-xs text-slate-300 transition-all hover:border-cyan-500/40 hover:bg-cyan-950/20 hover:text-white"
                    >
                      {getFileIcon(sample.name)}
                      <span>{sample.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Analysis Results Card */}
          {result && (
            <DashboardCard
              title="Static Analysis Verdict"
              subtitle={`Detailed forensic findings for ${result.fileName}`}
              action={
                <ThreatBadge
                  level={result.threatLevel}
                  size="md"
                  pulse={result.threatLevel === "critical"}
                />
              }
            >
              <div className="space-y-6">
                {/* File Metadata Banner */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-3.5">
                    <div className="font-mono text-[10px] text-slate-400">
                      FILE NAME & SIZE
                    </div>
                    <div className="mt-0.5 truncate font-mono text-xs font-semibold text-white">
                      {result.fileName}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">
                      {formatFileSize(result.fileSize)} &bull; {result.fileType}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-3.5">
                    <div className="font-mono text-[10px] text-slate-400">
                      RISK SCORE
                    </div>
                    <div className="mt-0.5 font-mono text-xl font-bold text-red-400">
                      {result.riskScore} / 100
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">
                      Confidence: {result.confidenceScore}%
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-3.5">
                    <div className="font-mono text-[10px] text-slate-400">
                      SHA-256 HASH
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-1">
                      <span className="truncate font-mono text-[11px] text-cyan-300">
                        {result.fileHash.substring(0, 16)}...
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyHash(result.fileHash)}
                        className="rounded p-1 text-slate-400 hover:text-white"
                        title="Copy full hash"
                      >
                        {copiedHash ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-[10px] text-slate-500">
                      Authentic Web Crypto hash
                    </div>
                  </div>
                </div>

                {/* AI Explanation Box */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                    <Cpu className="h-4 w-4" />
                    <span>AI Forensic Explanation</span>
                  </div>
                  <div className="font-body rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-xs leading-relaxed text-slate-200 sm:text-sm">
                    {result.aiExplanation}
                  </div>
                </div>

                {/* Heuristic Checks Checklist */}
                <div className="space-y-2.5">
                  <h4 className="font-heading text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Static Rule Matrix Checks
                  </h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {[
                      {
                        label: "Safe Extension Format",
                        met: result.checks.safeExtension,
                      },
                      {
                        label: "No Double-Extension Masking",
                        met: result.checks.noDoubleExtension,
                      },
                      {
                        label: "Normal Payload Entropy",
                        met: result.checks.normalEntropy,
                      },
                      {
                        label: "No Trojan / Dropper Keywords",
                        met: result.checks.noSuspiciousStrings,
                      },
                      {
                        label: "Valid File Header & Structure",
                        met: result.checks.validStructure,
                      },
                    ].map((check) => (
                      <div
                        key={check.label}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 font-mono text-xs ${
                          check.met
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-red-500/30 bg-red-950/20 text-red-300"
                        }`}
                      >
                        {check.met ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 shrink-0 text-red-400" />
                        )}
                        <span>{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specific Flagged Indicators */}
                {result.indicators.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-red-400 uppercase">
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        Flagged Threat Indicators ({result.indicators.length})
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {result.indicators.map((ind, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-950/20 p-3 font-mono text-xs text-red-200"
                        >
                          <span className="text-red-400">&bull;</span>
                          <span>{ind}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DashboardCard>
          )}
        </div>

        {/* Right Column: Live Feed & Best Practices (4 Cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Live Recent File Scans Feed */}
          <DashboardCard
            title="Recent Binary Scans"
            subtitle="Payloads audited in this session"
          >
            <div className="space-y-3">
              {recentScans.filter((s) => s.type === "malware").length === 0 ? (
                <div className="py-6 text-center font-mono text-xs text-slate-500">
                  No binary files scanned yet.
                </div>
              ) : (
                recentScans
                  .filter((s) => s.type === "malware")
                  .slice(0, 5)
                  .map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-slate-900/40 p-3"
                    >
                      <div className="truncate">
                        <div className="truncate font-mono text-xs text-white">
                          {scan.input}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {scan.timestamp} &bull; {scan.result}
                        </div>
                      </div>
                      <ThreatBadge
                        level={scan.threatLevel}
                        size="sm"
                        pulse={false}
                      />
                    </div>
                  ))
              )}
            </div>
          </DashboardCard>

          {/* Defense Blueprint Card */}
          <DashboardCard
            title="Malware Containment Rules"
            subtitle="Zero-trust endpoint guidelines"
          >
            <div className="font-body space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="space-y-1 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3">
                <div className="font-mono text-xs font-semibold text-cyan-300">
                  Always Unhide File Extensions
                </div>
                <p className="text-[11px] text-slate-400">
                  Windows hides extensions by default, enabling deceptive files
                  like &quot;Report.pdf.exe&quot; to appear as benign PDF
                  documents.
                </p>
              </div>

              <div className="space-y-1 rounded-xl border border-purple-500/20 bg-purple-950/20 p-3">
                <div className="font-mono text-xs font-semibold text-purple-300">
                  Block Macro Execution
                </div>
                <p className="text-[11px] text-slate-400">
                  Enforce group policies disabling VBA macros in files
                  downloaded from the Internet to prevent initial stage dropper
                  executions.
                </p>
              </div>

              <div className="space-y-1 rounded-xl border border-blue-500/20 bg-blue-950/20 p-3">
                <div className="font-mono text-xs font-semibold text-blue-300">
                  Sandbox Detonation
                </div>
                <p className="text-[11px] text-slate-400">
                  Never extract unverified ZIP attachments directly onto
                  workstations. Detonate within an isolated ephemeral sandbox.
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
