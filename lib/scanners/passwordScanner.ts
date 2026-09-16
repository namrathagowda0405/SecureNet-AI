import type {
  PasswordAnalysisResult,
  PasswordStrengthLabel,
  ThreatLevel,
} from "@/types";

const COMMON_DICTIONARY_WORDS = [
  "password",
  "admin",
  "administrator",
  "welcome",
  "user",
  "login",
  "master",
  "secret",
  "shadow",
  "access",
  "guest",
  "superman",
  "monkey",
  "football",
  "princess",
  "dragon",
  "sunshine",
  "iloveyou",
  "trustno1",
  "securenet",
  "cybersecurity",
  "default",
  "testing",
  "test1234",
  "hunter2",
  "letmein",
  "matrix",
  "starwars",
  "computer",
  "system",
  "root",
  "toor",
  "service",
  "account",
  "server",
  "database",
  "qwerty",
];

const KEYBOARD_PATTERNS = [
  "qwerty",
  "werty",
  "asdfgh",
  "asdf",
  "sdfg",
  "dfgh",
  "zxcvbn",
  "zxcv",
  "xcvb",
  "cvbn",
  "12345",
  "23456",
  "34567",
  "45678",
  "56789",
  "67890",
  "qazwsx",
  "wsxedc",
  "edcrfv",
  "rfvtgb",
  "ytrewq",
  "gfdsa",
  "nbvcx",
  "54321",
  "09876",
];

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
 * Detects consecutive repeated characters or repeating letter patterns
 */
export function findRepeatedPatterns(password: string): {
  hasRepeatedChars: boolean;
  repeatedRuns: string[];
  repeatedSubstrings: string[];
} {
  const repeatedRuns: string[] = [];
  const charRunRegex = /(.)\1+/g;
  let match: RegExpExecArray | null;
  while ((match = charRunRegex.exec(password)) !== null) {
    repeatedRuns.push(match[0]);
  }

  const repeatedSubstrings: string[] = [];
  const lower = password.toLowerCase();
  for (let len = 2; len <= 4; len++) {
    for (let i = 0; i <= lower.length - len * 2; i++) {
      const sub = lower.substring(i, i + len);
      if (/^(.)\1+$/.test(sub)) continue;
      const rest = lower.substring(i + len);
      if (rest.includes(sub) && !repeatedSubstrings.includes(sub)) {
        repeatedSubstrings.push(sub);
      }
    }
  }

  return {
    hasRepeatedChars: repeatedRuns.length > 0 || repeatedSubstrings.length > 0,
    repeatedRuns,
    repeatedSubstrings,
  };
}

/**
 * Detects common predictable numeric or symbol-numeric suffixes like @123, @45, 123456
 */
export function findPredictableSuffix(password: string): string | null {
  const symbolDigitMatch = password.match(/([!@#$%^&*_\-+=.]\d+)$/);
  if (symbolDigitMatch) {
    return symbolDigitMatch[1];
  }

  const digitsMatch = password.match(/(\d{2,})$/);
  if (digitsMatch) {
    return digitsMatch[1];
  }

  return null;
}

/**
 * Detects dictionary words
 */
export function findDictionaryMatches(password: string): string[] {
  const lower = password.toLowerCase();
  const matched: string[] = [];

  for (const word of COMMON_DICTIONARY_WORDS) {
    if (word.length >= 4 && lower.includes(word)) {
      matched.push(word);
    }
  }
  return matched;
}

/**
 * Detects keyboard patterns (qwerty, asdf, etc.)
 */
export function findKeyboardMatches(password: string): string[] {
  const lower = password.toLowerCase();
  const matched: string[] = [];

  for (const pattern of KEYBOARD_PATTERNS) {
    if (lower.includes(pattern)) {
      matched.push(pattern);
    }
  }
  return matched;
}

/**
 * Detects consecutive alphabetical or numerical characters (e.g. abcd, 1234, 123, dcba)
 */
export function findConsecutiveSequences(password: string): string[] {
  const matches: string[] = [];
  const lower = password.toLowerCase();
  let run = "";

  for (let i = 0; i < lower.length - 1; i++) {
    const c1 = lower.charCodeAt(i);
    const c2 = lower.charCodeAt(i + 1);

    const isForward =
      c2 === c1 + 1 && ((c1 >= 48 && c1 <= 56) || (c1 >= 97 && c1 <= 121));
    const isBackward =
      c2 === c1 - 1 && ((c1 >= 49 && c1 <= 57) || (c1 >= 98 && c1 <= 122));

    if (isForward || isBackward) {
      if (!run) {
        run = password[i] + password[i + 1];
      } else {
        run += password[i + 1];
      }
    } else {
      if (run.length >= 3) {
        matches.push(run);
      }
      run = "";
    }
  }
  if (run.length >= 3) {
    matches.push(run);
  }
  return matches;
}

/**
 * Main Password Analyzer Logic
 */
export function analyzePassword(password: string): PasswordAnalysisResult {
  const trimmed = password.trim();

  if (!trimmed) {
    return {
      score: 0,
      strengthLabel: "Very Weak",
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

  const len = trimmed.length;
  const minLength = len >= 12;
  const hasUppercase = /[A-Z]/.test(trimmed);
  const hasLowercase = /[a-z]/.test(trimmed);
  const hasNumber = /[0-9]/.test(trimmed);
  const hasSpecial = /[^A-Za-z0-9]/.test(trimmed);

  // Pattern checks
  const repeatedInfo = findRepeatedPatterns(trimmed);
  const predictableSuffix = findPredictableSuffix(trimmed);
  const dictionaryMatches = findDictionaryMatches(trimmed);
  const keyboardMatches = findKeyboardMatches(trimmed);
  const consecutiveSequences = findConsecutiveSequences(trimmed);

  const noRepeated = !repeatedInfo.hasRepeatedChars;
  const notCommon = dictionaryMatches.length === 0;

  const suggestions: string[] = [];

  // ==========================================
  // POSITIVE POINTS (Up to 100 base)
  // ==========================================
  let positiveScore = 0;

  // 1. Length (up to 30 points)
  let lengthPoints = 0;
  if (len <= 4) {
    lengthPoints = len * 2;
  } else if (len <= 7) {
    lengthPoints = 8 + (len - 4) * 2;
  } else if (len <= 11) {
    lengthPoints = 14 + (len - 7) * 1.5;
  } else if (len <= 15) {
    lengthPoints = 20 + (len - 11) * 1.5;
  } else if (len <= 19) {
    lengthPoints = 26 + (len - 15) * 1;
  } else {
    lengthPoints = 30;
  }
  positiveScore += lengthPoints;

  // 2. Character Classes (up to 28 points)
  if (hasLowercase) positiveScore += 7;
  else suggestions.push("Include lowercase letters (a-z).");

  if (hasUppercase) positiveScore += 7;
  else
    suggestions.push(
      "Include uppercase letters (A-Z) to expand character pool entropy."
    );

  if (hasNumber) positiveScore += 7;
  else suggestions.push("Include numerical digits (0-9).");

  if (hasSpecial) positiveScore += 7;
  else
    suggestions.push("Include special symbols (!@#$%^&*) to maximize entropy.");

  // 3. Character Variety (up to 14 points)
  const varietyCount = [
    hasLowercase,
    hasUppercase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;
  if (varietyCount === 4) positiveScore += 14;
  else if (varietyCount === 3) positiveScore += 8;
  else if (varietyCount === 2) positiveScore += 4;

  // 4. Informational Entropy (up to 22 points)
  const entropy = calculateEntropy(trimmed);
  if (entropy >= 80) positiveScore += 22;
  else if (entropy >= 60) positiveScore += 18;
  else if (entropy >= 45) positiveScore += 12;
  else if (entropy >= 25) positiveScore += 6;

  // 5. Structure & Randomness Bonus (up to 6 points)
  if (len >= 20) {
    positiveScore += 6;
  } else if (len >= 16 && varietyCount >= 3) {
    positiveScore += 3;
  }

  // Length suggestions
  if (len < 8) {
    suggestions.push(
      "Critically short: passwords under 8 characters can be cracked in minutes."
    );
  } else if (len < 12) {
    suggestions.push(
      "Extend length to 14+ characters to defeat parallel brute-force clusters."
    );
  }

  // ==========================================
  // PENALTY POINTS
  // ==========================================
  let penaltyScore = 0;

  // 1. Repeated characters or sequences
  if (repeatedInfo.hasRepeatedChars) {
    const penalty = len >= 20 ? 2 : 6;
    penaltyScore += penalty;
    suggestions.push("Avoid repeated letter patterns.");
  }

  // 2. Common predictable suffixes (e.g. @45, @123, 123456)
  if (predictableSuffix) {
    const penalty = len >= 20 ? 2 : 6;
    penaltyScore += penalty;
    suggestions.push(
      `Avoid predictable numeric endings like ${predictableSuffix}.`
    );
  }

  // 3. Dictionary words (e.g. password, admin)
  if (dictionaryMatches.length > 0) {
    penaltyScore += 20;
    suggestions.unshift(
      `Avoid common dictionary words like '${dictionaryMatches[0]}'.`
    );
  }

  // 4. Consecutive characters (e.g. abcd, 1234)
  if (consecutiveSequences.length > 0) {
    penaltyScore += 5;
    suggestions.push(
      `Avoid consecutive character sequences like '${consecutiveSequences[0]}'.`
    );
  }

  // 5. Keyboard patterns (e.g. qwerty, asdf)
  if (keyboardMatches.length > 0) {
    // Avoid double penalizing if consecutive sequence is identical
    const alreadyPenalized = consecutiveSequences.some((c) =>
      keyboardMatches[0].includes(c)
    );
    if (!alreadyPenalized) {
      penaltyScore += 8;
      suggestions.push(`Avoid keyboard patterns like '${keyboardMatches[0]}'.`);
    }
  }

  // Calculate raw score
  let score = Math.round(positiveScore - penaltyScore);
  score = Math.max(0, Math.min(100, score));

  // ==========================================
  // STRICT 100 RULE
  // Only highly random passwords meeting strict criteria can ever get 100
  // ==========================================
  const isEligibleFor100 =
    entropy >= 85 &&
    len >= 16 &&
    dictionaryMatches.length === 0 &&
    !repeatedInfo.hasRepeatedChars &&
    !predictableSuffix &&
    keyboardMatches.length === 0 &&
    consecutiveSequences.length === 0;

  if (score >= 100 && !isEligibleFor100) {
    score = 99;
  }

  // ==========================================
  // SCORE CATEGORIES & THREAT LEVEL MAPPING
  // 0–30   -> Very Weak   (critical)
  // 31–50  -> Weak        (high)
  // 51–70  -> Medium      (medium)
  // 71–85  -> Strong      (low)
  // 86–99  -> Very Strong (low)
  // 100    -> Excellent   (safe)
  // ==========================================
  let strengthLabel: PasswordStrengthLabel = "Very Weak";
  let threatLevel: ThreatLevel = "critical";

  if (score === 100) {
    strengthLabel = "Excellent";
    threatLevel = "safe";
  } else if (score >= 86) {
    strengthLabel = "Very Strong";
    threatLevel = "low";
  } else if (score >= 71) {
    strengthLabel = "Strong";
    threatLevel = "low";
  } else if (score >= 51) {
    strengthLabel = "Medium";
    threatLevel = "medium";
  } else if (score >= 31) {
    strengthLabel = "Weak";
    threatLevel = "high";
  } else {
    strengthLabel = "Very Weak";
    threatLevel = "critical";
  }

  // If dictionary breached credential, elevate threat level
  if (!notCommon && threatLevel === "safe") {
    threatLevel = "high";
  }

  // Confidence computation
  let confidence = 95;
  if (score === 100) {
    confidence = 99;
  } else if (len >= 20) {
    confidence = 97;
  } else if (len >= 14) {
    confidence = 96;
  } else if (len >= 8) {
    confidence = 95;
  } else {
    confidence = 92;
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Cryptographically optimal passphrase. Highly resistant to offline dictionary and quantum brute-force attacks."
    );
  }

  const crackTime = estimateCrackTime(entropy);

  return {
    score,
    strengthLabel,
    entropy,
    crackTime,
    threatLevel,
    confidence,
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
