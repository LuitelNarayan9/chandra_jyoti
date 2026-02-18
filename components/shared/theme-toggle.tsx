"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-7 w-14 rounded-full bg-muted animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-gradient-to-r from-amber-300 to-orange-400 dark:from-indigo-600 dark:to-violet-700"
      aria-label="Toggle theme"
      role="switch"
      aria-checked={isDark}
    >
      {/* Track decoration — stars (dark) / clouds (light) */}
      <span className="pointer-events-none absolute inset-0 flex items-center overflow-hidden rounded-full px-1.5">
        {/* Sun rays — visible in light mode */}
        <span className="absolute left-1 flex items-center gap-0.5 transition-all duration-300 dark:opacity-0 dark:translate-x-2">
          <span className="h-0.5 w-0.5 rounded-full bg-yellow-100/80" />
          <span className="h-1 w-1 rounded-full bg-yellow-100/60" />
        </span>
        {/* Stars — visible in dark mode */}
        <span className="absolute right-2 flex items-center gap-1 transition-all duration-300 opacity-0 -translate-x-2 dark:opacity-100 dark:translate-x-0">
          <span className="h-0.5 w-0.5 rounded-full bg-white/70" />
          <span className="h-1 w-1 rounded-full bg-white/50" />
          <span className="h-0.5 w-0.5 rounded-full bg-white/60" />
        </span>
      </span>

      {/* Thumb — the sliding circle */}
      <span
        className="pointer-events-none relative flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-lg ring-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] translate-x-0.5 dark:translate-x-[1.65rem]"
      >
        {/* Sun icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3 text-amber-500 transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0"
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
        </svg>

        {/* Moon icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute h-3 w-3 text-indigo-500 transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </span>
    </button>
  );
}
