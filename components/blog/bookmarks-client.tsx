"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Bookmark,
  BookmarkX,
  Eye,
  Heart,
  MessageSquare,
  Search,
  ArrowUpRight,
  Clock,
  BookOpen,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { bookmarkPost } from "@/lib/actions/blog.actions";

// ─── Types ─────────────────────────────────────────────────────

interface BookmarkEntry {
  id: string;
  createdAt: Date;
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    views: number;
    readingTime: number | null;
    publishedAt: Date | null;
    author: {
      id: string;
      firstName: string;
      lastName: string;
      avatar: string | null;
    };
    category: {
      id: string;
      name: string;
      slug: string;
      color: string | null;
    } | null;
    _count: { comments: number; likes: number };
  };
}

interface BookmarksClientProps {
  bookmarks: BookmarkEntry[];
}

// ─── Bookmark Card ─────────────────────────────────────────────

function BookmarkCard({
  entry,
  onRemove,
  removing,
  index,
}: {
  entry: BookmarkEntry;
  onRemove: (postId: string) => void;
  removing: boolean;
  index: number;
}) {
  const { post } = entry;
  const authorName = `${post.author.firstName} ${post.author.lastName}`.trim();
  const initials =
    `${post.author.firstName[0] ?? ""}${post.author.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div
      className={cn(
        "group relative flex rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5 hover:border-border/60",
        "animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both",
        removing && "opacity-30 scale-[0.98] pointer-events-none"
      )}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      {/* Cover image — tall and left-aligned */}
      <div className="hidden sm:block relative w-40 shrink-0 overflow-hidden bg-muted/40">
        {post.coverImage ? (
          <>
            <img
              src={post.coverImage}
              alt={post.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card/30" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/10" />
          </div>
        )}
        {/* Category color strip at bottom of image */}
        {post.category?.color && (
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{ backgroundColor: post.category.color }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {post.category && (
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                style={{
                  backgroundColor: `${post.category.color}12`,
                  color: post.category.color ?? undefined,
                  borderColor: `${post.category.color}25`,
                }}
              >
                {post.category.name}
              </span>
            )}
            {post.readingTime && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/50 font-medium">
                <Clock className="h-3 w-3" />
                {post.readingTime} min read
              </span>
            )}
          </div>

          {/* Remove button */}
          <button
            onClick={() => onRemove(post.id)}
            disabled={removing}
            className="h-8 w-8 rounded-xl shrink-0 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-95"
            title="Remove bookmark"
          >
            <BookmarkX className="h-4 w-4" />
          </button>
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="font-bold text-[15px] leading-snug line-clamp-2 hover:text-primary transition-colors duration-150 mb-2">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xs text-muted-foreground/60 line-clamp-2 mb-3.5 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Author */}
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5 border border-border/40 ring-1 ring-background">
              <AvatarImage
                src={post.author.avatar ?? undefined}
                alt={authorName}
              />
              <AvatarFallback className="text-[9px] bg-primary/8 text-primary font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] font-semibold text-muted-foreground/70">
              {authorName}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground/40">
            <span className="flex items-center gap-1 hover:text-primary transition-colors">
              <Eye className="h-3 w-3" />
              {post.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 hover:text-rose-500 transition-colors">
              <Heart className="h-3 w-3" />
              {post._count.likes}
            </span>
            <span className="flex items-center gap-1 hover:text-primary transition-colors">
              <MessageSquare className="h-3 w-3" />
              {post._count.comments}
            </span>
          </div>
        </div>

        {/* Saved timestamp */}
        <p className="text-[10px] text-muted-foreground/30 mt-2.5 font-medium">
          Saved{" "}
          {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Hover read CTA — slides up from bottom right */}
      <Link
        href={`/blog/${post.slug}`}
        className="absolute bottom-4 right-4 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200"
        aria-label={`Read ${post.title}`}
      >
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/8 border border-primary/15 hover:bg-primary/15 px-2.5 py-1.5 rounded-xl transition-colors">
          Read
          <ArrowUpRight className="h-3 w-3" />
        </span>
      </Link>
    </div>
  );
}

// ─── Main Client Component ──────────────────────────────────────

export function BookmarksClient({
  bookmarks: initialBookmarks,
}: BookmarksClientProps) {
  const [isPending, startTransition] = useTransition();
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const filtered = bookmarks.filter((b) => {
    const q = search.toLowerCase();
    return (
      !q ||
      b.post.title.toLowerCase().includes(q) ||
      (b.post.excerpt ?? "").toLowerCase().includes(q) ||
      (b.post.category?.name ?? "").toLowerCase().includes(q) ||
      `${b.post.author.firstName} ${b.post.author.lastName}`
        .toLowerCase()
        .includes(q)
    );
  });

  // Aggregate reading time
  const totalReadingTime = bookmarks.reduce(
    (s, b) => s + (b.post.readingTime ?? 0),
    0
  );

  function handleRemove(postId: string) {
    setRemovingId(postId);
    startTransition(async () => {
      const res = await bookmarkPost(postId);
      if (res.success) {
        setBookmarks((prev) => prev.filter((b) => b.post.id !== postId));
        toast.success("Removed from bookmarks.");
      } else {
        toast.error(res.error ?? "Failed to remove bookmark.");
      }
      setRemovingId(null);
    });
  }

  return (
    <div className="relative min-h-screen">
      {/* Background texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015] dark:opacity-[0.03]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed top-0 right-1/4 w-[500px] h-[300px] opacity-[0.04] dark:opacity-[0.06] rounded-full blur-3xl bg-amber-400" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* ── Hero Header ── */}
        <div
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600/70 dark:text-amber-400/70 mb-3 bg-amber-500/8 border border-amber-500/15 px-3 py-1 rounded-full">
                <Bookmark className="h-3 w-3" />
                Reading list
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none mb-2">
                Bookmarks
              </h1>
              <p className="text-sm text-muted-foreground">
                {bookmarks.length} {bookmarks.length === 1 ? "post" : "posts"}{" "}
                saved
                {totalReadingTime > 0 && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="text-muted-foreground/70">
                      ~{totalReadingTime} min of reading
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Icon badge */}
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0 shadow-sm">
              <Bookmark className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            </div>
          </div>

          {/* Mini stats strip */}
          {bookmarks.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: Layers,
                  value: bookmarks.length,
                  label: "Saved",
                  delay: "0ms",
                },
                {
                  icon: Clock,
                  value: `${totalReadingTime}m`,
                  label: "To Read",
                  delay: "60ms",
                },
                {
                  icon: Eye,
                  value: bookmarks
                    .reduce((s, b) => s + b.post.views, 0)
                    .toLocaleString(),
                  label: "Total Views",
                  delay: "120ms",
                },
              ].map(({ icon: Icon, value, label, delay }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card px-4 py-3.5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
                  style={{ animationDelay: delay }}
                >
                  <div className="h-8 w-8 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
                  </div>
                  <div>
                    <div className="text-base font-bold tabular-nums leading-none">
                      {value}
                    </div>
                    <div className="text-[10px] text-muted-foreground/50 font-semibold uppercase tracking-wider mt-0.5">
                      {label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Search ── */}
        {bookmarks.length > 0 && (
          <div className="relative animate-in fade-in duration-500 fill-mode-both [animation-delay:200ms]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <Input
              placeholder="Search by title, author, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl border-border/40 bg-muted/20 h-10 text-sm focus-visible:ring-amber-500/20 focus-visible:border-amber-500/30 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted-foreground hover:text-foreground bg-muted px-2 py-0.5 rounded-md transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* ── Bookmark List ── */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((entry, i) => (
              <BookmarkCard
                key={entry.id}
                entry={entry}
                onRemove={handleRemove}
                removing={removingId === entry.post.id}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-300">
            <div className="relative mb-5">
              <div className="h-16 w-16 rounded-3xl bg-muted/60 border border-border/40 flex items-center justify-center">
                <Bookmark className="h-7 w-7 text-muted-foreground/20" />
              </div>
              {search && (
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-muted border border-border/50 flex items-center justify-center">
                  <Search className="h-2.5 w-2.5 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <h3 className="font-bold text-base mb-1.5">
              {search ? "No bookmarks found" : "Your reading list is empty"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              {search
                ? `No bookmarks match "${search}"`
                : "Save posts you want to read later and they'll appear here."}
            </p>
            {!search && (
              <Button
                asChild
                size="sm"
                className="mt-5 rounded-xl gap-2 font-semibold"
              >
                <Link href="/blog">Browse posts</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
