"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { memberNavSections } from "@/lib/nav-config";

export function MemberSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        style={{ width: collapsed ? 68 : 256 }}
        className="relative hidden flex-col border-r bg-gradient-to-b from-background via-background to-indigo-50/30 dark:to-indigo-950/10 transition-all duration-300 ease-in-out lg:flex overflow-hidden shrink-0"
      >
        {/* Brand accent line */}
        <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-indigo-500 via-violet-500 to-indigo-500 opacity-60" />

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {memberNavSections.map((section) => (
            <div key={section.title}>
              <div
                className={cn(
                  "mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 transition-opacity duration-200 whitespace-nowrap",
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
                            "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          )}
                        >
                          {/* Active indicator dot */}
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-indigo-500 transition-all duration-300" />
                          )}

                          <item.icon
                            className={cn(
                              "h-[18px] w-[18px] shrink-0 transition-colors",
                              isActive
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-muted-foreground group-hover:text-foreground"
                            )}
                          />

                          <span
                            className={cn(
                              "truncate transition-all duration-200 whitespace-nowrap",
                              collapsed
                                ? "opacity-0 w-0 overflow-hidden"
                                : "opacity-100 w-auto"
                            )}
                          >
                            {item.label}
                          </span>
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

        {/* Community quote */}
        <div
          className={cn(
            "mx-3 mb-3 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 p-3 transition-all duration-300",
            collapsed
              ? "opacity-0 scale-95 h-0 p-0 m-0 overflow-hidden"
              : "opacity-100 scale-100"
          )}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3 w-3 text-indigo-500" />
            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Community
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Together we grow, together we thrive. 🌿
          </p>
        </div>

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
