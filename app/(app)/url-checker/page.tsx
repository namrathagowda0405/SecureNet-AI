"use client";

import React, { useState } from "react";
import { Globe, Search, Zap, Lock, Server, FileCode } from "lucide-react";
import { DashboardCard, ThreatBadge } from "@/components";

export default function UrlCheckerPage() {
  const [url, setUrl] = useState("");

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-blue-400 uppercase">
              Web & Domain Defense
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <ThreatBadge level="safe" label="PhishShield Active" size="sm" />
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
              <Globe className="h-6 w-6" />
            </div>
            <span>Website Scanner</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            Detect deceptive phishing landing pages, punycode/homograph domains,
            invalid TLS certificate chains, and drive-by malware downloads.
          </p>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <DashboardCard
            title="URL Inspection Console"
            subtitle="Input a target web address or domain to analyze"
          >
            <div className="space-y-4">
              <div className="relative flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute top-3.5 left-4 h-5 w-5 text-slate-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example-domain.com/secure/login"
                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-900/80 pr-4 pl-12 font-mono text-sm text-white placeholder-slate-400 transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 font-mono text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-purple-500 active:scale-95"
                >
                  <Zap className="h-4 w-4" />
                  <span>Scan Domain</span>
                </button>
              </div>

              {/* Heuristic Checks Checklist */}
              <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2">
                {[
                  {
                    icon: Lock,
                    title: "TLS / SSL Verification",
                    desc: "Inspect issuer CA, cipher suite, and certificate expiration validity.",
                  },
                  {
                    icon: Globe,
                    title: "Homograph & Punycode Check",
                    desc: "Analyze Cyrillic and international character substitution in domain names.",
                  },
                  {
                    icon: Server,
                    title: "DNS & WHOIS Age Telemetry",
                    desc: "Detect newly registered domains (<7 days old) commonly used for phishing.",
                  },
                  {
                    icon: FileCode,
                    title: "Optical Brand Matching",
                    desc: "Compare visual DOM structure against known banking and login portals.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="glass-panel flex items-start gap-3 rounded-xl border border-white/[0.06] p-3.5"
                    >
                      <div className="shrink-0 rounded-lg bg-blue-500/10 p-2 text-blue-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-heading text-xs font-semibold text-white">
                          {item.title}
                        </h4>
                        <p className="font-body text-[11px] leading-tight text-slate-400">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Right Sidebar: Recent Domain Verifications */}
        <div className="space-y-6 lg:col-span-4">
          <DashboardCard
            title="Scan History Preview"
            subtitle="Recent URL reputation reports"
          >
            <div className="space-y-3">
              {[
                {
                  domain: "github.com",
                  level: "safe" as const,
                  label: "VERIFIED SAFE",
                  time: "12m ago",
                },
                {
                  domain: "paypa1-security-check.xyz",
                  level: "critical" as const,
                  label: "PHISHING BLOCKED",
                  time: "1h ago",
                },
                {
                  domain: "cloud-billing-portal.biz",
                  level: "high" as const,
                  label: "SUSPICIOUS DOMAIN",
                  time: "3h ago",
                },
              ].map((site) => (
                <div
                  key={site.domain}
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-slate-900/40 p-3"
                >
                  <div className="truncate">
                    <div className="truncate font-mono text-xs text-white">
                      {site.domain}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      {site.time}
                    </div>
                  </div>
                  <ThreatBadge
                    level={site.level}
                    label={site.label}
                    size="sm"
                    pulse={false}
                  />
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
