"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  PenLine,
  MessageSquarePlus,
  IndianRupee,
  TreePine,
  Users,
  Flag,
  Megaphone,
  AlertTriangle,
  Settings,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { Role, hasPermission } from "@/lib/roles";

interface QuickActionsProps {
  role: Role;
}

interface ActionItem {
  label: string;
  href: string;
  icon: React.ElementType;
  gradient: string;
  description: string;
}

export function QuickActions({ role }: QuickActionsProps) {
  const isAdmin = hasPermission(role, "ADMIN");
  const isSuperAdmin = hasPermission(role, "SUPER_ADMIN");

  const memberActions: ActionItem[] = [
    {
      label: "Create Post",
      href: "/blog/create",
      icon: PenLine,
      gradient: "from-violet-500 to-purple-600",
      description: "Write a blog post",
    },
    {
      label: "Start Thread",
      href: "/forum/create",
      icon: MessageSquarePlus,
      gradient: "from-blue-500 to-cyan-600",
      description: "Start a discussion",
    },
    {
      label: "Make Donation",
      href: "/payments/donate",
      icon: IndianRupee,
      gradient: "from-emerald-500 to-green-600",
      description: "Support the community",
    },
    {
      label: "Family Tree",
      href: "/family-tree",
      icon: TreePine,
      gradient: "from-amber-500 to-orange-600",
      description: "View family tree",
    },
  ];

  const adminActions: ActionItem[] = [
    {
      label: "Manage Users",
      href: "/admin/users",
      icon: Users,
      gradient: "from-blue-600 to-indigo-700",
      description: "User management",
    },
    {
      label: "View Reports",
      href: "/admin/forum",
      icon: Flag,
      gradient: "from-rose-500 to-red-600",
      description: "Moderate content",
    },
    {
      label: "Create Campaign",
      href: "/admin/payments/campaigns/create",
      icon: Megaphone,
      gradient: "from-teal-500 to-cyan-600",
      description: "Emergency fundraising",
    },
    {
      label: "Assign Fine",
      href: "/admin/payments/fines/assign",
      icon: AlertTriangle,
      gradient: "from-amber-600 to-yellow-700",
      description: "Assign penalty",
    },
  ];

  const superAdminActions: ActionItem[] = [
    {
      label: "Site Settings",
      href: "/admin/settings",
      icon: Settings,
      gradient: "from-slate-600 to-zinc-700",
      description: "Platform configuration",
    },
    {
      label: "System Health",
      href: "/analytics/admin/system",
      icon: Activity,
      gradient: "from-indigo-600 to-violet-700",
      description: "System metrics",
    },
  ];

  const actions = [
    ...memberActions,
    ...(isAdmin ? adminActions : []),
    ...(isSuperAdmin ? superAdminActions : []),
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)]">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action, idx) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.05 * idx }}
          >
            <Link href={action.href}>
              <Card className="relative overflow-hidden p-4 border-0 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer h-full bg-card/50 backdrop-blur-sm">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                <div className="relative flex flex-col items-center text-center gap-2">
                  <div
                    className={`rounded-xl p-3 bg-gradient-to-br ${action.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{action.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
