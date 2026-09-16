"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles, CheckCircle2 } from "lucide-react";

export interface ScanningModalProps {
  isOpen: boolean;
  title: string;
  target?: string;
  steps?: string[];
  activeStep?: number;
}

export const ScanningModal: React.FC<ScanningModalProps> = ({
  isOpen,
  title = "Analyzing Telemetry...",
  target,
  steps = [
    "Normalizing input payload",
    "Evaluating neural heuristic matrices",
    "Cross-referencing global CVE & breach repositories",
    "Compiling defense verdict",
  ],
  activeStep = 1,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="glass-panel relative w-full max-w-md overflow-hidden rounded-2xl border border-blue-500/40 p-6 text-center shadow-[0_0_50px_rgba(37,99,235,0.3)]"
          >
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-blue-600/30 blur-3xl" />

            {/* Radar Animation */}
            <div className="relative mx-auto my-4 flex h-28 w-28 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-blue-500/30 bg-blue-950/40" />

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(37,99,235,0.5) 360deg)",
                }}
              />

              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/40">
                <Shield className="h-6 w-6 animate-pulse" />
              </div>
            </div>

            {/* Title & Target */}
            <h3 className="font-heading text-lg font-bold tracking-tight text-white">
              {title}
            </h3>

            {target && (
              <p className="mx-auto mt-1 max-w-xs truncate font-mono text-xs text-blue-400">
                {target}
              </p>
            )}

            {/* Steps Checklist */}
            <div className="mt-6 space-y-2 text-left">
              {steps.map((step, idx) => {
                const isDone = idx < activeStep;
                const isCurrent = idx === activeStep;

                return (
                  <div
                    key={step}
                    className={`flex items-center gap-2.5 rounded-lg p-2 font-mono text-xs transition-colors ${
                      isDone
                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : isCurrent
                          ? "animate-pulse border border-blue-500/30 bg-blue-500/15 text-blue-300"
                          : "text-slate-500 opacity-60"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    ) : isCurrent ? (
                      <Sparkles className="h-3.5 w-3.5 shrink-0 animate-spin text-blue-400" />
                    ) : (
                      <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-700" />
                    )}
                    <span className="truncate">{step}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
