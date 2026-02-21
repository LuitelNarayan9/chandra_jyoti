"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
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
import { adminNavSections } from "@/lib/nav-config";

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        style={{ width: collapsed ? 68 : 272 }}
        className="relative hidden flex-col border-r bg-gradient-to-b from-background via-background to-amber-50/20 dark:to-amber-950/10 transition-all duration-300 ease-in-out lg:flex overflow-hidden shrink-0"
      >
        {/* Accent stripe */}
        <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-amber-500 via-orange-500 to-amber-500 opacity-60" />

        {/* Admin badge header */}
        <div
          className={cn(
            "px-4 pt-4 pb-2 transition-all duration-300",
            collapsed ? "opacity-0 h-0 p-0 overflow-hidden" : "opacity-100"
          )}
        >
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 px-3 py-2 border border-amber-500/20">
            <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                Admin Console
              </p>
              <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">
                Management Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {adminNavSections.map((section, sIdx) => (
            <div key={section.title}>
              {sIdx > 0 && <Separator className="my-2 opacity-50" />}
              <div
                className={cn(
                  "mb-1.5 mt-2 px-3 text-[10px] font-bold uppercase tracking-widest text-amber-600/60 dark:text-amber-400/40 transition-opacity duration-200 whitespace-nowrap",
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
                              ? "bg-amber-500/10 text-amber-800 dark:text-amber-200"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          )}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-amber-500 transition-all duration-300" />
                          )}

                          <item.icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              isActive
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-muted-foreground group-hover:text-foreground"
                            )}
                          />

                          <span
                            className={cn(
                              "flex-1 truncate transition-all duration-200 whitespace-nowrap",
                              collapsed
                                ? "opacity-0 w-0 overflow-hidden"
                                : "opacity-100 w-auto"
                            )}
                          >
                            {item.label}
                          </span>

                          {/* Badge for specific admin items */}
                          {!collapsed && item.badge && (
                            <Badge
                              variant="secondary"
                              className="h-5 min-w-5 px-1.5 text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border-0"
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
