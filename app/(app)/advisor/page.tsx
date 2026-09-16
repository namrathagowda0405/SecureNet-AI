"use client";

import React, { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { DashboardCard, ThreatBadge } from "@/components";

export default function AdvisorPage() {
  const [inputMessage, setInputMessage] = useState("");

  const suggestedPrompts = [
    "How can I secure SSH access with hardware FIDO2 keys?",
    "Explain the attack vector behind CVE-2024-38077",
    "What are the best practices for setting up DMARC p=reject?",
    "How to detect memory injection in running Linux processes?",
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-purple-400 uppercase">
              Autonomous Intelligence
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            <ThreatBadge level="low" label="Neural Copilot Online" size="sm" />
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2 text-purple-400">
              <Bot className="h-6 w-6" />
            </div>
            <span>AI Security Advisor</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            24/7 autonomous copilot trained on threat intelligence, MITRE ATT&CK
            frameworks, and defense engineering blueprints.
          </p>
        </div>
      </div>

      {/* Main Chat / Copilot Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <DashboardCard
            title="Copilot Consultation Console"
            subtitle="Context-aware defense recommendations"
            className="flex h-[520px] flex-col"
          >
            {/* Messages Area */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {/* Bot Initial Welcome Greeting */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="glass-panel font-body max-w-xl space-y-2 rounded-2xl rounded-tl-sm border border-purple-500/20 p-4 text-xs leading-relaxed text-slate-200 sm:text-sm">
                  <p>
                    Hello, SecOps Analyst! I am{" "}
                    <strong>SecureNet AI Advisor</strong>, your dedicated cyber
                    defense companion.
                  </p>
                  <p className="text-xs text-slate-400">
                    I can help inspect incident logs, explain zero-day CVE
                    advisories, construct defensive firewall rules, or audit
                    configuration hardening. How can I assist your team today?
                  </p>
                </div>
              </div>

              {/* Sample User Prompt Suggestions */}
              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>Suggested Cybersecurity Prompts:</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInputMessage(prompt)}
                      className="font-body rounded-xl border border-white/[0.06] bg-slate-900/50 p-2.5 text-left text-xs text-slate-300 transition-all hover:border-purple-500/30 hover:bg-purple-950/20 hover:text-white"
                    >
                      &quot;{prompt}&quot;
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Bar */}
            <div className="relative border-t border-white/[0.08] pt-4">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask a security question, paste an alert, or request CVE analysis..."
                  className="font-body h-12 w-full rounded-xl border border-white/10 bg-slate-900/80 pr-14 pl-4 text-xs text-white placeholder-slate-400 transition-all focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 focus:outline-none sm:text-sm"
                />

                <button
                  type="button"
                  className="absolute right-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-2 text-white shadow-md shadow-purple-500/20 transition-all hover:from-blue-500 hover:to-purple-500 active:scale-95"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Right Info Box: Capabilities */}
        <div className="space-y-5 lg:col-span-4">
          <DashboardCard title="Copilot Telemetry" subtitle="AI Engine Specs">
            <div className="font-body space-y-3 text-xs text-slate-400">
              <div className="space-y-1 rounded-xl border border-white/[0.06] bg-slate-900/40 p-3">
                <div className="flex items-center justify-between font-mono text-white">
                  <span>Knowledge Base:</span>
                  <span className="text-purple-400">Q3 2026 Live Sync</span>
                </div>
                <div className="flex items-center justify-between font-mono text-white">
                  <span>Frameworks:</span>
                  <span className="text-blue-400">MITRE ATT&CK v15</span>
                </div>
                <div className="flex items-center justify-between font-mono text-white">
                  <span>Compliance:</span>
                  <span className="text-emerald-400">
                    SOC2, ISO 27001, HIPAA
                  </span>
                </div>
              </div>

              <p className="text-[11px] leading-tight text-slate-400">
                SecureNet Advisor does not store or share sensitive telemetry
                outside your tenant boundary.
              </p>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
