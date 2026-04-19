"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, format, isPast } from "date-fns";
import { toast } from "sonner";
import {
  FileText,
  Globe,
  Archive,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Heart,
  MessageSquare,
  Bookmark,
  MoreHorizontal,
  Search,
  CalendarClock,
  TrendingUp,
  Feather,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { deletePost } from "@/lib/actions/blog.actions";

// ─── Types ─────────────────────────────────────────────────────

type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  excerpt: string | null;
  coverImage: string | null;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  readingTime: number | null;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
  _count: { comments: number; likes: number; bookmarks: number };
}

interface MyPostsClientProps {
  posts: Post[];
}

// ─── Status config ─────────────────────────────────────────────

const STATUS_CONFIG = {
  ALL: {
    label: "All Posts",
    shortLabel: "All",
    icon: FileText,
    pill: "bg-foreground/8 text-foreground border-foreground/10",
    accent: "from-foreground/20 to-foreground/5",
    dot: "bg-foreground/40",
  },
  DRAFT: {
    label: "Drafts",
    shortLabel: "Draft",
    icon: Feather,
    pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    accent: "from-amber-400/20 to-amber-400/0",
    dot: "bg-amber-400",
  },
  PUBLISHED: {
    label: "Published",
    shortLabel: "Live",
    icon: Globe,
    pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    accent: "from-emerald-400/20 to-emerald-400/0",
    dot: "bg-emerald-400",
  },
  SCHEDULED: {
    label: "Scheduled",
    shortLabel: "Scheduled",
    icon: Clock,
    pill: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    accent: "from-sky-400/20 to-sky-400/0",
    dot: "bg-sky-400",
  },
  ARCHIVED: {
    label: "Archived",
    shortLabel: "Archived",
    icon: Archive,
    pill: "bg-muted text-muted-foreground border-border/50",
    accent: "from-muted-foreground/10 to-transparent",
    dot: "bg-muted-foreground/40",
  },
} as const;

// ─── Stat Pill ─────────────────────────────────────────────────

function StatPill({
  icon: Icon,
  value,
  label,
  className,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-2xl border border-border/40 bg-card px-5 py-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground/60">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-widest">
          {label}
        </span>
      </div>
      <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

// ─── Post Card ─────────────────────────────────────────────────

function PostCard({
  post,
  onDelete,
  index,
}: {
  post: Post;
  onDelete: (id: string) => void;
  index: number;
}) {
  const cfg = STATUS_CONFIG[post.status];

  const isScheduledFuture =
    post.status === "SCHEDULED" &&
    post.scheduledAt &&
    !isPast(new Date(post.scheduledAt));

  return (
    <div
      className="group relative rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden
                 transition-all duration-300 ease-out
                 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 hover:border-border/70
                 animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Status accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b",
          cfg.accent
        )}
      />

      <div className="flex gap-0 sm:gap-0">
        {/* Cover image */}
        {post.coverImage ? (
          <div className="hidden sm:block relative w-44 shrink-0 overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/20" />
            {/* Hover overlay with edit CTA */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Link
                href={`/blog/${post.slug}/edit`}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1.5 rounded-xl hover:bg-white/30 transition-colors"
              >
                <Edit3 className="h-3 w-3" /> Edit
              </Link>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex w-44 shrink-0 items-center justify-center bg-muted/30 border-r border-border/30">
            <FileText className="h-10 w-10 text-muted-foreground/10" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 p-5 pl-7">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Status pill */}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border",
                  cfg.pill
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                {cfg.shortLabel}
              </span>

              {/* Category */}
              {post.category && (
                <span
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
                  style={{
                    backgroundColor: `${post.category.color}12`,
                    color: post.category.color ?? undefined,
                    borderColor: `${post.category.color}25`,
                  }}
                >
                  {post.category.name}
                </span>
              )}
            </div>

            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 rounded-xl border-border/50 shadow-lg"
              >
                <DropdownMenuItem asChild className="gap-2 rounded-lg text-sm">
                  <Link href={`/blog/${post.slug}`}>
                    <Eye className="h-3.5 w-3.5" /> View live
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 rounded-lg text-sm">
                  <Link href={`/blog/${post.slug}/edit`}>
                    <Edit3 className="h-3.5 w-3.5" /> Edit post
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={() => onDelete(post.id)}
                  className="gap-2 rounded-lg text-sm text-destructive focus:text-destructive focus:bg-destructive/8"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title */}
          <Link href={`/blog/${post.slug}/edit`}>
            <h3 className="font-bold text-[15px] leading-snug line-clamp-2 hover:text-primary transition-colors duration-150 mb-1.5">
              {post.title}
            </h3>
          </Link>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xs text-muted-foreground/70 line-clamp-1 mb-3 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Scheduled info */}
          {isScheduledFuture && post.scheduledAt && (
            <div className="inline-flex items-center gap-1.5 mb-3 text-[11px] text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20 border border-sky-200/50 dark:border-sky-800/30 rounded-lg px-2.5 py-1">
              <CalendarClock className="h-3 w-3" />
              Publishes{" "}
              {format(new Date(post.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
            </div>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground/50">
            <span className="font-medium">
              Updated{" "}
              {formatDistanceToNow(new Date(post.updatedAt), {
                addSuffix: true,
              })}
            </span>
            {post.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readingTime} min
              </span>
            )}
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
            <span className="flex items-center gap-1 hover:text-amber-500 transition-colors">
              <Bookmark className="h-3 w-3" />
              {post._count.bookmarks}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Client Component ──────────────────────────────────────

export function MyPostsClient({ posts: initialPosts }: MyPostsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [posts, setPosts] = useState(initialPosts);
  const [activeTab, setActiveTab] = useState<PostStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Aggregate stats
  const totalViews = posts.reduce((s, p) => s + p.views, 0);
  const totalLikes = posts.reduce((s, p) => s + p._count.likes, 0);
  const totalComments = posts.reduce((s, p) => s + p._count.comments, 0);
  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;

  const tabs = (
    ["ALL", "PUBLISHED", "DRAFT", "SCHEDULED", "ARCHIVED"] as const
  ).map((s) => ({
    key: s,
    ...STATUS_CONFIG[s],
    count:
      s === "ALL" ? posts.length : posts.filter((p) => p.status === s).length,
  }));

  const filtered = posts.filter((p) => {
    const matchesTab = activeTab === "ALL" || p.status === activeTab;
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt ?? "").toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  function handleDelete(id: string) {
    setDeleteId(id);
  }

  function confirmDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const res = await deletePost({ postId: deleteId });
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== deleteId));
        toast.success("Post deleted.");
      } else {
        toast.error(res.error ?? "Failed to delete.");
      }
      setDeleteId(null);
    });
  }

  return (
    <div className="relative min-h-screen">
      {/* Subtle background texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015] dark:opacity-[0.03]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Page glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-[0.04] dark:opacity-[0.06] rounded-full blur-3xl bg-primary" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Delete dialog */}
        <AlertDialog
          open={!!deleteId}
          onOpenChange={(o) => !o && setDeleteId(null)}
        >
          <AlertDialogContent className="rounded-2xl max-w-sm border-border/50 shadow-2xl">
            <AlertDialogHeader className="gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/15 mx-auto mb-1">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-center text-base font-bold">
                Delete this post?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-sm text-muted-foreground leading-relaxed">
                This permanently removes the post and all its comments, likes,
                and bookmarks. You can't undo this.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row gap-2 mt-2">
              <AlertDialogCancel className="flex-1 rounded-xl h-9 text-sm font-medium">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isPending}
                className="flex-1 rounded-xl h-9 text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete forever
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Hero Header ── */}
        <div
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-3 bg-primary/6 border border-primary/10 px-3 py-1 rounded-full">
                <Sparkles className="h-3 w-3" />
                Your writing
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none mb-2">
                My Posts
              </h1>
              <p className="text-sm text-muted-foreground">
                {posts.length} total posts · {publishedCount} published
              </p>
            </div>

            <Button
              asChild
              className="rounded-xl gap-2 font-semibold shadow-sm px-4 h-10 shrink-0 transition-all duration-150 hover:shadow-md active:scale-[0.97]"
            >
              <Link href="/blog/create">
                <Plus className="h-4 w-4" />
                New Post
              </Link>
            </Button>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatPill
              icon={Eye}
              value={totalViews}
              label="Total Views"
              className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
            />
            <StatPill
              icon={Heart}
              value={totalLikes}
              label="Likes"
              className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both [animation-delay:60ms]"
            />
            <StatPill
              icon={MessageSquare}
              value={totalComments}
              label="Comments"
              className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both [animation-delay:120ms]"
            />
            <StatPill
              icon={TrendingUp}
              value={publishedCount}
              label="Published"
              className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both [animation-delay:180ms]"
            />
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both [animation-delay:200ms]">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar rounded-2xl border border-border/40 bg-muted/20 p-1.5">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={cn(
                    "relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200",
                    isActive
                      ? "bg-background text-foreground shadow-sm border border-border/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {t.shortLabel}
                  <span
                    className={cn(
                      "tabular-nums text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground/60"
                    )}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative animate-in fade-in duration-500 fill-mode-both [animation-delay:250ms]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <Input
            placeholder="Search your posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl border-border/40 bg-muted/20 h-10 text-sm focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all"
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

        {/* ── Post List ── */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDelete}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-300">
            <div className="relative mb-5">
              <div className="h-16 w-16 rounded-3xl bg-muted/60 border border-border/40 flex items-center justify-center">
                <FileText className="h-7 w-7 text-muted-foreground/20" />
              </div>
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-muted border border-border/50 flex items-center justify-center">
                <Search className="h-2.5 w-2.5 text-muted-foreground/40" />
              </div>
            </div>
            <h3 className="font-bold text-base mb-1.5">
              {search ? "No posts found" : "Nothing here yet"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              {search
                ? `No posts match "${search}"`
                : activeTab === "ALL"
                  ? "Start writing your first post and share your ideas with the world."
                  : `You don't have any ${STATUS_CONFIG[activeTab].label.toLowerCase()} posts.`}
            </p>
            {!search && activeTab === "ALL" && (
              <Button
                asChild
                size="sm"
                className="mt-5 rounded-xl gap-2 font-semibold"
              >
                <Link href="/blog/create">
                  <Plus className="h-4 w-4" /> Write your first post
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
