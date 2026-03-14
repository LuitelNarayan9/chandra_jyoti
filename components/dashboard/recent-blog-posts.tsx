"use client";

import { memo, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Heart,
  MessageCircle,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { TimeAgo } from "@/components/shared/time-ago";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  readingTime: number | null;
  publishedAt: Date | null;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    subtitle?: string | null;
    avatar: string | null;
  };
  category: { name: string; slug: string; color: string | null } | null;
  _count: { likes: number; comments: number };
}

interface RecentBlogPostsProps {
  posts: BlogPostData[];
}

// ─── Security helpers ─────────────────────────────────────────────────────────

const SAFE_PROTOCOLS = new Set(["https:", "http:"]);

function sanitiseImageSrc(src: string | null): string | null {
  if (!src) return null;
  try {
    const { protocol } = new URL(src);
    return SAFE_PROTOCOLS.has(protocol) ? src : null;
  } catch {
    return src.startsWith("/") ? src : null;
  }
}

function getInitials(first: string, last: string): string {
  return `${first.at(0) ?? ""}${last.at(0) ?? ""}`.toUpperCase();
}

// ─── Animation variants (module-scope → stable refs) ─────────────────────────

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const },
  },
} as const;

// ─── BlogPostCard ─────────────────────────────────────────────────────────────

const BlogPostCard = memo(function BlogPostCard({
  post,
  priority = false,
}: {
  post: BlogPostData;
  priority?: boolean;
}) {
  const safeCover = useMemo(
    () => sanitiseImageSrc(post.coverImage),
    [post.coverImage]
  );
  const safeAvatar = useMemo(
    () => sanitiseImageSrc(post.author.avatar),
    [post.author.avatar]
  );
  const initials = useMemo(
    () => getInitials(post.author.firstName, post.author.lastName),
    [post.author.firstName, post.author.lastName]
  );
  const isoDate = useMemo(
    () => post.publishedAt?.toISOString() ?? "",
    [post.publishedAt]
  );

  const accent = post.category?.color ?? "#3b82f6";

  return (
    <motion.article variants={cardVariants} className="h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="group block h-full rounded-2xl
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-offset-2 focus-visible:ring-blue-500"
        aria-label={`Read: ${post.title}`}
      >
        {/* ── Card shell ───────────────────────────────────────────────── */}
        <div
          className="relative h-full flex flex-col
            rounded-2xl overflow-hidden
            bg-white dark:bg-zinc-900
            border border-zinc-200 dark:border-zinc-700/60
            shadow-[0_2px_12px_rgba(0,0,0,0.06)]
            transition-all duration-[380ms] ease-out
            group-hover:-translate-y-1.5 group-active:-translate-y-1.5
            group-hover:shadow-[0_20px_48px_rgba(0,0,0,0.12)] group-active:shadow-[0_20px_48px_rgba(0,0,0,0.12)]"
          style={{ "--accent": accent } as React.CSSProperties}
        >
          {/* Ambient glow behind card — category coloured */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl
              opacity-0 group-hover:opacity-100 group-active:opacity-100 blur-2xl
              transition-opacity duration-[380ms]"
            style={{ background: `${accent}22` }}
          />

          {/* ── Cover image — FIXED height, not percentage ────────────── */}
          {/*
           * KEY FIX: h-48 sm:h-52 gives the image a fixed pixel height.
           * With flex-col on the card, the body below naturally takes the
           * remaining space. Percentage heights in flex children require a
           * fixed height on the parent — which we intentionally don't set
           * so cards can grow to fit their content.
           */}
          <div className="relative h-48 sm:h-52 w-full overflow-hidden shrink-0">
            {safeCover ? (
              <Image
                src={safeCover}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover
                  transition-transform duration-700 ease-out
                  group-hover:scale-[1.05] group-active:scale-[1.05]"
                priority={priority}
              />
            ) : (
              /* Gradient placeholder when no cover image */
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${accent}18, ${accent}38)`,
                }}
              >
                <BookOpen
                  className="h-14 w-14 opacity-20"
                  style={{ color: accent }}
                />
              </div>
            )}

            {/* Light scrim at bottom of image for text legibility */}
            <div
              aria-hidden="true"
              className="absolute inset-0
                bg-[linear-gradient(to_top,rgba(0,0,0,0.18)_0%,transparent_50%)]"
            />

            {/* Category badge — top-right */}
            {post.category && (
              <span
                className="absolute top-3 right-3 z-10
                  inline-flex items-center
                  px-3.5 py-1.5 rounded-full
                  text-[11px] font-bold tracking-wide text-white
                  shadow-[0_2px_10px_rgba(0,0,0,0.25)]
                  border border-white/20 backdrop-blur-sm"
                style={{ backgroundColor: accent }}
              >
                {post.category.name}
              </span>
            )}

            {/* Reading-time chip — bottom-left */}
            {post.readingTime != null && (
              <span
                className="absolute bottom-3 left-3 z-10
                  inline-flex items-center gap-1.5
                  bg-black/55 backdrop-blur-md border border-white/15
                  text-white/90 text-[10px] font-semibold tracking-wide
                  px-2.5 py-1 rounded-full"
                aria-label={`${post.readingTime} minute read`}
              >
                <Clock className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                {post.readingTime} min
              </span>
            )}
          </div>

          {/* ── Card body ── flex-1 so it fills remaining height ──────── */}
          <div className="flex flex-col flex-1 px-5 pt-4 pb-5 gap-3">
            {/* Title */}
            <h3
              className="font-extrabold text-[0.975rem] leading-snug line-clamp-2
                text-zinc-900 dark:text-zinc-50
                font-[family-name:--font-outfit]
                transition-colors duration-200
                group-hover:text-[var(--accent)] group-active:text-[var(--accent)]"
            >
              {post.title}
            </h3>

            {/* Excerpt */}
            {post.excerpt && (
              <p
                className="text-sm text-zinc-500 dark:text-zinc-400
                line-clamp-2 leading-relaxed flex-1"
              >
                {post.excerpt}
              </p>
            )}

            {/* Engagement row */}
            <div
              className="flex items-center gap-3"
              aria-label="Engagement stats"
            >
              <span
                className="flex items-center gap-1 text-[11px] font-medium
                  text-zinc-400 group-hover:text-rose-500 group-active:text-rose-500 transition-colors duration-200"
                aria-label={`${post._count.likes} likes`}
              >
                <Heart className="h-3 w-3 shrink-0" aria-hidden="true" />
                {post._count.likes}
              </span>
              <span
                className="flex items-center gap-1 text-[11px] font-medium
                  text-zinc-400 group-hover:text-sky-500 group-active:text-sky-500 transition-colors duration-200"
                aria-label={`${post._count.comments} comments`}
              >
                <MessageCircle
                  className="h-3 w-3 shrink-0"
                  aria-hidden="true"
                />
                {post._count.comments}
              </span>
            </div>

            {/* Animated hairline divider */}
            <div
              className="relative h-px w-full overflow-hidden rounded-full
              bg-zinc-100 dark:bg-zinc-800"
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-0 rounded-full
                  group-hover:w-full group-active:w-full transition-[width] duration-500 ease-out"
                style={{ background: accent }}
              />
            </div>

            {/* ── Footer: Author | pipe | Date ─────────────────────────── */}
            <div className="flex items-stretch">
              {/* Author */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar
                  className="h-10 w-10 shrink-0
                  ring-2 ring-white dark:ring-zinc-800 shadow-sm"
                >
                  {safeAvatar && (
                    <AvatarImage
                      src={safeAvatar}
                      alt={`${post.author.firstName} ${post.author.lastName}`}
                    />
                  )}
                  <AvatarFallback
                    className="text-xs font-bold select-none text-white"
                    style={{ background: accent }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col min-w-0">
                  <span
                    className="text-[12px] font-bold leading-tight
                    text-zinc-800 dark:text-zinc-100 truncate"
                  >
                    By {post.author.firstName} {post.author.lastName}
                  </span>
                  {post.author.subtitle && (
                    <span
                      className="text-[11px] leading-tight
                      text-zinc-400 dark:text-zinc-500 truncate"
                    >
                      {post.author.subtitle}
                    </span>
                  )}
                </div>
              </div>

              {/* Vertical rule */}
              {post.publishedAt && (
                <>
                  <div
                    aria-hidden="true"
                    className="w-px self-stretch mx-4
                      bg-zinc-200 dark:bg-zinc-700 rounded-full shrink-0"
                  />

                  {/* Date */}
                  <div className="flex flex-col items-start justify-center shrink-0">
                    <span
                      className="text-[11px] font-bold leading-tight
                      text-zinc-700 dark:text-zinc-200"
                    >
                      Date
                    </span>
                    <time
                      dateTime={isoDate}
                      className="text-[11px] leading-tight
                        text-zinc-500 dark:text-zinc-400"
                    >
                      <TimeAgo date={post.publishedAt} />
                    </time>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom accent line — grows left-to-right on hover */}
          <div
            aria-hidden="true"
            className="h-[3px] w-0 group-hover:w-full group-active:w-full
              transition-[width] duration-500 ease-out shrink-0"
            style={{
              background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
            }}
          />
        </div>
      </Link>
    </motion.article>
  );
});

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = memo(function EmptyState(): React.JSX.Element {
  return (
    <div
      className="rounded-2xl border border-dashed border-zinc-200
      dark:border-zinc-700/60 p-10 text-center bg-white dark:bg-zinc-900"
    >
      <BookOpen
        className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600 mb-3"
        aria-hidden="true"
      />
      <h2
        className="text-base font-semibold font-[family-name:--font-outfit]
        text-zinc-700 dark:text-zinc-300 mb-1"
      >
        Recent Blog Posts
      </h2>
      <p className="text-sm text-zinc-400">
        No posts yet. Be the first to share your story!
      </p>
    </div>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

export const RecentBlogPosts = memo(function RecentBlogPosts({
  posts,
}: RecentBlogPostsProps): React.JSX.Element {
  if (posts.length === 0) return <EmptyState />;

  return (
    <section aria-labelledby="recent-posts-heading">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2
          id="recent-posts-heading"
          className="text-lg font-bold font-[family-name:--font-outfit]
            tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Recent Blog Posts
        </h2>
        <Link
          href="/blog"
          className="group inline-flex items-center gap-1.5
            text-xs font-bold tracking-widest uppercase
            text-blue-600 dark:text-blue-400
            hover:text-blue-700 transition-colors duration-200
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
          aria-label="View all blog posts"
        >
          View All
          <ArrowRight
            className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-200"
            aria-hidden="true"
          />
        </Link>
      </div>

      {/* Grid */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-5 sm:grid-cols-2"
        role="list"
        aria-label="Recent blog posts"
      >
        {posts.map((post, idx) => (
          <div key={post.id} role="listitem">
            <BlogPostCard post={post} priority={idx === 0} />
          </div>
        ))}
      </motion.div>
    </section>
  );
});
