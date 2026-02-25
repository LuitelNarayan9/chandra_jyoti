"use client";

import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminNavbarProps {
  firstName: string;
  lastName: string;
  avatar: string | null;
  mobileSidebar: React.ReactNode;
}

export function AdminNavbar({ firstName, mobileSidebar }: AdminNavbarProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background/80 backdrop-blur-xl px-4">
      {mobileSidebar}

      <div className="ml-2 lg:ml-0">
        <Logo />
      </div>

      {/* Admin badge */}
      <Badge
        variant="outline"
        className="ml-3 hidden sm:flex border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider"
      >
        Admin
      </Badge>

      <div className="flex-1" />

      <TooltipProvider delayDuration={0}>
        <div className="flex items-center gap-1.5">
          {/* Quick create */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex h-8 gap-1.5 border-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="text-xs">Create</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quick create</TooltipContent>
          </Tooltip>

          {/* Search */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <Search className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Search
              <kbd className="ml-1.5 inline-flex h-5 items-center rounded border bg-muted px-1 text-[10px] font-mono">
                ⌘K
              </kbd>
            </TooltipContent>
          </Tooltip>

          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-amber-500 hover:bg-amber-500 text-white">
                  5
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          <ThemeToggle />

          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
        </div>
      </TooltipProvider>
    </header>
  );
}
