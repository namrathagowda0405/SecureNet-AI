import type {
  CyberHealthCategory,
  CyberHealthScoreBreakdown,
  ScanRecord,
  ThreatLevel,
} from "@/types";

export function computeCyberHealthScore(
  scans: ScanRecord[]
): CyberHealthScoreBreakdown {
  // Default baselines when no scans have been performed yet
  let passwordPoints = 23;
  let websitePoints = 22;
  let emailPoints = 21;
  let scanHistoryPoints = 22;

  // 1. Password Security Pillar (25 points max)
  const passwordScans = scans.filter((s) => s.type === "password");
  if (passwordScans.length > 0) {
    const latestPassword = passwordScans[0];
    const scoreVal =
      typeof latestPassword.metadata?.score === "number"
        ? latestPassword.metadata.score
        : latestPassword.threatLevel === "safe"
          ? 95
          : latestPassword.threatLevel === "low"
            ? 80
            : latestPassword.threatLevel === "medium"
              ? 50
              : 20;

    passwordPoints = Math.round((scoreVal / 100) * 25);
  }

  // 2. Website Safety Pillar (25 points max)
  const urlScans = scans.filter((s) => s.type === "url");
  if (urlScans.length > 0) {
    const latestUrl = urlScans[0];
    const riskVal =
      typeof latestUrl.metadata?.riskScore === "number"
        ? latestUrl.metadata.riskScore
        : latestUrl.threatLevel === "critical"
          ? 90
          : latestUrl.threatLevel === "high"
            ? 70
            : latestUrl.threatLevel === "medium"
              ? 40
              : 0;

    websitePoints = Math.round(((100 - riskVal) / 100) * 25);
  }

  // 3. Email Safety Pillar (25 points max)
  const emailScans = scans.filter((s) => s.type === "email");
  if (emailScans.length > 0) {
    const latestEmail = emailScans[0];
    const phishProb =
      typeof latestEmail.metadata?.phishingProbability === "number"
        ? latestEmail.metadata.phishingProbability
        : latestEmail.threatLevel === "critical"
          ? 90
          : latestEmail.threatLevel === "high"
            ? 70
            : latestEmail.threatLevel === "medium"
              ? 40
              : 0;

    emailPoints = Math.round(((100 - phishProb) / 100) * 25);
  }

  // 4. Previous Safe Scans Pillar (25 points max)
  if (scans.length > 0) {
    const cleanScans = scans.filter(
      (s) => s.threatLevel === "safe" || s.threatLevel === "low"
    ).length;
    const cleanRatio = cleanScans / scans.length;
    scanHistoryPoints = Math.round(cleanRatio * 25);
  }

  const overall = Math.min(
    100,
    Math.max(
      0,
      passwordPoints + websitePoints + emailPoints + scanHistoryPoints
    )
  );

  let category: CyberHealthCategory = "Good";
  if (overall >= 90) {
    category = "Excellent";
  } else if (overall >= 75) {
    category = "Good";
  } else if (overall >= 50) {
    category = "Average";
  } else {
    category = "Critical";
  }

  return {
    overall,
    category,
    passwordSecurity: passwordPoints,
    websiteSafety: websitePoints,
    emailSafety: emailPoints,
    previousScansBonus: scanHistoryPoints,
  };
}

export function deriveGlobalThreatLevel(scans: ScanRecord[]): ThreatLevel {
  if (scans.length === 0) return "safe";
  const recentSlice = scans.slice(0, 5);
  if (recentSlice.some((s) => s.threatLevel === "critical")) return "critical";
  if (recentSlice.some((s) => s.threatLevel === "high")) return "high";
  if (recentSlice.some((s) => s.threatLevel === "medium")) return "medium";
  if (recentSlice.some((s) => s.threatLevel === "low")) return "low";
  return "safe";
}
