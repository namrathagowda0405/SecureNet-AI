"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  ChevronDown,
  Search,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ThreatBadge } from "@/components";

interface FAQItem {
  id: string;
  category: "General" | "Privacy" | "Scanners" | "Scoring";
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    category: "General",
    question:
      "What is SecureNet AI and how does it protect my digital posture?",
    answer:
      "SecureNet AI is an autonomous, personal cybersecurity companion designed to proactively detect digital threats. It provides real-time heuristic scanning across credentials, URLs, emails, and binary files, synchronizing all findings into a unified Cyber Health Score and providing an interactive AI Security Advisor.",
  },
  {
    id: "faq-2",
    category: "Privacy",
    question:
      "Is my sensitive data (passwords, files, emails) uploaded to any cloud server?",
    answer:
      "No. SecureNet AI operates on a strict zero-trust edge model. Passwords and emails are parsed entirely in your browser memory. File SHA-256 hashes are generated using the browser's native W3C Web Crypto API. No plaintext credentials, uploaded files, or private correspondence ever leave your client device.",
  },
  {
    id: "faq-3",
    category: "Scoring",
    question: "How is the 0–100 Cyber Health Score calculated?",
    answer:
      "The Cyber Health Score uses a balanced 4-pillar methodology with 25 points allocated to each dimension: 1) Password Security (based on entropy & breach resilience), 2) Web Browsing Safety (based on domain reputation & clean pass rate), 3) Email Threat Defense (based on phishing vector containment), and 4) Scan Activity & Remediation Hygiene. A score of 90+ is rated Excellent, 70-89 Good, 50-69 Average, and below 50 Critical.",
  },
  {
    id: "faq-4",
    category: "Scanners",
    question:
      "How does the Password Analyzer calculate entropy and brute-force crack time?",
    answer:
      "Entropy is computed using Shannon's information formula: E = L * log2(R), where L is character length and R is character pool size (uppercase, lowercase, numbers, symbols). Crack time estimates assume high-end parallel GPU clusters testing 100 billion guesses per second, taking into account dictionary word clustering and common pattern penalties.",
  },
  {
    id: "faq-5",
    category: "Scanners",
    question: "What heuristics does the Website Phishing Scanner evaluate?",
    answer:
      "The engine inspects: 1) Transport security (HTTPS protocol), 2) Raw IP hostname detection (e.g. 192.168.1.1 in place of domain), 3) Punycode and homoglyph spoofing (character swaps mimicking PayPal, Microsoft, Google), 4) Deceptive subdomains and URL lengths, and 5) High-risk TLDs frequently used in ephemeral phishing (.top, .xyz, .biz).",
  },
  {
    id: "faq-6",
    category: "Scanners",
    question:
      "How does the Email Phishing detector recognize threats without external AI APIs?",
    answer:
      "The system utilizes an offline Natural Language Phishing Heuristics engine. It scans for psychological coercion vectors (urgency ultimatums, account suspension threats), financial lures, credential harvesting verification prompts, and header anomalies. Flagged coercive sentences are dynamically isolated and visually highlighted.",
  },
  {
    id: "faq-7",
    category: "Scanners",
    question: "What file types can the Malware Scanner inspect?",
    answer:
      "The Malware Scanner accepts PDF, DOCX, DOCM, ZIP, RAR, 7Z, EXE, BAT, CMD, VBS, PS1, PNG, and JPG files up to 64MB. It performs static heuristics: verifying MIME type alignments, double-extension masquerading (.pdf.exe), macro triggers, and cryptographic SHA-256 hash checks.",
  },
  {
    id: "faq-8",
    category: "General",
    question: "Can I download or print compliance audit reports?",
    answer:
      "Yes! Navigate to the 'Security Report' page (/reports) to generate a comprehensive, printable SecOps audit brief that summarizes all your active telemetry, pillar scores, and prioritized AI remediation protocols. You can print to PDF or export raw telemetry as JSON.",
  },
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("faq-1");

  const categories = ["All", "General", "Privacy", "Scanners", "Scoring"];

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      if (selectedCategory !== "All" && faq.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          faq.question.toLowerCase().includes(q) ||
          faq.answer.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-blue-400 uppercase">
              Knowledgebase & Transparency
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <ThreatBadge level="safe" label="FAQ v4.0" size="sm" />
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
              <HelpCircle className="h-6 w-6" />
            </div>
            <span>Frequently Asked Questions</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            Answers to common questions regarding SecureNet AI&apos;s edge
            privacy, heuristic engines, scoring algorithms, and report
            generation.
          </p>
        </div>

        <Link
          href="/reports"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-purple-500"
        >
          <span>View Security Report</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Filter Tabs */}
        <div className="glass-panel flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.08] p-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-all ${
                selectedCategory === cat
                  ? "border border-blue-500/40 bg-blue-600/30 font-semibold text-blue-300 shadow-sm"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-2.5 left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or keywords..."
            className="font-body h-9 w-full rounded-xl border border-white/10 bg-slate-900/60 pr-3 pl-9 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="glass-panel rounded-2xl border border-white/[0.08] p-12 text-center">
            <HelpCircle className="mx-auto mb-2 h-8 w-8 text-slate-500" />
            <div className="font-heading text-base font-semibold text-white">
              No matching questions found
            </div>
            <p className="font-body mt-1 text-xs text-slate-400">
              Try adjusting your search query or switching categories.
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;

            return (
              <div
                key={faq.id}
                className="glass-panel overflow-hidden rounded-2xl border border-white/[0.08] transition-colors hover:border-white/[0.15]"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-300 uppercase">
                      {faq.category}
                    </span>
                    <h3 className="font-heading text-sm font-semibold text-white sm:text-base">
                      {faq.question}
                    </h3>
                  </div>

                  <div
                    className={`shrink-0 rounded-lg p-1 text-slate-400 transition-transform duration-200 ${
                      isExpanded ? "rotate-180 text-blue-400" : ""
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/[0.06] bg-slate-900/40 px-5 py-4"
                    >
                      <p className="font-body text-xs leading-relaxed text-slate-300 sm:text-sm">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Still Have Questions Banner */}
      <div className="glass-panel flex flex-col justify-between gap-4 rounded-2xl border border-white/[0.08] p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-purple-400 uppercase">
            <Sparkles className="h-4 w-4" />
            <span>Dedicated SecOps Inquiries</span>
          </div>
          <h3 className="font-heading text-lg font-bold text-white sm:text-xl">
            Still have security, compliance, or architecture questions?
          </h3>
          <p className="font-body text-xs text-slate-400">
            Our team is available for technical discussions, vulnerability
            disclosures, and feature requests.
          </p>
        </div>

        <Link
          href="/contact"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 font-mono text-xs font-semibold text-white shadow-md shadow-purple-500/20 hover:bg-purple-500 active:scale-95"
        >
          <span>Submit Inquiry</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
