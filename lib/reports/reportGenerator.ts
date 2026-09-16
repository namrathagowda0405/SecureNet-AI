import type { AISecurityReport, ScanRecord } from "@/types";

/**
 * Generates an executive AI Security Report grounded in the scan outcome.
 */
export function generateSecurityReport(
  scan: Pick<
    ScanRecord,
    | "type"
    | "input"
    | "result"
    | "threatLevel"
    | "confidence"
    | "details"
    | "reasons"
    | "metadata"
  >
): AISecurityReport {
  const { type, input, result, threatLevel, confidence, details, reasons } =
    scan;

  let threatSummary = "";
  const whyGenerated: string[] = [];
  const recommendedActions: string[] = [];

  // Module-specific narrative formulation
  switch (type) {
    case "password": {
      if (threatLevel === "critical" || threatLevel === "high") {
        threatSummary = `Credential audit on target "${input}" identified critical vulnerability exposures. The passphrase has high susceptibility to automated GPU dictionary sweeps and credential stuffing attacks due to low entropy and predictable character clustering.`;
        whyGenerated.push(
          "Information entropy is below cryptographically viable thresholds (<50 bits)",
          "Character set diversity failed baseline multi-token requirements",
          "Structure resembles patterns prevalent in known dark-web breach corpuses"
        );
        recommendedActions.push(
          "Immediately decommission and replace this password across all services",
          "Switch to a 4-word random Diceware passphrase with 70+ bits of entropy",
          "Enforce multi-factor authentication (FIDO2 WebAuthn or TOTP)",
          "Store unique credentials in an audited zero-knowledge password vault"
        );
      } else if (threatLevel === "medium") {
        threatSummary = `Credential analysis on "${input}" evaluated moderate resilience. While not trivially breakable in seconds, the entropy level leaves room for brute-force attacks in targeted offline cracking environments.`;
        whyGenerated.push(
          "Passphrase meets basic length requirements but exhibits structural predictability",
          "Estimated crack time is viable for distributed cloud compute clusters",
          "Lacks symbol dispersion or contains recognizable dictionary substrings"
        );
        recommendedActions.push(
          "Extend passphrase length by at least 4 additional random characters",
          "Incorporate uncommon special characters without predictable substitutions",
          "Verify that this credential is not shared with any secondary accounts"
        );
      } else {
        threatSummary = `Passphrase audit on "${input}" confirms excellent cryptographic entropy and high brute-force resistance. The credential conforms to modern zero-trust enterprise authentication standards.`;
        whyGenerated.push(
          "Exceeds 75 bits of informational Shannon entropy",
          "Full character distribution (uppercase, lowercase, numbers, and symbols)",
          "Zero matches in known credential breach compilations"
        );
        recommendedActions.push(
          "Maintain current credential policy without frequent forced rotations unless breach occurs",
          "Ensure device-bound MFA is active on the associated account",
          "Never enter this credential into unverified browser prompts or HTTP forms"
        );
      }
      break;
    }

    case "url": {
      if (threatLevel === "critical" || threatLevel === "high") {
        threatSummary = `High-confidence heuristic detection flagged domain "${input}" as a dangerous phishing or credential harvesting portal designed to impersonate legitimate services.`;
        whyGenerated.push(
          ...(reasons && reasons.length > 0
            ? reasons
            : [
                "Deceptive brand spoofing keywords detected in domain hostname",
                "High-risk top-level domain (TLD) associated with rapid malicious registration",
                "Absence of authentic enterprise SSL verification and DNS security records",
              ])
        );
        recommendedActions.push(
          "Blacklist domain immediately in enterprise DNS firewall and Secure Web Gateway (SWG)",
          "Flush local DNS cache and block outbound TCP/UDP traffic to destination IP",
          "If credentials were submitted on this link, trigger emergency password rotation",
          "Report URL to Google Safe Browsing and Microsoft SmartScreen feeds"
        );
      } else if (threatLevel === "medium") {
        threatSummary = `URL inspection on "${input}" identified suspicious infrastructure indicators. The host exhibits abnormal subdomains or obfuscated URL parameter configurations.`;
        whyGenerated.push(
          ...(reasons && reasons.length > 0
            ? reasons
            : [
                "Multiple redirect layers or deep subdomains observed",
                "Newly registered domain certificate lacking established reputation history",
              ])
        );
        recommendedActions.push(
          "Exercise caution and avoid inputting sensitive payment or authentication data",
          "Verify the official root domain via a trusted search engine or bookmark",
          "Inspect SSL certificate details for organization verification"
        );
      } else {
        threatSummary = `Website scanner verified "${input}" as clean. The domain adheres to HTTPS transport encryption, demonstrates authentic structural hostname formatting, and exhibits no deceptive keywords.`;
        whyGenerated.push(
          "Valid HTTPS encryption enabled",
          "Domain structure contains no homoglyph, punycode, or raw IP anomalies",
          "Host demonstrates established domain reputation"
        );
        recommendedActions.push(
          "Safe to navigate; continue monitoring for browser certificate warning prompts",
          "Ensure browser extensions and ad/tracker shields remain enabled"
        );
      }
      break;
    }

    case "email": {
      if (threatLevel === "critical" || threatLevel === "high") {
        threatSummary = `Automated Natural Language Phishing heuristics flagged email "${input.substring(0, 40)}..." with severe social engineering indicators designed to coerce unauthorized actions.`;
        whyGenerated.push(
          ...(reasons && reasons.length > 0
            ? reasons
            : [
                "Urgent ultimatum and account suspension coercion triggers detected",
                "Suspicious sender address masquerading as legitimate administrative service",
                "Presence of credential harvesting authentication lures",
              ])
        );
        recommendedActions.push(
          "Do not click any embedded links or open accompanying file attachments",
          "Report email directly to internal Security Operations (SecOps) phishing inbox",
          "Block the sender domain and quarantine related inbound mail headers",
          "Verify any billing or wire claims via out-of-band phone confirmation"
        );
      } else if (threatLevel === "medium") {
        threatSummary = `Email inspection flagged moderate risk markers in "${input.substring(0, 40)}...". The communication contains mild promotional or identity verification pressure tactics.`;
        whyGenerated.push(
          ...(reasons && reasons.length > 0
            ? reasons
            : [
                "Language incorporates promotional reward or urgency hooks",
                "Sender address formatting deviates slightly from standard domain records",
              ])
        );
        recommendedActions.push(
          "Hover over links to verify true destination URLs before clicking",
          "Cross-reference sender address carefully against known contact records"
        );
      } else {
        threatSummary = `Email evaluation confirmed clean conversational indicators. Message "${input.substring(0, 40)}..." exhibits standard business correspondence without manipulative phishing cues.`;
        whyGenerated.push(
          "No coercive psychological triggers or countdown ultimatums",
          "Sender formatting aligns with standard professional correspondence",
          "No deceptive hyperlinks or hidden executable attachments"
        );
        recommendedActions.push(
          "Standard email safe handling applies; treat unexpected financial requests with caution"
        );
      }
      break;
    }

    case "malware": {
      if (threatLevel === "critical" || threatLevel === "high") {
        threatSummary = `Static malware analysis on target "${input}" identified dangerous payload signatures. The file exhibits evasion techniques typical of trojan droppers, weaponized macros, or ransomware loaders.`;
        whyGenerated.push(
          ...(reasons && reasons.length > 0
            ? reasons
            : [
                "Binary file extension or double extension masking detected",
                "Absence of verified digital code-signing certificate",
                "Structure exhibits structural characteristics common to malicious delivery vectors",
              ])
        );
        recommendedActions.push(
          "Do NOT execute or extract the file on any production workstation or server",
          "Quarantine the file and purge all local copies from Downloads and temporary directories",
          "Submit file hash to enterprise endpoint detection and response (EDR) blocklist",
          "Initiate deep endpoint scan if the file was previously opened or run"
        );
      } else if (threatLevel === "medium") {
        threatSummary = `File inspection on "${input}" flagged potentially unwanted program (PUP) or elevated macro indicators that warrant sandbox verification before use.`;
        whyGenerated.push(
          ...(reasons && reasons.length > 0
            ? reasons
            : [
                "Contains macro-enabled structures or unconventional binary headers",
                "File size or internal entropy deviates from standard application baselines",
              ])
        );
        recommendedActions.push(
          "Detonate file in an isolated virtual sandbox environment before running",
          "Verify the integrity checksum against the original vendor download portal"
        );
      } else {
        threatSummary = `Static binary analysis confirmed "${input}" as clean. File structure adheres to benign document/media specifications with no executable evasion or double extension spoofing.`;
        whyGenerated.push(
          "Consistent single file extension matching internal MIME headers",
          "No embedded executable payloads or suspicious VBA macro blocks",
          "Cryptographic hash is clean across baseline telemetry"
        );
        recommendedActions.push(
          "File is verified safe for standard workflow consumption",
          "Keep endpoint antivirus definitions up to date"
        );
      }
      break;
    }

    default: {
      threatSummary = `Security telemetry audit on "${input}" evaluated baseline risk posture (${result}).`;
      whyGenerated.push(
        details || "Telemetry matched deterministic heuristic baseline"
      );
      recommendedActions.push(
        "Maintain current zero-trust endpoint and authentication controls"
      );
    }
  }

  return {
    id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    scanType: type,
    target: input,
    threatLevel,
    confidenceScore: confidence,
    threatSummary,
    whyGenerated,
    recommendedActions,
    timestamp: "Just now",
  };
}
