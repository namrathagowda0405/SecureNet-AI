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
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  insertScanHistory,
  fetchScanHistory,
  saveCyberHealth,
  fetchLatestCyberHealth,
  insertRecommendation,
  fetchRecommendationsList,
} from "@/lib/supabase/db";

const STORAGE_KEY = "securenet_ai_security_state_v5";

const DEFAULT_SCANS: ScanRecord[] = [
  {
    id: "scan-init-1",
    type: "url",
    input: "https://paypa1-security-auth-check.top/login",
    result: "Deceptive Login Domain Blocked",
    threatLevel: "critical",
    confidence: 96,
    timestamp: "8m ago",
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
    timestamp: "22m ago",
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
    timestamp: "1h ago",
    details:
      "Failed SPF/DMARC alignment; urgent psychological coercion tactics.",
    metadata: { phishingProbability: 82 },
  },
  {
    id: "scan-init-4",
    type: "malware",
    input: "Invoice_Q3_Financial_Audit.pdf.exe",
    result: "Suspicious Double-Extension Dropper",
    threatLevel: "critical",
    confidence: 98,
    timestamp: "2h ago",
    details:
      "Executable masquerading as PDF; embedded PowerShell dropper signature.",
    reasons: [
      "Masqueraded double extension (.pdf.exe)",
      "Unverified executable binary header",
      "Heuristic match for trojan downloader",
    ],
  },
  {
    id: "scan-init-5",
    type: "url",
    input: "https://cloud.internal-aws.amazon.com/console",
    result: "Verified Enterprise SSL Domain",
    threatLevel: "safe",
    confidence: 99,
    timestamp: "3h ago",
    details: "Amazon Trust Services CA verified. High reputation domain.",
    reasons: ["Valid HTTPS certificate", "Trusted infrastructure domain"],
  },
  {
    id: "scan-init-6",
    type: "password",
    input: "Winter2025!Login",
    result: "Moderate Entropy Credential",
    threatLevel: "medium",
    confidence: 92,
    timestamp: "4h ago",
    details: "Entropy: 58.4 bits. Predictable seasonal pattern.",
    metadata: { score: 58 },
  },
  {
    id: "scan-init-7",
    type: "email",
    input: "Scheduled Infrastructure Maintenance Window Notice",
    result: "Routine Telemetry Notice (Clean)",
    threatLevel: "safe",
    confidence: 97,
    timestamp: "5h ago",
    details: "SPF, DKIM, and DMARC aligned. No deceptive keywords.",
    metadata: { phishingProbability: 4 },
  },
  {
    id: "scan-init-8",
    type: "malware",
    input: "Annual_Compliance_Audit_2026.pdf",
    result: "Verified Benign Document",
    threatLevel: "safe",
    confidence: 99,
    timestamp: "6h ago",
    details: "Standard PDF structure. 0 macro blocks or embedded scripts.",
    reasons: ["Clean PDF structure", "Clean SHA-256 hash"],
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
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

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

  // Hydrate state from Supabase Cloud on mount if configured
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured()) {
      return;
    }

    const initCloudState = async () => {
      try {
        const [scansRes, recsRes, healthRes] = await Promise.allSettled([
          fetchScanHistory(50),
          fetchRecommendationsList(20),
          fetchLatestCyberHealth(),
        ]);

        if (!isMounted) return;

        let hasSuccess = false;

        if (
          scansRes.status === "fulfilled" &&
          scansRes.value.success &&
          scansRes.value.data &&
          scansRes.value.data.length > 0
        ) {
          setRecentScans(scansRes.value.data);
          hasSuccess = true;
        }

        if (
          recsRes.status === "fulfilled" &&
          recsRes.value.success &&
          recsRes.value.data &&
          recsRes.value.data.length > 0
        ) {
          setRecommendations(recsRes.value.data);
          hasSuccess = true;
        }

        if (
          healthRes.status === "fulfilled" &&
          healthRes.value.success &&
          healthRes.value.data
        ) {
          hasSuccess = true;
        }

        if (hasSuccess) {
          setIsCloudConnected(true);
        } else {
          // Both tables may be empty or error encountered
          const errorOccurred = [scansRes, recsRes, healthRes].some(
            (r) =>
              r.status === "rejected" ||
              (r.status === "fulfilled" && !r.value.success)
          );
          if (errorOccurred) {
            showToast({
              type: "warning",
              title: "Cloud Database Warning",
              message: "Database connection failed. Results saved locally.",
            });
          }
        }
      } catch {
        if (isMounted) {
          showToast({
            type: "warning",
            title: "Cloud Connection Warning",
            message: "Database connection failed. Results saved locally.",
          });
        }
      }
    };

    initCloudState();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

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
      let generatedRec: SecurityRecommendation | null = null;
      if (
        scanData.threatLevel === "high" ||
        scanData.threatLevel === "critical"
      ) {
        generatedRec = {
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

        setRecommendations((prev) => [generatedRec!, ...prev]);
      }

      // Supabase Persistence with Graceful Error Handling
      if (isSupabaseConfigured()) {
        // 1. Insert into scan_history table
        insertScanHistory(newRecord)
          .then((res) => {
            if (!res.success) {
              showToast({
                type: "warning",
                title: "Database Sync Warning",
                message: "Database connection failed. Results saved locally.",
              });
            }
          })
          .catch(() => {
            showToast({
              type: "warning",
              title: "Database Sync Warning",
              message: "Database connection failed. Results saved locally.",
            });
          });

        // 2. Persist updated cyber_health metrics
        const updatedScans = [newRecord, ...recentScans];
        const updatedHealth = computeCyberHealthScore(updatedScans);
        const updatedThreat = deriveGlobalThreatLevel(updatedScans);
        const updatedConfidence =
          updatedScans.length === 0
            ? 99.4
            : Math.round(
                (updatedScans.reduce((a, s) => a + (s.confidence || 95), 0) /
                  updatedScans.length) *
                  10
              ) / 10;

        saveCyberHealth({
          health_score: updatedHealth.overall,
          threat_level: updatedThreat,
          confidence_score: updatedConfidence,
        }).catch(() => {
          // Silent fallback since scan_history already handles notifications
        });

        // 3. Persist recommendation if generated
        if (generatedRec) {
          insertRecommendation({
            recommendation: generatedRec.title,
            priority: generatedRec.impact,
          }).catch(() => {
            // Non-blocking
          });
        }
      }
    },
    [recentScans, showToast]
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

  const refreshFromDatabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      showToast({
        type: "info",
        title: "Local State Active",
        message:
          "Supabase environment variables not set. Running in local state.",
      });
      return;
    }

    try {
      const [scansRes, recsRes] = await Promise.all([
        fetchScanHistory(50),
        fetchRecommendationsList(20),
      ]);

      let errorFound = false;

      if (scansRes.success && scansRes.data && scansRes.data.length > 0) {
        setRecentScans(scansRes.data);
      } else if (!scansRes.success) {
        errorFound = true;
      }

      if (recsRes.success && recsRes.data && recsRes.data.length > 0) {
        setRecommendations(recsRes.data);
      } else if (!recsRes.success) {
        errorFound = true;
      }

      if (errorFound) {
        showToast({
          type: "warning",
          title: "Cloud Sync Warning",
          message: "Database connection failed. Results saved locally.",
        });
      } else {
        setIsCloudConnected(true);
        showToast({
          type: "success",
          title: "Database Synced",
          message: "Loaded latest telemetry and recommendations from Supabase.",
        });
      }
    } catch {
      showToast({
        type: "warning",
        title: "Cloud Connection Warning",
        message: "Database connection failed. Results saved locally.",
      });
    }
  }, [showToast]);

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
      isCloudConnected,
      addScanRecord,
      clearHistory,
      resolveRecommendation,
      resetToDefaults,
      refreshFromDatabase,
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
      isCloudConnected,
      addScanRecord,
      clearHistory,
      resolveRecommendation,
      resetToDefaults,
      refreshFromDatabase,
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
