import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { PenLine, Rss } from "lucide-react";

import { getCurrentDbUser } from "@/lib/auth";
import {
  getBlogPosts,
  getFeaturedPosts,
  getBlogCategories,
  getBlogTags,
} from "@/lib/queries/blog.queries";

import { BlogCard } from "@/components/blog/blog-card";
import { BlogCardFeatured } from "@/components/blog/blog-card-featured";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { BlogFilters } from "@/components/blog/blog-filters";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Blog | Chandra Jyoti Sanstha",
  description:
    "Read the latest posts from the Chandra Jyoti Sanstha community.",
};

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const sortBy = (params.sortBy as "latest" | "popular" | "oldest") || "latest";

  const [{ posts, pagination }, featuredPosts, categories, tags] =
    await Promise.all([
      getBlogPosts({ page, search, sortBy }),
      page === 1 && !search ? getFeaturedPosts() : Promise.resolve([]),
      getBlogCategories(),
      getBlogTags(),
    ]);

  const isFirstPage = page === 1 && !search;
  const hasFeatures = isFirstPage && featuredPosts.length > 0;

  return (
    <div className="min-h-screen pb-16">
      {/* ── Hero header ── */}
      <PageHeader
        title="Stories & Insights"
        description="Community stories, updates, and knowledge sharing from Chandra Jyoti Sanstha."
        eyebrow="Community Blog"
        icon={<Rss />}
      >
        <Button
          asChild
          size="lg"
          className="gap-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-shadow"
        >
          <Link href="/blog/create">
            <PenLine className="h-4 w-4" />
            Write a Post
          </Link>
        </Button>
      </PageHeader>

      {/* ── Page body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        {/* Featured posts */}
        {hasFeatures && (
          <section aria-label="Featured posts" className="space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground/70">
                ✦ Featured
              </span>
              <div className="h-px flex-1 bg-border/50" />
            </div>
            <BlogCardFeatured key={featuredPosts[0].id} posts={featuredPosts} />
          </section>
        )}

        {/* Filters row */}
        <div className="flex flex-col gap-4">
          {hasFeatures && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground/70">
                All Posts
              </span>
              <div className="h-px flex-1 bg-border/50" />
            </div>
          )}
          <BlogFilters
            search={search}
            sortBy={sortBy}
            totalResults={pagination.totalCount}
          />
        </div>

        {/* Main content + Sidebar */}
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          {/* Left: posts grid */}
          <div>
            {posts.length === 0 ? (
              <EmptyState search={search} />
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {posts.map((post, i) => (
                    <BlogCard key={post.id} post={post} index={i} />
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
                                href={buildHref(page - 1, search, sortBy)}
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
                                    href={buildHref(item, search, sortBy)}
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
                                href={buildHref(page + 1, search, sortBy)}
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
          <BlogSidebar categories={categories} tags={tags} />
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function buildHref(p: number, search: string, sortBy: string) {
  const qs = new URLSearchParams();
  if (p > 1) qs.set("page", String(p));
  if (search) qs.set("search", search);
  if (sortBy && sortBy !== "latest") qs.set("sortBy", sortBy);
  const s = qs.toString();
  return `/blog${s ? `?${s}` : ""}`;
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

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-border/50 border-dashed bg-muted/20 py-24 text-center gap-4">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-3xl">
        {search ? "🔍" : "✦"}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold font-(family-name:--font-outfit)">
          {search ? "No results found" : "No posts yet"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {search
            ? `Nothing matched "${search}". Try a different term.`
            : "Be the first to share something with the community."}
        </p>
      </div>
      {!search && (
        <Button asChild className="rounded-full gap-2 mt-2">
          <Link href="/blog/create">
            <PenLine className="h-4 w-4" />
            Write a Post
          </Link>
        </Button>
      )}
    </div>
  );
}
