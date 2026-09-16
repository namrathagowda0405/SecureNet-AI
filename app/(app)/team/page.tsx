"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Shield,
  Code,
  Terminal,
  Cpu,
  ExternalLink,
  Mail,
  ArrowRight,
} from "lucide-react";
import { ThreatBadge } from "@/components";

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

const TEAM_MEMBERS = [
  {
    name: "Alex Vance",
    role: "Lead Security Architect",
    specialty: "Cryptography & Threat Modeling",
    bio: "Pioneered the 4-pillar dynamic cyber health scoring algorithm and Shannon informational entropy matrix.",
    avatarBg: "from-blue-600 to-cyan-500",
    icon: Shield,
    github: "https://github.com/namrathagowda0405",
    tags: ["Zero-Trust", "Web Crypto API", "Penetration Testing"],
  },
  {
    name: "Elena Rostova",
    role: "AI Systems & Heuristics Engineer",
    specialty: "Phishing Vector NLP & Heuristics",
    bio: "Engineered the NLP conversational phishing detection model and the autonomous AI Security Advisor engine.",
    avatarBg: "from-purple-600 to-indigo-500",
    icon: Cpu,
    github: "https://github.com/namrathagowda0405",
    tags: ["NLP Heuristics", "Adversary Simulation", "Pattern Engines"],
  },
  {
    name: "Marcus Kane",
    role: "Threat Intelligence Researcher",
    specialty: "Malware Static Analysis & CVE Triaging",
    bio: "Designed the static binary rule engine, homoglyph domain verification rules, and automated CVE correlation matrices.",
    avatarBg: "from-red-600 to-amber-500",
    icon: Terminal,
    github: "https://github.com/namrathagowda0405",
    tags: ["Malware Sandboxing", "Reverse Engineering", "MITRE ATT&CK"],
  },
  {
    name: "Dr. Sarah Chen",
    role: "SecOps Frontend Engineer",
    specialty: "UI/UX & Telemetry Visualizations",
    bio: "Crafted the futuristic dark glassmorphism interface, holographic scanning modals, and real-time state synchronization.",
    avatarBg: "from-emerald-600 to-teal-500",
    icon: Code,
    github: "https://github.com/namrathagowda0405",
    tags: ["Next.js 16", "Framer Motion", "Reactive Systems"],
  },
];

export default function TeamPage() {
  return (
    <div className="space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-purple-400 uppercase">
              Core Engineering Team
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            <ThreatBadge level="safe" label="SecOps Guild" size="sm" />
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2 text-purple-400">
              <Users className="h-6 w-6" />
            </div>
            <span>Team & Developers</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            Meet the cybersecurity architects, AI researchers, and engineers
            behind SecureNet AI&apos;s autonomous defense ecosystem.
          </p>
        </div>

        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2 font-mono text-xs font-medium text-slate-300 transition-colors hover:border-purple-500/40 hover:text-white"
        >
          <span>Contact Team</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TEAM_MEMBERS.map((member) => {
          const MemberIcon = member.icon;
          return (
            <div
              key={member.name}
              className="glass-panel group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] p-6 transition-all duration-300 hover:border-purple-500/40 hover:bg-purple-950/10"
            >
              <div className="space-y-4">
                {/* Avatar Icon */}
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr ${member.avatarBg} text-white shadow-lg shadow-purple-500/20 transition-transform duration-300 group-hover:scale-105`}
                  >
                    <MemberIcon className="h-7 w-7" />
                  </div>

                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-white/10 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label={`${member.name} GitHub`}
                  >
                    <GithubIcon className="h-4 w-4" />
                  </a>
                </div>

                {/* Name & Title */}
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">
                    {member.name}
                  </h3>
                  <div className="font-mono text-xs font-semibold text-purple-400">
                    {member.role}
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    {member.specialty}
                  </div>
                </div>

                {/* Bio */}
                <p className="font-body text-xs leading-relaxed text-slate-300">
                  {member.bio}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {member.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-white/[0.06] bg-slate-900/80 px-2 py-0.5 font-mono text-[10px] text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-5 border-t border-white/[0.06] pt-3">
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between font-mono text-xs text-slate-400 transition-colors hover:text-purple-300"
                >
                  <span>Verified Contributor</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Open Source / Research Collaboration Banner */}
      <div className="glass-panel flex flex-col justify-between gap-4 rounded-2xl border border-white/[0.08] p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-blue-400 uppercase">
            <Mail className="h-4 w-4" />
            <span>Research & Responsible Disclosure</span>
          </div>
          <h3 className="font-heading text-lg font-bold text-white sm:text-xl">
            Interested in contributing threat signatures or heuristics?
          </h3>
          <p className="font-body text-xs text-slate-400">
            SecureNet AI is built on transparent heuristic models. We welcome
            academic papers, CVE signature definitions, and penetration testing
            feedback.
          </p>
        </div>

        <Link
          href="/contact"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-mono text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 active:scale-95"
        >
          <span>Submit Security Telemetry</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
