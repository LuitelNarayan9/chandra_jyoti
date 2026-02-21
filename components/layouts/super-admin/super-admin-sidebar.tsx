"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Shield, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { superAdminNavSections } from "@/lib/nav-config";

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        style={{ width: collapsed ? 68 : 280 }}
        className="relative hidden flex-col border-r border-border bg-muted/40 dark:bg-muted/20 transition-all duration-300 ease-in-out lg:flex overflow-hidden shrink-0"
      >
        {/* Accent stripe — professional teal/slate */}
        <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-teal-500 via-sky-500 to-teal-500 opacity-70" />

        {/* Mission control header */}
        <div
          className={cn(
            "px-4 pt-4 pb-2 transition-all duration-300",
            collapsed ? "opacity-0 h-0 p-0 overflow-hidden" : "opacity-100"
          )}
        >
          <div className="flex items-center gap-2.5 rounded-lg bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/20 px-3 py-2.5">
            <div className="relative">
              <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-teal-700 dark:text-teal-300 tracking-wide">
                Super Admin
              </p>
              <p className="text-[10px] text-muted-foreground">
                Full System Access
              </p>
            </div>
          </div>
        </div>

        {/* System status minibar */}
        <div
          className={cn(
            "mx-4 mb-2 flex items-center gap-3 rounded-md bg-muted px-3 py-1.5 border transition-all duration-300",
            collapsed ? "opacity-0 h-0 p-0 m-0 overflow-hidden" : "opacity-100"
          )}
        >
          <div className="flex items-center gap-1.5">
            <CircleDot className="h-2.5 w-2.5 text-teal-500" />
            <span className="text-[10px] text-muted-foreground">
              All systems nominal
            </span>
          </div>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {superAdminNavSections.map((section, sIdx) => (
            <div key={section.title}>
              {sIdx > 0 && <Separator className="my-2" />}
              <div
                className={cn(
                  "mb-1.5 mt-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-teal-600/60 dark:text-teal-400/50 transition-opacity duration-200 whitespace-nowrap",
                  collapsed ? "opacity-0" : "opacity-100"
                )}
              >
                {section.title}
              </div>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-teal-500/10 text-teal-700 dark:text-teal-300"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          )}
                        >
                          {isActive && (
                            <div className="absolute inset-0 rounded-lg border border-teal-500/20 bg-teal-500/5 transition-all duration-300" />
                          )}

                          <item.icon
                            className={cn(
                              "h-4 w-4 shrink-0 relative z-10 transition-colors",
                              isActive
                                ? "text-teal-600 dark:text-teal-400"
                                : "text-muted-foreground group-hover:text-foreground"
                            )}
                          />

                          <span
                            className={cn(
                              "flex-1 truncate relative z-10 transition-all duration-200 whitespace-nowrap",
                              collapsed
                                ? "opacity-0 w-0 overflow-hidden"
                                : "opacity-100 w-auto"
                            )}
                          >
                            {item.label}
                          </span>

                          {!collapsed && item.badge && (
                            <Badge
                              variant="secondary"
                              className="h-5 min-w-5 px-1.5 text-[10px] bg-teal-500/15 text-teal-700 dark:text-teal-300 border-0 relative z-10"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right" className="font-medium">
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
