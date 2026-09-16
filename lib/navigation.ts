import {
  LayoutDashboard,
  KeyRound,
  Globe,
  Mail,
  FileWarning,
  Bot,
  History,
  Settings,
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
