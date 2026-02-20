"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Users, FileText, MessageSquare, Heart, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back to your community dashboard."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Members", value: "124", icon: Users, delay: 0.1 },
          { label: "Blog Posts", value: "12", icon: FileText, delay: 0.2 },
          { label: "Forum Threads", value: "34", icon: MessageSquare, delay: 0.3 },
          { label: "Family Members", value: "450", icon: Heart, delay: 0.4 },
        ].map((stat) => (
          <StatsCard
            key={stat.label}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            delay={stat.delay}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 pb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="rounded-xl border bg-card p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold font-[family-name:var(--font-outfit)] mb-4">
            Recent Activity
          </h2>
          <EmptyState
            icon={Activity}
            title="No recent activity"
            description="When members post or interact, you'll see it here."
            className="border-dashed"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="rounded-xl border bg-card p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold font-[family-name:var(--font-outfit)] mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Placeholders for actions */}
            <div className="h-24 rounded-lg bg-muted/50 animate-pulse" />
            <div className="h-24 rounded-lg bg-muted/50 animate-pulse" />
            <div className="h-24 rounded-lg bg-muted/50 animate-pulse" />
            <div className="h-24 rounded-lg bg-muted/50 animate-pulse" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
