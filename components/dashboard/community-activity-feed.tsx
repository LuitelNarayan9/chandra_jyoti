"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserPlus,
  FileText,
  IndianRupee,
  MessageSquare,
  Activity,
} from "lucide-react";
import type { ActivityItem } from "@/lib/queries/dashboard.queries";
import { TimeAgo } from "@/components/shared/time-ago";
import type React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommunityActivityFeedProps {
  activities: ActivityItem[];
}

type ActivityType =
  | "USER_JOINED"
  | "BLOG_PUBLISHED"
  | "DONATION_MADE"
  | "THREAD_CREATED";

interface ActivityIconConfig {
  icon: React.ElementType;
  colorClass: string; // Tailwind: text + bg tint
  glowColor: string; // CSS colour for the ping ring
}

// ─── Module-scoped constants ──────────────────────────────────────────────────

const ACTIVITY_ICONS = {
  USER_JOINED: {
    icon: UserPlus,
    colorClass: "text-blue-500 bg-blue-500/10",
    glowColor: "#3b82f6",
  },
  BLOG_PUBLISHED: {
    icon: FileText,
    colorClass: "text-violet-500 bg-violet-500/10",
    glowColor: "#8b5cf6",
  },
  DONATION_MADE: {
    icon: IndianRupee,
    colorClass: "text-emerald-500 bg-emerald-500/10",
    glowColor: "#10b981",
  },
  THREAD_CREATED: {
    icon: MessageSquare,
    colorClass: "text-amber-500 bg-amber-500/10",
    glowColor: "#f59e0b",
  },
} as const satisfies Record<ActivityType, ActivityIconConfig>;

const FALLBACK_CONFIG = ACTIVITY_ICONS.USER_JOINED;

const SAFE_PROTOCOLS = new Set(["https:", "http:"]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitiseAvatarSrc(src: string | null | undefined): string | null {
  if (!src) return null;
  try {
    const { protocol } = new URL(src);
    return SAFE_PROTOCOLS.has(protocol) ? src : null;
  } catch {
    return src.startsWith("/") ? src : null;
  }
}

function getInitialsFromName(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part.at(0) ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getActivityConfig(type: string): ActivityIconConfig {
  return (
    (ACTIVITY_ICONS as Record<string, ActivityIconConfig>)[type] ??
    FALLBACK_CONFIG
  );
}

// ─── Animation variants (module-scope → stable refs) ─────────────────────────

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
} as const;

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, ease: "easeOut" },
  },
} as const;

// ─── ActivityRow sub-component ────────────────────────────────────────────────

const ActivityRow = memo(function ActivityRow({
  activity,
  isLast,
}: {
  activity: ActivityItem;
  isLast: boolean;
}) {
  const safeAvatar = useMemo(
    () => sanitiseAvatarSrc(activity.userAvatar),
    [activity.userAvatar]
  );
  const initials = useMemo(
    () => getInitialsFromName(activity.userName),
    [activity.userName]
  );
  const config = useMemo(
    () => getActivityConfig(activity.type),
    [activity.type]
  );
  const isoDate = useMemo(
    () => activity.createdAt.toISOString(),
    [activity.createdAt]
  );

  const Icon = config.icon;

  return (
    <motion.div
      variants={rowVariants}
      className="relative flex items-start gap-4 pl-1 group"
    >
      {/* Timeline connector — all rows except the last */}
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-[1.35rem] top-9 bottom-0 w-px
            bg-gradient-to-b from-zinc-200 via-zinc-200/50 to-transparent
            dark:from-zinc-700 dark:via-zinc-700/50"
        />
      )}

      {/* Activity icon */}
      <div
        className="relative mt-0.5 z-10 shrink-0"
        aria-label={`Activity: ${activity.type}`}
      >
        {/*
         * Ping ring — pure CSS animate-ping (Tailwind keyframe, compositor thread).
         * Replaces the original JS-driven motion.div animate-ping wrapper.
         */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 group-active:opacity-30 animate-ping"
          style={{ backgroundColor: config.glowColor }}
        />
        <div
          className={`relative rounded-full p-2 shadow-sm
            ring-4 ring-white dark:ring-zinc-900
            transition-transform duration-300 group-hover:scale-110 group-active:scale-110
            ${config.colorClass}`}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      </div>

      {/* Content card */}
      <div
        className="flex-1 min-w-0 mb-1
          bg-zinc-50 dark:bg-zinc-800/40
          hover:bg-zinc-100 dark:hover:bg-zinc-800/70
          active:bg-zinc-100 dark:active:bg-zinc-800/70
          border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/60
          active:border-zinc-200 dark:active:border-zinc-700/60
          transition-colors duration-200 rounded-xl p-3"
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 ring-2 ring-white dark:ring-zinc-800 shadow-sm">
            {safeAvatar && (
              <AvatarImage src={safeAvatar} alt={activity.userName} />
            )}
            <AvatarFallback className="text-[10px] font-bold select-none bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-medium leading-relaxed text-zinc-800 dark:text-zinc-200"
              style={{ overflowWrap: "anywhere" }}
            >
              {activity.description}
            </p>
            <time
              dateTime={isoDate}
              className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 block mt-1"
            >
              <TimeAgo date={activity.createdAt} />
            </time>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = memo(function EmptyState(): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700/60 p-8 text-center bg-white dark:bg-zinc-900">
      <Activity
        className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600 mb-3"
        aria-hidden="true"
      />
      <h2 className="text-base font-semibold font-[family-name:--font-outfit] text-zinc-700 dark:text-zinc-300 mb-1">
        Community Activity
      </h2>
      <p className="text-sm text-zinc-400">
        No recent activity. The community will come alive soon!
      </p>
    </div>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

export const CommunityActivityFeed = memo(function CommunityActivityFeed({
  activities,
}: CommunityActivityFeedProps): React.JSX.Element {
  if (activities.length === 0) return <EmptyState />;

  return (
    <section aria-labelledby="activity-feed-heading">
      <h2
        id="activity-feed-heading"
        className="text-lg font-bold font-[family-name:--font-outfit]
          tracking-tight text-zinc-900 dark:text-zinc-50 mb-4"
      >
        Community Activity
      </h2>

      <div
        className="rounded-2xl border border-zinc-200/80 dark:border-zinc-700/50
          bg-white dark:bg-zinc-900
          shadow-[0_2px_12px_rgba(0,0,0,0.05)]
          p-5 sm:p-6"
      >
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          role="feed"
          aria-label="Community activity feed"
          aria-busy="false"
          className="space-y-1"
        >
          {activities.map((activity, idx) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              isLast={idx === activities.length - 1}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
});
