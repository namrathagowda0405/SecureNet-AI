import type { EmailAnalysisResult, ThreatLevel } from "@/types";

const URGENCY_TRIGGERS = [
  "urgent",
  "immediately",
  "suspended",
  "suspension",
  "terminate",
  "terminated",
  "24 hours",
  "48 hours",
  "action required",
  "final notice",
  "unauthorized",
  "locked",
  "security alert",
  "freeze",
  "deactivation",
  "within minutes",
];

const REWARD_TRIGGERS = [
  "congratulations",
  "winner",
  "won",
  "lottery",
  "reward",
  "claim reward",
  "prize",
  "exclusive offer",
  "free gift",
  "gift card",
  "cash bonus",
  "inheritance",
  "million dollars",
  "crypto giveaway",
];

const VERIFICATION_PHRASES = [
  "verify your account",
  "verify your identity",
  "confirm your password",
  "reset your password",
  "update your billing",
  "confirm your details",
  "click here to login",
  "click here to verify",
  "authenticate identity",
  "enter your credentials",
  "restore access",
  "re-activate your account",
  "validate account",
];

const ATTACHMENT_TRIGGERS = [
  "invoice",
  "receipt",
  "statement",
  "attachment",
  "attached file",
  "document attached",
  "see attached",
  "open attached",
  ".pdf.exe",
  ".zip",
  ".scr",
  ".iso",
];

export function analyzeEmail(emailText: string): EmailAnalysisResult {
  const trimmed = emailText.trim();

  if (!trimmed) {
    return {
      phishingProbability: 0,
      confidenceScore: 90,
      threatLevel: "safe",
      explanation: "No email payload provided for analysis.",
      recommendation:
        "Paste the sender headers and message body to begin heuristic inspection.",
      suspiciousSentences: [],
      flags: {
        suspiciousSender: false,
        urgencyWords: [],
        rewardWords: [],
        verificationPhrases: [],
        suspiciousLinks: [],
        excessiveCaps: false,
        attachmentMentions: false,
      },
    };
  }

  const lowerText = trimmed.toLowerCase();

  // 1. Break into sentences for granular highlighting
  const rawSentences = trimmed
    .split(/(?<=[.?!])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const suspiciousSentences: string[] = [];
  let riskScore = 0;

  // 2. Identify Urgency triggers
  const foundUrgency = URGENCY_TRIGGERS.filter((kw) => lowerText.includes(kw));
  if (foundUrgency.length > 0) {
    riskScore += Math.min(30, foundUrgency.length * 10);
  }

  // 3. Identify Reward triggers
  const foundRewards = REWARD_TRIGGERS.filter((kw) => lowerText.includes(kw));
  if (foundRewards.length > 0) {
    riskScore += Math.min(30, foundRewards.length * 12);
  }

  // 4. Identify Credential Verification triggers
  const foundVerification = VERIFICATION_PHRASES.filter((kw) =>
    lowerText.includes(kw)
  );
  if (foundVerification.length > 0) {
    riskScore += Math.min(35, foundVerification.length * 15);
  }

  // 5. Attachment Mentions
  const hasAttachmentMention = ATTACHMENT_TRIGGERS.some((kw) =>
    lowerText.includes(kw)
  );
  if (hasAttachmentMention) {
    riskScore += 15;
  }

  // 6. Suspicious Sender Checks (Lookalike / Free email spoofing)
  let suspiciousSender = false;
  const fromMatch = trimmed.match(/from:\s*([^\n\r]+)/i);
  if (fromMatch) {
    const senderLine = fromMatch[1].toLowerCase();
    if (
      /@(gmail|yahoo|hotmail|outlook)\.com/i.test(senderLine) &&
      (lowerText.includes("bank") ||
        lowerText.includes("paypal") ||
        lowerText.includes("security") ||
        lowerText.includes("microsoft") ||
        lowerText.includes("apple"))
    ) {
      suspiciousSender = true;
      riskScore += 35;
    }
    // Number substitutions e.g. micr0soft, g00gle
    if (/[0-9]/.test(senderLine.split("@")[1] || "")) {
      suspiciousSender = true;
      riskScore += 25;
    }
  }

  // 7. Suspicious Links inside text
  const linkMatches = trimmed.match(/https?:\/\/[^\s]+/gi) || [];
  const suspiciousLinks: string[] = [];
  linkMatches.forEach((lnk) => {
    if (
      lnk.startsWith("http://") ||
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(lnk) ||
      /@/.test(lnk) ||
      /\.(xyz|top|click|tk|ru)/.test(lnk)
    ) {
      suspiciousLinks.push(lnk);
      riskScore += 25;
    }
  });

  // 8. Excessive Capital Letters
  const lettersOnly = trimmed.replace(/[^a-zA-Z]/g, "");
  const uppercaseLetters = trimmed.replace(/[^A-Z]/g, "");
  const capsRatio =
    lettersOnly.length > 30 ? uppercaseLetters.length / lettersOnly.length : 0;
  const excessiveCaps = capsRatio > 0.28;
  if (excessiveCaps) {
    riskScore += 15;
  }

  // Filter suspicious sentences
  rawSentences.forEach((sentence) => {
    const sLower = sentence.toLowerCase();
    const matchesUrgency = foundUrgency.some((u) => sLower.includes(u));
    const matchesReward = foundRewards.some((r) => sLower.includes(r));
    const matchesVerif = foundVerification.some((v) => sLower.includes(v));
    const hasLink = linkMatches.some((l) => sentence.includes(l));

    if (matchesUrgency || matchesReward || matchesVerif || hasLink) {
      suspiciousSentences.push(sentence);
    }
  });

  // Normalize probability
  const probability = Math.min(100, Math.max(0, riskScore));

  // Determine threat level & explanation
  let threatLevel: ThreatLevel = "safe";
  let explanation = "";
  let recommendation = "";

  if (probability >= 70) {
    threatLevel = probability >= 85 ? "critical" : "high";
    explanation =
      "High probability phishing attack. Message employs aggressive urgency, fraudulent credential harvesting triggers, or suspicious sender spoofing.";
    recommendation =
      "Do NOT click any hyperlinks or open attachments. Report this sender to your IT Security Operations Center (SOC) immediately.";
  } else if (probability >= 35) {
    threatLevel = "medium";
    explanation =
      "Elevated social engineering indicators detected. Message exhibits non-standard psychological triggers or verification prompts.";
    recommendation =
      "Verify the sender through an out-of-band communication channel (e.g. phone call or internal chat) before taking any requested action.";
  } else if (probability > 10) {
    threatLevel = "low";
    explanation =
      "Minor potential risk cues present, but message appears predominantly legitimate or automated transactional notice.";
    recommendation =
      "Standard caution advised. Confirm link destination matches the legitimate domain before entering credentials.";
  } else {
    threatLevel = "safe";
    explanation =
      "No malicious phishing vectors, spoofed headers, or credential harvesting payloads identified.";
    recommendation =
      "Message passed all heuristic filters. Standard zero-trust operational hygiene applies.";
  }

  return {
    phishingProbability: probability,
    confidenceScore: 93 + (suspiciousSentences.length > 0 ? 4 : 0),
    threatLevel,
    explanation,
    recommendation,
    suspiciousSentences,
    flags: {
      suspiciousSender,
      urgencyWords: foundUrgency,
      rewardWords: foundRewards,
      verificationPhrases: foundVerification,
      suspiciousLinks,
      excessiveCaps,
      attachmentMentions: hasAttachmentMention,
    },
  };
}
