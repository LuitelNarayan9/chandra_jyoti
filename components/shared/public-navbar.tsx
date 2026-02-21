"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About" },
  { href: "/contact-us", label: "Contact" },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-stone-900/10 dark:border-white/5 bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-xl shadow-sm shadow-black/5"
          : "border-transparent bg-transparent text-white"
      )}
    >
      <div className="flex h-18 w-full max-w-full items-center px-5 sm:px-8 lg:px-10 gap-8">
        {/* ─── LEFT: Logo ──────────────────────────────────── */}
        <Logo />

        {/* ─── CENTER-LEFT: Nav links (immediately after logo) ─ */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-full",
                pathname === link.href
                  ? "text-stone-900 dark:text-stone-100"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              )}
            >
              {pathname === link.href && (
                <motion.span
                  layoutId="navbar-pill"
                  className="absolute inset-0 rounded-full bg-stone-100 dark:bg-stone-800"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.55 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* ─── RIGHT: Theme toggle + Auth buttons ──────────── */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <ThemeToggle />

          {/* Visual divider */}
          <div className="h-5 w-px bg-stone-200 dark:bg-stone-700" />

          <SignedOut>
            <SignInButton>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-full px-5 text-sm font-semibold bg-violet-500 hover:bg-violet-600 dark:bg-black dark:hover:bg-stone-500 hover:text-white dark:text-white text-white border-0 shadow-none transition-all duration-200 hover:scale-[1.02]"
              >
                Log in
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button
                size="sm"
                className="h-9 rounded-full px-5 text-sm font-semibold bg-stone-900 hover:bg-stone-700 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-stone-950 text-white border-0 shadow-none transition-all duration-200 hover:scale-[1.02]"
              >
                Register
              </Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-full px-5 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              asChild
            >
              <Link href="/home">Dashboard</Link>
            </Button>
            <UserButton />
          </SignedIn>
        </div>

        {/* ─── MOBILE: Theme toggle + Hamburger ────────────── */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <Menu className="h-5 w-5 text-stone-700 dark:text-stone-300" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-72 bg-stone-50 dark:bg-stone-950 border-l border-stone-200 dark:border-stone-800 p-0"
            >
              <SheetTitle className="sr-only">Navigation</SheetTitle>

              {/* Sheet header */}
              <div className="flex items-center px-6 h-18 border-b border-stone-100 dark:border-stone-900">
                <Logo />
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-1 p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-200",
                      pathname === link.href
                        ? "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                        : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-stone-200"
                    )}
                  >
                    {pathname === link.href && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-amber-500" />
                    )}
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Auth buttons pinned to bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-100 dark:border-stone-900 flex flex-col gap-2 bg-stone-50 dark:bg-stone-950">
                <SignedOut>
                  <SignInButton>
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                      onClick={() => setOpen(false)}
                    >
                      Log in
                    </Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button
                      className="w-full rounded-full bg-stone-900 dark:bg-amber-400 dark:text-stone-950 text-white font-semibold border-0"
                      onClick={() => setOpen(false)}
                    >
                      Register
                    </Button>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    asChild
                  >
                    <Link href="/home" onClick={() => setOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <div className="flex justify-center pt-1">
                    <UserButton />
                  </div>
                </SignedIn>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
