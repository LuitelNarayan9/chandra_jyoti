"use client";

import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Bell,
  Search,
  Command,
  X,
  BookOpen,
  LayoutDashboard,
  Award,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MemberNavbarProps {
  firstName: string;
  lastName: string;
  avatar: string | null;
  mobileSidebar: React.ReactNode;
}

const NOTIFICATIONS = [
  {
    id: 1,
    icon: BookOpen,
    label: "New course module available",
    desc: "Advanced React Patterns — Ch. 4",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    icon: Award,
    label: "Assignment feedback ready",
    desc: "Your submission scored 94/100",
    time: "1h ago",
    unread: true,
  },
  {
    id: 3,
    icon: LayoutDashboard,
    label: "Weekly digest is here",
    desc: "Your learning stats for this week",
    time: "3h ago",
    unread: false,
  },
];

const QUICK_LINKS = [
  { label: "My Courses", icon: BookOpen },
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Certificates", icon: Award },
];

export function MemberNavbar({ firstName, mobileSidebar }: MemberNavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchValue("");
        setNotifOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <>
      {/* ── Search overlay ─────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-3 sm:pt-[15vh] sm:px-4",
          "bg-black/50 backdrop-blur-md transition-all duration-300",
          searchOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => {
          setSearchOpen(false);
          setSearchValue("");
        }}
      >
        <div
          className={cn(
            "w-full max-w-lg overflow-hidden rounded-2xl border border-indigo-500/25 bg-card",
            "shadow-[0_24px_80px_-12px_rgba(0,0,0,0.35)] transition-all duration-300",
            searchOpen ? "scale-100 translate-y-0" : "scale-95 -translate-y-4"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4 border-b border-border/60">
            <Search className="h-5 w-5 shrink-0 text-indigo-500/70" />
            <input
              ref={inputRef}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search courses, lessons, resources…"
              className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            <div className="flex items-center gap-2 shrink-0">
              <kbd className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-mono text-muted-foreground/60">
                ESC
              </kbd>
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchValue("");
                }}
                className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="px-3 py-3 sm:px-4 sm:py-3.5 bg-muted/40">
            <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              Quick Access
            </p>
            {QUICK_LINKS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-indigo-500/[0.08] hover:text-foreground transition-colors group"
              >
                <Icon className="h-4 w-4 shrink-0 text-indigo-400/50 group-hover:text-indigo-400 transition-colors" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Navbar ─────────────────────────────────────── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex h-[60px] sm:h-[68px] items-center px-3 sm:px-5 md:px-8",
          "bg-background/90 backdrop-blur-2xl border-b transition-all duration-300",
          scrolled
            ? "border-border/60 shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_32px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_0_rgba(255,255,255,0.03),0_8px_32px_-4px_rgba(0,0,0,0.4)]"
            : "border-transparent"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/[0.025] via-transparent to-violet-500/[0.02]" />
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-300",
            "bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent",
            scrolled ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Mobile sidebar */}
        <div className="lg:hidden mr-2 sm:mr-3 shrink-0">{mobileSidebar}</div>

        {/* Logo + Greeting */}
        <div className="flex items-center gap-3 min-w-0">
          {/*
            Mobile: clip logo wrapper to icon width only (hides text portion).
            sm+: show full logo with greeting beside it.
          */}
          <div className="max-w-[38px] sm:max-w-none overflow-hidden shrink-0">
            <Logo />
          </div>

          {/* Greeting — hidden on mobile, shown on lg+ */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="h-5 w-px bg-border/50" />
            <div className="flex flex-col justify-center gap-0.5">
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-indigo-400/60 leading-none">
                {greeting}
              </span>
              <span className="text-[13px] font-medium text-foreground/80 leading-none">
                {firstName} <span className="text-indigo-400/60">✦</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Right cluster */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-2.5">
          {/* Search pill — sm+ */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex h-8 sm:h-9 items-center gap-2 rounded-xl border border-border/60 bg-muted/50 px-2.5 sm:px-3.5 text-muted-foreground/60 hover:bg-muted hover:text-muted-foreground hover:border-border transition-all duration-200 group"
          >
            <Search className="h-4 w-4 sm:h-[17px] sm:w-[17px] text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
            <span className="hidden lg:inline text-[13px]">Search…</span>
            <div className="hidden lg:flex items-center gap-0.5 rounded-md border border-border/70 bg-background px-1.5 py-0.5 shrink-0">
              <Command className="h-3 w-3 text-muted-foreground/50" />
              <span className="text-[10px] font-mono text-muted-foreground/50">
                K
              </span>
            </div>
          </button>

          {/* Search icon — mobile only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="sm:hidden h-9 w-9 rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-indigo-500/[0.08] transition-all duration-200"
          >
            <Search className="h-[17px] w-[17px]" />
          </Button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotifOpen((v) => !v)}
              className={cn(
                "relative h-10 w-10 rounded-xl text-muted-foreground/60 hover:text-foreground",
                "hover:bg-indigo-500/[0.08] transition-all duration-200",
                notifOpen && "bg-indigo-500/[0.10] text-foreground"
              )}
            >
              <Bell className="h-[17px] w-[17px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-[9px] w-[9px]">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-70" />
                  <span className="relative inline-flex h-[9px] w-[9px] rounded-full bg-indigo-500 ring-2 ring-background" />
                </span>
              )}
            </Button>

            {/*
                Mobile: fixed full-width panel below navbar
                sm+: absolute dropdown from button
              */}
            <div
              className={cn(
                "fixed inset-x-3 top-[68px] z-50 overflow-hidden rounded-2xl",
                "sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-[340px]",
                "border border-border bg-card",
                "shadow-[0_4px_6px_rgba(0,0,0,0.07),0_20px_60px_-8px_rgba(0,0,0,0.22)]",
                "dark:shadow-[0_4px_6px_rgba(0,0,0,0.3),0_20px_60px_-8px_rgba(0,0,0,0.6)]",
                "transition-all duration-200 origin-top-right",
                notifOpen
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              )}
            >
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent" />

              {/* Header */}
              <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border bg-muted/50">
                <div className="flex items-center gap-2.5">
                  <Bell className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-semibold text-foreground">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-400 transition-colors"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Items */}
              <div className="max-h-[300px] sm:max-h-[340px] overflow-y-auto overscroll-contain">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        "flex items-start gap-3.5 px-4 sm:px-5 py-3.5 cursor-pointer border-b border-border/50 last:border-0 transition-colors",
                        n.unread
                          ? "bg-indigo-500/[0.05] hover:bg-indigo-500/[0.09]"
                          : "bg-card hover:bg-muted/60"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                          n.unread
                            ? "bg-indigo-500/10 border-indigo-500/20"
                            : "bg-muted border-border"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            n.unread
                              ? "text-indigo-500 dark:text-indigo-400"
                              : "text-muted-foreground/40"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm leading-snug",
                            n.unread
                              ? "font-semibold text-foreground"
                              : "font-medium text-muted-foreground/80"
                          )}
                        >
                          {n.label}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">
                          {n.desc}
                        </p>
                        <p className="text-[11px] font-medium text-indigo-500/60 dark:text-indigo-400/50 mt-1">
                          {n.time}
                        </p>
                      </div>
                      {n.unread && (
                        <div className="mt-2 shrink-0 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-indigo-500/20" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-border bg-muted/50 px-4 sm:px-5 py-3.5">
                <button className="w-full text-center text-xs font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-400 transition-colors">
                  View all notifications →
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-6 w-0.5 bg-border/100 " />

          <ThemeToggle />

          {/* User avatar */}
          <div className="relative group pl-3 flex items-center">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm pointer-events-none" />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox:
                    "h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-border hover:ring-indigo-500/40 transition-all duration-200",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-[60px] sm:h-[68px]" />
    </>
  );
}
