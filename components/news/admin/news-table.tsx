"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Star,
  StarOff,
  Eye,
  ExternalLink,
  MapPin,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  deleteNewsArticle,
  toggleNewsFeatured,
} from "@/lib/actions/news.actions";
import {
  LOCAL_NEWS_TAG_LABELS,
  LOCAL_NEWS_TAG_COLORS,
} from "@/lib/validations/news";

// ─── Types ────────────────────────────────────────────────────

interface NewsArticleRow {
  id: string;
  title: string;
  slug: string;
  source: string;
  sourceName: string | null;
  category: string;
  localTag: string | null;
  urgency: string;
  isFeatured: boolean;
  views: number;
  publishedAt: Date;
  _count: { bookmarks: number };
}

interface NewsTableProps {
  articles: NewsArticleRow[];
}

// ─── Constants ────────────────────────────────────────────────

const CATEGORY_BADGE: Record<string, string> = {
  LOCAL:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  STATE: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  NATIONAL:
    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  INTERNATIONAL:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
};

const URGENCY_BADGE: Record<string, string> = {
  NORMAL: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
  FEATURED:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  URGENT:
    "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

// ─── Component ────────────────────────────────────────────────

export function NewsTable({ articles }: NewsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteNewsArticle({ articleId: deleteId });
      if (result.success) {
        toast.success(result.message ?? "Article deleted.");
      } else {
        toast.error(result.error ?? "Failed to delete.");
      }
      setDeleteId(null);
    });
  };

  const handleToggleFeatured = (articleId: string) => {
    startTransition(async () => {
      const result = await toggleNewsFeatured(articleId);
      if (result.success) {
        toast.success(result.message ?? "Updated.");
      } else {
        toast.error(result.error ?? "Failed.");
      }
    });
  };

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Globe className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No articles found.</p>
        <Button asChild size="sm" className="mt-4 rounded-xl">
          <Link href="/admin/news/create">Create First Article</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left font-semibold py-3 px-4 text-muted-foreground text-xs tracking-wide uppercase">
                  Title
                </th>
                <th className="text-left font-semibold py-3 px-4 text-muted-foreground text-xs tracking-wide uppercase">
                  Category
                </th>
                <th className="text-left font-semibold py-3 px-4 text-muted-foreground text-xs tracking-wide uppercase hidden md:table-cell">
                  Source
                </th>
                <th className="text-left font-semibold py-3 px-4 text-muted-foreground text-xs tracking-wide uppercase hidden lg:table-cell">
                  Tag
                </th>
                <th className="text-center font-semibold py-3 px-4 text-muted-foreground text-xs tracking-wide uppercase hidden sm:table-cell">
                  Views
                </th>
                <th className="text-center font-semibold py-3 px-4 text-muted-foreground text-xs tracking-wide uppercase hidden sm:table-cell">
                  Status
                </th>
                <th className="text-right font-semibold py-3 px-4 text-muted-foreground text-xs tracking-wide uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article, i) => (
                <motion.tr
                  key={article.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  {/* Title */}
                  <td className="py-3 px-4 max-w-[280px]">
                    <Link
                      href={`/news/${article.slug}`}
                      className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {article.title}
                    </Link>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      {new Date(article.publishedAt).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </p>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full text-[0.65rem] font-semibold",
                        CATEGORY_BADGE[article.category] ?? ""
                      )}
                    >
                      {article.category}
                    </Badge>
                  </td>

                  {/* Source */}
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {article.source === "LOCAL" ? (
                        <MapPin className="h-3 w-3" />
                      ) : (
                        <Globe className="h-3 w-3" />
                      )}
                      {article.source === "LOCAL"
                        ? "Local"
                        : article.sourceName ?? "External"}
                    </div>
                  </td>

                  {/* Tag */}
                  <td className="py-3 px-4 hidden lg:table-cell">
                    {article.localTag ? (
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
                        {LOCAL_NEWS_TAG_LABELS[
                          article.localTag as keyof typeof LOCAL_NEWS_TAG_LABELS
                        ] ?? article.localTag}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">
                        —
                      </span>
                    )}
                  </td>

                  {/* Views */}
                  <td className="py-3 px-4 text-center hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {article.views.toLocaleString()}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center hidden sm:table-cell">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full text-[0.6rem]",
                        URGENCY_BADGE[article.urgency] ?? ""
                      )}
                    >
                      {article.urgency}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-44 rounded-xl"
                      >
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/news/${article.slug}`}
                            className="gap-2"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Article
                          </Link>
                        </DropdownMenuItem>

                        {article.source === "LOCAL" && (
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/news/${article.id}/edit`}
                              className="gap-2"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={() => handleToggleFeatured(article.id)}
                          className="gap-2"
                        >
                          {article.isFeatured ? (
                            <>
                              <StarOff className="h-3.5 w-3.5" />
                              Remove Featured
                            </>
                          ) : (
                            <>
                              <Star className="h-3.5 w-3.5" />
                              Mark Featured
                            </>
                          )}
                        </DropdownMenuItem>

                        {article.source === "EXTERNAL" &&
                          article.sourceName && (
                            <DropdownMenuItem asChild>
                              <a
                                href={`/news/${article.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="gap-2"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Open Source
                              </a>
                            </DropdownMenuItem>
                          )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => setDeleteId(article.id)}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              article and all associated bookmarks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
