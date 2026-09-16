"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, Radio } from "lucide-react";
import { NAVIGATION_ITEMS, SECONDARY_NAV_ITEMS } from "@/lib/navigation";
import type { SidebarProps } from "@/types";

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  className = "",
}) => {
  const pathname = usePathname();

  const SidebarContent = (
    <div className="flex h-full flex-col border-r border-white/[0.08] bg-[#060816]/95 text-slate-200 backdrop-blur-xl lg:bg-[#0c102b]/70">
      {/* Sidebar Header / Brand */}
      <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/25 transition-transform group-hover:scale-105">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="font-heading flex items-center gap-1.5 text-base font-bold tracking-tight text-white">
              <span>SecureNet</span>
              <span className="text-blue-400">AI</span>
            </div>
            <div className="font-mono text-[10px] tracking-wider text-slate-400">
              CYBER COMPANION
            </div>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Items List */}
      <div className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <div className="px-3 pb-2 font-mono text-[10px] tracking-wider text-slate-400 uppercase">
          Core Security Suite
        </div>

        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  onClose();
                }
              }}
              className={`font-body group relative flex items-center justify-between rounded-xl px-3.5 py-2 text-sm transition-all duration-200 ${
                isActive
                  ? "border border-blue-500/30 bg-blue-600/15 font-medium text-white shadow-[0_0_15px_rgba(37,99,235,0.15)]"
                  : "border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-lg p-1.5 transition-colors ${
                    isActive
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-slate-400 group-hover:bg-white/[0.06] group-hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span>{item.title}</span>
              </div>

              {item.badge && (
                <span
                  className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase ${
                    isActive
                      ? "bg-blue-500/30 text-blue-300"
                      : "bg-white/[0.06] text-slate-400 group-hover:text-slate-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute top-2 bottom-2 left-0 w-1 rounded-r-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"
                />
              )}
            </Link>
          );
        })}

        {/* Secondary Navigation Section */}
        <div className="pt-4 pb-2">
          <div className="mb-3 h-px bg-white/[0.06]" />
          <div className="px-3 pb-2 font-mono text-[10px] tracking-wider text-slate-400 uppercase">
            Platform & Intelligence
          </div>
        </div>

        {SECONDARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  onClose();
                }
              }}
              className={`font-body group relative flex items-center justify-between rounded-xl px-3.5 py-2 text-sm transition-all duration-200 ${
                isActive
                  ? "border border-purple-500/30 bg-purple-600/15 font-medium text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  : "border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-lg p-1.5 transition-colors ${
                    isActive
                      ? "bg-purple-500/20 text-purple-400"
                      : "text-slate-400 group-hover:bg-white/[0.06] group-hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span>{item.title}</span>
              </div>

              {item.badge && (
                <span
                  className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase ${
                    isActive
                      ? "bg-purple-500/30 text-purple-300"
                      : "bg-white/[0.06] text-slate-400 group-hover:text-slate-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId="activeIndicatorSecondary"
                  className="absolute top-2 bottom-2 left-0 w-1 rounded-r-full bg-purple-500 shadow-[0_0_8px_#a855f7]"
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Telemetry Status Card */}
      <div className="border-t border-white/[0.08] p-4">
        <div className="glass-panel rounded-xl border border-white/[0.06] bg-blue-950/20 p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-xs font-semibold text-emerald-400">
                AI Engine Active
              </span>
            </div>
            <Radio className="h-3.5 w-3.5 animate-pulse text-blue-400" />
          </div>
          <p className="font-body text-[11px] leading-tight text-slate-400">
            Real-time heuristic threat detection enabled.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 hidden w-64 lg:block ${className}`}
      >
        {SidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay + Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />

            {/* Slide-out Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[80vw] shadow-2xl lg:hidden"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
