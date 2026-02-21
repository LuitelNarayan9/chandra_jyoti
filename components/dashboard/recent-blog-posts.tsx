"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  Clock,
  Heart,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { TimeAgo } from "@/components/shared/time-ago";

interface BlogPostData {
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
    name: string;
    slug: string;
    color: string | null;
  } | null;
  _count: {
    likes: number;
    comments: number;
  };
}

interface RecentBlogPostsProps {
  posts: BlogPostData[];
}

export function RecentBlogPosts({ posts }: RecentBlogPostsProps) {
  if (posts.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-3">
          Recent Blog Posts
        </h2>
        <p className="text-sm text-muted-foreground">
          No blog posts yet. Be the first to share your story!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)]">
          Recent Blog Posts
        </h2>
        <Link
          href="/blog"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group"
        >
          View All
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post, idx) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + idx * 0.08 }}
          >
            <Link href={`/blog/${post.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                {post.coverImage && (
                  <div className="relative h-36 w-full overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {post.category && (
                      <Badge
                        className="absolute top-2 left-2 text-[10px]"
                        style={{
                          backgroundColor: post.category.color ?? "#6366f1",
                          color: "white",
                        }}
                      >
                        {post.category.name}
                      </Badge>
                    )}
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={post.author.avatar ?? undefined} />
                        <AvatarFallback className="text-[8px]">
                          {post.author.firstName[0]}
                          {post.author.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {post.author.firstName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Heart className="h-3 w-3" />
                        {post._count.likes}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="h-3 w-3" />
                        {post._count.comments}
                      </span>
                      {post.readingTime && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {post.readingTime}m
                        </span>
                      )}
                    </div>
                  </div>
                  {post.publishedAt && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      <TimeAgo date={post.publishedAt} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
