"use client";

import React, { useState } from "react";
import {
  History,
  Search,
  Download,
  KeyRound,
  Globe,
  Mail,
  FileWarning,
} from "lucide-react";
import { DashboardCard, ThreatBadge } from "@/components";
import { RECENT_ACTIVITIES } from "@/lib/data";

export default function HistoryPage() {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredActivities = RECENT_ACTIVITIES.filter((act) => {
    if (filterType !== "all" && act.type !== filterType) return false;
    if (
      searchQuery &&
      !act.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !act.target.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "password":
        return <KeyRound className="h-4 w-4 text-blue-400" />;
      case "url":
        return <Globe className="h-4 w-4 text-purple-400" />;
      case "email":
        return <Mail className="h-4 w-4 text-indigo-400" />;
      case "malware":
        return <FileWarning className="h-4 w-4 text-cyan-400" />;
      default:
        return <History className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-blue-400 uppercase">
              Forensics & Compliance
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="font-mono text-[11px] text-slate-400">
              Audit Trail Verified
            </span>
          </div>
          <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
              <History className="h-6 w-6" />
            </div>
            <span>Scan History & Audit Logs</span>
          </h1>
          <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
            Immutable log of all automated scans, manual inspections,
            quarantined threats, and defense mitigation steps.
          </p>
        </div>

        <button
          type="button"
          className="glass-panel inline-flex items-center gap-2 self-start rounded-xl px-4 py-2 font-mono text-xs font-medium text-slate-300 transition-all hover:border-blue-500/30 hover:text-white active:scale-95 sm:self-auto"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        {/* Type Filter Tabs */}
        <div className="glass-panel flex w-full flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.08] p-1 sm:w-auto">
          {[
            { id: "all", label: "All Events" },
            { id: "url", label: "Web URLs" },
            { id: "password", label: "Passwords" },
            { id: "email", label: "Emails" },
            { id: "malware", label: "Malware" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-all ${
                filterType === tab.id
                  ? "border border-blue-500/40 bg-blue-600/30 font-semibold text-blue-300 shadow-sm"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search targets or incidents..."
            className="font-body h-9 w-full rounded-xl border border-white/10 bg-slate-900/60 pr-3 pl-9 text-xs text-slate-200 placeholder-slate-400 focus:border-blue-500/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Trail Records List */}
      <DashboardCard
        title="Event Telemetry Records"
        subtitle={`Showing ${filteredActivities.length} incident records`}
      >
        <div className="-mx-4 divide-y divide-white/[0.06] sm:-mx-6">
          {filteredActivities.map((event) => (
            <div
              key={event.id}
              className="flex flex-col justify-between gap-3 p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:px-6"
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 shrink-0 rounded-xl border border-white/[0.08] bg-slate-900/80 p-2">
                  {getTypeIcon(event.type)}
                </div>

                <div className="max-w-xl space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-heading text-sm font-semibold text-white">
                      {event.title}
                    </h4>
                    <ThreatBadge
                      level={event.severity}
                      size="sm"
                      pulse={false}
                    />
                  </div>
                  <div className="truncate font-mono text-xs text-blue-400">
                    {event.target}
                  </div>
                  {event.details && (
                    <p className="font-body text-xs text-slate-400">
                      {event.details}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-1 font-mono text-[11px] text-slate-400 sm:flex-col sm:items-end sm:justify-center">
                <span>{event.timestamp}</span>
                <span className="text-[10px] text-slate-400 uppercase">
                  ID: {event.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
