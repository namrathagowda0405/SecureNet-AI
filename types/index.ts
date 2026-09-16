import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type ThreatLevel = "safe" | "low" | "medium" | "high" | "critical";

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
}

export interface ScanActivity {
  id: string;
  type: "password" | "url" | "email" | "malware" | "system";
  title: string;
  target: string;
  timestamp: string;
  severity: ThreatLevel;
  status: "completed" | "flagged" | "blocked" | "verified";
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
  status: string;
  description: string;
  threatLevel: ThreatLevel;
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
