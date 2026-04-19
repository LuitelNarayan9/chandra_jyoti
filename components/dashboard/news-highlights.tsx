"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Globe, MapPin, ArrowRight } from "lucide-react";
import { TimeAgo } from "@/components/shared/time-ago";
import { cn } from "@/lib/utils";
import type React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NewsData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  source: string;
  sourceName: string | null;
  category: string;
  publishedAt: Date;
}

interface NewsHighlightsProps {
  articles: NewsData[];
}

type ArticleSource = "LOCAL" | "EXTERNAL";
type ArticleCategory = "LOCAL" | "STATE" | "NATIONAL" | "INTERNATIONAL";

// ─── Module-scoped constants ──────────────────────────────────────────────────

const SOURCE_ICONS = {
  LOCAL: MapPin,
  EXTERNAL: Globe,
} as const satisfies Record<ArticleSource, React.ElementType>;

const CATEGORY_COLORS = {
  LOCAL:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  STATE: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  NATIONAL:
    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  INTERNATIONAL:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
} as const satisfies Record<ArticleCategory, string>;

const FALLBACK_CATEGORY_COLOR =
  "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700";

// ─── Animation variants (module-scope → stable refs) ─────────────────────────

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
} as const;

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, ease: "easeOut" },
  },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSourceIcon(source: string): React.ElementType {
  return (SOURCE_ICONS as Record<string, React.ElementType>)[source] ?? Globe;
}

function getCategoryColor(category: string): string {
  return (
    (CATEGORY_COLORS as Record<string, string>)[category] ??
    FALLBACK_CATEGORY_COLOR
  );
}

// ─── NewsArticleRow ───────────────────────────────────────────────────────────

const NewsArticleRow = memo(function NewsArticleRow({
  article,
}: {
  article: NewsData;
}) {
  const SourceIcon = useMemo(
    () => getSourceIcon(article.source),
    [article.source]
  );
  const categoryClass = useMemo(
    () => getCategoryColor(article.category),
    [article.category]
  );
  const isoDate = useMemo(
    () => article.publishedAt.toISOString(),
    [article.publishedAt]
  );

  return (
    <motion.div variants={rowVariants} role="listitem">
      <Link
        href={`/news/${article.slug}`}
        className="group relative flex items-start gap-3.5 p-3 sm:p-4
          rounded-xl
          hover:bg-zinc-50 dark:hover:bg-white/[0.03]
          active:bg-zinc-50 dark:active:bg-white/3
          transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-inset focus-visible:ring-indigo-500"
        aria-label={`Read: ${article.title}`}
      >
        {/* Left accent bar — real element, not a pseudo-class string */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full
            bg-indigo-500 origin-center scale-y-0 group-hover:scale-y-100 group-active:scale-y-100
            transition-transform duration-300
            ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        />

        {/* Source icon */}
        <div
          className="shrink-0 mt-0.5 rounded-xl p-2.5
            bg-zinc-100 dark:bg-zinc-800/60
            shadow-sm group-hover:shadow-md group-active:shadow-md transition-shadow duration-200"
          aria-label={`Source: ${article.source.toLowerCase()}`}
        >
          <SourceIcon
            className="h-4 w-4 sm:h-5 sm:w-5
              text-zinc-400 dark:text-zinc-500
              group-hover:text-indigo-600 dark:group-hover:text-indigo-400
              group-active:text-indigo-600 dark:group-active:text-indigo-400
              transition-colors duration-200"
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p
            className="text-sm font-bold leading-snug line-clamp-2
              text-zinc-900 dark:text-zinc-50
              group-hover:text-indigo-600 dark:group-hover:text-indigo-400
              group-active:text-indigo-600 dark:group-active:text-indigo-400
              transition-colors duration-200"
          >
            {article.title}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md shadow-sm border",
                categoryClass
              )}
            >
              {article.category}
            </Badge>

            {article.sourceName && (
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 truncate max-w-[120px]">
                {article.sourceName}
              </span>
            )}

            <span
              aria-hidden="true"
              className="text-[11px] text-zinc-300 dark:text-zinc-600 select-none"
            >
              ·
            </span>

            <time
              dateTime={isoDate}
              className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 shrink-0"
            >
              <TimeAgo date={article.publishedAt} />
            </time>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = memo(function EmptyState(): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700/60 p-8 text-center bg-white dark:bg-zinc-900">
      <Newspaper
        className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600 mb-3"
        aria-hidden="true"
      />
      <h2 className="text-base font-semibold font-[family-name:--font-outfit] text-zinc-700 dark:text-zinc-300 mb-1">
        News Highlights
      </h2>
      <p className="text-sm text-zinc-400">No news articles available yet.</p>
    </div>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

export const NewsHighlights = memo(function NewsHighlights({
  articles,
}: NewsHighlightsProps): React.JSX.Element {
  if (articles.length === 0) return <EmptyState />;

  return (
    <section aria-labelledby="news-highlights-heading">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2
          id="news-highlights-heading"
          className="text-lg font-bold font-[family-name:--font-outfit]
            tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5"
        >
          <span
            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500"
            aria-hidden="true"
          >
            <Newspaper className="h-4 w-4" />
          </span>
          News Highlights
        </h2>

        <Link
          href="/news"
          className="group inline-flex items-center gap-1.5
            text-xs font-bold tracking-widest uppercase
            text-indigo-600 dark:text-indigo-400
            hover:text-indigo-700 transition-colors duration-200
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
          aria-label="View all news articles"
        >
          View All
          <ArrowRight
            className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-200"
            aria-hidden="true"
          />
        </Link>
      </div>

      {/* List */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        role="list"
        aria-label="News highlights"
        className="rounded-2xl overflow-hidden
          border border-zinc-200/80 dark:border-zinc-700/50
          bg-white dark:bg-zinc-900
          shadow-[0_2px_12px_rgba(0,0,0,0.05)]
          divide-y divide-zinc-100 dark:divide-zinc-800
          p-1"
      >
        {articles.map((article) => (
          <NewsArticleRow key={article.id} article={article} />
        ))}
      </motion.div>
    </section>
  );
});
