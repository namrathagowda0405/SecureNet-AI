"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Zap, ArrowRight, ChevronRight } from "lucide-react";
import {
  AnimatedBackground,
  FeatureCard,
  GlowingShield,
  SectionHeading,
} from "@/components";
import { LANDING_FEATURES, HOW_IT_WORKS_STEPS } from "@/lib/data";

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

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#060816] text-slate-100 selection:bg-blue-600/40 selection:text-white">
      {/* Background Cyber Grid & Glowing Ambient Orbs */}
      <AnimatedBackground
        showParticles={true}
        showGrid={true}
        showOrbs={true}
      />

      {/* Top Landing Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#060816]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-105 sm:h-11 sm:w-11">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <div className="font-heading flex items-center gap-1.5 text-lg font-bold tracking-tight text-white sm:text-xl">
                <span>SecureNet</span>
                <span className="text-blue-400">AI</span>
              </div>
              <div className="font-mono text-[9px] tracking-wider text-slate-400 sm:text-[10px]">
                PERSONAL CYBERSECURITY
              </div>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="font-body hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-blue-400"
            >
              Features
            </a>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-blue-400"
            >
              Dashboard
            </Link>
            <Link
              href="/reports"
              className="font-semibold transition-colors hover:text-purple-300"
            >
              Audit Report
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-blue-400"
            >
              About
            </Link>
            <Link href="/faq" className="transition-colors hover:text-blue-400">
              FAQ
            </Link>
            <a
              href="https://github.com/namrathagowda0405/SecureNet-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <GithubIcon className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="glass-panel hidden items-center rounded-xl px-4 py-2 font-mono text-xs font-medium text-slate-300 transition-all hover:border-blue-500/40 hover:text-white sm:inline-flex"
            >
              Dashboard
            </Link>

            <Link
              href="/url-checker"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-purple-500 active:scale-95 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              <Zap className="h-4 w-4" />
              <span>Start Free Scan</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8 lg:pt-32">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-6 text-center lg:col-span-7 lg:text-left"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 font-mono text-xs tracking-wider text-blue-400 uppercase">
              <span className="h-2 w-2 animate-ping rounded-full bg-blue-400" />
              <span>Next-Gen Cybersecurity Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-4xl leading-[1.1] font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Protect Your Digital World with{" "}
              <span className="text-gradient drop-shadow-[0_0_35px_rgba(96,165,250,0.4)]">
                AI
              </span>
            </h1>

            {/* Subheading */}
            <p className="font-body mx-auto max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg lg:mx-0 lg:text-xl">
              SecureNet AI is your personal, proactive cyber defense companion.
              Powered by neural heuristics that identify phishing portals,
              analyze compromised passwords, inspect suspicious emails, and
              neutralize malicious binaries in real time.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row lg:justify-start">
              <Link
                href="/url-checker"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 px-7 py-3.5 font-mono text-sm font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] hover:from-blue-500 hover:to-purple-500 hover:shadow-blue-500/50 active:scale-95 sm:w-auto"
              >
                <Zap className="h-4 w-4" />
                <span>Start Free Scan</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/dashboard"
                className="glass-panel inline-flex w-full items-center justify-center gap-2 rounded-2xl px-7 py-3.5 font-mono text-sm font-medium text-slate-200 transition-all hover:border-blue-500/40 hover:bg-white/[0.06] hover:text-white sm:w-auto"
              >
                <span>View Dashboard</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="mx-auto grid max-w-lg grid-cols-3 gap-4 border-t border-white/[0.08] pt-6 lg:mx-0">
              <div className="text-left">
                <div className="font-mono text-xl font-bold text-white sm:text-2xl">
                  99.4%
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  AI Accuracy
                </div>
              </div>
              <div className="text-left">
                <div className="font-mono text-xl font-bold text-blue-400 sm:text-2xl">
                  &lt; 150ms
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  Scan Latency
                </div>
              </div>
              <div className="text-left">
                <div className="font-mono text-xl font-bold text-purple-400 sm:text-2xl">
                  10B+
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  Threat Records
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Illustration: Animated Glowing Shield */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center lg:col-span-5"
          >
            <GlowingShield />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 border-t border-white/[0.08] bg-slate-950/40 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-7xl space-y-12 px-4 sm:space-y-16 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Security Capabilities"
            title="Six Pillars of Autonomous Defense"
            description="Comprehensive protection modules designed to safeguard your credentials, communications, web interactions, and local endpoints."
            align="center"
          />

          {/* 6 Feature Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {LANDING_FEATURES.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="relative z-10 border-t border-white/[0.08] py-20 sm:py-28"
      >
        <div className="mx-auto max-w-7xl space-y-12 px-4 sm:space-y-16 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Threat Resolution Pipeline"
            title="How SecureNet AI Works"
            description="Our three-step pipeline guarantees rapid detection and immediate threat isolation before compromise occurs."
            align="center"
          />

          {/* Three Steps Grid */}
          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="glass-panel group relative overflow-hidden rounded-2xl border border-white/[0.08] p-8 transition-all hover:border-blue-500/30"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <span className="font-mono text-3xl font-extrabold text-slate-400 transition-colors group-hover:text-blue-400">
                      {step.step}
                    </span>

                    <div
                      className={`rounded-xl bg-gradient-to-tr p-3 ${step.color} text-white shadow-lg`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  <h3 className="font-heading mb-2.5 text-xl font-bold text-white">
                    {step.title}
                  </h3>

                  <p className="font-body text-sm leading-relaxed text-slate-400">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="glass-panel relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-purple-950/20 to-[#060816] p-8 text-center shadow-[0_0_60px_rgba(37,99,235,0.15)] sm:p-14">
          <div className="mx-auto max-w-2xl space-y-6">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Upgrade Your Personal Cyber Defense?
            </h2>
            <p className="font-body text-sm leading-relaxed text-slate-300 sm:text-base">
              Explore the SecureNet AI dashboard and test your credentials,
              URLs, and files against cutting-edge neural detection heuristics
              today.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 font-mono text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-purple-500 active:scale-95 sm:w-auto"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="font-body relative z-10 border-t border-white/[0.08] bg-[#03050c] py-12 text-slate-400 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand column */}
            <div className="space-y-4 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 text-white">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="font-heading text-base font-bold tracking-tight text-white">
                  SecureNet <span className="text-blue-400">AI</span>
                </span>
              </Link>
              <p className="text-xs leading-relaxed text-slate-400">
                Autonomous personal cybersecurity platform defending your
                credentials, web browsing, emails, and endpoints.
              </p>
            </div>

            {/* Navigation links */}
            <div>
              <h4 className="font-heading mb-3 font-mono text-xs font-semibold tracking-wider text-slate-200 uppercase">
                Platform
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/dashboard"
                    className="transition-colors hover:text-blue-400"
                  >
                    Security Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/password-checker"
                    className="transition-colors hover:text-blue-400"
                  >
                    Password Analyzer
                  </Link>
                </li>
                <li>
                  <Link
                    href="/url-checker"
                    className="transition-colors hover:text-blue-400"
                  >
                    Website Scanner
                  </Link>
                </li>
                <li>
                  <Link
                    href="/email-checker"
                    className="transition-colors hover:text-blue-400"
                  >
                    Email Phishing Scanner
                  </Link>
                </li>
                <li>
                  <Link
                    href="/file-checker"
                    className="transition-colors hover:text-blue-400"
                  >
                    Malware Scanner
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading mb-3 font-mono text-xs font-semibold tracking-wider text-slate-200 uppercase">
                Platform & Audits
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/dashboard"
                    className="transition-colors hover:text-blue-400"
                  >
                    Operations Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reports"
                    className="font-medium transition-colors hover:text-purple-300"
                  >
                    Cyber Security Audit Report
                  </Link>
                </li>
                <li>
                  <Link
                    href="/advisor"
                    className="transition-colors hover:text-blue-400"
                  >
                    AI Security Advisor
                  </Link>
                </li>
                <li>
                  <Link
                    href="/history"
                    className="transition-colors hover:text-blue-400"
                  >
                    Forensic Scan History
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading mb-3 font-mono text-xs font-semibold tracking-wider text-slate-200 uppercase">
                Company & Docs
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/about"
                    className="transition-colors hover:text-blue-400"
                  >
                    About SecureNet AI
                  </Link>
                </li>
                <li>
                  <Link
                    href="/team"
                    className="transition-colors hover:text-blue-400"
                  >
                    Team & SecOps
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="transition-colors hover:text-blue-400"
                  >
                    FAQ Knowledgebase
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="transition-colors hover:text-blue-400"
                  >
                    Contact & Telemetry Feedback
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading mb-3 font-mono text-xs font-semibold tracking-wider text-slate-200 uppercase">
                Community & Code
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="https://github.com/namrathagowda0405/SecureNet-AI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 transition-colors hover:text-blue-400"
                  >
                    <GithubIcon className="h-3.5 w-3.5" />
                    <span>GitHub Repository</span>
                  </a>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="transition-colors hover:text-blue-400"
                  >
                    Responsible Disclosure
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="transition-colors hover:text-blue-400"
                  >
                    Privacy Architecture
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 font-mono text-xs text-slate-400 sm:flex-row">
            <div>&copy; 2026 SecureNet AI. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                All Defense Nodes Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
