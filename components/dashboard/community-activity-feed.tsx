"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, FileText, IndianRupee, MessageSquare } from "lucide-react";
import type { ActivityItem } from "@/lib/queries/dashboard.queries";
import { TimeAgo } from "@/components/shared/time-ago";

interface CommunityActivityFeedProps {
  activities: ActivityItem[];
}

const ACTIVITY_ICONS: Record<
  string,
  { icon: React.ElementType; color: string }
> = {
  USER_JOINED: { icon: UserPlus, color: "text-blue-500 bg-blue-500/10" },
  BLOG_PUBLISHED: { icon: FileText, color: "text-violet-500 bg-violet-500/10" },
  DONATION_MADE: {
    icon: IndianRupee,
    color: "text-emerald-500 bg-emerald-500/10",
  },
  THREAD_CREATED: {
    icon: MessageSquare,
    color: "text-amber-500 bg-amber-500/10",
  },
};

export function CommunityActivityFeed({
  activities,
}: CommunityActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-3">
          Community Activity
        </h2>
        <p className="text-sm text-muted-foreground">
          No recent activity. The community will come alive soon!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)]">
        Community Activity
      </h2>
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm p-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

          <div className="space-y-1">
            {activities.map((activity, idx) => {
              const config =
                ACTIVITY_ICONS[activity.type] ?? ACTIVITY_ICONS.USER_JOINED;
              const Icon = config.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.03 * idx }}
                  className="relative flex items-start gap-3 pl-2 py-2 group"
                >
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 rounded-full p-1.5 shrink-0 ${config.color}`}
                  >
                    <Icon className="h-3 w-3" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-5 w-5 shrink-0 mt-0.5">
                        <AvatarImage src={activity.userAvatar ?? undefined} />
                        <AvatarFallback className="text-[8px]">
                          {activity.userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm leading-snug">
                          {activity.description}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          <TimeAgo date={activity.createdAt} />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
