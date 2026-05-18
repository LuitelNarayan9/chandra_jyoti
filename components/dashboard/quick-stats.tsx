"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  MessageSquare,
  IndianRupee,
  TreePine,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Role, hasPermission } from "@/lib/roles";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuickStatsData {
  totalMembers: number;
  newMembersThisMonth: number;
  totalBlogPosts: number;
  newPostsToday: number;
  totalForumThreads: number;
  newThreadsToday: number;
  donationsThisMonth: number;
  donationsLastMonth: number;
  totalFamilyMembers: number;
  pendingFines: number;
}

interface QuickStatsProps {
  stats: QuickStatsData;
  role: Role;
}

interface StatCardData {
  id: string; // stable key (not title, which could be i18n'd later)
  title: string;
  value: string;
  icon: React.ElementType;
  trend: string;
  trendUp: boolean;
  gradient: string;
  iconColor: string;
  iconBg: string;
  ariaLabel: string;
}

// ─── Module-scoped constants ──────────────────────────────────────────────────

/**
 * Cached formatters — Intl constructors are expensive; build once.
 * Using en-IN locale for Indian number grouping (1,00,000 style).
 */
const NUM_FORMAT_IN = new Intl.NumberFormat("en-IN");

// ─── Animation variants (module-scope → stable refs, no re-alloc) ─────────────

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] as const },
  },
} as const;

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Computes a month-over-month donation delta string.
 * Math.max(..., 1) guards against division by zero when lastMonth === 0.
 */
function calcDonationTrend(
  current: number,
  previous: number
): { label: string; up: boolean } {
  if (current >= previous) {
    const pct = (((current - previous) / Math.max(previous, 1)) * 100).toFixed(
      0
    );
    return { label: `+${pct}% vs last month`, up: true };
  }
  const pct = (((previous - current) / Math.max(previous, 1)) * 100).toFixed(0);
  return { label: `-${pct}% vs last month`, up: false };
}

// ─── StatCard sub-component ───────────────────────────────────────────────────

const StatCard = memo(function StatCard({ card }: { card: StatCardData }) {
  const Icon = card.icon;

  return (
    <motion.div variants={cardVariants} className="h-full">
      <Card
        aria-label={card.ariaLabel}
        className={`group relative h-full overflow-hidden
          bg-linear-to-br ${card.gradient}
          border border-white/10 dark:border-white/6
          shadow-sm
          hover:shadow-xl hover:-translate-y-1 active:shadow-xl active:-translate-y-1
          transition-all duration-300
          backdrop-blur-md`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground/90 leading-snug">
            {card.title}
          </CardTitle>

          <div
            className={`shrink-0 rounded-xl p-2.5
              ${card.iconColor} ${card.iconBg}
              shadow-inner ring-1 ring-black/5 dark:ring-white/10
              group-hover:scale-110 group-active:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-2xl sm:text-3xl font-bold font-[--font-outfit] tracking-tight tabular-nums">
            {card.value}
          </p>

          <div className="flex items-center gap-1.5 mt-2" aria-live="polite">
            {card.trendUp ? (
              <TrendingUp
                className="h-3.5 w-3.5 shrink-0 text-emerald-500"
                aria-hidden="true"
              />
            ) : (
              <TrendingDown
                className="h-3.5 w-3.5 shrink-0 text-rose-500"
                aria-hidden="true"
              />
            )}
            <span
              className={`text-xs font-medium leading-none ${
                card.trendUp
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {card.trend}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

export const QuickStats = memo(function QuickStats({
  stats,
  role,
}: QuickStatsProps): React.JSX.Element {
  const isAdmin = useMemo(() => hasPermission(role, "ADMIN"), [role]);

  // Computed once; only re-runs when the two donation values change
  const donationTrend = useMemo(
    () => calcDonationTrend(stats.donationsThisMonth, stats.donationsLastMonth),
    [stats.donationsThisMonth, stats.donationsLastMonth]
  );

  // Build the cards array inside useMemo so it's only reconstructed when
  // the relevant stats or role changes — not on every parent render.
  const cards = useMemo<StatCardData[]>(() => {
    const memberCards: StatCardData[] = [
      {
        id: "total-members",
        title: "Total Members",
        value: NUM_FORMAT_IN.format(stats.totalMembers),
        icon: Users,
        trend: `+${stats.newMembersThisMonth} this month`,
        trendUp: stats.newMembersThisMonth > 0,
        gradient: "from-blue-500/10 to-blue-600/5",
        iconColor: "text-blue-500",
        iconBg: "bg-background/80 dark:bg-background/50",
        ariaLabel: `Total members: ${stats.totalMembers}, ${stats.newMembersThisMonth} new this month`,
      },
      {
        id: "blog-posts",
        title: "Blog Posts",
        value: NUM_FORMAT_IN.format(stats.totalBlogPosts),
        icon: FileText,
        trend: `+${stats.newPostsToday} today`,
        trendUp: stats.newPostsToday > 0,
        gradient: "from-violet-500/10 to-violet-600/5",
        iconColor: "text-violet-500",
        iconBg: "bg-background/80 dark:bg-background/50",
        ariaLabel: `Blog posts: ${stats.totalBlogPosts}, ${stats.newPostsToday} new today`,
      },
      {
        id: "forum-threads",
        title: "Forum Threads",
        value: NUM_FORMAT_IN.format(stats.totalForumThreads),
        icon: MessageSquare,
        trend: `+${stats.newThreadsToday} today`,
        trendUp: stats.newThreadsToday > 0,
        gradient: "from-emerald-500/10 to-emerald-600/5",
        iconColor: "text-emerald-500",
        iconBg: "bg-background/80 dark:bg-background/50",
        ariaLabel: `Forum threads: ${stats.totalForumThreads}, ${stats.newThreadsToday} new today`,
      },
      {
        id: "family-members",
        title: "Family Members",
        value: NUM_FORMAT_IN.format(stats.totalFamilyMembers),
        icon: TreePine,
        trend: "In family tree",
        trendUp: true,
        gradient: "from-amber-500/10 to-amber-600/5",
        iconColor: "text-amber-500",
        iconBg: "bg-background/80 dark:bg-background/50",
        ariaLabel: `Family tree members: ${stats.totalFamilyMembers}`,
      },
    ];

    const adminCards: StatCardData[] = [
      {
        id: "donations-month",
        title: "Donations (Month)",
        value: `₹${NUM_FORMAT_IN.format(stats.donationsThisMonth)}`,
        icon: IndianRupee,
        trend: donationTrend.label,
        trendUp: donationTrend.up,
        gradient: "from-green-500/10 to-green-600/5",
        iconColor: "text-green-500",
        iconBg: "bg-background/80 dark:bg-background/50",
        ariaLabel: `Donations this month: ₹${NUM_FORMAT_IN.format(stats.donationsThisMonth)}, ${donationTrend.label}`,
      },
      {
        id: "pending-fines",
        title: "Pending Fines",
        value: NUM_FORMAT_IN.format(stats.pendingFines),
        icon: AlertTriangle,
        trend: stats.pendingFines > 0 ? "Action needed" : "All clear",
        trendUp: stats.pendingFines === 0,
        gradient: "from-rose-500/10 to-rose-600/5",
        iconColor: "text-rose-500",
        iconBg: "bg-background/80 dark:bg-background/50",
        ariaLabel: `Pending fines: ${stats.pendingFines}. ${stats.pendingFines > 0 ? "Action needed" : "All clear"}`,
      },
    ];

    // Admin sees: members[0..1], admin cards, members[2..3]
    // Regular user sees: all 4 member cards
    return isAdmin
      ? [...memberCards.slice(0, 2), ...adminCards, ...memberCards.slice(2)]
      : memberCards;
  }, [
    stats.totalMembers,
    stats.newMembersThisMonth,
    stats.totalBlogPosts,
    stats.newPostsToday,
    stats.totalForumThreads,
    stats.newThreadsToday,
    stats.totalFamilyMembers,
    stats.donationsThisMonth,
    stats.pendingFines,
    donationTrend,
    isAdmin,
  ]);

  // Responsive column count:
  //  • 2 cols on mobile (always)
  //  • 4 cols on lg+ for member-only view
  //  • 3 cols on lg / 6 cols on xl for admin view (6 cards)
  const gridClass = isAdmin
    ? "grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
    : "grid gap-4 grid-cols-2 lg:grid-cols-4";

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className={gridClass}
      role="list"
      aria-label="Dashboard quick statistics"
    >
      {cards.map((card) => (
        <div key={card.id} role="listitem">
          <StatCard card={card} />
        </div>
      ))}
    </motion.div>
  );
});
