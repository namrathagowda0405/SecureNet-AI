import type { ThreatLevel } from "./index";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface ScanHistoryRow {
  id?: string;
  scan_type: "password" | "url" | "email" | "malware" | "system";
  input_value: string;
  result: string;
  threat_level: ThreatLevel;
  confidence_score: number;
  risk_score: number;
  created_at?: string;
}

export interface CyberHealthRow {
  id?: string | number;
  health_score: number;
  threat_level: ThreatLevel;
  confidence_score: number;
  updated_at?: string;
}

export interface RecommendationRow {
  id?: string;
  recommendation: string;
  priority: ThreatLevel;
  created_at?: string;
}

export interface Database {
  public: {
    Tables: {
      scan_history: {
        Row: ScanHistoryRow;
        Insert: ScanHistoryRow;
        Update: Partial<ScanHistoryRow>;
        Relationships: [];
      };
      cyber_health: {
        Row: CyberHealthRow;
        Insert: CyberHealthRow;
        Update: Partial<CyberHealthRow>;
        Relationships: [];
      };
      recommendations: {
        Row: RecommendationRow;
        Insert: RecommendationRow;
        Update: Partial<RecommendationRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
