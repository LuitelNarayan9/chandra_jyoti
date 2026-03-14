"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Clock, Heart, MessageSquare, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BlogCardProps {
  post: {
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
  };
  index?: number;
}

export function BlogCard({ post, index = 0 }: BlogCardProps) {
  const initials =
    (post.author.firstName?.[0] ?? "") + (post.author.lastName?.[0] ?? "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group"
    >
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <article className="relative h-full flex flex-col rounded-2xl overflow-hidden border border-border/50 bg-card transition-all duration-500 hover:border-border hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-1">
          {/* Issue number watermark */}
          <span className="absolute top-4 right-4 z-10 font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/40 select-none">
            #{String(index + 1).padStart(2, "0")}
          </span>

          {/* Cover Image */}
          {post.coverImage ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Category pill on image */}
              {post.category && (
                <div className="absolute bottom-3 left-3">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border shadow-sm"
                    style={{
                      backgroundColor: post.category.color ?? "#6366f1",
                      color: "#ffffff",
                      borderColor: "rgba(255,255,255,0.25)",
                      textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                    }}
                  >
                    {post.category.name}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              className="relative aspect-[16/9] w-full overflow-hidden flex items-center justify-center"
              style={{
                background: post.category?.color
                  ? `linear-gradient(135deg, ${post.category.color}15, ${post.category.color}05)`
                  : "linear-gradient(135deg, hsl(var(--primary)/0.1), hsl(var(--primary)/0.03))",
              }}
            >
              <span className="text-5xl opacity-30">✦</span>
              {post.category && (
                <div className="absolute bottom-3 left-3">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border"
                    style={{
                      backgroundColor: `${post.category.color}20`,
                      color: post.category.color ?? "#6366f1",
                      borderColor: `${post.category.color}30`,
                    }}
                  >
                    {post.category.name}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex flex-col flex-1 p-5 gap-3">
            {/* Title */}
            <h3 className="text-base font-bold leading-snug line-clamp-2 font-(family-name:--font-outfit) group-hover:text-primary transition-colors duration-300">
              {post.title}
            </h3>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                {post.excerpt}
              </p>
            )}

            {/* Divider */}
            <div className="w-full h-px bg-border/60 mt-auto" />

            {/* Footer */}
            <div className="flex items-center justify-between">
              {/* Author */}
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7 ring-2 ring-background shadow-sm">
                  <AvatarImage src={post.author.avatar ?? undefined} />
                  <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-semibold leading-none truncate max-w-[90px]">
                    {post.author.firstName} {post.author.lastName}
                  </p>
                  {post.publishedAt && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(post.publishedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                {post.readingTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readingTime}m
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {post._count.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {post._count.comments}
                </span>
              </div>
            </div>
          </div>

          {/* Hover arrow indicator */}
          <div className="absolute top-4 right-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
