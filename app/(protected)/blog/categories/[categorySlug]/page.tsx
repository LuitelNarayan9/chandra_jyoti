import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { PenLine, Folder } from "lucide-react";

import { getCurrentDbUser } from "@/lib/auth";
import {
  getBlogPosts,
  getBlogCategories,
  getBlogTags,
} from "@/lib/queries/blog.queries";
import { db } from "@/lib/db";

import { BlogCard } from "@/components/blog/blog-card";
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

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string; search?: string; sortBy?: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await db.blogCategory.findUnique({
    where: { slug: categorySlug },
  });
  return {
    title: category
      ? `${category.name} | Blog | Chandra Jyoti Sanstha`
      : "Category Not Found",
    description: category?.description ?? "Browse posts in this category.",
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  const { categorySlug } = await params;
  const sp = await searchParams;

  const category = await db.blogCategory.findUnique({
    where: { slug: categorySlug },
  });
  if (!category) notFound();

  const page = Number(sp.page) || 1;
  const search = sp.search || "";
  const sortBy = (sp.sortBy as "latest" | "popular" | "oldest") || "latest";

  const [{ posts, pagination }, categories, tags] = await Promise.all([
    getBlogPosts({ page, search, sortBy, categorySlug }),
    getBlogCategories(),
    getBlogTags(),
  ]);

  const basePath = `/blog/categories/${categorySlug}`;

  return (
    <div className="min-h-screen pb-16">
      {/* ── Hero header ── */}
      <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/40 to-transparent">
        {/* Dot-grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Category-coloured glow blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/3 h-64 w-64 rounded-full blur-3xl"
          style={{
            backgroundColor: category.color
              ? `${category.color}20`
              : "hsl(var(--primary)/0.1)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 right-1/4 h-48 w-48 rounded-full blur-2xl"
          style={{
            backgroundColor: category.color
              ? `${category.color}10`
              : "hsl(var(--primary)/0.05)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            {/* Left */}
            <div className="space-y-3">
              {/* Eyebrow */}
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: category.color
                      ? `${category.color}20`
                      : "hsl(var(--primary)/0.1)",
                  }}
                >
                  <Folder
                    className="h-3.5 w-3.5"
                    style={{ color: category.color ?? "hsl(var(--primary))" }}
                  />
                </div>
                <span
                  className="text-[11px] font-bold tracking-[0.2em] uppercase"
                  style={{ color: category.color ?? "hsl(var(--primary))" }}
                >
                  Category
                </span>
              </div>

              {/* Title */}
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight font-(family-name:--font-outfit) leading-[1.02]">
                  <span className="relative inline-block">
                    {category.name}
                    <span
                      aria-hidden
                      className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full"
                      style={{
                        background: category.color
                          ? `linear-gradient(to right, ${category.color}, ${category.color}40)`
                          : "linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary)/0.4))",
                      }}
                    />
                  </span>
                </h1>
                {pagination.totalCount !== undefined && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border border-border/60 bg-background/60 text-muted-foreground backdrop-blur-sm self-end mb-1">
                    {pagination.totalCount}{" "}
                    {pagination.totalCount === 1 ? "post" : "posts"}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-sm md:text-base max-w-md leading-relaxed">
                {category.description ??
                  `Browsing all posts in ${category.name}.`}
              </p>
            </div>

            {/* Right: CTAs */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-full gap-2"
              >
                <Link href="/blog">← All Posts</Link>
              </Button>
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
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        {/* Filters */}
        <BlogFilters search={search} sortBy={sortBy} />

        {/* Grid + Sidebar */}
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          {/* Posts */}
          <div>
            {posts.length === 0 ? (
              <EmptyState search={search} categoryName={category.name} />
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {posts.map((post, i) => (
                    <BlogCard key={post.id} post={post} index={i} />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <div className="inline-flex items-center gap-1 p-1 rounded-full border border-border/60 bg-background/80 backdrop-blur-sm shadow-sm">
                      <Pagination>
                        <PaginationContent className="gap-0.5">
                          {pagination.hasPrev && (
                            <PaginationItem>
                              <PaginationPrevious
                                href={buildHref(
                                  basePath,
                                  page - 1,
                                  search,
                                  sortBy
                                )}
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
                                    href={buildHref(
                                      basePath,
                                      item,
                                      search,
                                      sortBy
                                    )}
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
                                href={buildHref(
                                  basePath,
                                  page + 1,
                                  search,
                                  sortBy
                                )}
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

          {/* Sidebar */}
          <BlogSidebar
            categories={categories}
            tags={tags}
            activeCategorySlug={categorySlug}
          />
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function buildHref(base: string, p: number, search: string, sortBy: string) {
  const qs = new URLSearchParams();
  if (p > 1) qs.set("page", String(p));
  if (search) qs.set("search", search);
  if (sortBy && sortBy !== "latest") qs.set("sortBy", sortBy);
  const s = qs.toString();
  return `${base}${s ? `?${s}` : ""}`;
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

function EmptyState({
  search,
  categoryName,
}: {
  search: string;
  categoryName: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-border/50 border-dashed bg-muted/20 py-24 text-center gap-4">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-3xl">
        {search ? "🔍" : "📂"}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold font-(family-name:--font-outfit)">
          {search ? "No results found" : `No posts in ${categoryName}`}
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {search
            ? `Nothing matched "${search}". Try a different term.`
            : "Be the first to write a post in this category!"}
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
