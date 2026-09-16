"use client";

import React, { useState, useMemo } from "react";
import {
  Radio,
  Mail,
  FileWarning,
  KeyRound,
  Network,
  Clock,
  ExternalLink,
} from "lucide-react";
import { ThreatBadge } from "@/components";
import type { ThreatAlert } from "@/types";

interface ThreatIntelligenceFeedProps {
  alerts: ThreatAlert[];
}

export const ThreatIntelligenceFeed: React.FC<ThreatIntelligenceFeedProps> = ({
  alerts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Phishing", "Malware", "Password", "Network"];

  const filteredAlerts = useMemo(() => {
    if (selectedCategory === "All") return alerts;
    return alerts.filter(
      (a) => a.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [alerts, selectedCategory]);

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "phishing":
        return <Mail className="h-4 w-4 text-purple-400" />;
      case "malware":
        return <FileWarning className="h-4 w-4 text-cyan-400" />;
      case "password":
        return <KeyRound className="h-4 w-4 text-blue-400" />;
      case "network":
        return <Network className="h-4 w-4 text-emerald-400" />;
      default:
        return <Radio className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="font-mono text-xs font-semibold tracking-wider text-red-400 uppercase">
              Global Cyber Threat Radar
            </span>
          </div>
          <h3 className="font-heading text-lg font-bold text-white sm:text-xl">
            Active Threat Intelligence Feed
          </h3>
        </div>

        {/* Category Filter Pills */}
        <div className="glass-panel flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.08] p-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1 font-mono text-xs transition-all ${
                selectedCategory === cat
                  ? "border border-blue-500/40 bg-blue-600/30 font-semibold text-blue-300 shadow-sm"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {filteredAlerts.length === 0 ? (
          <div className="glass-panel col-span-full rounded-2xl border border-white/[0.08] p-8 text-center font-mono text-xs text-slate-500">
            No active threat intelligence alerts in this category.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="glass-panel flex flex-col justify-between gap-3 rounded-xl border border-white/[0.08] p-4 transition-all duration-200 hover:border-blue-500/30 hover:bg-slate-900/60"
            >
              <div className="space-y-2">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg border border-white/[0.06] bg-slate-900 p-1.5">
                      {getCategoryIcon(alert.category)}
                    </div>
                    <span className="font-mono text-xs font-medium text-slate-300">
                      {alert.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ThreatBadge
                      level={alert.severity}
                      size="sm"
                      pulse={alert.severity === "critical"}
                    />
                    <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-heading text-sm leading-snug font-semibold text-white">
                  {alert.title}
                </h4>

                {/* Description */}
                <p className="font-body text-xs leading-relaxed text-slate-400">
                  {alert.description}
                </p>
              </div>

              {/* Bottom Meta Vector & Source */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-2.5 font-mono text-[10px]">
                <span className="rounded-md border border-white/[0.06] bg-slate-900/60 px-2 py-0.5 text-blue-300">
                  Vector: {alert.vector}
                </span>

                <span className="inline-flex items-center gap-1 text-slate-500">
                  <span>{alert.source}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
