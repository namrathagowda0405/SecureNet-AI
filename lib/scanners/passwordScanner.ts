import type { PasswordAnalysisResult, ThreatLevel } from "@/types";

const COMMON_PASSWORDS = new Set([
  "123456",
  "password",
  "12345678",
  "qwerty",
  "123456789",
  "12345",
  "1234",
  "111111",
  "1234567",
  "dragon",
  "welcome",
  "admin",
  "master",
  "football",
  "monkey",
  "letmein",
  "sunshine",
  "iloveyou",
  "princess",
  "shadow",
  "trustno1",
  "superman",
  "secret",
  "pass123",
  "default",
  "login",
  "access",
  "administrator",
  "root",
  "toor",
  "hunter2",
  "securenet",
  "cybersecurity",
  "computer",
  "test1234",
  "guest",
  "starwars",
  "matrix",
]);

/**
 * Calculates Shannon-like informational entropy in bits
 */
export function calculateEntropy(password: string): number {
  if (!password) return 0;
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

  if (poolSize === 0) return 0;
  const entropy = password.length * Math.log2(poolSize);
  return Math.round(entropy * 10) / 10;
}

/**
 * Estimates brute-force resistance time given an adversary with 100 billion guesses/sec
 */
export function estimateCrackTime(entropy: number): string {
  if (entropy <= 0) return "Instantaneous";
  if (entropy < 28) return "Under 1 second";
  if (entropy < 36) return "A few seconds";
  if (entropy < 45) return "Several minutes";
  if (entropy < 55) return "3 to 14 days";
  if (entropy < 65) return "Several months";
  if (entropy < 75) return "50 to 300 years";
  if (entropy < 85) return "Thousands of centuries";
  return "Centillions of millennia (Quantum-resistant)";
}

/**
 * Checks for consecutive repeated or sequential characters
 */
function hasRepeatedOrSequential(str: string): boolean {
  if (str.length < 3) return false;
  // 3 of same character in a row
  if (/(.)\1\1/.test(str)) return true;

  const lower = str.toLowerCase();
  for (let i = 0; i < lower.length - 2; i++) {
    const c1 = lower.charCodeAt(i);
    const c2 = lower.charCodeAt(i + 1);
    const c3 = lower.charCodeAt(i + 2);
    if (c2 === c1 + 1 && c3 === c2 + 1) return true; // abc, 123
    if (c2 === c1 - 1 && c3 === c2 - 1) return true; // cba, 321
  }
  return false;
}

export function analyzePassword(password: string): PasswordAnalysisResult {
  const trimmed = password.trim();

  if (!trimmed) {
    return {
      score: 0,
      entropy: 0,
      crackTime: "Instantaneous",
      threatLevel: "critical",
      confidence: 99,
      checks: {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
        noRepeated: true,
        notCommon: true,
      },
      suggestions: [
        "Provide a password of at least 12 characters to begin cryptographic analysis.",
      ],
    };
  }

  const minLength = trimmed.length >= 12;
  const hasUppercase = /[A-Z]/.test(trimmed);
  const hasLowercase = /[a-z]/.test(trimmed);
  const hasNumber = /[0-9]/.test(trimmed);
  const hasSpecial = /[^A-Za-z0-9]/.test(trimmed);
  const noRepeated = !hasRepeatedOrSequential(trimmed);
  const notCommon = !COMMON_PASSWORDS.has(trimmed.toLowerCase());

  let score = 0;
  const suggestions: string[] = [];

  // Length scoring (up to 35 points)
  if (trimmed.length >= 16) {
    score += 35;
  } else if (trimmed.length >= 12) {
    score += 25;
  } else if (trimmed.length >= 8) {
    score += 15;
    suggestions.push(
      "Extend length to 14+ characters to defeat parallel brute-force clusters."
    );
  } else {
    score += 5;
    suggestions.push(
      "Critically short: passwords under 8 characters can be cracked in minutes."
    );
  }

  // Character diversity scoring (up to 40 points)
  if (hasUppercase) score += 10;
  else
    suggestions.push(
      "Include uppercase letters (A-Z) to expand character pool entropy."
    );

  if (hasLowercase) score += 10;
  else suggestions.push("Include lowercase letters (a-z).");

  if (hasNumber) score += 10;
  else suggestions.push("Include numerical digits (0-9).");

  if (hasSpecial) score += 10;
  else
    suggestions.push("Include special symbols (!@#$%^&*) to maximize entropy.");

  // Structure checks (up to 25 points)
  if (noRepeated) {
    score += 10;
  } else {
    score -= 10;
    suggestions.push(
      "Remove repeated characters ('aaa') or keyboard runs ('123', 'abc')."
    );
  }

  if (notCommon) {
    score += 15;
  } else {
    score = Math.min(score, 15);
    suggestions.unshift(
      "CRITICAL: This password matches a high-frequency breached dictionary entry!"
    );
  }

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  const entropy = calculateEntropy(trimmed);
  const crackTime = estimateCrackTime(entropy);

  // Map to threat level
  let threatLevel: ThreatLevel = "safe";
  if (score < 40 || !notCommon) {
    threatLevel = "critical";
  } else if (score < 60) {
    threatLevel = "high";
  } else if (score < 80) {
    threatLevel = "medium";
  } else if (score < 90) {
    threatLevel = "low";
  } else {
    threatLevel = "safe";
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Strong cryptographic posture! Store securely in an encrypted vault."
    );
  }

  return {
    score,
    entropy,
    crackTime,
    threatLevel,
    confidence: 96 + (trimmed.length > 10 ? 3 : 0),
    checks: {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
      noRepeated,
      notCommon,
    },
    suggestions,
  };
}
