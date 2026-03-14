import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  MessageSquare,
  Eye,
  Clock,
  Pin,
  Lock,
  CheckCircle2,
  XCircle,
  Circle,
} from "lucide-react";

import { getCurrentDbUser } from "@/lib/auth";
import { getThreadBySlug } from "@/lib/queries/forum.queries";
import { incrementThreadViews } from "@/lib/actions/forum.actions";
import type { Role } from "@/lib/roles";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { RichTextViewer } from "@/components/shared/rich-text-viewer";
import { ReplyList } from "@/components/forum/reply-list";
import { ReplyForm } from "@/components/forum/reply-form";
import { ThreadActions } from "@/components/forum/thread-actions";
import { VoteButtons } from "@/components/forum/vote-buttons";
import { PollWidget } from "@/components/forum/poll-widget";

// ── Types ────────────────────────────────────────────────────

type ThreadStatus = "OPEN" | "RESOLVED" | "CLOSED";

const STATUS_CONFIG: Record<
  ThreadStatus,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  OPEN: {
    label: "Open",
    icon: Circle,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
  },
  CLOSED: {
    label: "Closed",
    icon: XCircle,
    color: "text-neutral-500 dark:text-neutral-400",
    bg: "bg-neutral-50 dark:bg-neutral-500/10 border-neutral-200 dark:border-neutral-500/20",
  },
};

// ── Metadata ─────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ categorySlug: string; threadSlug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categorySlug, threadSlug } = await params;
  const thread = await getThreadBySlug(categorySlug, threadSlug);
  if (!thread) return { title: "Thread Not Found" };

  return {
    title: `${thread.title} | Forum | Chandra Jyoti Sanstha`,
    description: thread.content.replace(/<[^>]+>/g, "").substring(0, 160),
  };
}

// ── Page ─────────────────────────────────────────────────────

export default async function ThreadDetailPage({ params }: PageProps) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  const { categorySlug, threadSlug } = await params;
  const thread = await getThreadBySlug(categorySlug, threadSlug);
  if (!thread) notFound();

  // Fire-and-forget view increment
  incrementThreadViews(thread.id);

  const statusCfg = STATUS_CONFIG[thread.status as ThreadStatus];
  const StatusIcon = statusCfg.icon;
  const initials =
    (thread.author.firstName?.[0] ?? "") + (thread.author.lastName?.[0] ?? "");

  return (
    <div className="min-h-screen pb-20">
      {/* ── Breadcrumb bar ── */}
      <div className="border-b border-border/50 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-6 px-2 text-xs gap-1 rounded-md hover:text-foreground"
          >
            <Link href="/forum">
              <ArrowLeft className="h-3 w-3" />
              Forum
            </Link>
          </Button>
          <span>/</span>
          <Link
            href={`/forum/${categorySlug}`}
            className="hover:text-foreground transition-colors"
          >
            {thread.category.name}
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* ── Thread header ── */}
        <div className="space-y-4">
          {/* Indicators */}
          <div className="flex items-center gap-2 flex-wrap">
            {thread.isPinned && (
              <Badge
                variant="outline"
                className="text-[10px] gap-1 rounded-full bg-primary/5 text-primary border-primary/20"
              >
                <Pin className="h-3 w-3 -rotate-45" />
                Pinned
              </Badge>
            )}
            {thread.isLocked && (
              <Badge
                variant="outline"
                className="text-[10px] gap-1 rounded-full bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-400/20"
              >
                <Lock className="h-3 w-3" />
                Locked
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`text-[10px] gap-1 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}
            >
              <StatusIcon className="h-3 w-3" />
              {statusCfg.label}
            </Badge>
          </div>

          {/* Title + Actions */}
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight font-(family-name:--font-outfit) leading-tight">
              {thread.title}
            </h1>
            <ThreadActions
              threadId={thread.id}
              isPinned={thread.isPinned}
              isLocked={thread.isLocked}
              categorySlug={categorySlug}
              threadSlug={threadSlug}
              authorId={thread.author.id}
              currentUserId={user.id}
              currentUserRole={user.role as Role}
            />
          </div>

          {/* Author + meta */}
          <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7 ring-2 ring-background shadow-sm">
                <AvatarImage src={thread.author.avatar ?? undefined} />
                <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-foreground text-sm">
                {thread.author.firstName} {thread.author.lastName}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(thread.createdAt), {
                addSuffix: true,
              })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {thread.views} views
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {thread._count.replies} replies
            </span>
          </div>

          {/* Tags */}
          {thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {thread.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground text-[11px] font-medium border border-border/40"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Thread content with vote buttons ── */}
        <div className="flex gap-4">
          {/* Thread vote buttons */}
          <div className="pt-6 shrink-0">
            <VoteButtons
              targetId={thread.id}
              targetType="thread"
              votes={thread.votes}
              currentUserId={user.id}
            />
          </div>

          {/* Content card */}
          <div className="flex-1 min-w-0 rounded-2xl border border-border/40 bg-card p-6 md:p-8 shadow-sm">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <RichTextViewer content={thread.content} />
            </div>
          </div>
        </div>

        {/* ── Poll section ── */}
        {thread.polls && thread.polls.length > 0 && (
          <div className="space-y-3">
            {thread.polls.map((poll: any) => (
              <PollWidget key={poll.id} poll={poll} currentUserId={user.id} />
            ))}
          </div>
        )}

        {/* ── Replies section ── */}
        <div className="space-y-6">
          {/* Section header */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground/70">
              ✦ Replies ({thread._count.replies})
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          {/* Reply list */}
          <div className="rounded-2xl border border-border/40 bg-card/50 p-3 md:p-4">
            <ReplyList
              replies={thread.replies}
              threadId={thread.id}
              threadAuthorId={thread.author.id}
              currentUserId={user.id}
              currentUserRole={user.role as Role}
              isLocked={thread.isLocked}
            />
          </div>

          {/* Reply form */}
          <div className="rounded-2xl border border-border/40 bg-card p-5 md:p-6 shadow-sm">
            <ReplyForm threadId={thread.id} isLocked={thread.isLocked} />
          </div>
        </div>
      </div>
    </div>
  );
}
