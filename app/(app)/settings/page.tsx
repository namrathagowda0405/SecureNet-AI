"use client";

import React, { useState } from "react";
import { Settings, Key, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { DashboardCard } from "@/components";

export default function SettingsPage() {
  const [realtimeShield, setRealtimeShield] = useState(true);
  const [autoQuarantine, setAutoQuarantine] = useState(true);
  const [deepHeuristics, setDeepHeuristics] = useState(true);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-blue-400 uppercase">
              System Configuration
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="font-mono text-[11px] text-slate-400">
              Policy v2.4
            </span>
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
              <Settings className="h-6 w-6" />
            </div>
            <span>Platform Settings</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            Fine-tune threat detection sensitivity, automated containment
            workflows, and upcoming API connectors.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-blue-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-95 sm:self-auto"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Save Preferences</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Autonomous Defense Toggles */}
        <div className="space-y-6 lg:col-span-8">
          <DashboardCard
            title="Autonomous Defense Engine"
            subtitle="Configure local threat mitigation rules"
          >
            <div className="space-y-4 divide-y divide-white/[0.06]">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between pt-2">
                <div className="max-w-lg space-y-0.5">
                  <div className="font-heading text-sm font-semibold text-white">
                    Real-Time Heuristic Shield
                  </div>
                  <p className="font-body text-xs text-slate-400">
                    Continuously intercept suspicious outbound network requests
                    and phishing domain resolutions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRealtimeShield(!realtimeShield)}
                  className={`rounded-full p-1 transition-colors ${
                    realtimeShield ? "text-blue-400" : "text-slate-600"
                  }`}
                  aria-label="Toggle Real-Time Heuristic Shield"
                >
                  {realtimeShield ? (
                    <ToggleRight className="h-8 w-8" />
                  ) : (
                    <ToggleLeft className="h-8 w-8" />
                  )}
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between pt-4">
                <div className="max-w-lg space-y-0.5">
                  <div className="font-heading text-sm font-semibold text-white">
                    Autonomous Payload Quarantine
                  </div>
                  <p className="font-body text-xs text-slate-400">
                    Isolate detected trojans and ransomware droppers before
                    execution into a protected sandbox.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoQuarantine(!autoQuarantine)}
                  className={`rounded-full p-1 transition-colors ${
                    autoQuarantine ? "text-blue-400" : "text-slate-600"
                  }`}
                  aria-label="Toggle Autonomous Payload Quarantine"
                >
                  {autoQuarantine ? (
                    <ToggleRight className="h-8 w-8" />
                  ) : (
                    <ToggleLeft className="h-8 w-8" />
                  )}
                </button>
              </div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between pt-4">
                <div className="max-w-lg space-y-0.5">
                  <div className="font-heading text-sm font-semibold text-white">
                    Deep Neural Entropy Scanning
                  </div>
                  <p className="font-body text-xs text-slate-400">
                    Execute extended byte-level entropy calculations to uncover
                    heavily obfuscated scripts and macros.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeepHeuristics(!deepHeuristics)}
                  className={`rounded-full p-1 transition-colors ${
                    deepHeuristics ? "text-blue-400" : "text-slate-600"
                  }`}
                  aria-label="Toggle Deep Neural Entropy Scanning"
                >
                  {deepHeuristics ? (
                    <ToggleRight className="h-8 w-8" />
                  ) : (
                    <ToggleLeft className="h-8 w-8" />
                  )}
                </button>
              </div>
            </div>
          </DashboardCard>

          {/* API Connectors Placeholder Card (Ready for Phase 2/3) */}
          <DashboardCard
            title="External Telemetry Connectors"
            subtitle="Prepare API connections for future backend integration"
          >
            <div className="space-y-4">
              {[
                {
                  name: "VirusTotal Enterprise API",
                  desc: "Hash reputation and multi-engine antivirus validation feed.",
                  badge: "Ready to Plug-in",
                },
                {
                  name: "OpenAI / Anthropic Neural Copilot API",
                  desc: "Powers conversational AI advisor and natural language CVE synthesis.",
                  badge: "Ready to Plug-in",
                },
                {
                  name: "HaveIBeenPwned k-Anonymity API",
                  desc: "Zero-knowledge credential breach database verification.",
                  badge: "Ready to Plug-in",
                },
              ].map((conn) => (
                <div
                  key={conn.name}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-slate-900/40 p-3.5"
                >
                  <div className="space-y-0.5">
                    <div className="font-heading flex items-center gap-2 text-sm font-semibold text-white">
                      <Key className="h-3.5 w-3.5 text-slate-400" />
                      <span>{conn.name}</span>
                    </div>
                    <p className="font-body text-xs text-slate-400">
                      {conn.desc}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 font-mono text-[10px] text-blue-400 uppercase">
                    {conn.badge}
                  </span>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>

        {/* Right Column: Platform Metadata */}
        <div className="space-y-5 lg:col-span-4">
          <DashboardCard
            title="Tenant Info"
            subtitle="Client environment details"
          >
            <div className="space-y-3 font-mono text-xs text-slate-400">
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span>Tenant ID:</span>
                <span className="text-white">SN-AI-CORP-9401</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span>Frontend Version:</span>
                <span className="text-blue-400">Phase 1 Foundation</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span>Next.js Architecture:</span>
                <span className="text-purple-400">v16 App Router</span>
              </div>
              <div className="flex justify-between">
                <span>Styling Engine:</span>
                <span className="text-cyan-400">Tailwind CSS v4</span>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
