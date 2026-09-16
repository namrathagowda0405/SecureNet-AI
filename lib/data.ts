import {
  KeyRound,
  Globe,
  Mail,
  FileWarning,
  Bot,
  Activity,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type {
  FeatureItem,
  ScanActivity,
  SecurityRecommendation,
  StatMetric,
  ThreatAlert,
} from "@/types";

export const LANDING_FEATURES: FeatureItem[] = [
  {
    title: "Password Analyzer",
    description:
      "Inspect password entropy, dictionary susceptibility, and cross-reference against over 10 billion known credential leak databases.",
    icon: KeyRound,
    badge: "Entropy AI",
    href: "/password-checker",
    gradient: "from-blue-600/20 to-cyan-500/20",
  },
  {
    title: "Website Phishing Detection",
    description:
      "Inspect URLs in real-time with optical SSL inspection, domain age telemetry, and DNS spoofing detection heuristics.",
    icon: Globe,
    badge: "Zero-Day Shield",
    href: "/url-checker",
    gradient: "from-purple-600/20 to-blue-500/20",
  },
  {
    title: "Email Phishing Detection",
    description:
      "Deep scan sender headers, DKIM/SPF authenticity, homograph spoofing, and NLP-analyzed social engineering attacks.",
    icon: Mail,
    badge: "NLP Heuristics",
    href: "/email-checker",
    gradient: "from-indigo-600/20 to-purple-500/20",
  },
  {
    title: "Malware Detection",
    description:
      "Multi-engine file hash verification and heuristic static analysis to neutralize trojans, ransomware, and obfuscated payloads.",
    icon: FileWarning,
    badge: "Heuristic Engine",
    href: "/file-checker",
    gradient: "from-blue-600/20 to-emerald-500/20",
  },
  {
    title: "AI Security Advisor",
    description:
      "24/7 autonomous copilot offering customized mitigation strategies, CVE explanations, and hardening blueprints.",
    icon: Bot,
    badge: "Neural Copilot",
    href: "/advisor",
    gradient: "from-purple-600/20 to-pink-500/20",
  },
  {
    title: "Cyber Health Score",
    description:
      "Continuous algorithmic index calculating your overall security posture, attack surface exposure, and compliance posture.",
    icon: Activity,
    badge: "Dynamic Score",
    href: "/dashboard",
    gradient: "from-cyan-600/20 to-blue-500/20",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Scan",
    description:
      "Submit passwords, URLs, emails, or suspect files to the SecureNet AI telemetry pipeline with one click or automated sync.",
    icon: Zap,
    color: "from-blue-500 to-cyan-400",
  },
  {
    step: "02",
    title: "AI Analysis",
    description:
      "Neural models process byte signatures, threat intel matrices, and behavioral heuristics within milliseconds.",
    icon: Bot,
    color: "from-purple-500 to-indigo-400",
  },
  {
    step: "03",
    title: "Stay Protected",
    description:
      "Receive prioritized threat scoring, instant remediation steps, and continuous dynamic defense protection.",
    icon: ShieldCheck,
    color: "from-emerald-500 to-teal-400",
  },
];

export const DASHBOARD_STATS: StatMetric[] = [
  {
    label: "Total Scans Today",
    value: "1,428",
    change: "+12.4%",
    trend: "up",
    subtext: "vs yesterday (1,271)",
  },
  {
    label: "Threats Neutralized",
    value: "37",
    change: "-4.2%",
    trend: "down",
    subtext: "98.7% auto-mitigated",
  },
  {
    label: "Verified Clean Assets",
    value: "1,391",
    change: "+14.1%",
    trend: "up",
    subtext: "passed all security heuristics",
  },
  {
    label: "System Defense Uptime",
    value: "99.98%",
    change: "Optimal",
    trend: "neutral",
    subtext: "32 global telemetry nodes",
  },
];

export const RECENT_ACTIVITIES: ScanActivity[] = [
  {
    id: "act-1",
    type: "url",
    title: "Deceptive Login Domain Blocked",
    target: "https://paypa1-security-auth-check.top/login",
    timestamp: "2 minutes ago",
    severity: "critical",
    status: "blocked",
    details:
      "Detected targeted homograph domain with newly minted Let's Encrypt cert.",
  },
  {
    id: "act-2",
    type: "password",
    title: "Credential Audit Completed",
    target: "Corporate SSO Database Key",
    timestamp: "18 minutes ago",
    severity: "safe",
    status: "verified",
    details:
      "Entropy: 94.2 bits. 0 matches in HaveIBeenPwned or darknet breaches.",
  },
  {
    id: "act-3",
    type: "malware",
    title: "Suspicious PDF Attachment Quarantined",
    target: "Invoice_Q3_Financial_Audit.pdf.exe",
    timestamp: "45 minutes ago",
    severity: "high",
    status: "flagged",
    details:
      "Double extension detected; embedded PowerShell dropper signature.",
  },
  {
    id: "act-4",
    type: "email",
    title: "Executive Impersonation Attempt Caught",
    target: "cfo-urgent-wire@secure-internal-mail.biz",
    timestamp: "2 hours ago",
    severity: "high",
    status: "blocked",
    details:
      "Failed SPF/DMARC alignment; sender IP located in anomalous geo-region.",
  },
  {
    id: "act-5",
    type: "system",
    title: "Network Port Baseline Audit",
    target: "Edge Gateway 192.168.1.1",
    timestamp: "4 hours ago",
    severity: "low",
    status: "completed",
    details: "Standard port sweep completed. All listening endpoints filtered.",
  },
];

export const RECOMMENDATIONS: SecurityRecommendation[] = [
  {
    id: "rec-1",
    title: "Rotate Exposed SSH Admin Keys",
    description:
      "Two keypairs have exceeded the 90-day lifecycle policy and lack hardware token enforcement.",
    category: "authentication",
    impact: "high",
    actionLabel: "Rotate Keys",
    scoreBoost: 4,
  },
  {
    id: "rec-2",
    title: "Activate DMARC Quarantine Policy",
    description:
      "Domain DNS records currently have DMARC in monitor-only mode (p=none). Upgrade to p=quarantine.",
    category: "email",
    impact: "medium",
    actionLabel: "Update DNS",
    scoreBoost: 3,
  },
  {
    id: "rec-3",
    title: "Enable Multi-Factor on Backup Admin Account",
    description:
      "Emergency recovery account does not enforce WebAuthn or TOTP verification.",
    category: "endpoint",
    impact: "critical",
    actionLabel: "Enforce MFA",
    scoreBoost: 5,
  },
  {
    id: "rec-4",
    title: "Whitelist Strict Browser Extension Policy",
    description:
      "Detected 3 legacy third-party extensions with excessive DOM inspection privileges.",
    category: "general",
    impact: "low",
    actionLabel: "Review Policy",
    scoreBoost: 2,
  },
];

export const THREAT_ALERTS: ThreatAlert[] = [
  {
    id: "alert-1",
    category: "Phishing",
    title: "Mass Microsoft 365 Device Code Phishing Surge",
    description:
      "Adversary-in-the-Middle (AiTM) campaigns actively proxying MFA sessions via deceptive Cloudflare Worker subdomains.",
    severity: "critical",
    timestamp: "8m ago",
    source: "CISA US-CERT Advisory",
    vector: "OAuth Device Auth Flow",
  },
  {
    id: "alert-2",
    category: "Malware",
    title: "LummaC2 Stealer Distributed via Malicious ZIP Droppers",
    description:
      "New evasion variants utilizing double extension naming (.pdf.exe) and DLL side-loading to bypass legacy endpoint detection.",
    severity: "high",
    timestamp: "24m ago",
    source: "SecureNet Edge Telemetry",
    vector: "Compressed Archive Evasion",
  },
  {
    id: "alert-3",
    category: "Password",
    title: "Automated Credential Stuffing Surge Targeting SSO Portals",
    description:
      "Residential proxy botnets replaying compromised RockYou2024 password corpuses against enterprise Okta and Azure IDPs.",
    severity: "high",
    timestamp: "1h ago",
    source: "Cloudflare Threat Operations",
    vector: "Distributed Brute Force",
  },
  {
    id: "alert-4",
    category: "Network",
    title: "Active Exploitation of Palo Alto PAN-OS (CVE-2024-3400)",
    description:
      "Unauthenticated remote code execution vulnerability being probed globally across edge firewall interfaces.",
    severity: "critical",
    timestamp: "2h ago",
    source: "Shadowserver Foundation",
    vector: "Edge Gateway Port 443",
  },
  {
    id: "alert-5",
    category: "Phishing",
    title: "Deceptive SWIFT Banking Notification Campaign",
    description:
      "Targeted corporate spear-phishing using lookalike homoglyph domains and high-urgency executive payment requests.",
    severity: "medium",
    timestamp: "3h ago",
    source: "FS-ISAC Intelligence Feed",
    vector: "Inbound Email Vector",
  },
  {
    id: "alert-6",
    category: "Malware",
    title: "Weaponized Office Macro Invoices (QakBot Emulation)",
    description:
      "Macro-enabled .docm containers executing obfuscated PowerShell downloaders from compromised WordPress sites.",
    severity: "high",
    timestamp: "5h ago",
    source: "VirusTotal Telemetry",
    vector: "VBA Document Trigger",
  },
  {
    id: "alert-7",
    category: "Network",
    title: "DNS Amplification Reflection Anomalies Detected",
    description:
      "Unmonitored recursive DNS resolvers observed generating atypical UDP bursts across regional subnet ranges.",
    severity: "low",
    timestamp: "6h ago",
    source: "Global BGP Monitor",
    vector: "UDP Port 53",
  },
  {
    id: "alert-8",
    category: "Password",
    title: "Dark Web Leak: 1.4M Fresh Corporate Hashes Indexed",
    description:
      "Breached third-party HR management portal database published on underground forums without salt protections.",
    severity: "medium",
    timestamp: "8h ago",
    source: "HaveIBeenPwned Monitor",
    vector: "Third-Party Supply Chain",
  },
];
