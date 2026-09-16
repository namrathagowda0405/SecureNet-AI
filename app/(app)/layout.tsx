"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#060816] text-slate-100">
      {/* Subtle futuristic cyber background */}
      <AnimatedBackground
        showParticles={true}
        showGrid={true}
        showOrbs={true}
      />

      {/* Left Sidebar (Desktop persistent + Mobile Drawer) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area shifted on desktop by sidebar width */}
      <div className="relative z-10 flex min-h-screen flex-col transition-all duration-300 lg:pl-64">
        {/* Sticky Top Navigation Bar */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          showSidebarToggle={true}
        />

        {/* Page Content Viewport */}
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
