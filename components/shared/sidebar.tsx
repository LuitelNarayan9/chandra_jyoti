"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  TreePine,
  BookOpen,
  MessageSquare,
  Newspaper,
  CreditCard,
  BarChart3,
  User,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { hasPermission, Role } from "@/lib/roles";

import { useUser } from "@clerk/nextjs";

const mainNav = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/family-tree", label: "Family Tree", icon: TreePine },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/forum", label: "Forum", icon: MessageSquare },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

const adminNav = [{ href: "/admin", label: "Admin Panel", icon: Shield }];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useUser();

  const isAdmin = hasPermission(user?.publicMetadata?.role as Role, "ADMIN");

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative hidden h-[calc(100vh-4rem)] flex-col border-r bg-muted/30 transition-all duration-300 lg:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Nav links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {mainNav.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            );
          })}

          {isAdmin && (
            <>
              <Separator className="my-3" />

              {/* Admin section */}
              {adminNav.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </>
          )}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            <span className="sr-only">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
