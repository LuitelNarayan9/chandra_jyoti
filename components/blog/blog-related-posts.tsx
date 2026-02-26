"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RelatedPost {
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
    avatar: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
  _count: { comments: number; likes: number };
}

interface BlogRelatedPostsProps {
  posts: RelatedPost[];
}

export function BlogRelatedPosts({ posts }: BlogRelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Related posts"
      className="space-y-7"
    >
      {/* Decorative separator */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border" />
        <span className="text-muted-foreground/30 text-sm">✦</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border" />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black font-(family-name:--font-outfit) tracking-tight">
          Continue Reading
        </h3>
        <Link
          href="/blog"
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all duration-200"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post, idx) => {
          const initials =
            (post.author.firstName?.[0] ?? "") +
            (post.author.lastName?.[0] ?? "");

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.06 * idx,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group"
            >
              <Link href={`/blog/${post.slug}`} className="block h-full">
                <article className="h-full rounded-2xl overflow-hidden border border-border/50 bg-card transition-all duration-400 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 hover:border-border hover:-translate-y-0.5">
                  {/* Cover */}
                  {post.coverImage ? (
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div
                      className="aspect-video flex items-center justify-center"
                      style={{
                        background: post.category?.color
                          ? `linear-gradient(135deg, ${post.category.color}15, ${post.category.color}05)`
                          : "linear-gradient(135deg, hsl(var(--muted)), hsl(var(--muted)/0.5))",
                      }}
                    >
                      <span className="text-4xl opacity-20">✦</span>
                    </div>
                  )}

                  <div className="p-4 space-y-2.5">
                    {post.category && (
                      <span
                        className="inline-block text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${post.category.color}15`,
                          color: post.category.color ?? "hsl(var(--primary))",
                          borderColor: `${post.category.color}25`,
                        }}
                      >
                        {post.category.name}
                      </span>
                    )}

                    <h4 className="font-bold leading-snug line-clamp-2 text-sm group-hover:text-primary transition-colors duration-200 font-(family-name:--font-outfit)">
                      {post.title}
                    </h4>

                    {post.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground border-t border-border/40">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={post.author.avatar ?? undefined} />
                          <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium truncate max-w-[80px]">
                          {post.author.firstName}
                        </span>
                      </div>
                      {post.readingTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readingTime}m
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
