"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";
import type { LoadingScannerProps } from "@/types";

export const LoadingScanner: React.FC<LoadingScannerProps> = ({
  statusText = "AI Neural Engine Scanning...",
  subtext = "Correlating telemetry against global CVE & threat matrices",
  size = "md",
  className = "",
}) => {
  const sizeMap = {
    sm: { container: "h-28 w-28", icon: "h-6 w-6", radar: "h-24 w-24" },
    md: { container: "h-40 w-40", icon: "h-10 w-10", radar: "h-36 w-36" },
    lg: { container: "h-56 w-56", icon: "h-16 w-16", radar: "h-52 w-52" },
  }[size];

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      {/* Radar Animation Area */}
      <div
        className={`relative flex items-center justify-center ${sizeMap.container}`}
      >
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border border-blue-500/20 bg-blue-950/20" />

        {/* Pulsing Concentric Waves */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.05, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-2 rounded-full border border-blue-400/40"
        />

        <motion.div
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.2, 0, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute inset-4 rounded-full border border-purple-500/30"
        />

        {/* Rotating Radar Sweeper */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, rgba(37, 99, 235, 0) 0deg, rgba(37, 99, 235, 0.4) 360deg)",
          }}
        />

        {/* Center Shield Icon */}
        <div className="relative z-10 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-3 shadow-lg shadow-blue-500/30">
          <Shield className={`${sizeMap.icon} animate-pulse text-white`} />
        </div>
      </div>

      {/* Status & Subtext */}
      <div className="mt-6 space-y-1.5">
        <div className="flex items-center justify-center gap-2 font-mono text-sm font-semibold text-blue-400">
          <Sparkles className="h-4 w-4 animate-spin" />
          <span>{statusText}</span>
        </div>
        {subtext && (
          <p className="font-body max-w-md text-xs text-slate-400">{subtext}</p>
        )}
      </div>
    </div>
  );
};
