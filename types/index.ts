import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type ThreatLevel = "safe" | "low" | "medium" | "high" | "critical";

export type CyberHealthCategory = "Excellent" | "Good" | "Average" | "Critical";

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
}

export interface ScanRecord {
  id: string;
  type: "password" | "url" | "email" | "malware" | "system";
  input: string;
  result: string;
  threatLevel: ThreatLevel;
  confidence: number;
  timestamp: string;
  title?: string;
  target?: string;
  severity?: ThreatLevel;
  status?: string;
  details?: string;
  reasons?: string[];
  metadata?: Record<string, unknown>;
}

export interface ScanActivity {
  id: string;
  type: "password" | "url" | "email" | "malware" | "system";
  title: string;
  target: string;
  timestamp: string;
  severity: ThreatLevel;
  status: "blocked" | "flagged" | "verified" | "completed";
  details?: string;
}

export interface SecurityRecommendation {
  id: string;
  title: string;
  description: string;
  category: "authentication" | "network" | "email" | "endpoint" | "general";
  impact: ThreatLevel;
  actionLabel: string;
  actionHref?: string;
  scoreBoost?: number;
  resolved?: boolean;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  href: string;
  gradient?: string;
}

export interface StatMetric {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  subtext?: string;
}

// Password Scanner Models
export interface PasswordAnalysisResult {
  score: number; // 0 - 100
  entropy: number; // informational entropy in bits
  crackTime: string;
  threatLevel: ThreatLevel;
  confidence: number;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    noRepeated: boolean;
    notCommon: boolean;
  };
  suggestions: string[];
}

// URL Scanner Models
export interface UrlAnalysisResult {
  verdict: "Safe" | "Suspicious" | "Dangerous";
  riskScore: number; // 0 - 100 (higher = more dangerous)
  confidenceScore: number; // 0 - 100
  threatLevel: ThreatLevel;
  reasons: string[];
  checks: {
    hasHttps: boolean;
    validLength: boolean;
    notIpAddress: boolean;
    noSuspiciousKeywords: boolean;
    acceptableSubdomains: boolean;
    noSuspiciousChars: boolean;
  };
  domain: string;
}

// Email Scanner Models
export interface EmailAnalysisResult {
  phishingProbability: number; // 0 - 100%
  confidenceScore: number; // 0 - 100%
  threatLevel: ThreatLevel;
  explanation: string;
  recommendation: string;
  suspiciousSentences: string[];
  flags: {
    suspiciousSender: boolean;
    urgencyWords: string[];
    rewardWords: string[];
    verificationPhrases: string[];
    suspiciousLinks: string[];
    excessiveCaps: boolean;
    attachmentMentions: boolean;
  };
}

// Cyber Health Score Model
export interface CyberHealthScoreBreakdown {
  overall: number; // 0 - 100
  category: CyberHealthCategory;
  passwordSecurity: number; // 0 - 25
  websiteSafety: number; // 0 - 25
  emailSafety: number; // 0 - 25
  previousScansBonus: number; // 0 - 25
}

// AI Advisor Message Model
export interface AdvisorMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  contextPill?: string;
  suggestedActions?: { label: string; href?: string; prompt?: string }[];
}

// Malware Scanner Models
export interface MalwareAnalysisResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileHash: string;
  verdict: string;
  threatLevel: ThreatLevel;
  confidenceScore: number;
  riskScore: number; // 0 - 100
  aiExplanation: string;
  indicators: string[];
  checks: {
    safeExtension: boolean;
    noDoubleExtension: boolean;
    normalEntropy: boolean;
    noSuspiciousStrings: boolean;
    validStructure: boolean;
  };
}

// AI Security Report Model
export interface AISecurityReport {
  id: string;
  scanType: "password" | "url" | "email" | "malware" | "system";
  target: string;
  threatLevel: ThreatLevel;
  confidenceScore: number;
  threatSummary: string;
  whyGenerated: string[];
  recommendedActions: string[];
  timestamp: string;
}

// Threat Intelligence Alert Model
export interface ThreatAlert {
  id: string;
  category: "Phishing" | "Malware" | "Password" | "Network";
  title: string;
  description: string;
  severity: ThreatLevel;
  timestamp: string;
  source: string;
  vector: string;
}

// Toast Notification Model
export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

// Global Security State Context Interface
export interface SecurityContextType {
  cyberHealthScore: number;
  healthBreakdown: CyberHealthScoreBreakdown;
  threatLevel: ThreatLevel;
  confidenceScore: number;
  recentScans: ScanRecord[];
  recommendations: SecurityRecommendation[];
  latestReport: AISecurityReport | null;
  threatAlerts: ThreatAlert[];
  toasts: ToastMessage[];
  addScanRecord: (scan: Omit<ScanRecord, "id" | "timestamp">) => void;
  clearHistory: () => void;
  resolveRecommendation: (id: string) => void;
  resetToDefaults: () => void;
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

// Component Props Interfaces
export interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  hoverGlow?: boolean;
}

export interface CyberScoreCardProps {
  score: number;
  maxScore?: number;
  status?: string;
  description?: string;
  threatLevel?: ThreatLevel;
  breakdown?: CyberHealthScoreBreakdown;
  lastUpdated?: string;
  className?: string;
}

export interface ThreatBadgeProps {
  level: ThreatLevel;
  label?: string;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

export interface FeatureCardProps {
  feature: FeatureItem;
  index?: number;
  className?: string;
}

export interface AnimatedBackgroundProps {
  showGrid?: boolean;
  showParticles?: boolean;
  showOrbs?: boolean;
  className?: string;
}

export interface LoadingScannerProps {
  statusText?: string;
  subtext?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface SectionHeadingProps {
  badge?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  action?: ReactNode;
  className?: string;
}

export interface RecommendationCardProps {
  recommendation: SecurityRecommendation;
  onAction?: (id: string) => void;
  className?: string;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export interface NavbarProps {
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
  className?: string;
}
