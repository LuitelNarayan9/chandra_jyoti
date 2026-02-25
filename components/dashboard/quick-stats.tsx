"use client";

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

interface QuickStatsProps {
  stats: {
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
  };
  role: Role;
}

interface StatCardData {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: string;
  trendUp: boolean;
  gradient: string;
  iconColor: string;
}

export function QuickStats({ stats, role }: QuickStatsProps) {
  const isAdmin = hasPermission(role, "ADMIN");

  const memberCards: StatCardData[] = [
    {
      title: "Total Members",
      value: stats.totalMembers.toLocaleString(),
      icon: Users,
      trend: `+${stats.newMembersThisMonth} this month`,
      trendUp: stats.newMembersThisMonth > 0,
      gradient: "from-blue-500/10 to-blue-600/5",
      iconColor: "text-blue-500",
    },
    {
      title: "Blog Posts",
      value: stats.totalBlogPosts.toLocaleString(),
      icon: FileText,
      trend: `+${stats.newPostsToday} today`,
      trendUp: stats.newPostsToday > 0,
      gradient: "from-violet-500/10 to-violet-600/5",
      iconColor: "text-violet-500",
    },
    {
      title: "Forum Threads",
      value: stats.totalForumThreads.toLocaleString(),
      icon: MessageSquare,
      trend: `+${stats.newThreadsToday} today`,
      trendUp: stats.newThreadsToday > 0,
      gradient: "from-emerald-500/10 to-emerald-600/5",
      iconColor: "text-emerald-500",
    },
    {
      title: "Family Members",
      value: stats.totalFamilyMembers.toLocaleString(),
      icon: TreePine,
      trend: "In family tree",
      trendUp: true,
      gradient: "from-amber-500/10 to-amber-600/5",
      iconColor: "text-amber-500",
    },
  ];

  const adminCards: StatCardData[] = [
    {
      title: "Donations (Month)",
      value: `₹${stats.donationsThisMonth.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      trend:
        stats.donationsThisMonth >= stats.donationsLastMonth
          ? `+${(((stats.donationsThisMonth - stats.donationsLastMonth) / Math.max(stats.donationsLastMonth, 1)) * 100).toFixed(0)}% vs last month`
          : `-${(((stats.donationsLastMonth - stats.donationsThisMonth) / Math.max(stats.donationsLastMonth, 1)) * 100).toFixed(0)}% vs last month`,
      trendUp: stats.donationsThisMonth >= stats.donationsLastMonth,
      gradient: "from-green-500/10 to-green-600/5",
      iconColor: "text-green-500",
    },
    {
      title: "Pending Fines",
      value: stats.pendingFines.toLocaleString(),
      icon: AlertTriangle,
      trend: stats.pendingFines > 0 ? "Action needed" : "All clear",
      trendUp: stats.pendingFines === 0,
      gradient: "from-rose-500/10 to-rose-600/5",
      iconColor: "text-rose-500",
    },
  ];

  const cards = isAdmin
    ? [...memberCards.slice(0, 2), ...adminCards, ...memberCards.slice(2)]
    : memberCards;

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
      {cards.slice(0, isAdmin ? 6 : 4).map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.08, ease: "easeOut" }}
        >
          <Card
            className={`relative overflow-hidden bg-gradient-to-br ${card.gradient} border-0 shadow-sm hover:shadow-md transition-shadow`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div
                className={`rounded-lg p-2 ${card.iconColor} bg-background/60 backdrop-blur-sm`}
              >
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-[family-name:var(--font-outfit)]">
                {card.value}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {card.trendUp ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-rose-500" />
                )}
                <span
                  className={`text-xs ${card.trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                >
                  {card.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
