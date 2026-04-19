"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Heart,
  MessageSquare,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeaturedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  readingTime: number | null;
  views: number;
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
  _count: {
    comments: number;
    likes: number;
  };
}

interface BlogCardFeaturedProps {
  posts: FeaturedPost[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INTERVAL = 5000;
const TICK = 50;

// ─── Slide animation variants ────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "5%" : "-5%",
    opacity: 0,
    scale: 1.03,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { duration: 0.6, ease: EASE },
      opacity: { duration: 0.4, ease: "easeOut" as const },
      scale: { duration: 0.6, ease: EASE },
    },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-5%" : "5%",
    opacity: 0,
    scale: 0.97,
    transition: {
      x: { duration: 0.5, ease: EASE },
      opacity: { duration: 0.3, ease: "easeIn" as const },
      scale: { duration: 0.5, ease: EASE },
    },
  }),
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.07,
      ease: EASE,
    },
  }),
};

// ─── Main carousel component ─────────────────────────────────────────────────

export function BlogCardFeatured({ posts }: BlogCardFeaturedProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number, dir: number) => {
    setDirection(dir);
    setCurrent(idx);
    setProgress(0);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % posts.length, 1);
  }, [current, posts.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + posts.length) % posts.length, -1);
  }, [current, posts.length, goTo]);

  // Auto-advance + progress ticker
  useEffect(() => {
    if (posts.length <= 1 || paused) return;

    intervalRef.current = setInterval(next, INTERVAL);
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + (TICK / INTERVAL) * 100, 100));
    }, TICK);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [paused, next, posts.length]);

  // Reset progress on slide change
  useEffect(() => {
    setProgress(0);
  }, [current]);

  if (!posts.length) return null;
  if (posts.length === 1) return <SingleSlide post={posts[0]} />;

  const post = posts[current];
  const initials =
    (post.author.firstName?.[0] ?? "") + (post.author.lastName?.[0] ?? "");

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.012 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Stage ─────────────────────────────────────────────────────── */}
      <div className="relative w-full min-h-[420px] md:min-h-[540px] overflow-hidden rounded-3xl">
        {/* Background slide */}
        <AnimatePresence custom={direction} initial={false} mode="sync">
          <motion.div
            key={`bg-${post.id}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: post.category?.color
                    ? `linear-gradient(135deg, ${post.category.color}50 0%, ${post.category.color}15 60%, transparent 100%)`
                    : "linear-gradient(135deg, hsl(var(--primary)/0.35) 0%, hsl(var(--primary)/0.08) 100%)",
                }}
              />
            )}
            {/* Gradient overlays for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content layer — fades in per-slide independently */}
        <AnimatePresence mode="wait">
          <div
            key={`content-${post.id}`}
            className="absolute inset-0 flex flex-col justify-between p-7 md:p-10"
          >
            {/* Top: badges */}
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              custom={0}
              className="flex items-center gap-2.5"
            >
              {post.category && (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase backdrop-blur-md border border-white/20"
                  style={{
                    backgroundColor: `${post.category.color}30`,
                    color: "white",
                  }}
                >
                  {post.category.name}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase backdrop-blur-md bg-amber-400/20 border border-amber-400/30 text-amber-300">
                <span className="text-amber-400">✦</span> Featured
              </span>
            </motion.div>

            {/* Bottom: title + author + CTA */}
            <div className="space-y-5">
              <div className="space-y-2.5 max-w-3xl">
                <motion.h2
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                  className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight font-(family-name:--font-outfit) drop-shadow-sm"
                >
                  {post.title}
                </motion.h2>
                {post.excerpt && (
                  <motion.p
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    custom={2}
                    className="text-sm md:text-base text-white/65 leading-relaxed line-clamp-2 max-w-2xl"
                  >
                    {post.excerpt}
                  </motion.p>
                )}
              </div>

              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                custom={3}
                className="flex items-center justify-between"
              >
                {/* Author */}
                <Link
                  href={`/blog?author=${post.author.id}`}
                  className="flex items-center gap-3 group/author"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-white/30 shadow-lg">
                    <AvatarImage src={post.author.avatar ?? undefined} />
                    <AvatarFallback className="text-xs font-bold bg-white/20 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover/author:text-white/80 transition-colors">
                      {post.author.firstName} {post.author.lastName}
                    </p>
                    <p className="text-xs text-white/55">
                      {post.publishedAt
                        ? formatDistanceToNow(new Date(post.publishedAt), {
                            addSuffix: true,
                          })
                        : ""}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-4">
                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-3 text-xs text-white/55">
                    {post.readingTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readingTime} min
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      {post._count.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post._count.comments}
                    </span>
                  </div>

                  {/* Read CTA */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group/cta inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold tracking-wide transition-all duration-300 hover:bg-primary hover:text-white hover:gap-3 shadow-xl shadow-black/20"
                  >
                    Read Article
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </AnimatePresence>

        {/* ── Prev button ── */}
        <button
          onClick={prev}
          aria-label="Previous post"
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 z-20",
            "h-11 w-11 rounded-full flex items-center justify-center",
            "bg-black/30 hover:bg-black/55 backdrop-blur-md",
            "border border-white/15 hover:border-white/35",
            "text-white/70 hover:text-white",
            "transition-all duration-200 hover:scale-105 active:scale-95",
            "shadow-lg shadow-black/20"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* ── Next button ── */}
        <button
          onClick={next}
          aria-label="Next post"
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 z-20",
            "h-11 w-11 rounded-full flex items-center justify-center",
            "bg-black/30 hover:bg-black/55 backdrop-blur-md",
            "border border-white/15 hover:border-white/35",
            "text-white/70 hover:text-white",
            "transition-all duration-200 hover:scale-105 active:scale-95",
            "shadow-lg shadow-black/20"
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* ── Dots centered below slide ────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {posts.map((p, i) => {
          const isActive = i === current;
          return (
            <button
              key={p.id}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              aria-label={`Go to slide ${i + 1}`}
              className="relative flex items-center justify-center"
            >
              <motion.span
                animate={{
                  width: isActive ? 36 : 10,
                  opacity: isActive ? 1 : 0.3,
                }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="block h-2.5 rounded-full bg-muted-foreground/40 overflow-hidden relative"
              >
                {isActive && (
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-foreground transition-none"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </motion.span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Single slide (no carousel chrome) ───────────────────────────────────────

function SingleSlide({ post }: { post: FeaturedPost }) {
  const initials =
    (post.author.firstName?.[0] ?? "") + (post.author.lastName?.[0] ?? "");

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-3xl"
    >
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative w-full min-h-[420px] md:min-h-[520px] overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              sizes="100vw"
              priority
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: post.category?.color
                  ? `linear-gradient(135deg, ${post.category.color}40 0%, ${post.category.color}10 60%, transparent 100%)`
                  : "linear-gradient(135deg, hsl(var(--primary)/0.3) 0%, hsl(var(--primary)/0.05) 100%)",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-between p-7 md:p-10">
            <div className="flex items-center gap-2.5">
              {post.category && (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase backdrop-blur-md border border-white/20"
                  style={{
                    backgroundColor: `${post.category.color}30`,
                    color: "white",
                  }}
                >
                  {post.category.name}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase backdrop-blur-md bg-amber-400/20 border border-amber-400/30 text-amber-300">
                <span className="text-amber-400">✦</span> Featured
              </span>
            </div>
            <div className="space-y-5">
              <div className="space-y-2.5 max-w-3xl">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight font-(family-name:--font-outfit)">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm md:text-base text-white/65 leading-relaxed line-clamp-2 max-w-2xl">
                    {post.excerpt}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 ring-2 ring-white/30 shadow-lg">
                    <AvatarImage src={post.author.avatar ?? undefined} />
                    <AvatarFallback className="text-xs font-bold bg-white/20 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {post.author.firstName} {post.author.lastName}
                    </p>
                    <p className="text-xs text-white/55">
                      {post.publishedAt
                        ? formatDistanceToNow(new Date(post.publishedAt), {
                            addSuffix: true,
                          })
                        : ""}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold tracking-wide transition-all duration-300 group-hover:bg-primary group-hover:text-white shadow-xl">
                  Read Article <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
