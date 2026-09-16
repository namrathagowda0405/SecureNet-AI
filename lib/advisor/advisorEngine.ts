import type { ScanRecord } from "@/types";

export interface AdvisorResponse {
  text: string;
  contextPill?: string;
  suggestedPrompts?: string[];
}

export function generateAdvisorResponse(
  query: string,
  recentScans: ScanRecord[],
  cyberHealthScore: number,
  healthCategory: string
): AdvisorResponse {
  const lower = query.toLowerCase().trim();

  const latestPassword = recentScans.find((s) => s.type === "password");
  const latestUrl = recentScans.find((s) => s.type === "url");
  const latestEmail = recentScans.find((s) => s.type === "email");
  const highThreatScans = recentScans.filter(
    (s) => s.threatLevel === "high" || s.threatLevel === "critical"
  );

  // 1. Password analysis questions
  if (
    lower.includes("password") ||
    lower.includes("credential") ||
    lower.includes("entropy") ||
    lower.includes("crack")
  ) {
    if (latestPassword) {
      const score = (latestPassword.metadata?.score as number) ?? 50;
      const isWeak =
        latestPassword.threatLevel === "critical" ||
        latestPassword.threatLevel === "high";

      if (isWeak) {
        return {
          contextPill: `Latest Password: ${score}/100 (${latestPassword.threatLevel.toUpperCase()})`,
          text: `I analyzed your latest credential scan (${score}/100 PTS). It was flagged as **${latestPassword.threatLevel.toUpperCase()} RISK** due to low informational entropy and susceptibility to offline dictionary or mask attacks.\n\n### Why It's Vulnerable:\n1. **Short Length / Low Entropy**: Passwords under 12 characters can be cracked in minutes by modern GPU hash clusters (e.g. 8x RTX 4090 hashcat rigs).\n2. **Predictable Substitutions**: Using '0' for 'o' or '@' for 'a' is already mapped in common breach dictionaries.\n\n### Recommended Remediation:\nAdopt the **Diceware 4-Word Passphrase Protocol**: Select 4 random unrelated words separated by hyphens (e.g., \`solar-falcon-battery-frost\`). This yields **~77 bits of entropy**, rendering brute-force mathematically unfeasible without requiring confusing character substitutions.`,
          suggestedPrompts: [
            "How do I set up a hardware security key (YubiKey)?",
            "What is k-Anonymity breach verification?",
          ],
        };
      } else {
        return {
          contextPill: `Latest Password: ${score}/100 (STRONG)`,
          text: `Your scanned credential scored **${score}/100 PTS** with solid character diversity and high entropy.\n\n### Optimization Tips:\n- Ensure this password is **never reused** across multiple online services to prevent credential stuffing.\n- Enable **FIDO2 / WebAuthn hardware token authentication** on priority accounts to eliminate phishing risks entirely.`,
          suggestedPrompts: [
            "Check a suspicious website URL next",
            "How does credential stuffing work?",
          ],
        };
      }
    }

    return {
      contextPill: "Password Security Guidance",
      text: `To construct resilient passwords that withstand distributed cracking arrays:\n\n1. **Length Trumps Complexity**: A 16-character passphrase is vastly stronger than an 8-character complex string.\n2. **Avoid Reusable Patterns**: Never use repetitive sequences ('123', 'qwerty') or personal names.\n3. **Test with our Password Analyzer**: Head over to the **Password Analyzer** tab to test your credentials with live entropy and brute-force estimations.`,
      suggestedPrompts: [
        "What is the minimum safe password length in 2026?",
        "What are the best password manager architectures?",
      ],
    };
  }

  // 2. URL / Website / Phishing Domain questions
  if (
    lower.includes("url") ||
    lower.includes("website") ||
    lower.includes("domain") ||
    lower.includes("link") ||
    lower.includes("https")
  ) {
    if (latestUrl) {
      const isRisky =
        latestUrl.threatLevel === "high" ||
        latestUrl.threatLevel === "critical" ||
        latestUrl.threatLevel === "medium";

      if (isRisky) {
        return {
          contextPill: `Recent URL Flagged: ${latestUrl.input}`,
          text: `Your recent scan of **${latestUrl.input}** raised critical red flags (${latestUrl.threatLevel.toUpperCase()}).\n\n### Detected Phishing Indicators:\n${(latestUrl.reasons || []).map((r) => `- ${r}`).join("\n")}\n\n### Autonomous Defensive Recommendations:\n1. **Immediate Block**: Add the root domain to your local firewall or DNS-sinkhole (e.g. Pi-hole / Cloudflare Gateway).\n2. **Session Termination**: If anyone accessed this link, terminate all active browser sessions and flush authentication cookies.\n3. **Report Abuse**: Submit the URL to Google Safe Browsing and Netcraft for global ecosystem containment.`,
          suggestedPrompts: [
            "How do homograph domain attacks work?",
            "What is DNS sinkholing?",
          ],
        };
      } else {
        return {
          contextPill: `Clean URL: ${latestUrl.input}`,
          text: `The domain **${latestUrl.input}** passed our optical, TLS, and domain heuristics checks cleanly.\n\n### Ongoing Vigilance:\nEven with clean domains, remember that legitimate services can host malicious user-generated content. Always verify the exact payload before downloading executables.`,
          suggestedPrompts: [
            "How do drive-by download attacks operate?",
            "Scan another suspicious link",
          ],
        };
      }
    }

    return {
      contextPill: "Web Threat Defense",
      text: `When inspecting untrusted links, SecureNet AI screens for 6 key threat vectors:\n\n- **Punycode / Homograph Spoofing**: Replacing Latin letters with Cyrillic equivalents.\n- **Insecure Plaintext (HTTP)**: Exposes session tokens to Wi-Fi sniffing.\n- **Raw IP Hostnames**: Circumvents domain reputation filters.\n- **Disposable Phishing TLDs**: .xyz, .top, and .click domains registered within hours of an attack.\n\nTry pasting any suspicious link into the **Website Scanner** module!`,
      suggestedPrompts: [
        "How can I spot an optical phishing site?",
        "What is an SSL strip attack?",
      ],
    };
  }

  // 3. Email Phishing questions
  if (
    lower.includes("email") ||
    lower.includes("phish") ||
    lower.includes("mail") ||
    lower.includes("spf") ||
    lower.includes("dkim") ||
    lower.includes("dmarc")
  ) {
    if (latestEmail) {
      return {
        contextPill: `Recent Email Scan: ${latestEmail.threatLevel.toUpperCase()}`,
        text: `In your recent email inspection, SecureNet AI evaluated the message content:\n\n**Verdict**: ${latestEmail.result}\n**Threat Level**: ${latestEmail.threatLevel.toUpperCase()}\n\n### Phishing Defense Playbook:\n- **Lookalike Sender Headers**: Attackers routinely falsify the visible display name while the true envelope sender originates from an untrusted MTA.\n- **Artificial Urgency**: Phrases like *"Account terminated in 24 hours"* bypass analytical thinking by triggering cognitive panic.\n- **Out-of-Band Verification**: Never click verification links in emails. Navigate directly to the known vendor portal in a new browser tab.`,
        suggestedPrompts: [
          "How do SPF, DKIM, and DMARC work together?",
          "What is executive BEC (Business Email Compromise)?",
        ],
      };
    }

    return {
      contextPill: "Email Security Heuristics",
      text: `Over 91% of enterprise breaches originate via malicious emails. Key warning signs to train your staff to recognize:\n\n1. **Urgent Coercion**: Time-sensitive pressure to transfer funds or confirm credentials.\n2. **Mismatched Hyperlinks**: Anchor text showing paypal.com while the underlying URL redirects to an external IP.\n3. **Double Extensions**: Attachments masquerading as invoices (e.g., Q3_Financials.pdf.exe).\n\nPaste raw email headers into our **Email Scanner** for instantaneous breakdown.`,
      suggestedPrompts: [
        "Explain DMARC quarantine vs reject",
        "How to inspect raw email headers",
      ],
    };
  }

  // 4. Cyber Health Score & Overall Posture questions
  if (
    lower.includes("score") ||
    lower.includes("health") ||
    lower.includes("posture") ||
    lower.includes("status") ||
    lower.includes("overview")
  ) {
    return {
      contextPill: `Current Cyber Health: ${cyberHealthScore}/100 (${healthCategory.toUpperCase()})`,
      text: `Your overall **Cyber Health Score is currently ${cyberHealthScore}/100 (${healthCategory})**.\n\n### Health Score Breakdown:\n- **Password Security**: Evaluates credential entropy and breach records.\n- **Website Safety**: Measures clean web navigation and low phishing exposure.\n- **Email Safety**: Grades social engineering immunity and header verification.\n- **Scan Frequency**: Rewards regular automated telemetry verification.\n\n${
        cyberHealthScore < 75
          ? `### Critical Next Step:\nYour score is currently in the **${healthCategory}** tier. Run a scan in the Password Analyzer and Website Scanner to boost your score back to **Good / Excellent**!`
          : `### Maintaining Defense Excellence:\nYour score is resilient! Maintain your posture by checking any unverified email or URL before interaction.`
      }`,
      suggestedPrompts: [
        "What specific actions will increase my score?",
        "How is the 4-pillar score calculated?",
      ],
    };
  }

  // 5. High Threat Alerts / Incidents
  if (
    lower.includes("alert") ||
    lower.includes("danger") ||
    lower.includes("threat") ||
    lower.includes("incident") ||
    lower.includes("remediation")
  ) {
    if (highThreatScans.length > 0) {
      return {
        contextPill: `${highThreatScans.length} Critical Threat(s) In Log`,
        text: `### Active Threat Response Advisory:\nI detected **${highThreatScans.length} elevated or critical incidents** in your recent telemetry:\n\n${highThreatScans
          .slice(0, 3)
          .map(
            (t) =>
              `- **[${t.type.toUpperCase()}]** ${t.input} &rarr; *${t.result}*`
          )
          .join(
            "\n"
          )}\n\n### Mitigation Steps:\n1. **Quarantine Target Assets**: Ensure flagged files or scripts are not executed in memory.\n2. **Password Invalidation**: If credentials were typed into any flagged site, change them immediately from an isolated, clean device.\n3. **Network Audit**: Check firewall egress logs for unexpected connections to these endpoints.`,
        suggestedPrompts: [
          "Explain how to isolate a compromised host",
          "What is zero-trust network access?",
        ],
      };
    }
  }

  // Default context-aware general response
  return {
    contextPill: "Autonomous AI Cybersecurity Advisor",
    text: `I am monitoring your local telemetry. Your current **Cyber Health Score is ${cyberHealthScore}/100 (${healthCategory})** across ${recentScans.length} recorded scans.\n\nI can analyze your scan results, break down threat mechanics, or provide hardening playbooks for:\n- **Credential Security & Entropy**\n- **Phishing URL & Domain Heuristics**\n- **Email Social Engineering Vectors**\n- **Endpoint Hardening & Zero-Trust Best Practices**\n\nWhat would you like me to evaluate?`,
    suggestedPrompts: [
      "Review my recent scan history",
      "How to improve my Cyber Health Score?",
      "Explain the top web security threats in 2026",
    ],
  };
}
