"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Users,
  FileText,
  MessageSquare,
  TreePine,
  IndianRupee,
  BarChart3,
  Bell,
  Activity,
} from "lucide-react";

interface SystemHealthProps {
  data: {
    totalUsers: number;
    totalPosts: number;
    totalThreads: number;
    totalFamilyMembers: number;
    totalDonations: number;
    totalAnalyticsEvents: number;
    totalNotifications: number;
    userGrowth: number[]; // last 7 days
  };
}

const DB_TABLES = [
  { label: "Users", key: "totalUsers", icon: Users, color: "text-blue-500" },
  {
    label: "Blog Posts",
    key: "totalPosts",
    icon: FileText,
    color: "text-violet-500",
  },
  {
    label: "Forum Threads",
    key: "totalThreads",
    icon: MessageSquare,
    color: "text-emerald-500",
  },
  {
    label: "Family Members",
    key: "totalFamilyMembers",
    icon: TreePine,
    color: "text-amber-500",
  },
  {
    label: "Donations",
    key: "totalDonations",
    icon: IndianRupee,
    color: "text-green-500",
  },
  {
    label: "Analytics Events",
    key: "totalAnalyticsEvents",
    icon: BarChart3,
    color: "text-indigo-500",
  },
  {
    label: "Notifications",
    key: "totalNotifications",
    icon: Bell,
    color: "text-rose-500",
  },
] as const;

export function SystemHealth({ data }: SystemHealthProps) {
  const numericKeys = [
    "totalUsers",
    "totalPosts",
    "totalThreads",
    "totalFamilyMembers",
    "totalDonations",
    "totalAnalyticsEvents",
    "totalNotifications",
  ] as const;
  const totalRecords = numericKeys.reduce((sum, key) => sum + data[key], 0);

  const [growthLabels, setGrowthLabels] = useState<string[]>(Array(7).fill(""));

  useEffect(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date().getDay();
    const labels = Array.from({ length: 7 }, (_, i) => {
      const dayIdx = (today - 6 + i + 7) % 7;
      return days[dayIdx];
    });
    setGrowthLabels(labels);
  }, []);

  const maxGrowth = Math.max(...data.userGrowth, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-500" />
          System Health
        </h2>
        <Badge
          variant="outline"
          className="text-[10px] border-red-500 text-red-600"
        >
          SUPER ADMIN
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Database Overview */}
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-[family-name:var(--font-outfit)] mb-4">
              {totalRecords.toLocaleString()}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                total records
              </span>
            </div>
            <div className="space-y-2">
              {DB_TABLES.map((table) => {
                const count = data[table.key] as number;
                const percentage = (count / Math.max(totalRecords, 1)) * 100;
                return (
                  <div key={table.key} className="flex items-center gap-2">
                    <table.icon
                      className={`h-3.5 w-3.5 ${table.color} shrink-0`}
                    />
                    <span className="text-xs text-muted-foreground w-28 shrink-0">
                      {table.label}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500`}
                      />
                    </div>
                    <span className="text-xs font-medium w-12 text-right">
                      {count.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* User Growth (Simple bar chart) */}
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Registrations (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-1 h-32">
              {data.userGrowth.map((count, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-1 flex-1"
                >
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {count}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${Math.max((count / maxGrowth) * 100, 4)}%`,
                    }}
                    transition={{ duration: 0.6, delay: 0.05 * idx }}
                    className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-purple-400 min-h-1"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {growthLabels[idx]}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center mt-3">
              <span className="text-xs text-muted-foreground">
                Total this week:{" "}
                <strong>{data.userGrowth.reduce((s, c) => s + c, 0)}</strong>{" "}
                new users
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
