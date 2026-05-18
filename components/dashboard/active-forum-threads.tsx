"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, ArrowRight, Eye, MessagesSquare } from "lucide-react";
import { TimeAgo } from "@/components/shared/time-ago";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ThreadData {
  id: string;
  title: string;
  slug: string;
  views: number;
  updatedAt: Date;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  category: { name: string; slug: string; color: string | null };
  _count: { replies: number };
}

interface ActiveForumThreadsProps {
  threads: ThreadData[];
}

// ─── Module-scoped constants ──────────────────────────────────────────────────

/** Built once — 1200 → "1.2K", 4_500_000 → "4.5M" */
const COMPACT_NUM = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const SAFE_PROTOCOLS = new Set(["https:", "http:"]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitiseAvatarSrc(src: string | null): string | null {
  if (!src) return null;
  try {
    const { protocol } = new URL(src);
    return SAFE_PROTOCOLS.has(protocol) ? src : null;
  } catch {
    return src.startsWith("/") ? src : null;
  }
}

function getInitials(first: string, last: string): string {
  return `${first.at(0) ?? ""}${last.at(0) ?? ""}`.toUpperCase();
}

/** Validates colour is a safe CSS value before using as inline style. */
function safeColour(colour: string | null, fallback = "#6366f1"): string {
  if (!colour) return fallback;
  if (typeof CSS !== "undefined" && CSS.supports("color", colour))
    return colour;
  return /^#[0-9a-fA-F]{3,8}$/.test(colour) ? colour : fallback;
}

// ─── Animation variants (module-scope → stable refs) ─────────────────────────

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
} as const;

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, ease: "easeOut" },
  },
} as const;

// ─── ForumThreadRow sub-component ─────────────────────────────────────────────

const ForumThreadRow = memo(function ForumThreadRow({
  thread,
}: {
  thread: ThreadData;
}) {
  const safeAvatar = useMemo(
    () => sanitiseAvatarSrc(thread.author.avatar),
    [thread.author.avatar]
  );
  const initials = useMemo(
    () => getInitials(thread.author.firstName, thread.author.lastName),
    [thread.author.firstName, thread.author.lastName]
  );
  const accent = useMemo(
    () => safeColour(thread.category.color),
    [thread.category.color]
  );
  const isoDate = useMemo(
    () => thread.updatedAt.toISOString(),
    [thread.updatedAt]
  );
  const compactViews = useMemo(
    () => COMPACT_NUM.format(thread.views),
    [thread.views]
  );

  return (
    <motion.div variants={rowVariants}>
      <Link
        href={`/forum/${thread.category.slug}/${thread.slug}`}
        className={cn(
          "group relative flex flex-col sm:flex-row sm:items-center",
          "gap-3 px-4 py-4 sm:px-5",
          "hover:bg-zinc-50 dark:hover:bg-white/3",
          "active:bg-zinc-50 dark:active:bg-white/3",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-inset focus-visible:ring-indigo-500"
        )}
        aria-label={`Forum thread: ${thread.title}`}
      >
        {/* Left accent bar — real element, not CSS pseudo (more reliable) */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm",
            "origin-center scale-y-0 group-hover:scale-y-100 group-active:scale-y-100",
            "transition-transform duration-300",
            "ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          )}
          style={{ background: accent }}
        />

        {/* ── Avatar + title + category ── */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          <Avatar className="h-9 w-9 shrink-0 ring-2 ring-white dark:ring-zinc-800 shadow-sm">
            {safeAvatar && (
              <AvatarImage
                src={safeAvatar}
                alt={`${thread.author.firstName} ${thread.author.lastName}`}
              />
            )}
            <AvatarFallback
              className="text-[11px] font-bold select-none text-white"
              style={{ background: accent }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-sm font-semibold leading-snug truncate",
                "text-zinc-900 dark:text-zinc-50",
                "transition-colors duration-150",
                "group-hover:text-accent group-active:text-accent"
              )}
            >
              {thread.title}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-semibold px-2 py-0",
                  "bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm shadow-sm"
                )}
                style={{ borderColor: `${accent}55`, color: accent }}
              >
                {thread.category.name}
              </Badge>
              <span className="text-[11px] font-medium text-zinc-400 truncate">
                by {thread.author.firstName} {thread.author.lastName}
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats + time chip ── */}
        <div
          className={cn(
            "flex items-center justify-between sm:justify-end",
            "gap-4 shrink-0 pl-[52px] sm:pl-0"
          )}
        >
          <div className="flex items-center gap-3" aria-label="Thread stats">
            <span
              className={cn(
                "flex items-center gap-1.5 text-[12px] font-medium",
                "text-zinc-400 group-hover:text-blue-500 group-active:text-blue-500 transition-colors duration-150"
              )}
              aria-label={`${thread._count.replies} replies`}
            >
              <MessageCircle
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
              {thread._count.replies}
            </span>
            <span
              className={cn(
                "flex items-center gap-1.5 text-[12px] font-medium",
                "text-zinc-400 group-hover:text-emerald-500 group-active:text-emerald-500 transition-colors duration-150"
              )}
              aria-label={`${thread.views} views`}
            >
              <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {compactViews}
            </span>
          </div>

          <time
            dateTime={isoDate}
            className={cn(
              "text-[11px] font-medium text-zinc-400 dark:text-zinc-500",
              "bg-zinc-100 dark:bg-zinc-800/80",
              "border border-zinc-200 dark:border-zinc-700/60",
              "px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap"
            )}
          >
            <TimeAgo date={thread.updatedAt} />
          </time>
        </div>
      </Link>
    </motion.div>
  );
});

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = memo(function EmptyState(): React.JSX.Element {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-zinc-200",
        "dark:border-zinc-700/60 p-8 text-center bg-white dark:bg-zinc-900"
      )}
    >
      <MessagesSquare
        className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600 mb-3"
        aria-hidden="true"
      />
      <h2
        className={cn(
          "text-base font-semibold font-[--font-outfit]",
          "text-zinc-700 dark:text-zinc-300 mb-1"
        )}
      >
        Active Forum Threads
      </h2>
      <p className="text-sm text-zinc-400">
        No active threads yet. Start a discussion!
      </p>
    </div>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

export const ActiveForumThreads = memo(function ActiveForumThreads({
  threads,
}: ActiveForumThreadsProps): React.JSX.Element {
  if (threads.length === 0) return <EmptyState />;

  return (
    <section aria-labelledby="forum-threads-heading">
      <div className="flex items-center justify-between mb-4">
        <h2
          id="forum-threads-heading"
          className={cn(
            "text-lg font-bold font-[--font-outfit]",
            "tracking-tight text-zinc-900 dark:text-zinc-50"
          )}
        >
          Active Forum Threads
        </h2>
        <Link
          href="/forum"
          className={cn(
            "group inline-flex items-center gap-1.5",
            "text-xs font-bold tracking-widest uppercase",
            "text-indigo-600 dark:text-indigo-400",
            "hover:text-indigo-700 transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
          )}
          aria-label="View all forum threads"
        >
          View All
          <ArrowRight
            className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-200"
            aria-hidden="true"
          />
        </Link>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        role="list"
        aria-label="Active forum threads"
        className={cn(
          "rounded-2xl overflow-hidden",
          "border border-zinc-200/80 dark:border-zinc-700/50",
          "bg-white dark:bg-zinc-900",
          "shadow-[0_2px_12px_rgba(0,0,0,0.05)]",
          "divide-y divide-zinc-100 dark:divide-zinc-800"
        )}
      >
        {threads.map((thread) => (
          <div key={thread.id} role="listitem">
            <ForumThreadRow thread={thread} />
          </div>
        ))}
      </motion.div>
    </section>
  );
});
