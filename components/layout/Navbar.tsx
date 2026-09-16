"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, Search, Bell, Shield, Zap, User, FileText } from "lucide-react";
import type { NavbarProps } from "@/types";

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  showSidebarToggle = true,
  className = "",
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header
      className={`glass-panel sticky top-0 z-20 flex h-16 w-full items-center justify-between gap-4 border-b border-white/[0.08] bg-[#060816]/80 px-4 backdrop-blur-xl sm:px-6 ${className}`}
    >
      {/* Left section: Mobile menu toggle + Logo */}
      <div className="flex items-center gap-3">
        {showSidebarToggle && (
          <button
            onClick={onToggleSidebar}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Toggle Navigation Drawer"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 text-white">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-heading text-sm font-bold tracking-tight text-white">
            SecureNet <span className="text-blue-400">AI</span>
          </span>
        </Link>

        {/* Global Search Bar */}
        <div className="relative hidden w-72 items-center md:flex lg:w-96">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search CVEs, domains, hashes, IP addresses..."
            className="font-body h-9 w-full rounded-xl border border-white/10 bg-slate-900/60 pr-16 pl-9 text-xs text-slate-200 placeholder-slate-400 transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:outline-none"
          />
          <kbd className="pointer-events-none absolute right-2.5 rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right Section: Quick Action + Notifications + User Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Security Audit Report CTA */}
        <Link
          href="/reports"
          className="hidden items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 font-mono text-xs font-semibold text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all hover:border-purple-500/50 hover:bg-purple-500/20 hover:text-white md:inline-flex"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Audit Report</span>
        </Link>

        {/* Quick Instant Scan CTA */}
        <Link
          href="/url-checker"
          className="hidden items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 font-mono text-xs font-semibold text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.15)] transition-all hover:border-blue-500/50 hover:bg-blue-500/20 hover:text-blue-300 sm:inline-flex"
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Quick Scan</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {/* Unread dot */}
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          </button>

          {showNotifications && (
            <div className="glass-panel animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-white/10 p-4 shadow-2xl duration-200 sm:w-96">
              <div className="mb-3 flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="font-heading flex items-center gap-2 text-sm font-semibold text-white">
                  <span>Threat Notifications</span>
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.5 font-mono text-[10px] text-blue-400">
                    2 New
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Dismiss
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-left">
                  <div className="mb-1 flex items-center justify-between font-mono text-xs font-semibold text-red-400">
                    <span>Phishing URL Blocked</span>
                    <span className="text-[10px] text-slate-400">5m ago</span>
                  </div>
                  <p className="font-body text-[11px] leading-tight text-slate-300">
                    Intercepted deceptive login prompt attempting to mimic
                    internal SSO.
                  </p>
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-left">
                  <div className="mb-1 flex items-center justify-between font-mono text-xs font-semibold text-blue-400">
                    <span>Heuristic Scan Complete</span>
                    <span className="text-[10px] text-slate-400">1h ago</span>
                  </div>
                  <p className="font-body text-[11px] leading-tight text-slate-300">
                    All 1,428 endpoint telemetry records synchronized cleanly.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Placeholder */}
        <div className="flex items-center gap-2 border-l border-white/[0.08] pl-2">
          <div className="group relative cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 p-[1.5px] shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0c102b] text-slate-200">
                <User className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            {/* Online badge */}
            <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#060816] bg-emerald-500" />
          </div>

          <div className="hidden text-left xl:block">
            <div className="text-xs leading-tight font-semibold text-white">
              SecOps Analyst
            </div>
            <div className="font-mono text-[10px] leading-tight text-slate-400">
              agent@securenet.ai
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
