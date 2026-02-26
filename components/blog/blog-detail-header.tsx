"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Clock, Eye, ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface BlogDetailHeaderProps {
  post: {
    id: string;
    title: string;
    slug: string;
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
    tags: Array<{
      tag: { id: string; name: string; slug: string };
    }>;
  };
  canEdit?: boolean;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function BlogDetailHeader({ post, canEdit }: BlogDetailHeaderProps) {
  const initials =
    (post.author.firstName?.[0] ?? "") + (post.author.lastName?.[0] ?? "");

  return (
    <motion.header initial="initial" animate="animate" className="space-y-8">
      {/* Navigation */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between"
      >
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-2 text-muted-foreground hover:text-foreground -ml-2 group"
        >
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to Blog
          </Link>
        </Button>
        {canEdit && (
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href={`/blog/${post.slug}/edit`}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        )}
      </motion.div>

      {/* Category + Tags */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-center gap-2"
      >
        {post.category && (
          <Link href={`/blog/categories/${post.category.slug}`}>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border transition-all duration-200 hover:opacity-80"
              style={{
                backgroundColor: `${post.category.color}15`,
                color: post.category.color ?? "hsl(var(--primary))",
                borderColor: `${post.category.color}30`,
              }}
            >
              {post.category.name}
            </span>
          </Link>
        )}
        {post.tags.map(({ tag }) => (
          <Link key={tag.id} href={`/blog/tags/${tag.slug}`}>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors duration-200">
              #{tag.name}
            </span>
          </Link>
        ))}
      </motion.div>

      {/* Title — big and editorial */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight font-(family-name:--font-outfit) text-balance">
          {post.title}
        </h1>
      </motion.div>

      {/* Author + Meta bar */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-center gap-5"
      >
        <Link
          href={`/blog?author=${post.author.id}`}
          className="flex items-center gap-3 group"
        >
          <Avatar className="h-11 w-11 ring-2 ring-background shadow-md">
            <AvatarImage src={post.author.avatar ?? undefined} />
            <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold group-hover:text-primary transition-colors duration-200">
              {post.author.firstName} {post.author.lastName}
            </p>
            {post.publishedAt && (
              <p className="text-xs text-muted-foreground">
                {format(new Date(post.publishedAt), "MMMM d, yyyy")}
              </p>
            )}
          </div>
        </Link>

        {/* Dot separator */}
        <div className="h-1 w-1 rounded-full bg-border" />

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {post.readingTime && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime} min read
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {post.views.toLocaleString()} views
          </span>
        </div>
      </motion.div>

      {/* Decorative rule */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-4"
      >
        <div className="h-px flex-1 bg-gradient-to-r from-primary/40 via-border to-transparent" />
        <span className="text-muted-foreground/30 text-lg">✦</span>
        <div className="h-px w-12 bg-gradient-to-l from-border/50 to-transparent" />
      </motion.div>

      {/* Cover Image */}
      {post.coverImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/50 shadow-xl shadow-black/5 dark:shadow-black/20"
        >
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 860px"
            priority
          />
        </motion.div>
      )}
    </motion.header>
  );
}
