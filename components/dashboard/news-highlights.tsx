"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Globe, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TimeAgo } from "@/components/shared/time-ago";

interface NewsData {
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

const SOURCE_ICONS: Record<string, React.ElementType> = {
  LOCAL: MapPin,
  EXTERNAL: Globe,
};

const CATEGORY_COLORS: Record<string, string> = {
  LOCAL:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  STATE: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  NATIONAL:
    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  INTERNATIONAL:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
};

export function NewsHighlights({ articles }: NewsHighlightsProps) {
  if (articles.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-3">
          News Highlights
        </h2>
        <p className="text-sm text-muted-foreground">
          No news articles available yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-indigo-500" />
          News Highlights
        </h2>
        <Link
          href="/news"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group"
        >
          View All
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      <Card className="divide-y border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        {articles.map((article, idx) => {
          const SourceIcon = SOURCE_ICONS[article.source] ?? Globe;
          return (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * idx }}
            >
              <Link
                href={`/news/${article.slug}`}
                className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="rounded-lg bg-muted/50 p-2 shrink-0 mt-0.5">
                  <SourceIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 h-4 ${CATEGORY_COLORS[article.category] ?? ""}`}
                    >
                      {article.category}
                    </Badge>
                    {article.sourceName && (
                      <span className="text-[10px] text-muted-foreground">
                        {article.sourceName}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      <TimeAgo date={article.publishedAt} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </Card>
    </div>
  );
}
