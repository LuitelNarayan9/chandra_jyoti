"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-7 w-14 rounded-full bg-stone-200 dark:bg-stone-800 animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      role="switch"
      aria-checked={isDark}
      whileTap={{ scale: 0.93 }}
      className="relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background overflow-hidden"
    >
      {/* Animated track background */}
      <motion.span
        className="absolute inset-0 rounded-full"
        animate={{
          background: isDark
            ? "linear-gradient(135deg, #4338ca, #7c3aed)"
            : "linear-gradient(135deg, #fbbf24, #f97316)",
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      {/* Track decorations */}
      <span className="pointer-events-none absolute inset-0 flex items-center overflow-hidden rounded-full px-1.5">
        {/* Light mode: tiny sun sparkles on right */}
        <AnimatePresence>
          {!isDark && (
            <motion.span
              key="sparkles"
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 4 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="absolute right-1.5 flex items-center gap-0.5"
            >
              <span className="h-0.5 w-0.5 rounded-full bg-yellow-100/80" />
              <span className="h-1 w-1 rounded-full bg-yellow-100/60" />
              <span className="h-0.5 w-0.5 rounded-full bg-yellow-100/80" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Dark mode: stars on left */}
        <AnimatePresence>
          {isDark && (
            <motion.span
              key="stars"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="absolute left-1.5 flex items-center gap-0.5"
            >
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                className="h-0.5 w-0.5 rounded-full bg-white/80"
              />
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
                className="h-1 w-1 rounded-full bg-white/60"
              />
              <motion.span
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.8 }}
                className="h-0.5 w-0.5 rounded-full bg-white/70"
              />
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {/* Sliding thumb */}
      <motion.span
        className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md"
        animate={{ x: isDark ? 30 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.8 }}
      >
        <AnimatePresence mode="wait">
          {!isDark ? (
            // Sun icon
            <motion.svg
              key="sun"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3 text-amber-500"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "backOut" }}
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </motion.svg>
          ) : (
            // Moon icon
            <motion.svg
              key="moon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3 text-indigo-500"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "backOut" }}
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}
