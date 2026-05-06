"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Eye, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { cn, getFallbackImage } from "@/lib/utils";
import { TimeAgo } from "@/components/shared/time-ago";
import { LOCAL_NEWS_TAG_LABELS, LOCAL_NEWS_TAG_COLORS } from "@/lib/validations/news";

// ─── Types ────────────────────────────────────────────────────

interface NewsCardArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  source: string;
  sourceName: string | null;
  category: string;
  localTag: string | null;
  urgency: string;
  views: number;
  publishedAt: Date;
  _count: { bookmarks: number };
}

interface NewsCardProps {
  article: NewsCardArticle;
  index?: number;
}

// ─── Constants ────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  LOCAL: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  STATE: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  NATIONAL: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  INTERNATIONAL: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
};

// ─── Component ────────────────────────────────────────────────

export function NewsCard({ article, index = 0 }: NewsCardProps) {
  const isUrgent = article.urgency === "URGENT";
  const isFeatured = article.urgency === "FEATURED";
  
  const displayImage = article.coverImage || getFallbackImage(article.category, article.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/news/${article.slug}`}
        className={cn(
          "group block rounded-2xl border overflow-hidden transition-all duration-300",
          "hover:shadow-lg hover:-translate-y-0.5",
          isUrgent
            ? "border-red-500/30 shadow-red-500/5"
            : "border-border/50 hover:border-border/80"
        )}
      >
        {/* Image */}
        <div className="relative aspect-[16/9] bg-muted overflow-hidden">
          <img
            src={displayImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

          {/* Urgency indicator */}
          {isUrgent && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm text-white text-[0.6rem] font-bold px-2 py-1 rounded-full shadow-md animate-pulse">
              <AlertTriangle className="h-3 w-3" />
              URGENT
            </div>
          )}
          {isFeatured && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-amber-500/90 backdrop-blur-sm text-white text-[0.6rem] font-bold px-2 py-1 rounded-full shadow-md">
              <Sparkles className="h-3 w-3" />
              FEATURED
            </div>
          )}

          {/* Category badge */}
          <div className="absolute bottom-2 left-2">
            <Badge
              variant="outline"
              className={cn(
                "rounded-full text-[0.6rem] font-semibold backdrop-blur-sm bg-black/30 border-white/20 text-white",
              )}
            >
              {article.category}
            </Badge>
          </div>

          {/* Source indicator */}
          <div className="absolute bottom-2 right-2">
            <div className="flex items-center gap-1 text-[0.6rem] text-white/80 backdrop-blur-sm bg-black/30 rounded-full px-2 py-0.5">
              {article.source === "LOCAL" ? (
                <MapPin className="h-2.5 w-2.5" />
              ) : (
                <Globe className="h-2.5 w-2.5" />
              )}
              {article.source === "LOCAL" ? "Local" : (article.sourceName ?? "External")}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          {/* Local tag */}
          {article.localTag && (
            <Badge
              variant="outline"
              className="rounded-full text-[0.6rem] mb-1"
              style={{
                backgroundColor: `${LOCAL_NEWS_TAG_COLORS[article.localTag as keyof typeof LOCAL_NEWS_TAG_COLORS]}12`,
                color: LOCAL_NEWS_TAG_COLORS[article.localTag as keyof typeof LOCAL_NEWS_TAG_COLORS],
                borderColor: `${LOCAL_NEWS_TAG_COLORS[article.localTag as keyof typeof LOCAL_NEWS_TAG_COLORS]}30`,
              }}
            >
              {LOCAL_NEWS_TAG_LABELS[article.localTag as keyof typeof LOCAL_NEWS_TAG_LABELS]}
            </Badge>
          )}

          {/* Title */}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-[0.65rem] text-muted-foreground/60 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <TimeAgo date={article.publishedAt} />
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
