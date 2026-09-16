"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { DashboardCard, ThreatBadge } from "@/components";
import { useSecurity } from "@/lib/context/SecurityContext";
import type {
  AdvisorApiRequest,
  AdvisorApiResponse,
  AdvisorMessage,
  ApiResponse,
} from "@/types";

export default function AdvisorPage() {
  const { recentScans, cyberHealthScore, healthBreakdown } = useSecurity();
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idCounterRef = useRef(1);

  // Dynamic context suggestions based on user's actual scan history
  const latestPassword = recentScans.find((s) => s.type === "password");
  const latestUrl = recentScans.find((s) => s.type === "url");
  const latestEmail = recentScans.find((s) => s.type === "email");

  const contextualPrompts = [
    latestPassword
      ? `Explain my recent password score (${latestPassword.metadata?.score || 50}/100)`
      : "How can I construct an unbreakable password?",
    latestUrl
      ? `Why was ${latestUrl.input.substring(0, 24)}... flagged?`
      : "What are the biggest phishing domain signs?",
    latestEmail
      ? "Break down the phishing email vectors detected"
      : "How do SPF, DKIM, and DMARC work?",
    `How can I elevate my ${cyberHealthScore}/100 Cyber Health Score?`,
  ];

  const [messages, setMessages] = useState<AdvisorMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: `Hello, SecOps Analyst! I am **SecureNet AI Advisor**, your personal cyber defense companion.\n\nI have evaluated your current posture (**${cyberHealthScore}/100 PTS - ${healthBreakdown.category.toUpperCase()}**) across your ${recentScans.length} telemetry scans. Ask me anything about your results, threat containment, or infrastructure hardening!`,
      timestamp: "Just now",
      contextPill: `Telemetry Synced: ${healthBreakdown.category}`,
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isTyping) return;

    const userMsg: AdvisorMessage = {
      id: `msg-user-${idCounterRef.current++}`,
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);
    setError(null);

    try {
      const payload: AdvisorApiRequest = {
        query,
        recentScans,
        cyberHealthScore,
        healthCategory: healthBreakdown.category,
      };

      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json: ApiResponse<AdvisorApiResponse> = await res.json();

      if (json.success && json.data) {
        const response = json.data;
        const botMsg: AdvisorMessage = {
          id: `msg-bot-${idCounterRef.current++}`,
          sender: "assistant",
          text: response.text,
          timestamp: "Just now",
          contextPill: response.contextPill,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        setError(json.error || "Advisor query failed.");
        const fallbackMsg: AdvisorMessage = {
          id: `msg-bot-${idCounterRef.current++}`,
          sender: "assistant",
          text: "I encountered an issue retrieving that analysis. Please verify your connection or rephrase the query.",
          timestamp: "Just now",
          contextPill: "Telemetry Alert",
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } catch {
      setError("Network error communicating with /api/advisor.");
      const networkErrorMsg: AdvisorMessage = {
        id: `msg-bot-${idCounterRef.current++}`,
        sender: "assistant",
        text: "Network failure: Unable to reach the AI Advisor API endpoint.",
        timestamp: "Just now",
        contextPill: "Connection Error",
      };
      setMessages((prev) => [...prev, networkErrorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

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
            <ThreatBadge level="low" label="Neural Copilot Active" size="sm" />
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2 text-purple-400">
              <Bot className="h-6 w-6" />
            </div>
            <span>AI Security Advisor</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            Conversational cybersecurity companion grounded in your live scan
            telemetry, threat indicators, and mitigation blueprints.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="glass-panel flex items-center gap-3 rounded-xl border border-white/10 px-4 py-2">
          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400">TELEMETRY CONTEXT</div>
            <div className="text-sm font-bold text-purple-300">
              {recentScans.length} Scans Loaded
            </div>
          </div>
          <div className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Chat Console Area */}
        <div className="space-y-4 lg:col-span-8">
          <DashboardCard
            title="Copilot Consultation Console"
            subtitle="Grounded in your real-time security state"
            className="flex h-[560px] flex-col"
          >
            {/* Messages Scroll Area */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.sender === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${
                      msg.sender === "user"
                        ? "bg-blue-600 shadow-blue-500/20"
                        : "bg-gradient-to-tr from-purple-600 to-blue-600 shadow-purple-500/20"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`font-body max-w-xl space-y-2 rounded-2xl p-4 text-xs leading-relaxed sm:text-sm ${
                      msg.sender === "user"
                        ? "rounded-tr-sm border border-blue-500/40 bg-blue-600/30 text-white"
                        : "glass-panel rounded-tl-sm border border-white/10 text-slate-200"
                    }`}
                  >
                    {msg.contextPill && (
                      <div className="mb-1 inline-flex items-center gap-1.5 rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-purple-300 uppercase">
                        <Sparkles className="h-3 w-3" />
                        <span>{msg.contextPill}</span>
                      </div>
                    )}

                    <div className="space-y-2 whitespace-pre-wrap">
                      {msg.text.split("\n\n").map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>

                    <div className="pt-1 text-right font-mono text-[10px] text-slate-400">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Animation Indicator */}
              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white">
                    <Bot className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="glass-panel flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/10 p-3.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:0.4s]" />
                    <span className="ml-2 font-mono text-xs text-slate-400">
                      Analyzing local telemetry...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Contextual Suggestions Pills */}
            <div className="border-t border-white/[0.08] pt-3">
              <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                <Lightbulb className="h-3.5 w-3.5 text-purple-400" />
                <span>Contextual Prompts:</span>
              </div>
              <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-1">
                {contextualPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="max-w-xs shrink-0 truncate rounded-xl border border-white/[0.06] bg-slate-900/60 px-3 py-1.5 text-left font-mono text-xs text-slate-300 transition-all hover:border-purple-500/30 hover:bg-purple-950/20 hover:text-white"
                  >
                    &quot;{prompt}&quot;
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-2.5 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about your scan results, CVEs, or hardening steps..."
                className="font-body h-12 w-full rounded-xl border border-white/10 bg-slate-900/80 pr-12 pl-4 text-xs text-white placeholder-slate-500 transition-all focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 focus:outline-none sm:text-sm"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="absolute right-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-2 text-white shadow-md shadow-purple-500/20 transition-all hover:from-blue-500 hover:to-purple-500 active:scale-95 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </DashboardCard>
        </div>

        {/* Right Info Box: Context Overview */}
        <div className="space-y-5 lg:col-span-4">
          <DashboardCard
            title="Live Context Feed"
            subtitle="Scans available to AI Copilot"
          >
            <div className="space-y-3 font-mono text-xs text-slate-400">
              <div className="space-y-1.5 rounded-xl border border-white/[0.06] bg-slate-900/40 p-3">
                <div className="flex justify-between font-semibold text-white">
                  <span>Current Health:</span>
                  <span className="text-emerald-400">
                    {cyberHealthScore}/100 ({healthBreakdown.category})
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Password: {healthBreakdown.passwordSecurity}/25 | Web:{" "}
                  {healthBreakdown.websiteSafety}/25 | Email:{" "}
                  {healthBreakdown.emailSafety}/25
                </div>
              </div>

              <div className="space-y-1 rounded-xl border border-white/[0.06] bg-slate-900/40 p-3">
                <div className="font-semibold text-slate-300">
                  Latest Scans Loaded:
                </div>
                <ul className="space-y-1 text-[11px]">
                  {recentScans.slice(0, 3).map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between truncate"
                    >
                      <span className="max-w-[150px] truncate">{s.input}</span>
                      <span className="text-[10px] text-purple-300 uppercase">
                        {s.threatLevel}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="font-body text-[11px] text-slate-500">
                The Advisor operates fully client-side using deterministic
                threat heuristics. No private keys, passwords, or company
                telemetry are transmitted.
              </p>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
