"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, AlertTriangle, Info, X } from "lucide-react";
import { useSecurity } from "@/lib/context/SecurityContext";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSecurity();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2.5 p-4 sm:p-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isError = toast.type === "error";
          const isWarning = toast.type === "warning";
          const isSuccess = toast.type === "success";

          const borderBg = isError
            ? "border-red-500/40 bg-red-950/90 shadow-[0_0_20px_rgba(239,68,68,0.25)] text-red-100"
            : isWarning
              ? "border-amber-500/40 bg-amber-950/90 shadow-[0_0_20px_rgba(245,158,11,0.25)] text-amber-100"
              : isSuccess
                ? "border-emerald-500/40 bg-emerald-950/90 shadow-[0_0_20px_rgba(16,185,129,0.25)] text-emerald-100"
                : "border-blue-500/40 bg-slate-900/90 shadow-[0_0_20px_rgba(59,130,246,0.25)] text-blue-100";

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.92 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 backdrop-blur-xl transition-all ${borderBg}`}
            >
              {/* Status Icon */}
              <div className="mt-0.5 shrink-0">
                {isError && <ShieldAlert className="h-4 w-4 text-red-400" />}
                {isWarning && (
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                )}
                {isSuccess && (
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                )}
                {!isError && !isWarning && !isSuccess && (
                  <Info className="h-4 w-4 text-blue-400" />
                )}
              </div>

              {/* Text details */}
              <div className="flex-1 space-y-0.5">
                <h5 className="font-heading text-xs font-bold tracking-wide">
                  {toast.title}
                </h5>
                {toast.message && (
                  <p className="font-body text-[11px] leading-tight text-slate-300">
                    {toast.message}
                  </p>
                )}
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
