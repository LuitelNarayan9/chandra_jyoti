"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Heart } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="relative mt-auto border-t border-amber-500/10 bg-background/50 backdrop-blur-2xl px-4 py-8 text-sm md:px-6 overflow-hidden">
      {/* Subtle ambient background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[100px] rounded-full bg-amber-500/5 blur-[80px] pointer-events-none" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 md:flex-row md:items-start">
        {/* Brand & Copyright */}
        <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Logo />
            <div className="h-4 w-px bg-border/60 hidden sm:block" />
            <span className="text-xs text-muted-foreground hidden sm:flex font-medium tracking-wide items-center gap-1.5">
              Made with
              <Heart className="h-3 w-3 fill-amber-500 text-amber-500 animate-pulse" />
            </span>
          </div>
          <p className="text-xs text-muted-foreground/80 max-w-[280px]">
            © {new Date().getFullYear()} Chandra Jyoti Sanstha.{" "}
            <br className="md:hidden" /> All rights reserved.
          </p>
        </div>

        {/* Quick Links with Hover Effects */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-end">
          {[
            { name: "About", href: "/about-us" },
            { name: "Contact", href: "/contact-us" },
            { name: "Privacy", href: "/privacy" },
            { name: "Terms", href: "/terms" },
          ].map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="group relative flex items-center text-xs font-medium text-muted-foreground transition-colors hover:text-amber-600 dark:hover:text-amber-400"
            >
              <span>{link.name}</span>
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-amber-500/60 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
