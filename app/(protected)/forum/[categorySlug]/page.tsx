import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, PenLine } from "lucide-react";

import { getCurrentDbUser } from "@/lib/auth";
import {
  getCategoryBySlug,
  getCategoryThreads,
  getForumCategories,
  getForumStats,
  getRecentActivity,
} from "@/lib/queries/forum.queries";

import { ThreadCard } from "@/components/forum/thread-card";
import { ForumSidebar } from "@/components/forum/forum-sidebar";
import { ForumFilters } from "@/components/forum/forum-filters";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// ── Dynamic metadata ──────────────────────────────────────

interface PageProps {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string; sortBy?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} | Forum | Chandra Jyoti Sanstha`,
    description: category.description ?? `Browse threads in ${category.name}.`,
  };
}

// ── Page ──────────────────────────────────────────────────

export default async function CategoryThreadsPage({
  params,
  searchParams,
}: PageProps) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  const { categorySlug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const page = Number(sp.page) || 1;
  const sortBy =
    (sp.sortBy as "latest" | "most-replied" | "unanswered") || "latest";

  const [result, allCategories, stats, recentActivity] = await Promise.all([
    getCategoryThreads({ categorySlug, page, sortBy }),
    getForumCategories(),
    getForumStats(),
    getRecentActivity(),
  ]);

  if (!result) notFound();

  const { threads, pagination } = result;

  return (
    <div className="min-h-screen pb-16">
      {/* ── Hero header ── */}
      <PageHeader
        title={category.name}
        description={category.description ?? undefined}
        eyebrow="Forum"
        icon={
          <span className="text-lg">
            {(category as { icon?: string | null }).icon || "💬"}
          </span>
        }
      >
        <div className="flex items-center gap-2.5">
          <Button
            asChild
            variant="ghost"
            className="gap-2 rounded-full h-10 px-4 hover:bg-muted"
          >
            <Link href="/forum">
              <ArrowLeft className="h-4 w-4" />
              Back to Forum
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="gap-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            <Link href={`/forum/create?category=${categorySlug}`}>
              <PenLine className="h-4 w-4" />
              New Thread
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* ── Page body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
        {/* Filters */}
        <ForumFilters sortBy={sortBy} totalResults={pagination.totalCount} />

        {/* Main content + Sidebar */}
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          {/* Left: thread list */}
          <div>
            {threads.length === 0 ? (
              <EmptyState categorySlug={categorySlug} />
            ) : (
              <>
                <div className="space-y-3">
                  {threads.map((thread, i) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      categorySlug={categorySlug}
                      index={i}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <div className="inline-flex items-center gap-1 p-1 rounded-full border border-border/60 bg-background/80 backdrop-blur-sm shadow-sm">
                      <Pagination>
                        <PaginationContent className="gap-0.5">
                          {pagination.hasPrev && (
                            <PaginationItem>
                              <PaginationPrevious
                                href={buildHref(categorySlug, page - 1, sortBy)}
                                className="rounded-full"
                              />
                            </PaginationItem>
                          )}

                          {buildPageNumbers(page, pagination.totalPages).map(
                            (item, idx) =>
                              item === "ellipsis" ? (
                                <PaginationItem key={`ellipsis-${idx}`}>
                                  <span className="px-3 text-muted-foreground text-sm">
                                    …
                                  </span>
                                </PaginationItem>
                              ) : (
                                <PaginationItem key={item}>
                                  <PaginationLink
                                    href={buildHref(categorySlug, item, sortBy)}
                                    isActive={item === page}
                                    className="rounded-full w-9 h-9"
                                  >
                                    {item}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                          )}

                          {pagination.hasNext && (
                            <PaginationItem>
                              <PaginationNext
                                href={buildHref(categorySlug, page + 1, sortBy)}
                                className="rounded-full"
                              />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: sidebar */}
          <ForumSidebar
            stats={stats}
            categories={allCategories}
            recentActivity={recentActivity}
            activeCategorySlug={categorySlug}
          />
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────

function buildHref(slug: string, p: number, sortBy: string) {
  const qs = new URLSearchParams();
  if (p > 1) qs.set("page", String(p));
  if (sortBy && sortBy !== "latest") qs.set("sortBy", sortBy);
  const s = qs.toString();
  return `/forum/${slug}${s ? `?${s}` : ""}`;
}

function buildPageNumbers(
  current: number,
  total: number
): (number | "ellipsis")[] {
  const pages = Array.from({ length: total }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === total || Math.abs(p - current) <= 1
  );
  const result: (number | "ellipsis")[] = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) result.push("ellipsis");
    result.push(pages[i]);
  }
  return result;
}

// ── Empty state ─────────────────────────────────────────

function EmptyState({ categorySlug }: { categorySlug: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-border/50 border-dashed bg-muted/20 py-24 text-center gap-4">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-3xl">
        🧵
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold font-(family-name:--font-outfit)">
          No threads yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Be the first to start a discussion in this category.
        </p>
      </div>
      <Button asChild className="rounded-full gap-2 mt-2">
        <Link href={`/forum/create?category=${categorySlug}`}>
          <PenLine className="h-4 w-4" />
          Start a Thread
        </Link>
      </Button>
    </div>
  );
}
