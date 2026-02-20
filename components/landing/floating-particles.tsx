"use client";

import { motion } from "framer-motion";

// Reusable atmospheric background component
// Can be used on any dark section needing depth
export function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Warm amber primary orb */}
      <motion.div
        className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[120px]"
        animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Emerald secondary orb */}
      <motion.div
        className="absolute top-1/2 -right-24 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-emerald-500/8 blur-[100px]"
        animate={{ x: [0, -60, 0], y: [0, 80, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Tertiary deep amber bottom */}
      <motion.div
        className="absolute -bottom-48 left-1/3 h-[700px] w-[700px] rounded-full bg-orange-500/6 blur-[140px]"
        animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 7 }}
      />

      {/* Fine dot grid for texture — very subtle */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}