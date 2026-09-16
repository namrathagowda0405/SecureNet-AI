"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  Shield,
  Key,
  Bug,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { DashboardCard, ThreatBadge } from "@/components";
import { useSecurity } from "@/lib/context/SecurityContext";

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function ContactPage() {
  const { showToast } = useSecurity();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "Security Disclosure",
    severity: "medium",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      showToast({
        type: "warning",
        title: "Validation Incomplete",
        message: "Please provide your name, email, and description.",
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      showToast({
        type: "success",
        title: "Transmission Recorded",
        message: `Thank you, ${formData.name}. Your report was logged into SecureNet SecOps triage.`,
      });
    }, 900);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      category: "Security Disclosure",
      severity: "medium",
      subject: "",
      message: "",
    });
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-blue-400 uppercase">
              SecOps Telemetry & Triage
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <ThreatBadge level="safe" label="Encrypted Portal" size="sm" />
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
              <MessageSquare className="h-6 w-6" />
            </div>
            <span>Contact & Feedback Portal</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            Submit vulnerability disclosures, bug reports, feature
            recommendations, or enterprise partnership inquiries directly to our
            security engineers.
          </p>
        </div>
      </div>

      {/* Main Layout: Form (8 Cols) + Info (4 Cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Contact Form */}
        <div className="lg:col-span-8">
          <DashboardCard
            title="Telemetry Transmission Form"
            subtitle="All feedback is processed securely under zero-trust guidelines"
          >
            {isSubmitted ? (
              <div className="space-y-4 py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading text-lg font-bold text-white">
                    Telemetry Dispatch Confirmed
                  </h3>
                  <p className="font-body mx-auto max-w-md text-xs text-slate-400">
                    Your transmission has been queued for SecOps analysis. If
                    you requested follow-up, our team will reach out to{" "}
                    <strong className="text-white">{formData.email}</strong>.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl border border-white/10 bg-slate-900 px-5 py-2 font-mono text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    Submit Another Report
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1: Name and Email */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="font-mono text-xs font-semibold text-slate-300">
                      Your Name / Handle *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Alex Rivera"
                      className="font-body h-11 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 text-xs text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-xs font-semibold text-slate-300">
                      Work / Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="e.g. alex@enterprise.com"
                      className="font-body h-11 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 text-xs text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 2: Category and Severity */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="font-mono text-xs font-semibold text-slate-300">
                      Report Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="font-body h-11 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 text-xs text-white focus:border-blue-500/50 focus:outline-none"
                    >
                      <option value="Security Disclosure">
                        Vulnerability / Security Disclosure
                      </option>
                      <option value="Bug Report">Engine Bug Report</option>
                      <option value="Heuristic Suggestion">
                        Heuristic Rule Suggestion
                      </option>
                      <option value="General Feedback">
                        Platform Feedback & Collaboration
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-xs font-semibold text-slate-300">
                      Perceived Severity
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) =>
                        setFormData({ ...formData, severity: e.target.value })
                      }
                      className="font-body h-11 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 text-xs text-white focus:border-blue-500/50 focus:outline-none"
                    >
                      <option value="low">
                        Low &mdash; Minor UI or Suggestion
                      </option>
                      <option value="medium">
                        Medium &mdash; Inconvenience or Edge Case
                      </option>
                      <option value="high">
                        High &mdash; False Positive / Incorrect Flag
                      </option>
                      <option value="critical">
                        Critical &mdash; Active Security Vulnerability
                      </option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="font-mono text-xs font-semibold text-slate-300">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="Brief summary of the inquiry..."
                    className="font-body h-11 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 text-xs text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="font-mono text-xs font-semibold text-slate-300">
                    Detailed Transmission / Observation *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Provide reproduction steps, observed telemetry behavior, or feature concepts..."
                    className="font-body w-full rounded-xl border border-white/10 bg-slate-900/80 p-4 text-xs text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-mono text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-purple-500 active:scale-95 disabled:opacity-50 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin" />
                      <span>Encrypting & Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Dispatch Telemetry Report</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </DashboardCard>
        </div>

        {/* Right: Security Channels & Info (4 Cols) */}
        <div className="space-y-6 lg:col-span-4">
          <DashboardCard
            title="Responsible Disclosure"
            subtitle="Security vulnerability policy"
            icon={Shield}
          >
            <div className="font-body space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                We value the research of security analysts and ethical hackers.
                If you uncover a flaw in our heuristic algorithms or state
                engine, we ask for coordinated disclosure.
              </p>

              <div className="space-y-2 rounded-xl border border-blue-500/20 bg-blue-950/20 p-3">
                <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-blue-300">
                  <Key className="h-3.5 w-3.5" />
                  <span>PGP Key Fingerprint</span>
                </div>
                <div className="font-mono text-[10px] break-all text-slate-400">
                  E4B8 99A2 01F7 C6E3 4D89 BB01 77FE 92C1 40A5
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Community & Bug Tracker"
            subtitle="Open source collaboration"
            icon={Bug}
          >
            <div className="space-y-3 text-xs">
              <a
                href="https://github.com/namrathagowda0405/SecureNet-AI/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-slate-900/60 p-3.5 transition-colors hover:border-white/20"
              >
                <div className="flex items-center gap-2 text-white">
                  <GithubIcon className="h-4 w-4" />
                  <span className="font-mono text-xs">GitHub Issues</span>
                </div>
                <span className="font-mono text-[10px] text-blue-400">
                  Open &rarr;
                </span>
              </a>

              <div className="rounded-xl border border-white/[0.06] bg-slate-900/40 p-3.5 text-slate-400">
                <div className="font-mono text-[11px] font-semibold text-white">
                  Response SLA
                </div>
                <p className="mt-0.5 text-[11px]">
                  Critical security reports are triaged within 24 hours by our
                  core engineering team.
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
