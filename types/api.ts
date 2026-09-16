import type {
  AISecurityReport,
  CyberHealthCategory,
  CyberHealthScoreBreakdown,
  EmailAnalysisResult,
  MalwareAnalysisResult,
  PasswordAnalysisResult,
  ScanRecord,
  SecurityRecommendation,
  ThreatLevel,
  UrlAnalysisResult,
} from "./index";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Password API
export interface PasswordScanRequest {
  password: string;
}
export type PasswordScanResponse = PasswordAnalysisResult;

// URL API
export interface UrlScanRequest {
  url: string;
}
export type UrlScanResponse = UrlAnalysisResult;

// Email API
export interface EmailScanRequest {
  emailText: string;
}
export type EmailScanResponse = EmailAnalysisResult;

// Malware API
export type MalwareScanResponse = MalwareAnalysisResult;

// Advisor API
export interface AdvisorApiRequest {
  query: string;
  recentScans?: ScanRecord[];
  cyberHealthScore?: number;
  healthCategory?: string;
}

export interface AdvisorApiResponse {
  text: string;
  contextPill?: string;
  suggestedPrompts?: string[];
}

// Report API
export interface FullAuditReport {
  title: string;
  generatedAt: string;
  cyberHealthScore: number;
  category: CyberHealthCategory;
  threatLevel: ThreatLevel;
  confidenceScore: number;
  breakdown: CyberHealthScoreBreakdown;
  totalScans: number;
  threatsIdentified: number;
  recentScans: ScanRecord[];
  recommendations: SecurityRecommendation[];
  executiveSummary: string;
}

export interface ReportApiRequest {
  mode?: "single" | "aggregate";
  scan?: Pick<
    ScanRecord,
    | "type"
    | "input"
    | "result"
    | "threatLevel"
    | "confidence"
    | "details"
    | "reasons"
    | "metadata"
  >;
  recentScans?: ScanRecord[];
  cyberHealthScore?: number;
  healthBreakdown?: CyberHealthScoreBreakdown;
  threatLevel?: ThreatLevel;
  confidenceScore?: number;
  recommendations?: SecurityRecommendation[];
}

export type ReportApiResponse = AISecurityReport | FullAuditReport;
