"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Cpu, Sparkles } from "lucide-react";

export const GlowingShield: React.FC = () => {
  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[480px] items-center justify-center">
      {/* Background ambient blur orbs */}
      <div className="absolute inset-4 animate-pulse rounded-full bg-blue-600/20 blur-[90px]" />
      <div className="absolute inset-16 rounded-full bg-purple-600/20 blur-[80px]" />

      {/* Orbit Ring 1 - Outer */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 rounded-full border border-dashed border-blue-500/20"
      >
        <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-blue-400 shadow-[0_0_12px_#60a5fa]" />
      </motion.div>

      {/* Orbit Ring 2 - Middle reverse */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-12 rounded-full border border-purple-500/30"
      >
        <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-purple-400 shadow-[0_0_12px_#c084fc]" />
      </motion.div>

      {/* Inner Circuit Hexagon Plate */}
      <div className="glass-panel relative z-10 flex h-56 w-56 items-center justify-center rounded-3xl border border-blue-500/30 p-6 shadow-[0_0_60px_rgba(37,99,235,0.3)] sm:h-64 sm:w-64">
        {/* Animated radar sweep inside */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-3xl opacity-30"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(37,99,235,0.5) 360deg)",
          }}
        />

        {/* Center Shield Core */}
        <div className="relative z-20 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-[#060816] p-6 shadow-inner">
          <motion.div
            animate={{
              scale: [1, 1.06, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 p-4 text-white shadow-[0_0_30px_rgba(37,99,235,0.6)]"
          >
            <Shield className="h-14 w-14 sm:h-16 sm:w-16" strokeWidth={1.5} />
          </motion.div>

          <div className="mt-3 flex items-center gap-1.5 font-mono text-xs font-semibold text-cyan-300">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            <span>NEURAL DEFENSE</span>
          </div>
        </div>
      </div>

      {/* Floating Pill Badge 1: Top Left */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="glass-panel absolute top-6 -left-4 z-20 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 px-3.5 py-2 shadow-lg shadow-emerald-950/40 sm:-left-6"
      >
        <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
        <div className="text-left font-mono">
          <div className="text-[10px] leading-none text-slate-400">
            THREAT LEVEL
          </div>
          <div className="text-xs leading-tight font-bold text-emerald-400">
            ZERO RISK
          </div>
        </div>
      </motion.div>

      {/* Floating Pill Badge 2: Bottom Right */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="glass-panel absolute -right-4 -bottom-2 z-20 flex items-center gap-2.5 rounded-xl border border-blue-500/30 px-3.5 py-2 shadow-lg shadow-blue-950/40 sm:-right-6"
      >
        <div className="rounded-md bg-blue-500/20 p-1 text-blue-400">
          <Cpu className="h-3.5 w-3.5" />
        </div>
        <div className="text-left font-mono">
          <div className="text-[10px] leading-none text-slate-400">
            AI CONFIDENCE
          </div>
          <div className="text-xs leading-tight font-bold text-blue-400">
            99.4% REAL-TIME
          </div>
        </div>
      </motion.div>
    </div>
  );
};
