"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  MessagesSquare,
  Users,
  TrendingUp,
  Folder,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ── Types ────────────────────────────────────────────────

interface ForumStats {
  totalThreads: number;
  totalReplies: number;
  activeMembers: number;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  _count: { threads: number };
}

interface RecentThread {
  id: string;
  title: string;
  slug: string;
  createdAt: Date;
  category: { slug: string; color: string | null };
  author: { firstName: string; lastName: string; avatar: string | null };
  _count: { replies: number };
}

interface ForumSidebarProps {
  stats: ForumStats;
  categories: CategoryItem[];
  recentActivity: RecentThread[];
  activeCategorySlug?: string;
}

// ── Animation variants ───────────────────────────────────

const EASE_SPRING = [0.22, 1, 0.36, 1] as const;

const sectionVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      delay: i * 0.12,
      ease: EASE_SPRING,
    },
  }),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: EASE_SPRING },
  },
};

// ── Card shell ───────────────────────────────────────────

function SidebarCard({
  children,
  index,
  glowPosition = "top-left",
}: {
  children: React.ReactNode;
  index: number;
  glowPosition?: "top-left" | "bottom-right";
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border) / 0.6)",
        boxShadow:
          "0 1px 2px hsl(var(--foreground) / 0.04), 0 4px 16px hsl(var(--foreground) / 0.04)",
      }}
    >
      <div
        className={cn(
          "pointer-events-none absolute h-32 w-32 rounded-full opacity-30",
          glowPosition === "top-left"
            ? "-top-10 -left-10"
            : "-bottom-8 -right-8"
        )}
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.35) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      {children}
    </motion.div>
  );
}

function SidebarHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="relative flex items-center gap-3 px-5 py-4 border-b border-border/40">
      <motion.div
        whileHover={{ scale: 1.1, rotate: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--primary) / 0.06))",
          border: "1px solid hsl(var(--primary) / 0.2)",
        }}
      >
        <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
      </motion.div>
      <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground/70">
        {title}
      </h3>
    </div>
  );
}

// ── Main component ───────────────────────────────────────

export function ForumSidebar({
  stats,
  categories,
  recentActivity,
  activeCategorySlug,
}: ForumSidebarProps) {
  return (
    <aside className="space-y-4 font-[system-ui]">
      {/* ── Stats card ── */}
      <SidebarCard index={0}>
        <SidebarHeader icon={TrendingUp} title="Forum Stats" />
        <div className="p-4 grid grid-cols-3 gap-3">
          <StatItem
            icon={MessageSquare}
            label="Threads"
            value={stats.totalThreads}
          />
          <StatItem
            icon={MessagesSquare}
            label="Replies"
            value={stats.totalReplies}
          />
          <StatItem icon={Users} label="Active" value={stats.activeMembers} />
        </div>
      </SidebarCard>

      {/* ── Categories card ── */}
      <SidebarCard index={1}>
        <SidebarHeader icon={Folder} title="Categories" />
        <motion.div
          className="p-2 space-y-0.5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* All Forums */}
          <motion.div variants={itemVariants}>
            <Link href="/forum">
              <div
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.04))",
                  border: "1px solid hsl(var(--primary) / 0.25)",
                  borderRadius: "0.75rem",
                }}
              >
                <CategoryRow
                  label="All Forums"
                  count={categories.reduce((s, c) => s + c._count.threads, 0)}
                  isActive={!activeCategorySlug}
                  color="hsl(var(--primary))"
                />
              </div>
            </Link>
          </motion.div>

          {categories.map((cat) => (
            <motion.div key={cat.id} variants={itemVariants}>
              <Link href={`/forum/${cat.slug}`}>
                <CategoryRow
                  label={cat.name}
                  count={cat._count.threads}
                  isActive={activeCategorySlug === cat.slug}
                  color={cat.color}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </SidebarCard>

      {/* ── Recent Activity card ── */}
      {recentActivity.length > 0 && (
        <SidebarCard index={2} glowPosition="bottom-right">
          <SidebarHeader icon={Clock} title="Recent Activity" />
          <motion.div
            className="p-3 space-y-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {recentActivity.map((thread) => (
              <motion.div key={thread.id} variants={itemVariants}>
                <Link
                  href={`/forum/${thread.category.slug}/${thread.slug}`}
                  className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/50 transition-colors duration-200"
                >
                  <Avatar className="h-6 w-6 shrink-0 ring-1 ring-background">
                    <AvatarImage src={thread.author.avatar ?? undefined} />
                    <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">
                      {thread.author.firstName?.[0]}
                      {thread.author.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate group-hover:text-primary transition-colors duration-200">
                      {thread.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MessageSquare className="h-2.5 w-2.5" />
                      {thread._count.replies}
                      <span className="mx-0.5">·</span>
                      {formatDistanceToNow(new Date(thread.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </SidebarCard>
      )}
    </aside>
  );
}

// ── Sub-components ───────────────────────────────────────

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-2 rounded-xl bg-muted/30">
      <Icon className="h-4 w-4 text-primary/60" />
      <span className="text-lg font-black tabular-nums text-foreground">
        {value}
      </span>
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function CategoryRow({
  label,
  count,
  isActive,
  color,
}: {
  label: string;
  count: number;
  isActive: boolean;
  color: string | null;
}) {
  const dotColor = color ?? "hsl(var(--muted-foreground) / 0.5)";
  const activeColor = color ?? "hsl(var(--primary))";

  return (
    <motion.div
      whileHover={{ x: 3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm cursor-pointer transition-colors duration-200",
        isActive
          ? "font-semibold"
          : "text-muted-foreground hover:text-foreground"
      )}
      style={
        isActive
          ? {
              backgroundColor: `${activeColor}14`,
              color: activeColor,
              boxShadow: `inset 3px 0 0 0 ${activeColor}`,
            }
          : {}
      }
    >
      {!isActive && (
        <div
          className="absolute inset-0 rounded-xl bg-muted/0 group-hover:bg-muted/50 transition-colors duration-200"
          aria-hidden
        />
      )}

      <div className="relative flex items-center gap-2.5">
        <motion.span
          className="relative flex h-2 w-2 shrink-0"
          animate={isActive ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={
            isActive
              ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
              : {}
          }
        >
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full",
              isActive && "animate-ping opacity-40"
            )}
            style={{ backgroundColor: activeColor }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{
              backgroundColor: isActive ? activeColor : dotColor,
            }}
          />
        </motion.span>
        <span className="text-[13.5px]">{label}</span>
      </div>

      <span
        className="relative z-10 min-w-[24px] text-center text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-full transition-all duration-200"
        style={
          isActive
            ? {
                backgroundColor: `${activeColor}22`,
                color: activeColor,
              }
            : {
                backgroundColor: "hsl(var(--muted))",
                color: "hsl(var(--muted-foreground))",
              }
        }
      >
        {count}
      </span>
    </motion.div>
  );
}
