"use client";

import React, { useState } from "react";
import { Mail, Zap } from "lucide-react";
import { DashboardCard, ThreatBadge } from "@/components";

export default function EmailCheckerPage() {
  const [emailContent, setEmailContent] = useState("");

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-blue-400 uppercase">
              Communication Security
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <ThreatBadge level="safe" label="NLP Engine Ready" size="sm" />
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
              <Mail className="h-6 w-6" />
            </div>
            <span>Email Phishing Scanner</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            Analyze suspicious email headers (SPF, DKIM, DMARC) and body
            contents for social engineering triggers, executive impersonation,
            and hidden tracking pixels.
          </p>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <DashboardCard
            title="Email Payload & Header Inspector"
            subtitle="Paste raw headers (RFC 822) or suspicious email message text"
          >
            <div className="space-y-4">
              <textarea
                rows={8}
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Paste the email message or raw email headers here...&#10;Example:&#10;From: billing-support@micros0ft-account.net&#10;Subject: Urgent: Account suspended within 24 hours&#10;..."
                className="w-full resize-y rounded-xl border border-white/10 bg-slate-900/80 p-4 font-mono text-xs text-white placeholder-slate-400 transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:outline-none"
              />

              <div className="flex items-center justify-between pt-2">
                <div className="font-mono text-[11px] text-slate-400">
                  {emailContent.length} characters parsed
                </div>

                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 font-mono text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-purple-500 active:scale-95"
                >
                  <Zap className="h-4 w-4" />
                  <span>Analyze Phishing Vectors</span>
                </button>
              </div>
            </div>
          </DashboardCard>

          {/* Inspection Checks Matrix */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="glass-panel space-y-1 rounded-xl border border-white/[0.08] p-4">
              <div className="font-mono text-xs text-slate-400">
                Authentication Alignment
              </div>
              <div className="font-heading text-sm font-semibold text-white">
                SPF / DKIM / DMARC
              </div>
              <p className="font-body text-[11px] text-slate-400">
                Verifies if sending server is authorized by the domain owner.
              </p>
            </div>

            <div className="glass-panel space-y-1 rounded-xl border border-white/[0.08] p-4">
              <div className="font-mono text-xs text-slate-400">
                Psychological Urgency
              </div>
              <div className="font-heading text-sm font-semibold text-white">
                NLP Social Engineering
              </div>
              <p className="font-body text-[11px] text-slate-400">
                Detects panic inducement, urgent wire transfers, or credential
                resets.
              </p>
            </div>

            <div className="glass-panel space-y-1 rounded-xl border border-white/[0.08] p-4">
              <div className="font-mono text-xs text-slate-400">
                Embedded Hyperlinks
              </div>
              <div className="font-heading text-sm font-semibold text-white">
                Link Obfuscation
              </div>
              <p className="font-body text-[11px] text-slate-400">
                Flags mismatch between visible anchor text and true href
                destinations.
              </p>
            </div>
          </div>
        </div>

        {/* Right Info Box */}
        <div className="space-y-5 lg:col-span-4">
          <DashboardCard
            title="How to Extract Headers"
            subtitle="Obtaining raw message telemetry"
          >
            <div className="font-body space-y-3 text-xs leading-relaxed text-slate-400">
              <div className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
                <strong className="mb-1 block text-slate-200">Gmail:</strong>
                Click the three dots &rarr; &quot;Show original&quot; &rarr;
                Copy header text.
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
                <strong className="mb-1 block text-slate-200">
                  Outlook / Office 365:
                </strong>
                Open message &rarr; File &rarr; Properties &rarr; &quot;Internet
                headers&quot;.
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
                <strong className="mb-1 block text-slate-200">
                  Apple Mail:
                </strong>
                View &rarr; Message &rarr; Raw Source (? ? U).
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
