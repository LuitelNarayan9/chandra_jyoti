import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { getNewsArticleById } from "@/lib/queries/news.queries";
import { LocalNewsEditor } from "@/components/news/admin/local-news-editor";

export const metadata: Metadata = {
  title: "Edit News — Admin | Chandra Jyoti Sanstha",
  description: "Edit a local news article.",
};

export default async function AdminEditNewsPage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  await requireAdmin();

  const { articleId } = await params;
  const article = await getNewsArticleById(articleId);

  if (!article || article.source !== "LOCAL") {
    redirect("/admin/news");
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="relative overflow-hidden border-b border-border/60 bg-linear-to-b from-muted/40 to-transparent">
        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="space-y-2">
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-500/80">
              Edit Article
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight line-clamp-1">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 pt-10">
        <div className="rounded-3xl border border-border/50 bg-card shadow-sm shadow-black/5 dark:shadow-black/20 p-6 md:p-8 lg:p-10">
          <LocalNewsEditor
            initialData={{
              id: article.id,
              title: article.title,
              content: article.content,
              excerpt: article.excerpt,
              coverImage: article.coverImage,
              gallery: article.gallery,
              localTag: article.localTag,
              location: article.location,
              urgency: article.urgency,
            }}
          />
        </div>
      </div>
    </div>
  );
}
