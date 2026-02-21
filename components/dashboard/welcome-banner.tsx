"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Flag,
} from "lucide-react";
import { Role, hasPermission } from "@/lib/roles";

interface WelcomeBannerProps {
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: Role;
  pendingApprovals?: number;
  pendingReports?: number;
  pendingFines?: number;
}

const COMMUNITY_QUOTES = [
  "Together we grow, together we thrive. 🌿",
  "Our heritage connects us, our future unites us. 🤝",
  "Every family strengthens our community. 🏡",
  "Preserving the past, building the future. ✨",
  "United in community, strong in purpose. 💪",
];

export function WelcomeBanner({
  firstName,
  lastName,
  avatar,
  role,
  pendingApprovals = 0,
  pendingReports = 0,
  pendingFines = 0,
}: WelcomeBannerProps) {
  const [formattedDate, setFormattedDate] = useState("");
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const now = new Date();
    setFormattedDate(
      now.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
    const hour = now.getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Deterministic quote based on day of year to avoid SSR mismatch
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const quote = COMMUNITY_QUOTES[dayOfYear % COMMUNITY_QUOTES.length];
  const isAdmin = hasPermission(role, "ADMIN");
  const totalPending = pendingApprovals + pendingReports + pendingFines;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-emerald-500/10 dark:from-indigo-500/20 dark:via-purple-500/10 dark:to-emerald-500/15 p-6 md:p-8"
    >
      {/* Decorative background orbs */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-indigo-500/30 ring-offset-2 ring-offset-background">
            <AvatarImage src={avatar ?? undefined} alt={firstName} />
            <AvatarFallback className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold text-lg">
              {firstName[0]}
              {lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] tracking-tight">
              {greeting},{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 dark:from-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
                {firstName}!
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>{formattedDate}</span>
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-wider"
              >
                <ShieldCheck className="h-3 w-3 mr-1" />
                {role.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <p className="text-sm text-muted-foreground italic max-w-xs text-right hidden md:block">
            &ldquo;{quote}&rdquo;
          </p>

          {isAdmin && totalPending > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-2 flex-wrap"
            >
              {pendingApprovals > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <ClipboardList className="h-3 w-3" />
                  {pendingApprovals} approval{pendingApprovals !== 1 ? "s" : ""}
                </Badge>
              )}
              {pendingReports > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <Flag className="h-3 w-3" />
                  {pendingReports} report{pendingReports !== 1 ? "s" : ""}
                </Badge>
              )}
              {pendingFines > 0 && (
                <Badge
                  variant="outline"
                  className="gap-1 border-amber-500 text-amber-600"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {pendingFines} fine{pendingFines !== 1 ? "s" : ""}
                </Badge>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
