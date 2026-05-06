import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Plus, Globe, MapPin } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { getAdminNewsArticles, getNewsCategoryCounts } from "@/lib/queries/news.queries";
import { NewsTable } from "@/components/news/admin/news-table";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Manage News — Admin | Chandra Jyoti Sanstha",
  description: "Manage community news articles.",
};

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; source?: string; search?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const category = params.category as "LOCAL" | "STATE" | "NATIONAL" | "INTERNATIONAL" | undefined;
  const source = params.source as "LOCAL" | "EXTERNAL" | undefined;

  const [{ articles, pagination }, stats] = await Promise.all([
    getAdminNewsArticles({ page, category, source, search: params.search }),
    getNewsCategoryCounts(),
  ]);

  const localCount = stats.categories.find((c) => c.category === "LOCAL")?.count ?? 0;
  const externalCount = stats.total - localCount;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Newspaper className="h-6 w-6 text-primary" />
            Manage News
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.total} total articles · {localCount} local · {externalCount} external
          </p>
        </div>
        <Button asChild className="rounded-xl gap-2">
          <Link href="/admin/news/create">
            <Plus className="h-4 w-4" />
            Create Local News
          </Link>
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.categories.map((cat) => (
          <div
            key={cat.category}
            className="rounded-xl border border-border/50 bg-card p-3 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              {cat.category === "LOCAL" ? (
                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Globe className="h-3.5 w-3.5 text-blue-500" />
              )}
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {cat.category}
              </span>
            </div>
            <p className="text-lg font-bold">{cat.count}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <NewsTable articles={articles as Parameters<typeof NewsTable>[0]["articles"]} />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {pagination.hasPrev && (
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href={`/admin/news?page=${page - 1}`}>Previous</Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground px-3">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          {pagination.hasNext && (
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href={`/admin/news?page=${page + 1}`}>Next</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
