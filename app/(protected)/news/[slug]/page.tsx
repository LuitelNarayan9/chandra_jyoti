import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Eye,
  Globe,
  MapPin,
  ExternalLink,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

import { getCurrentDbUser } from "@/lib/auth";
import { getNewsArticleBySlug } from "@/lib/queries/news.queries";
import { incrementNewsViews } from "@/lib/actions/news.actions";
import { BookmarkButton } from "@/components/news/bookmark-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TimeAgo } from "@/components/shared/time-ago";
import { cn, getFallbackImage } from "@/lib/utils";
import {
  LOCAL_NEWS_TAG_LABELS,
  LOCAL_NEWS_TAG_COLORS,
} from "@/lib/validations/news";

// ─── Metadata ─────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: `${article.title} — News | Chandra Jyoti Sanstha`,
    description: article.excerpt || article.title,
  };
}

// ─── Page ─────────────────────────────────────────────────────

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dbUser = await getCurrentDbUser();
  const article = await getNewsArticleBySlug(slug, dbUser?.id);

  if (!article) notFound();

  // Fire-and-forget view increment
  incrementNewsViews(article.id);

  const isUrgent = article.urgency === "URGENT";
  const isFeatured = article.urgency === "FEATURED";
  
  const displayImage = article.coverImage || getFallbackImage(article.category, article.id);

  return (
    <div className="min-h-screen">
      {/* Hero with cover image */}
      <section className="relative overflow-hidden">
        <div className="relative h-64 md:h-80 lg:h-96">
          <img
            src={displayImage}
            alt={article.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/40 to-background" />
        </div>
      </section>

      <div className="container max-w-4xl mx-auto px-4">
        <article className="-mt-16 relative z-10">
          {/* Article header card */}
          <div className="rounded-3xl border border-border/50 bg-card shadow-xl shadow-black/5 dark:shadow-black/30 p-6 md:p-8">
            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Badge
                variant="outline"
                className="rounded-full text-[0.65rem] font-semibold"
              >
                {article.category}
              </Badge>

              {isUrgent && (
                <Badge className="rounded-full bg-red-600 text-white text-[0.6rem] gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  URGENT
                </Badge>
              )}

              {isFeatured && (
                <Badge className="rounded-full bg-amber-500 text-white text-[0.6rem] gap-1">
                  <Sparkles className="h-3 w-3" />
                  FEATURED
                </Badge>
              )}

              {article.localTag && (
                <Badge
                  variant="outline"
                  className="rounded-full text-[0.6rem]"
                  style={{
                    backgroundColor: `${LOCAL_NEWS_TAG_COLORS[article.localTag as keyof typeof LOCAL_NEWS_TAG_COLORS]}12`,
                    color:
                      LOCAL_NEWS_TAG_COLORS[
                        article.localTag as keyof typeof LOCAL_NEWS_TAG_COLORS
                      ],
                    borderColor: `${LOCAL_NEWS_TAG_COLORS[article.localTag as keyof typeof LOCAL_NEWS_TAG_COLORS]}30`,
                  }}
                >
                  {
                    LOCAL_NEWS_TAG_LABELS[
                      article.localTag as keyof typeof LOCAL_NEWS_TAG_LABELS
                    ]
                  }
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-[1.1] mb-4">
              {article.title}
            </h1>

            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-4 text-xs text-muted-foreground mb-6 pb-6 border-b border-border/50">
              <span className="flex items-center gap-1.5">
                {article.source === "LOCAL" ? (
                  <MapPin className="h-3.5 w-3.5" />
                ) : (
                  <Globe className="h-3.5 w-3.5" />
                )}
                {article.source === "LOCAL"
                  ? "Local"
                  : (article.sourceName ?? "External")}
              </span>

              {article.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {article.location}
                </span>
              )}

              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(article.publishedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>

              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {article.views.toLocaleString()} views
              </span>
            </div>

            {/* Excerpt as Subtitle (only if full content exists) */}
            {article.excerpt && article.content && (
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-6 italic">
                {article.excerpt}
              </p>
            )}

            {/* Main Content or Fallback Summary */}
            {article.content ? (
              <div
                className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : article.excerpt ? (
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <p className="leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {article.excerpt}
                </p>
                <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/50 text-sm text-muted-foreground italic flex gap-3 items-start">
                  <ExternalLink className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="m-0">
                    This is a brief summary provided by {article.sourceName}. Please visit the original publisher's website to read the full article and view all related media.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Gallery */}
            {article.gallery.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-4">
                  Photo Gallery
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {article.gallery.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border/50"
                    >
                      <img
                        src={url}
                        alt={`Gallery photo ${i + 1}`}
                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External source link */}
            {article.source === "EXTERNAL" && article.sourceUrl && (
              <div className="mt-6 pt-6 border-t border-border/50">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl gap-2"
                >
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Read full article on {article.sourceName}
                  </a>
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
              <Button
                variant="ghost"
                asChild
                className="rounded-xl gap-2 text-muted-foreground"
              >
                <Link href="/news">
                  <ArrowLeft className="h-4 w-4" />
                  Back to News
                </Link>
              </Button>

              {dbUser?.id && (
                <BookmarkButton
                  articleId={article.id}
                  isBookmarked={article.isBookmarked}
                />
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
