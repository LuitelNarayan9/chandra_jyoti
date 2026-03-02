import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  MessageSquare,
  ArrowLeft,
  Eye,
  Pin,
  Lock,
  CheckCircle2,
  XCircle,
  Circle,
} from "lucide-react";

import { getCurrentDbUser } from "@/lib/auth";
import { searchForumThreads } from "@/lib/queries/forum.queries";

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

// ── Metadata ─────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Search Forum | Chandra Jyoti Sanstha",
  description: "Search threads in the community forum.",
};

// ── Page ─────────────────────────────────────────────────────

export default async function ForumSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
}) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  const query = params.q || "";
  const page = parseInt(params.page || "1");
  const categorySlug = params.category;

  const result = query
    ? await searchForumThreads({ query, page, categorySlug })
    : null;

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Search Forum"
        description="Find threads, questions, and discussions."
        eyebrow="Search"
        icon={<Search />}
      >
        <Button asChild variant="outline" className="gap-2 rounded-full">
          <Link href="/forum">
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Link>
        </Button>
      </PageHeader>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        {/* Search form */}
        <form action="/forum/search" method="GET" className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search threads by title or content..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border/40 bg-card text-base placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200 shadow-sm"
          />
        </form>

        {/* Results */}
        {query && result && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground/70">
                ✦ {result.pagination.totalCount} result
                {result.pagination.totalCount !== 1 && "s"} for &ldquo;{query}
                &rdquo;
              </span>
              <div className="h-px flex-1 bg-border/50" />
            </div>

            {result.threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-border/50 border-dashed bg-muted/20 py-20 text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-2xl">
                  🔍
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold">No threads found</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Try different keywords or browse categories.
                  </p>
                </div>
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
                          {/* Author avatar */}
                          <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background shadow-sm">
                            <AvatarImage src={thread.author.avatar ?? ""} />
                            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                              {thread.author.firstName?.[0]}
                              {thread.author.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>

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
                              <span
                                className={`flex items-center gap-1 ${status.color}`}
                              >
                                {status.icon}
                                {status.label}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5 px-1.5 rounded-md font-medium"
                                style={{
                                  borderColor:
                                    thread.category.color ?? undefined,
                                }}
                              >
                                {thread.category.name}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {thread._count.replies}
                              </span>
                              <span>
                                {formatDistanceToNow(
                                  new Date(thread.createdAt),
                                  {
                                    addSuffix: true,
                                  }
                                )}
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
                      href={`/forum/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
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
                      href={`/forum/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                    >
                      Next
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-border/50 border-dashed bg-muted/20 py-20 text-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-2xl">
              🔍
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold">Search the Forum</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Type a keyword above to find relevant threads.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
