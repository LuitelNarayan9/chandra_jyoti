"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ClipboardList,
  Flag,
  AlertTriangle,
  Clock,
  Star,
  Mail,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { TimeAgo } from "@/components/shared/time-ago";

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar: string | null;
  createdAt: Date;
}

interface AdminOverviewProps {
  data: {
    pendingApprovals: number;
    pendingReports: number;
    pendingFines: number;
    overdueFinies: number;
    recentUsers: AdminUser[];
    pendingTestimonials: number;
    newContactSubmissions: number;
  };
}

const OVERVIEW_ITEMS = [
  {
    key: "pendingApprovals",
    label: "Family Approvals",
    icon: ClipboardList,
    color: "text-blue-500 bg-blue-500/10",
    href: "/admin/family-tree",
  },
  {
    key: "pendingReports",
    label: "Content Reports",
    icon: Flag,
    color: "text-red-500 bg-red-500/10",
    href: "/admin/forum",
  },
  {
    key: "pendingFines",
    label: "Pending Fines",
    icon: AlertTriangle,
    color: "text-amber-500 bg-amber-500/10",
    href: "/admin/payments/fines",
  },
  {
    key: "overdueFinies",
    label: "Overdue Fines",
    icon: Clock,
    color: "text-rose-500 bg-rose-500/10",
    href: "/admin/payments/fines",
  },
  {
    key: "pendingTestimonials",
    label: "Testimonials",
    icon: Star,
    color: "text-purple-500 bg-purple-500/10",
    href: "/admin/testimonials",
  },
  {
    key: "newContactSubmissions",
    label: "Contact Messages",
    icon: Mail,
    color: "text-emerald-500 bg-emerald-500/10",
    href: "/admin/contact-submissions",
  },
] as const;

export function AdminOverview({ data }: AdminOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)]">
          Admin Overview
        </h2>
        <Badge
          variant="outline"
          className="text-[10px] border-amber-500 text-amber-600"
        >
          ADMIN
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Pending Actions */}
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {OVERVIEW_ITEMS.map((item) => {
              const count = data[item.key];
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`rounded-md p-1.5 ${item.color}`}>
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm group-hover:text-foreground text-muted-foreground transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={count > 0 ? "default" : "secondary"}
                      className={`text-xs ${count > 0 ? "bg-indigo-500 hover:bg-indigo-600" : ""}`}
                    >
                      {count}
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Recent Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent registrations
              </p>
            ) : (
              <div className="space-y-1">
                {data.recentUsers.map((user) => (
                  <Link
                    key={user.id}
                    href={`/admin/users/${user.id}`}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.avatar ?? undefined} />
                      <AvatarFallback className="text-[10px]">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      <TimeAgo date={user.createdAt} />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
