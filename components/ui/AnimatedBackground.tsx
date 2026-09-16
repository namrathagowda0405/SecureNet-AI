"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import type { AnimatedBackgroundProps } from "@/types";

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  showGrid = true,
  showParticles = true,
  showOrbs = true,
  className = "",
}) => {
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: (i * 37) % 100,
      y: (i * 59) % 100,
      size: (i % 3) + 2,
      duration: 8 + (i % 7) * 2,
      delay: (i % 5) * 0.8,
      color:
        i % 3 === 0
          ? "rgba(37, 99, 235, 0.7)"
          : i % 3 === 1
            ? "rgba(124, 58, 237, 0.7)"
            : "rgba(6, 182, 212, 0.6)",
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
    >
      <div className="absolute inset-0 bg-[#060816]" />

      {showGrid && (
        <div className="cyber-grid absolute inset-0 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_40%,#000_70%,transparent_100%)] opacity-40" />
      )}

      {showOrbs && (
        <>
          <motion.div
            initial={{ opacity: 0.3, scale: 0.9 }}
            animate={{
              opacity: [0.25, 0.45, 0.25],
              scale: [0.95, 1.1, 0.95],
              x: [0, 40, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-blue-600/15 blur-[120px]"
          />

          <motion.div
            initial={{ opacity: 0.25, scale: 1 }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.15, 1],
              x: [0, -40, 0],
              y: [0, 35, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute top-1/3 -right-32 h-[600px] w-[600px] rounded-full bg-purple-600/15 blur-[140px]"
          />

          <motion.div
            initial={{ opacity: 0.15 }}
            animate={{
              opacity: [0.15, 0.3, 0.15],
              scale: [0.9, 1.05, 0.9],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
            className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px]"
          />
        </>
      )}

      {showParticles && (
        <div className="absolute inset-0">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: `${p.x}vw`,
                y: `${p.y}vh`,
                opacity: 0.2,
              }}
              animate={{
                y: [`${p.y}vh`, `${(p.y + 15) % 100}vh`, `${p.y}vh`],
                x: [`${p.x}vw`, `${(p.x + 6) % 100}vw`, `${p.x}vw`],
                opacity: [0.2, 0.7, 0.2],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: p.delay,
              }}
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}`,
              }}
              className="absolute rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
};
