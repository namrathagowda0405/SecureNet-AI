import {
  LayoutDashboard,
  KeyRound,
  Globe,
  Mail,
  FileWarning,
  Bot,
  History,
  Settings,
  FileText,
  Shield,
  Users,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import type { NavigationItem } from "@/types";

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Security posture & threat overview",
  },
  {
    title: "Password Analyzer",
    href: "/password-checker",
    icon: KeyRound,
    badge: "AI Guard",
    description: "Entropy check & breach vulnerability",
  },
  {
    title: "Website Scanner",
    href: "/url-checker",
    icon: Globe,
    badge: "PhishShield",
    description: "URL reputation & malicious domain scanner",
  },
  {
    title: "Email Scanner",
    href: "/email-checker",
    icon: Mail,
    description: "Header inspection & phishing payload analysis",
  },
  {
    title: "Malware Scanner",
    href: "/file-checker",
    icon: FileWarning,
    badge: "DeepScan",
    description: "Binary analysis & signature detection",
  },
  {
    title: "AI Security Advisor",
    href: "/advisor",
    icon: Bot,
    badge: "Copilot",
    description: "Conversational cyber defense assistant",
  },
  {
    title: "Scan History",
    href: "/history",
    icon: History,
    description: "Audit trail and event records",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Preferences & security policies",
  },
];

export const SECONDARY_NAV_ITEMS: NavigationItem[] = [
  {
    title: "Security Report",
    href: "/reports",
    icon: FileText,
    badge: "PDF Audit",
    description: "Downloadable SecOps audit brief",
  },
  {
    title: "About Project",
    href: "/about",
    icon: Shield,
    description: "Mission, architecture & edge engine",
  },
  {
    title: "Team & SecOps",
    href: "/team",
    icon: Users,
    description: "Architects & developers",
  },
  {
    title: "FAQ & Privacy",
    href: "/faq",
    icon: HelpCircle,
    description: "Frequently asked security questions",
  },
  {
    title: "Contact / Feedback",
    href: "/contact",
    icon: MessageSquare,
    description: "Telemetry feedback & disclosures",
  },
];
