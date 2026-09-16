"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { FeatureCardProps } from "@/types";

export const FeatureCard: React.FC<FeatureCardProps> = ({
  feature,
  index = 0,
  className = "",
}) => {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className={`glass-panel group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] p-6 transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)] sm:p-7 ${className}`}
    >
      {/* Background radial gradient on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div>
        {/* Header row: Icon & Badge */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-blue-400 shadow-lg shadow-blue-500/10 transition-all duration-300 group-hover:scale-110 group-hover:border-blue-400/50 group-hover:text-blue-300">
            <Icon className="h-6 w-6" />
          </div>

          {feature.badge && (
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-blue-300 uppercase">
              {feature.badge}
            </span>
          )}
        </div>

        {/* Content */}
        <h3 className="font-heading mb-2.5 text-lg font-bold text-white transition-colors group-hover:text-blue-200 sm:text-xl">
          {feature.title}
        </h3>

        <p className="font-body mb-6 text-sm leading-relaxed text-slate-400">
          {feature.description}
        </p>
      </div>

      {/* Footer Link */}
      <Link
        href={feature.href}
        className="group/link inline-flex items-center gap-2 border-t border-white/[0.06] pt-4 font-mono text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
      >
        <span>Launch Module</span>
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
      </Link>
    </motion.div>
  );
};
