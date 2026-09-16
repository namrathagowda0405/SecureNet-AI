"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import type {
  SecurityContextType,
  ScanRecord,
  ThreatLevel,
  CyberHealthScoreBreakdown,
  SecurityRecommendation,
  AISecurityReport,
  ToastMessage,
} from "@/types";
import {
  computeCyberHealthScore,
  deriveGlobalThreatLevel,
} from "@/lib/scanners/healthScorer";
import { RECOMMENDATIONS, THREAT_ALERTS } from "@/lib/data";
import { generateSecurityReport } from "@/lib/reports/reportGenerator";

const STORAGE_KEY = "securenet_ai_security_state_v3";

const DEFAULT_SCANS: ScanRecord[] = [
  {
    id: "scan-init-1",
    type: "url",
    input: "https://paypa1-security-auth-check.top/login",
    result: "Deceptive Login Domain Blocked",
    threatLevel: "critical",
    confidence: 96,
    timestamp: "12m ago",
    details:
      "Detected targeted homograph domain with newly minted Let's Encrypt cert.",
    reasons: [
      "High-Risk TLD (.top) frequently used in credential harvesting",
      "Punycode/homograph substitution detected in root domain",
      "Suspicious keyword 'login' in path",
    ],
  },
  {
    id: "scan-init-2",
    type: "password",
    input: "Cyb3r-G@te#2026!Str0ng",
    result: "High Entropy Passphrase Verified",
    threatLevel: "safe",
    confidence: 99,
    timestamp: "45m ago",
    details: "Entropy: 94.2 bits. 0 matches in breach dictionaries.",
    metadata: { score: 95 },
  },
  {
    id: "scan-init-3",
    type: "email",
    input:
      "Urgent: CFO Wire Authorization Request (From: billing@micros0ft-support.biz)",
    result: "Executive Impersonation Attempt Caught",
    threatLevel: "high",
    confidence: 94,
    timestamp: "2h ago",
    details:
      "Failed SPF/DMARC alignment; urgent psychological coercion tactics.",
    metadata: { phishingProbability: 82 },
  },
  {
    id: "scan-init-4",
    type: "malware",
    input: "Invoice_Q3_Financial_Audit.pdf.exe",
    result: "Suspicious Double-Extension Dropper",
    threatLevel: "high",
    confidence: 98,
    timestamp: "4h ago",
    details:
      "Executable masquerading as PDF; embedded PowerShell dropper signature.",
    reasons: [
      "Masqueraded double extension (.pdf.exe)",
      "Unverified executable binary header",
      "Heuristic match for trojan downloader",
    ],
  },
];

const DEFAULT_REPORT: AISecurityReport = generateSecurityReport(
  DEFAULT_SCANS[0]
);

const SecurityContext = createContext<SecurityContextType | undefined>(
  undefined
);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const toastIdCounter = useRef(1);

  const [recentScans, setRecentScans] = useState<ScanRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.scans)) return parsed.scans;
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_SCANS;
  });

  const [recommendations, setRecommendations] = useState<
    SecurityRecommendation[]
  >(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.recommendations))
            return parsed.recommendations;
        }
      } catch {
        // ignore
      }
    }
    return RECOMMENDATIONS;
  });

  const [latestReport, setLatestReport] = useState<AISecurityReport | null>(
    () => {
      if (typeof window !== "undefined") {
        try {
          const saved = sessionStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.latestReport) return parsed.latestReport;
          }
        } catch {
          // ignore
        }
      }
      return DEFAULT_REPORT;
    }
  );

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Dispatchers
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastMessage, "id">) => {
      const id = `toast-${toastIdCounter.current++}`;
      const newToast: ToastMessage = {
        ...toast,
        id,
        duration: toast.duration || 4500,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    },
    [removeToast]
  );

  // Sync to browser storage on updates
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          scans: recentScans,
          recommendations,
          latestReport,
        })
      );
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [recentScans, recommendations, latestReport]);

  // Derived calculations
  const healthBreakdown: CyberHealthScoreBreakdown = useMemo(() => {
    return computeCyberHealthScore(recentScans);
  }, [recentScans]);

  const cyberHealthScore = healthBreakdown.overall;

  const threatLevel: ThreatLevel = useMemo(() => {
    return deriveGlobalThreatLevel(recentScans);
  }, [recentScans]);

  const confidenceScore = useMemo(() => {
    if (recentScans.length === 0) return 99.4;
    const sum = recentScans.reduce((acc, s) => acc + (s.confidence || 95), 0);
    return Math.round((sum / recentScans.length) * 10) / 10;
  }, [recentScans]);

  // Actions
  const addScanRecord = useCallback(
    (scanData: Omit<ScanRecord, "id" | "timestamp">) => {
      const newRecord: ScanRecord = {
        ...scanData,
        id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: "Just now",
      };

      setRecentScans((prev) => [newRecord, ...prev]);

      // Generate in-depth AI Security Report
      const newReport = generateSecurityReport(newRecord);
      setLatestReport(newReport);

      // Trigger user-facing reactive Toast notification
      if (
        scanData.threatLevel === "critical" ||
        scanData.threatLevel === "high"
      ) {
        showToast({
          type: "error",
          title: `Threat Flagged: ${scanData.threatLevel.toUpperCase()}`,
          message: `${scanData.result} (${scanData.input.substring(0, 24)}...)`,
        });
      } else if (scanData.threatLevel === "medium") {
        showToast({
          type: "warning",
          title: "Elevated Risk Detected",
          message: `${scanData.result} (${scanData.input.substring(0, 24)}...)`,
        });
      } else {
        showToast({
          type: "success",
          title: "Scan Clean & Verified",
          message: `${scanData.result} (${scanData.confidence}% Confidence)`,
        });
      }

      // If a dangerous item is found, add an immediate tailored recommendation
      if (
        scanData.threatLevel === "high" ||
        scanData.threatLevel === "critical"
      ) {
        const newRec: SecurityRecommendation = {
          id: `rec-auto-${Date.now()}`,
          title: `Contain Threat: ${scanData.input.substring(0, 28)}...`,
          description: `Immediate remediation advised for detected ${scanData.type} threat: ${scanData.result}.`,
          category:
            scanData.type === "password"
              ? "authentication"
              : scanData.type === "url"
                ? "network"
                : scanData.type === "email"
                  ? "email"
                  : "endpoint",
          impact: scanData.threatLevel,
          actionLabel: "Neutralize",
          scoreBoost: scanData.threatLevel === "critical" ? 6 : 4,
          resolved: false,
        };

        setRecommendations((prev) => [newRec, ...prev]);
      }
    },
    [showToast]
  );

  const clearHistory = useCallback(() => {
    setRecentScans([]);
    showToast({
      type: "info",
      title: "History Cleared",
      message: "Telemetry event logs have been reset for this session.",
    });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [showToast]);

  const resolveRecommendation = useCallback(
    (id: string) => {
      setRecommendations((prev) => {
        const matched = prev.find((r) => r.id === id);
        if (matched) {
          showToast({
            type: "success",
            title: "Remediation Applied",
            message: `Policy "${matched.title}" successfully enforced (+${matched.scoreBoost || 4} PTS).`,
          });
        }
        return prev.map((rec) =>
          rec.id === id ? { ...rec, resolved: true } : rec
        );
      });
    },
    [showToast]
  );

  const resetToDefaults = useCallback(() => {
    setRecentScans(DEFAULT_SCANS);
    setRecommendations(RECOMMENDATIONS);
    setLatestReport(DEFAULT_REPORT);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      cyberHealthScore,
      healthBreakdown,
      threatLevel,
      confidenceScore,
      recentScans,
      recommendations,
      latestReport,
      threatAlerts: THREAT_ALERTS,
      toasts,
      addScanRecord,
      clearHistory,
      resolveRecommendation,
      resetToDefaults,
      showToast,
      removeToast,
    }),
    [
      cyberHealthScore,
      healthBreakdown,
      threatLevel,
      confidenceScore,
      recentScans,
      recommendations,
      latestReport,
      toasts,
      addScanRecord,
      clearHistory,
      resolveRecommendation,
      resetToDefaults,
      showToast,
      removeToast,
    ]
  );

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error("useSecurity must be used within a SecurityProvider");
  }
  return context;
};
