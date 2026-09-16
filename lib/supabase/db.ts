import { getSupabaseClient, isSupabaseConfigured } from "./client";
import type {
  ScanHistoryRow,
  CyberHealthRow,
  RecommendationRow,
} from "@/types/supabase";
import type { ScanRecord, ThreatLevel, SecurityRecommendation } from "@/types";

/**
 * Derives a numeric 0-100 risk score from a scan record.
 */
export const deriveRiskScore = (
  scan: Omit<ScanRecord, "id" | "timestamp"> | ScanRecord
): number => {
  if (scan.metadata) {
    if (typeof scan.metadata.riskScore === "number") {
      return Math.round(scan.metadata.riskScore);
    }
    if (typeof scan.metadata.phishingProbability === "number") {
      return Math.round(scan.metadata.phishingProbability);
    }
    if (typeof scan.metadata.score === "number") {
      // For passwords, higher score = stronger/safer, so risk = 100 - score
      return Math.max(0, Math.min(100, Math.round(100 - scan.metadata.score)));
    }
  }

  // Fallback heuristic based on threat level
  switch (scan.threatLevel) {
    case "critical":
      return 95;
    case "high":
      return 80;
    case "medium":
      return 50;
    case "low":
      return 20;
    case "safe":
    default:
      return 5;
  }
};

/**
 * Formats an ISO date string into a friendly relative timestamp.
 */
export const formatRelativeTime = (isoString?: string): string => {
  if (!isoString) return "Just now";
  try {
    const past = new Date(isoString).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "Recently";
  }
};

/**
 * Inserts a new scan event into the `scan_history` Supabase table.
 */
export async function insertScanHistory(
  scan: Omit<ScanRecord, "id" | "timestamp"> | ScanRecord
): Promise<{ success: boolean; data?: ScanHistoryRow; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured.",
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: "Unable to initialize Supabase client.",
    };
  }

  try {
    const riskScore = deriveRiskScore(scan);
    const row: ScanHistoryRow = {
      scan_type: scan.type,
      input_value: scan.input,
      result: scan.result,
      threat_level: scan.threatLevel,
      confidence_score: scan.confidence,
      risk_score: riskScore,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from("scan_history")
      .insert([row])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as ScanHistoryRow };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown database error";
    return { success: false, error: message };
  }
}

/**
 * Fetches recent scan history from the `scan_history` Supabase table.
 */
export async function fetchScanHistory(
  limit: number = 50
): Promise<{ success: boolean; data?: ScanRecord[]; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured.",
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: "Unable to initialize Supabase client.",
    };
  }

  try {
    const { data, error } = await client
      .from("scan_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: true, data: [] };
    }

    const records: ScanRecord[] = (data as ScanHistoryRow[]).map(
      (row, idx) => ({
        id: row.id ? String(row.id) : `db-scan-${idx}`,
        type: row.scan_type,
        input: row.input_value,
        result: row.result,
        threatLevel: row.threat_level,
        confidence: row.confidence_score,
        timestamp: formatRelativeTime(row.created_at),
        details: `Supabase Cloud Record • Risk Score: ${row.risk_score}/100`,
        metadata: {
          riskScore: row.risk_score,
          persistedAt: row.created_at,
        },
      })
    );

    return { success: true, data: records };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown database error";
    return { success: false, error: message };
  }
}

/**
 * Inserts or updates the latest cyber health metrics in `cyber_health`.
 */
export async function saveCyberHealth(health: {
  health_score: number;
  threat_level: ThreatLevel;
  confidence_score: number;
}): Promise<{ success: boolean; data?: CyberHealthRow; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured.",
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: "Unable to initialize Supabase client.",
    };
  }

  try {
    const row: CyberHealthRow = {
      health_score: Math.round(health.health_score),
      threat_level: health.threat_level,
      confidence_score: health.confidence_score,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from("cyber_health")
      .insert([row])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as CyberHealthRow };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown database error";
    return { success: false, error: message };
  }
}

/**
 * Fetches the latest recorded cyber health score from `cyber_health`.
 */
export async function fetchLatestCyberHealth(): Promise<{
  success: boolean;
  data?: CyberHealthRow | null;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured.",
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: "Unable to initialize Supabase client.",
    };
  }

  try {
    const { data, error } = await client
      .from("cyber_health")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data ? (data as unknown as CyberHealthRow) : null,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown database error";
    return { success: false, error: message };
  }
}

/**
 * Inserts a new recommendation into the `recommendations` table.
 */
export async function insertRecommendation(rec: {
  recommendation: string;
  priority: ThreatLevel;
}): Promise<{ success: boolean; data?: RecommendationRow; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured.",
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: "Unable to initialize Supabase client.",
    };
  }

  try {
    const row: RecommendationRow = {
      recommendation: rec.recommendation,
      priority: rec.priority,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from("recommendations")
      .insert([row])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as RecommendationRow };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown database error";
    return { success: false, error: message };
  }
}

/**
 * Fetches the list of recommendations from `recommendations`.
 */
export async function fetchRecommendationsList(limit: number = 20): Promise<{
  success: boolean;
  data?: SecurityRecommendation[];
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured.",
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: "Unable to initialize Supabase client.",
    };
  }

  try {
    const { data, error } = await client
      .from("recommendations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: true, data: [] };
    }

    const mapped: SecurityRecommendation[] = (data as RecommendationRow[]).map(
      (row, idx) => ({
        id: row.id ? String(row.id) : `rec-db-${idx}`,
        title: row.recommendation,
        description: `Remediation priority: ${row.priority.toUpperCase()} • Recorded in Supabase Cloud.`,
        category: "general",
        impact: row.priority,
        actionLabel: "Mitigate",
        scoreBoost:
          row.priority === "critical" ? 8 : row.priority === "high" ? 5 : 3,
        resolved: false,
      })
    );

    return { success: true, data: mapped };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown database error";
    return { success: false, error: message };
  }
}
