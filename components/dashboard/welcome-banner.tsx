"use client";

import { memo, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Flag,
} from "lucide-react";
import { Role, hasPermission } from "@/lib/roles";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WelcomeBannerProps {
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: Role;
  pendingApprovals?: number;
  pendingReports?: number;
  pendingFines?: number;
}

interface BannerState {
  formattedDate: string;
  isoDate: string;
  greeting: string;
  quote: string;
}

// ─── Module-scoped constants (created once, never GC'd between renders) ───────

const COMMUNITY_QUOTES = [
  "Together we grow, together we thrive. 🌿",
  "Our heritage connects us, our future unites us. 🤝",
  "Every family strengthens our community. 🏡",
  "Preserving the past, building the future. ✨",
  "United in community, strong in purpose. 💪",
] as const;

/**
 * Built once at module load. The Intl.DateTimeFormat constructor is
 * notably expensive — reusing a cached instance avoids the overhead
 * on every component mount.
 */
const DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

/** Permitted avatar URL protocols — blocks javascript: / data: URIs. */
const SAFE_PROTOCOLS = new Set(["https:", "http:"]);

// ─── Animation variants (module-scope → stable refs, no re-alloc) ─────────────

const containerVariants = {
  hidden: { opacity: 0, y: -14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
} as const;

const headingVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.18, duration: 0.4, ease: "easeOut" },
  },
} as const;

const metaVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.34, duration: 0.4 },
  },
} as const;

const badgesVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay: 0.28, duration: 0.35, ease: "easeOut" },
  },
} as const;

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getDayOfYear(now: Date): number {
  const yearStart = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - yearStart.getTime()) / 86_400_000);
}

/**
 * Validates an avatar src string. Returns null for anything that isn't
 * an explicit https/http URL or a root-relative path, preventing
 * javascript: / data: URI injection when src is reflected into the DOM.
 */
function sanitiseAvatarSrc(src: string | null): string | null {
  if (!src) return null;
  try {
    const { protocol } = new URL(src);
    return SAFE_PROTOCOLS.has(protocol) ? src : null;
  } catch {
    // URL constructor throws for relative paths — those are safe too
    return src.startsWith("/") && !src.startsWith("//") ? src : null;
  }
}

/** Extracts up to two uppercase initials; safe against empty strings. */
function getInitials(first: string, last: string): string {
  return `${first.at(0) ?? ""}${last.at(0) ?? ""}`.toUpperCase();
}

/** Converts ROLE_ENUM_VALUE → "Role Enum Value"-style display label. */
function formatRoleLabel(role: string): string {
  return role.replaceAll("_", " ");
}

// ─── NotificationBadges sub-component ────────────────────────────────────────

interface NotificationBadgesProps {
  pendingApprovals: number;
  pendingReports: number;
  pendingFines: number;
}

const NotificationBadges = memo(function NotificationBadges({
  pendingApprovals,
  pendingReports,
  pendingFines,
}: NotificationBadgesProps) {
  const total = pendingApprovals + pendingReports + pendingFines;
  if (total === 0) return null;

  return (
    <motion.div
      variants={badgesVariants}
      className="flex gap-2 flex-wrap md:justify-end"
      role="status"
      aria-label="Pending admin tasks"
    >
      {pendingApprovals > 0 && (
        <Badge
          variant="secondary"
          className="gap-1.5 text-[11px] font-semibold tracking-wide"
          aria-label={`${pendingApprovals} pending approval${pendingApprovals !== 1 ? "s" : ""}`}
        >
          <ClipboardList className="h-3 w-3 shrink-0" aria-hidden="true" />
          {pendingApprovals} approval{pendingApprovals !== 1 ? "s" : ""}
        </Badge>
      )}
      {pendingReports > 0 && (
        <Badge
          variant="destructive"
          className="gap-1.5 text-[11px] font-semibold tracking-wide"
          aria-label={`${pendingReports} pending report${pendingReports !== 1 ? "s" : ""}`}
        >
          <Flag className="h-3 w-3 shrink-0" aria-hidden="true" />
          {pendingReports} report{pendingReports !== 1 ? "s" : ""}
        </Badge>
      )}
      {pendingFines > 0 && (
        <Badge
          variant="outline"
          className="gap-1.5 text-[11px] font-semibold tracking-wide border-amber-500/50 text-amber-600 dark:text-amber-400 dark:border-amber-400/40"
          aria-label={`${pendingFines} pending fine${pendingFines !== 1 ? "s" : ""}`}
        >
          <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
          {pendingFines} fine{pendingFines !== 1 ? "s" : ""}
        </Badge>
      )}
    </motion.div>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

export const WelcomeBanner = memo(function WelcomeBanner({
  firstName,
  lastName,
  avatar,
  role,
  pendingApprovals = 0,
  pendingReports = 0,
  pendingFines = 0,
}: WelcomeBannerProps) {
  // Consolidated state object → only one re-render when the effect fires
  const [state, setState] = useState<BannerState>({
    formattedDate: "",
    isoDate: "",
    greeting: "Welcome",
    quote: "",
  });

  useEffect(() => {
    const now = new Date();
    setState({
      formattedDate: DATE_FORMATTER.format(now),
      isoDate: now.toISOString().split("T")[0],
      greeting: getGreeting(now.getHours()),
      // Day-of-year keeps the quote deterministic across SSR/CSR, preventing
      // a hydration mismatch that Math.random() would cause.
      quote: COMMUNITY_QUOTES[getDayOfYear(now) % COMMUNITY_QUOTES.length],
    });
  }, []); // intentionally empty — date/greeting won't change mid-session

  // Derived values — memoised so they only recompute when inputs change
  const isAdmin = useMemo(() => hasPermission(role, "ADMIN"), [role]);
  const initials = useMemo(
    () => getInitials(firstName, lastName),
    [firstName, lastName]
  );
  const safeSrc = useMemo(() => sanitiseAvatarSrc(avatar), [avatar]);
  const roleLabel = useMemo(() => formatRoleLabel(role), [role]);

  const { formattedDate, isoDate, greeting, quote } = state;

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={`Welcome banner for ${firstName} ${lastName}`}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl
        border border-white/20 dark:border-white/[0.08]
        bg-linear-to-br
        from-indigo-500/[0.11] via-violet-500/[0.07] to-emerald-500/[0.11]
        dark:from-indigo-500/[0.20] dark:via-violet-500/[0.11] dark:to-emerald-500/[0.20]
        backdrop-blur-2xl
        shadow-[0_8px_32px_rgba(0,0,0,0.06)]
        dark:shadow-[0_8px_40px_rgba(0,0,0,0.28)]
        hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)]
        dark:hover:shadow-[0_12px_48px_rgba(0,0,0,0.38)]
        transition-shadow duration-500
        p-5 sm:p-7 lg:p-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24
          h-72 w-72 rounded-full
          bg-indigo-500/[0.18] dark:bg-indigo-400/[0.22]
          blur-[96px]
          animate-[orb-breathe_9s_ease-in-out_infinite]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24
          h-64 w-64 rounded-full
          bg-emerald-500/[0.18] dark:bg-emerald-400/[0.22]
          blur-[96px]
          animate-[orb-breathe_11s_ease-in-out_infinite_1.5s]"
      />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col gap-5 sm:gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left column: Avatar + greeting */}
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar
              className="h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]
                ring-[3px] ring-white/60 dark:ring-white/[0.12]
                shadow-lg"
            >
              {safeSrc ? (
                <Image
                  src={safeSrc}
                  alt={`${firstName} ${lastName}`}
                  fill
                  sizes="(max-width: 640px) 64px, 72px"
                  className="rounded-full object-cover"
                  priority
                />
              ) : (
                <AvatarFallback
                  className="bg-gradient-to-br from-indigo-500 to-violet-600
                    text-white font-semibold text-lg sm:text-xl select-none"
                >
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>

            {/* Online / active presence indicator */}
            <span
              aria-hidden="true"
              className="absolute bottom-0.5 right-0.5
                h-3 w-3 rounded-full
                bg-emerald-500
                ring-2 ring-white dark:ring-background
                shadow-sm"
            />
          </div>

          {/* Greeting text + meta chips */}
          <div className="flex flex-col justify-center min-w-0">
            <motion.h1
              variants={headingVariants}
              className="text-2xl sm:text-3xl md:text-[2rem]
                font-bold font-[family-name:--font-outfit]
                tracking-tight leading-tight truncate"
            >
              {greeting},{" "}
              <span
                className="bg-gradient-to-r
                  from-indigo-600 to-emerald-600
                  dark:from-indigo-400 dark:to-emerald-400
                  bg-clip-text text-transparent"
              >
                {firstName}!
              </span>
            </motion.h1>

            <motion.div
              variants={metaVariants}
              className="flex flex-wrap items-center gap-2 mt-2"
            >
              {/* Date chip — rendered only after client hydration to prevent
                  SSR mismatch; empty string is falsy so nothing flashes. */}
              {formattedDate && (
                <span
                  className="inline-flex items-center gap-1.5
                    bg-background/60 dark:bg-background/25
                    border border-black/[0.06] dark:border-white/[0.08]
                    px-2.5 py-1 rounded-full
                    text-xs font-medium text-foreground/75
                    shadow-sm backdrop-blur-sm"
                >
                  <CalendarDays
                    className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 shrink-0"
                    aria-hidden="true"
                  />
                  <time dateTime={isoDate}>{formattedDate}</time>
                </span>
              )}

              {/* Role badge */}
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-widest font-semibold
                  bg-background/60 dark:bg-background/25
                  backdrop-blur-sm
                  border-indigo-400/25 dark:border-indigo-400/20
                  shadow-sm px-2.5 py-1"
              >
                <ShieldCheck
                  className="h-3.5 w-3.5 mr-1.5 text-emerald-500 dark:text-emerald-400 shrink-0"
                  aria-hidden="true"
                />
                {roleLabel}
              </Badge>
            </motion.div>
          </div>
        </div>

        {/* Right column: Quote + notification badges */}
        <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
          {/* Community quote — hidden on mobile to keep layout clean */}
          {quote && (
            <p
              className="hidden md:block
                text-sm text-muted-foreground/75
                italic max-w-[18rem] text-right leading-relaxed"
            >
              <q>{quote}</q>
            </p>
          )}

          {isAdmin && (
            <NotificationBadges
              pendingApprovals={pendingApprovals}
              pendingReports={pendingReports}
              pendingFines={pendingFines}
            />
          )}
        </div>
      </div>
    </motion.section>
  );
});
