"use client";

import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Bell,
  Search,
  Shield,
  Activity,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Users,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SuperAdminNavbarProps {
  firstName: string;
  lastName: string;
  avatar: string | null;
  mobileSidebar: React.ReactNode;
}

const NOTIFICATIONS = [
  {
    id: 1,
    icon: AlertTriangle,
    label: "Security alert",
    desc: "Unusual login activity detected",
    time: "1m ago",
    unread: true,
    urgent: true,
  },
  {
    id: 2,
    icon: Users,
    label: "5 new user registrations",
    desc: "Pending admin approval",
    time: "8m ago",
    unread: true,
    urgent: false,
  },
  {
    id: 3,
    icon: Activity,
    label: "Server CPU spike",
    desc: "US-East peaked at 94% — resolved",
    time: "22m ago",
    unread: true,
    urgent: false,
  },
  {
    id: 4,
    icon: CheckCircle2,
    label: "Scheduled maintenance done",
    desc: "Database migration completed",
    time: "2h ago",
    unread: false,
    urgent: false,
  },
  {
    id: 5,
    icon: Users,
    label: "Role change request",
    desc: "User @m.chen requests admin access",
    time: "4h ago",
    unread: false,
    urgent: false,
  },
  {
    id: 6,
    icon: Activity,
    label: "Monthly analytics ready",
    desc: "View platform performance report",
    time: "6h ago",
    unread: false,
    urgent: false,
  },
  {
    id: 7,
    icon: CheckCircle2,
    label: "Backup completed",
    desc: "Full snapshot saved to cold storage",
    time: "8h ago",
    unread: false,
    urgent: false,
  },
  {
    id: 8,
    icon: AlertTriangle,
    label: "SSL cert expiry warning",
    desc: "api.yourplatform.com — 14 days left",
    time: "1d ago",
    unread: false,
    urgent: false,
  },
];

const QUICK_SEARCH = [
  "User Management",
  "System Logs",
  "Permission Matrix",
  "Platform Analytics",
  "Security Settings",
];

export function SuperAdminNavbar({
  firstName,
  mobileSidebar,
}: SuperAdminNavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const inputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => n.unread).length;
  const urgentCount = notifications.filter((n) => n.unread && n.urgent).length;

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
            "w-full max-w-xl overflow-hidden rounded-2xl border border-teal-500/25 bg-card",
            "shadow-[0_24px_80px_-12px_rgba(0,0,0,0.35)] transition-all duration-300",
            searchOpen ? "scale-100 translate-y-0" : "scale-95 -translate-y-4"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4 border-b border-border/60">
            <Search className="h-5 w-5 shrink-0 text-teal-500/70" />
            <input
              ref={inputRef}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Global search — users, logs, settings…"
              className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            <kbd className="shrink-0 rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-mono text-muted-foreground/60">
              ESC
            </kbd>
          </div>
          <div className="px-3 py-3 sm:px-4 sm:py-3.5 bg-muted/40">
            <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              Quick Access
            </p>
            {QUICK_SEARCH.map((item) => (
              <button
                key={item}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-teal-500/[0.08] hover:text-foreground transition-colors group"
              >
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-teal-400/50 group-hover:text-teal-400 transition-colors" />
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Navbar ─────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-[60px] sm:h-[68px] items-center border-b border-teal-500/[0.08] bg-background/90 backdrop-blur-2xl px-3 sm:px-5 md:px-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-teal-500/[0.04] via-transparent to-emerald-500/[0.025]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />

        {/* Mobile sidebar */}
        <div className="lg:hidden mr-2 sm:mr-3 shrink-0">{mobileSidebar}</div>

        {/* Logo + Badges */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/*
            Mobile: clip to logo icon only (hides text label rendered by Logo).
            sm+: show full logo + badges.
          */}
          <div className="max-w-[38px] sm:max-w-none overflow-hidden shrink-0">
            <Logo />
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Badge
              variant="outline"
              className="h-6 items-center gap-1.5 border-teal-500/30 bg-teal-500/[0.08] text-teal-600 dark:text-teal-400 text-[10px] font-bold uppercase tracking-[0.1em] px-2.5"
            >
              <Shield className="h-3 w-3" />
              Super Admin
            </Badge>

            {/* Live status — md+ only */}
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-teal-500/25 bg-teal-500/[0.07] px-2.5 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-500" />
              </span>
              <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 tracking-wide">
                Systems OK
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Right cluster */}
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-2.5">
            {/* Search pill — sm+ */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex h-8 sm:h-9 items-center gap-2 rounded-xl border border-border/60 bg-muted/50 px-2.5 sm:px-3.5 text-muted-foreground/60 hover:bg-muted hover:text-muted-foreground hover:border-border transition-all duration-200 group"
            >
              <Search className="h-4 w-4 sm:h-[17px] sm:w-[17px] text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
              <span className="hidden lg:inline text-[13px]">Search…</span>
              <kbd className="hidden lg:inline-flex items-center rounded-md border border-border/70 bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/50 shrink-0">
                Ctrl K
              </kbd>
            </button>

            {/* Search icon — mobile only */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="sm:hidden h-9 w-9 rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-teal-500/[0.08] transition-all duration-200"
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
                  "relative h-9 w-9 rounded-xl text-muted-foreground/60 hover:text-foreground",
                  "hover:bg-teal-500/[0.08] transition-all duration-200",
                  notifOpen && "bg-teal-500/[0.10] text-foreground"
                )}
              >
                <Bell className="h-[17px] w-[17px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-[9px] w-[9px]">
                    {urgentCount > 0 && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-70" />
                    )}
                    <span
                      className={cn(
                        "relative inline-flex h-[9px] w-[9px] rounded-full ring-2 ring-background",
                        urgentCount > 0 ? "bg-red-500" : "bg-teal-500"
                      )}
                    />
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
                  "sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-[360px]",
                  "border border-border bg-card",
                  "shadow-[0_4px_6px_rgba(0,0,0,0.07),0_20px_60px_-8px_rgba(0,0,0,0.22)]",
                  "dark:shadow-[0_4px_6px_rgba(0,0,0,0.3),0_20px_60px_-8px_rgba(0,0,0,0.6)]",
                  "transition-all duration-200 origin-top-right",
                  notifOpen
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none"
                )}
              >
                {/* Accent line — red if urgent, teal otherwise */}
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent to-transparent",
                    urgentCount > 0 ? "via-red-500/70" : "via-teal-500/70"
                  )}
                />

                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border bg-muted/50">
                  <div className="flex items-center gap-2.5">
                    <Bell
                      className={cn(
                        "h-4 w-4",
                        urgentCount > 0 ? "text-red-500" : "text-teal-500"
                      )}
                    />
                    <span className="text-sm font-semibold text-foreground">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span
                        className={cn(
                          "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white",
                          urgentCount > 0 ? "bg-red-500" : "bg-teal-500"
                        )}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Items */}
                <div className="max-h-[320px] sm:max-h-[380px] overflow-y-auto overscroll-contain">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    const isUrgent = n.unread && n.urgent;
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "flex items-start gap-3.5 px-4 sm:px-5 py-3.5 cursor-pointer border-b border-border/50 last:border-0 transition-colors",
                          isUrgent
                            ? "bg-red-500/[0.05] hover:bg-red-500/[0.09]"
                            : n.unread
                              ? "bg-teal-500/[0.04] hover:bg-teal-500/[0.08]"
                              : "bg-card hover:bg-muted/60"
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                            isUrgent
                              ? "bg-red-500/10 border-red-500/25"
                              : n.unread
                                ? "bg-teal-500/10 border-teal-500/20"
                                : "bg-muted border-border"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              isUrgent
                                ? "text-red-500"
                                : n.unread
                                  ? "text-teal-500 dark:text-teal-400"
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
                          <p
                            className={cn(
                              "text-[11px] font-medium mt-1",
                              isUrgent
                                ? "text-red-500/60"
                                : "text-teal-600/60 dark:text-teal-400/50"
                            )}
                          >
                            {n.time}
                          </p>
                        </div>
                        {n.unread && (
                          <div
                            className={cn(
                              "mt-2 shrink-0 h-2 w-2 rounded-full ring-2",
                              isUrgent
                                ? "bg-red-500 ring-red-500/20"
                                : "bg-teal-500 ring-teal-500/20"
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="border-t border-border bg-muted/50 px-4 sm:px-5 py-3.5">
                  <button className="w-full text-center text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors">
                    View all notifications →
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-5 w-px bg-border/50" />

            <ThemeToggle />

            {/* User avatar */}
            <div className="relative group flex items-center pl-3">
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm pointer-events-none" />
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox:
                      "h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-border hover:ring-teal-500/40 transition-all duration-200",
                  },
                }}
              />
            </div>
          </div>
        </TooltipProvider>
      </header>

      {/* Spacer */}
      <div className="h-[60px] sm:h-[68px]" />
    </>
  );
}
