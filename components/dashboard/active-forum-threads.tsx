"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import { TimeAgo } from "@/components/shared/time-ago";

interface ThreadData {
  id: string;
  title: string;
  slug: string;
  views: number;
  updatedAt: Date;
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
  };
  _count: {
    replies: number;
  };
}

interface ActiveForumThreadsProps {
  threads: ThreadData[];
}

export function ActiveForumThreads({ threads }: ActiveForumThreadsProps) {
  if (threads.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-3">
          Active Forum Threads
        </h2>
        <p className="text-sm text-muted-foreground">
          No active threads. Start a discussion!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)]">
          Active Forum Threads
        </h2>
        <Link
          href="/forum"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group"
        >
          View All
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      <Card className="divide-y border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        {threads.map((thread, idx) => (
          <motion.div
            key={thread.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * idx }}
          >
            <Link
              href={`/forum/${thread.category.slug}/${thread.slug}`}
              className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors group"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={thread.author.avatar ?? undefined} />
                <AvatarFallback className="text-xs">
                  {thread.author.firstName[0]}
                  {thread.author.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {thread.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-4"
                    style={{
                      borderColor: thread.category.color ?? "#6366f1",
                      color: thread.category.color ?? "#6366f1",
                    }}
                  >
                    {thread.category.name}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    by {thread.author.firstName}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                <span className="flex items-center gap-0.5" title="Replies">
                  <MessageCircle className="h-3 w-3" />
                  {thread._count.replies}
                </span>
                <span className="flex items-center gap-0.5" title="Views">
                  <Eye className="h-3 w-3" />
                  {thread.views}
                </span>
                <span className="hidden sm:block text-[10px]">
                  <TimeAgo date={thread.updatedAt} />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </Card>
    </div>
  );
}
