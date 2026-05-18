"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
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
import { Role, hasPermission } from "@/lib/roles";
import { cn } from "@/lib/utils";
import type React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Action arrays (module-scope → created once, never re-allocated) ──────────

const MEMBER_ACTIONS: readonly ActionItem[] = [
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
] as const;

const ADMIN_ACTIONS: readonly ActionItem[] = [
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
] as const;

const SUPER_ADMIN_ACTIONS: readonly ActionItem[] = [
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
] as const;

// ─── Animation variants (module-scope → stable refs, no re-alloc) ─────────────

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
} as const;

const cardVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as const },
  },
} as const;

// ─── ActionCard sub-component ─────────────────────────────────────────────────

const ActionCard = memo(function ActionCard({
  action,
}: {
  action: ActionItem;
}) {
  const Icon = action.icon;

  return (
    <motion.div variants={cardVariants} className="h-full">
      <Link
        href={action.href}
        className={cn(
          "block h-full group rounded-2xl",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        )}
        aria-label={`${action.label}: ${action.description}`}
      >
        <Card
          className={cn(
            "relative overflow-hidden h-full",
            "p-4 sm:p-5",
            "border border-zinc-200/80 dark:border-zinc-700/50",
            "bg-white/80 dark:bg-zinc-900/70",
            "backdrop-blur-md",
            "shadow-sm",
            "hover:shadow-xl active:shadow-xl",
            "transition-all duration-300",
            "cursor-pointer rounded-2xl",
            "group-hover:-translate-y-1 active:-translate-y-1"
          )}
        >
          {/* Gradient wash on hover */}
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 bg-linear-to-br opacity-0",
              "group-hover:opacity-[0.08] group-active:opacity-[0.08] transition-opacity duration-300",
              action.gradient
            )}
          />

          {/* Ambient glow behind card */}
          <div
            aria-hidden="true"
            className={cn(
              "absolute -inset-3 -z-10 opacity-0 blur-xl",
              "group-hover:opacity-20 group-active:opacity-20 transition-opacity duration-500",
              action.gradient
            )}
          />

          <div className="relative flex flex-col items-center text-center gap-3">
            {/* Icon pill */}
            <div
              className={cn(
                "relative rounded-xl p-3.5 sm:p-4",
                "text-white shadow-md ring-1 ring-white/20 dark:ring-white/10",
                "group-hover:scale-110 group-hover:shadow-lg",
                "group-active:scale-110 group-active:shadow-lg",
                "transition-all duration-300",
                "bg-linear-to-br",
                action.gradient
              )}
            >
              {/* Inner top-edge highlight */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 rounded-xl",
                  "bg-linear-to-b from-white/20 to-transparent",
                  "pointer-events-none"
                )}
              />
              <Icon
                className="h-5 w-5 sm:h-6 sm:w-6 relative z-10 drop-shadow-sm"
                aria-hidden="true"
              />
            </div>

            {/* Label + description */}
            <div>
              <p
                className={cn(
                  "text-xs sm:text-sm font-bold leading-tight",
                  "text-zinc-900 dark:text-zinc-50",
                  "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
                  "group-active:text-indigo-600 dark:group-active:text-indigo-400",
                  "transition-colors duration-200"
                )}
              >
                {action.label}
              </p>
              <p
                className={cn(
                  "text-[11px] font-medium text-zinc-400 dark:text-zinc-500",
                  "mt-1 hidden sm:block leading-snug"
                )}
              >
                {action.description}
              </p>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

export const QuickActions = memo(function QuickActions({
  role,
}: QuickActionsProps): React.JSX.Element {
  const isAdmin = useMemo(() => hasPermission(role, "ADMIN"), [role]);
  const isSuperAdmin = useMemo(
    () => hasPermission(role, "SUPER_ADMIN"),
    [role]
  );

  // Only reconstructed when role changes — not on every parent render
  const actions = useMemo<readonly ActionItem[]>(
    () => [
      ...MEMBER_ACTIONS,
      ...(isAdmin ? ADMIN_ACTIONS : []),
      ...(isSuperAdmin ? SUPER_ADMIN_ACTIONS : []),
    ],
    [isAdmin, isSuperAdmin]
  );

  return (
    <section aria-labelledby="quick-actions-heading">
      <h2
        id="quick-actions-heading"
        className={cn(
          "text-lg font-bold font-[--font-outfit]",
          "tracking-tight text-zinc-900 dark:text-zinc-50 mb-4"
        )}
      >
        Quick Actions
      </h2>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
        role="list"
        aria-label="Quick action shortcuts"
      >
        {actions.map((action) => (
          <div key={action.label} role="listitem">
            <ActionCard action={action} />
          </div>
        ))}
      </motion.div>
    </section>
  );
});
