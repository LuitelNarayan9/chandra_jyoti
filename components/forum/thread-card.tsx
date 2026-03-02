"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Pin,
  Lock,
  MessageSquare,
  Eye,
  CheckCircle2,
  XCircle,
  Circle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ThreadStatus = "OPEN" | "RESOLVED" | "CLOSED";

interface ThreadCardProps {
  thread: {
    id: string;
    title: string;
    slug: string;
    isPinned: boolean;
    isLocked: boolean;
    status: ThreadStatus;
    views: number;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      firstName: string;
      lastName: string;
      avatar: string | null;
    };
    tags: {
      tag: { id: string; name: string; slug: string };
    }[];
    _count: { replies: number };
  };
  categorySlug: string;
  index?: number;
}

const STATUS_CONFIG: Record<
  ThreadStatus,
  { label: string; icon: typeof Circle; color: string; bg: string; dot: string }
> = {
  OPEN: {
    label: "Open",
    icon: Circle,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200/60 dark:border-blue-500/20",
    dot: "bg-blue-500",
  },
  CLOSED: {
    label: "Closed",
    icon: XCircle,
    color: "text-neutral-500 dark:text-neutral-400",
    bg: "bg-neutral-100 dark:bg-neutral-500/10 border-neutral-200/60 dark:border-neutral-500/20",
    dot: "bg-neutral-400",
  },
};

export function ThreadCard({
  thread,
  categorySlug,
  index = 0,
}: ThreadCardProps) {
  const initials =
    (thread.author.firstName?.[0] ?? "") + (thread.author.lastName?.[0] ?? "");
  const statusCfg = STATUS_CONFIG[thread.status];
  const StatusIcon = statusCfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={`/forum/${categorySlug}/${thread.slug}`}
        className="block group"
      >
        <div
          className={cn(
            "relative flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300",
            "border border-border/30 bg-card/60 backdrop-blur-sm",
            "hover:border-primary/20 hover:bg-card hover:shadow-md hover:shadow-primary/5",
            "hover:-translate-y-px",
            thread.isPinned &&
              "bg-amber-50/50 dark:bg-amber-500/5 border-amber-200/50 dark:border-amber-500/15"
          )}
        >
          {/* Pinned indicator bar */}
          {thread.isPinned && (
            <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-amber-400 dark:bg-amber-500" />
          )}

          {/* Left: avatar */}
          <Avatar className="h-10 w-10 ring-2 ring-background shadow-md shrink-0">
            <AvatarImage src={thread.author.avatar ?? undefined} />
            <AvatarFallback className="text-[11px] font-bold bg-linear-to-br from-primary/15 to-primary/5 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Middle: content */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Title row */}
            <div className="flex items-center gap-2 flex-wrap">
              {thread.isPinned && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Pin className="h-3 w-3 -rotate-45" />
                  Pinned
                </span>
              )}
              {thread.isLocked && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">
                  <Lock className="h-3 w-3" />
                  Locked
                </span>
              )}
              <h3 className="text-[14px] font-semibold leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-1">
                {thread.title}
              </h3>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-2.5 flex-wrap text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground/70">
                {thread.author.firstName} {thread.author.lastName}
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span>
                {formatDistanceToNow(new Date(thread.createdAt), {
                  addSuffix: true,
                })}
              </span>

              {/* Tags */}
              {thread.tags.slice(0, 3).map(({ tag }) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary/5 text-primary/70 text-[10px] font-medium border border-primary/10"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>

          {/* Right: stats column */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Status badge */}
            <span
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold border text-[10px] tracking-wide",
                statusCfg.bg,
                statusCfg.color
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {statusCfg.label}
            </span>

            {/* Stats */}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span
                className="flex items-center gap-1.5 tabular-nums"
                title="Replies"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {thread._count.replies}
              </span>
              <span
                className="flex items-center gap-1.5 tabular-nums"
                title="Views"
              >
                <Eye className="h-3.5 w-3.5" />
                {formatCount(thread.views)}
              </span>
            </div>

            {/* Arrow indicator */}
            <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors duration-200 shrink-0" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}
