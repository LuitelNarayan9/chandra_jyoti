import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { formatDistanceToNow } from "date-fns";
import {
  User,
  ArrowLeft,
  MessageSquare,
  Pin,
  Lock,
  CheckCircle2,
  XCircle,
  Circle,
  PenLine,
} from "lucide-react";

import { getCurrentDbUser } from "@/lib/auth";
import { getUserThreads } from "@/lib/queries/forum.queries";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";

// ── Types ────────────────────────────────────────────────────

type ThreadStatus = "OPEN" | "RESOLVED" | "CLOSED";

const statusConfig: Record<
  ThreadStatus,
  { label: string; icon: React.ReactNode; color: string }
> = {
  OPEN: {
    label: "Open",
    icon: <Circle className="h-3 w-3" />,
    color: "text-emerald-500",
  },
  RESOLVED: {
    label: "Resolved",
    icon: <CheckCircle2 className="h-3 w-3" />,
    color: "text-blue-500",
  },
  CLOSED: {
    label: "Closed",
    icon: <XCircle className="h-3 w-3" />,
    color: "text-muted-foreground",
  },
};

const STATUS_TABS = ["ALL", "OPEN", "RESOLVED", "CLOSED"] as const;

// ── Metadata ─────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "My Threads | Chandra Jyoti Sanstha",
  description: "View and manage your forum threads.",
};

// ── Page ─────────────────────────────────────────────────────

export default async function MyThreadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  const statusFilter = (params.status || "ALL") as
    | "ALL"
    | "OPEN"
    | "RESOLVED"
    | "CLOSED";
  const page = parseInt(params.page || "1");

  const result = await getUserThreads({
    userId: user.id,
    page,
    status: statusFilter,
  });

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="My Threads"
        description="View and manage your forum discussions."
        eyebrow="Your Activity"
        icon={<User />}
      >
        <div className="flex gap-2">
          <Button asChild variant="outline" className="gap-2 rounded-full">
            <Link href="/forum">
              <ArrowLeft className="h-4 w-4" />
              Back to Forum
            </Link>
          </Button>
          <Button
            asChild
            className="gap-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            <Link href="/forum/create">
              <PenLine className="h-4 w-4" />
              New Thread
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
        {/* Status tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 w-fit">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab}
              href={`/forum/my-threads?status=${tab}`}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                statusFilter === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "ALL"
                ? "All"
                : (statusConfig[tab as ThreadStatus]?.label ?? tab)}
            </Link>
          ))}
        </div>

        {/* Thread count */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground/70">
            ✦ {result.pagination.totalCount} thread
            {result.pagination.totalCount !== 1 && "s"}
          </span>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        {/* Thread list */}
        {result.threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-border/50 border-dashed bg-muted/20 py-20 text-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-2xl">
              📝
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold">No threads found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {statusFilter === "ALL"
                  ? "You haven't created any threads yet. Start a new discussion!"
                  : `No ${statusFilter.toLowerCase()} threads found.`}
              </p>
            </div>
            <Button asChild className="gap-2 rounded-full mt-2">
              <Link href="/forum/create">
                <PenLine className="h-4 w-4" />
                Start a Thread
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {result.threads.map((thread) => {
              const status =
                statusConfig[thread.status as ThreadStatus] ??
                statusConfig.OPEN;
              return (
                <Link
                  key={thread.id}
                  href={`/forum/${thread.category.slug}/${thread.slug}`}
                  className="block group"
                >
                  <div className="rounded-2xl border border-border/40 bg-card p-5 hover:border-primary/20 hover:shadow-md transition-all duration-300 group-hover:scale-[1.005]">
                    <div className="flex items-start gap-4">
                      {/* Status indicator */}
                      <div
                        className={`mt-1 shrink-0 h-8 w-8 rounded-xl flex items-center justify-center ${
                          thread.status === "RESOLVED"
                            ? "bg-blue-500/10"
                            : thread.status === "CLOSED"
                              ? "bg-muted"
                              : "bg-emerald-500/10"
                        }`}
                      >
                        <span className={status.color}>{status.icon}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {thread.isPinned && (
                            <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          )}
                          {thread.isLocked && (
                            <Lock className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          )}
                          <h3 className="text-sm font-bold group-hover:text-primary transition-colors truncate">
                            {thread.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground/60">
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-1.5 rounded-md font-medium"
                            style={{
                              borderColor: thread.category.color ?? undefined,
                            }}
                          >
                            {thread.category.name}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {thread._count.replies} replies
                          </span>
                          <span>
                            {formatDistanceToNow(new Date(thread.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>

                        {/* Tags */}
                        {thread.tags.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {thread.tags.map((tt) => (
                              <span
                                key={tt.tag.id}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
                              >
                                #{tt.tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {result.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            {result.pagination.hasPrev && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <Link
                  href={`/forum/my-threads?status=${statusFilter}&page=${page - 1}`}
                >
                  Previous
                </Link>
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              Page {page} of {result.pagination.totalPages}
            </span>
            {result.pagination.hasNext && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <Link
                  href={`/forum/my-threads?status=${statusFilter}&page=${page + 1}`}
                >
                  Next
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
