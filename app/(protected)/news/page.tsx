import type { Metadata } from "next";
import { Newspaper, Search, Globe, MapPin, Landmark, Earth } from "lucide-react";
import Link from "next/link";

import { getNewsArticles, getNewsCategoryCounts, getFeaturedNews } from "@/lib/queries/news.queries";
import { NewsCard } from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "News — Chandra Jyoti Sanstha",
  description: "Stay updated with local, state, national and international news relevant to our community.",
};

const CATEGORY_TABS = [
  { key: undefined, label: "All", icon: Newspaper },
  { key: "LOCAL", label: "Local", icon: MapPin },
  { key: "STATE", label: "State", icon: Landmark },
  { key: "NATIONAL", label: "National", icon: Globe },
  { key: "INTERNATIONAL", label: "International", icon: Earth },
] as const;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const category = params.category as "LOCAL" | "STATE" | "NATIONAL" | "INTERNATIONAL" | undefined;
  const page = Number(params.page) || 1;

  const [{ articles, pagination }, stats, featured] = await Promise.all([
    getNewsArticles({ page, category, search: params.search, pageSize: 12 }),
    getNewsCategoryCounts(),
    category ? Promise.resolve([]) : getFeaturedNews(3),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-linear-to-b from-muted/50 via-muted/20 to-transparent">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative container max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Newspaper className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-primary/80">
              News & Updates
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05]">
            Community News
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg">
            Stay informed about local events, state developments, national policies,
            and international news relevant to our community.
          </p>
        </div>
      </section>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Category tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORY_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = category === tab.key;
            const count = tab.key
              ? stats.categories.find((c) => c.category === tab.key)?.count ?? 0
              : stats.total;

            return (
              <Link
                key={tab.label}
                href={
                  tab.key ? `/news?category=${tab.key}` : "/news"
                }
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                  "border transition-all duration-200 whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                    : "bg-card border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <TabIcon className="h-3.5 w-3.5" />
                {tab.label}
                <span
                  className={cn(
                    "text-[0.6rem] rounded-full px-1.5 py-0.5 font-semibold",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Featured (only on "All" tab) */}
        {featured.length > 0 && !category && (
          <div className="mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-4">
              Featured News
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map((article, i) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-border/50",
                    "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                    i === 0 && "md:col-span-2 md:row-span-2"
                  )}
                >
                  <div
                    className={cn(
                      "relative overflow-hidden bg-muted",
                      i === 0 ? "aspect-[16/9]" : "aspect-[16/9]"
                    )}
                  >
                    {article.coverImage ? (
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <Globe className="h-10 w-10 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-[0.6rem] uppercase tracking-wider text-white/70 mb-1">
                        {article.category} · {article.sourceName ?? "Local"}
                      </p>
                      <h3
                        className={cn(
                          "font-bold leading-snug",
                          i === 0 ? "text-lg md:text-xl" : "text-sm"
                        )}
                      >
                        {article.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article, i) => (
              <NewsCard
                key={article.id}
                article={article as Parameters<typeof NewsCard>[0]["article"]}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">
              No articles found for this category.
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            {pagination.hasPrev && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-xl"
              >
                <Link
                  href={`/news?${category ? `category=${category}&` : ""}page=${page - 1}`}
                >
                  Previous
                </Link>
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            {pagination.hasNext && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-xl"
              >
                <Link
                  href={`/news?${category ? `category=${category}&` : ""}page=${page + 1}`}
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
