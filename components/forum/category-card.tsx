"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ArrowUpRight, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    _count: { threads: number };
    threads: {
      id: string;
      title: string;
      slug: string;
      createdAt: Date;
      author: {
        firstName: string;
        lastName: string;
        avatar: string | null;
      };
    }[];
  };
  index?: number;
}

export function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const color = category.color ?? "#6366f1";
  const latestThread = category.threads[0] ?? null;

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
      <Link href={`/forum/${category.slug}`} className="block h-full">
        <article className="relative h-full flex flex-col rounded-2xl overflow-hidden border border-border/50 bg-card transition-all duration-500 hover:border-border hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-1">
          {/* Top color accent bar */}
          <div
            className="h-1.5 w-full"
            style={{
              background: `linear-gradient(90deg, ${color}, ${color}88)`,
            }}
          />

          {/* Category icon + header */}
          <div className="flex items-start gap-4 p-5 pb-3">
            {/* Icon */}
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{
                background: `linear-gradient(135deg, ${color}20, ${color}08)`,
                border: `1px solid ${color}30`,
              }}
            >
              {category.icon || "💬"}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold leading-snug font-(family-name:--font-outfit) group-hover:text-primary transition-colors duration-300 truncate">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="px-5 pb-3">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold"
                style={{
                  backgroundColor: `${color}12`,
                  color: color,
                }}
              >
                <MessageSquare className="h-3 w-3" />
                {category._count.threads}{" "}
                {category._count.threads === 1 ? "thread" : "threads"}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-border/60" />

          {/* Latest thread */}
          <div className="flex-1 px-5 py-3">
            {latestThread ? (
              <div className="flex items-center gap-2.5">
                <Avatar className="h-6 w-6 ring-1 ring-background shadow-sm shrink-0">
                  <AvatarImage src={latestThread.author.avatar ?? undefined} />
                  <AvatarFallback className="text-[9px] font-semibold bg-primary/10 text-primary">
                    {latestThread.author.firstName?.[0]}
                    {latestThread.author.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate leading-none">
                    {latestThread.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {formatDistanceToNow(new Date(latestThread.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 italic">
                No threads yet — be the first!
              </p>
            )}
          </div>

          {/* Hover arrow indicator */}
          <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
