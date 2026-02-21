"use client";

import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Bell, Search, Shield, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SuperAdminNavbarProps {
  firstName: string;
  lastName: string;
  avatar: string | null;
  mobileSidebar: React.ReactNode;
}

export function SuperAdminNavbar({
  firstName,
  mobileSidebar,
}: SuperAdminNavbarProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background/80 backdrop-blur-xl px-4">
      {mobileSidebar}

      <div className="ml-2 lg:ml-0">
        <Logo />
      </div>

      {/* Role badge */}
      <div className="ml-3 hidden sm:flex items-center gap-2">
        <Badge
          variant="outline"
          className="border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wider gap-1"
        >
          <Shield className="h-3 w-3" />
          Super Admin
        </Badge>

        {/* System status */}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <CircleDot className="h-2.5 w-2.5 text-teal-500" />
          <span className="hidden md:inline">Systems OK</span>
        </div>
      </div>

      <div className="flex-1" />

      <TooltipProvider delayDuration={0}>
        <div className="flex items-center gap-1.5">
          {/* Search */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex h-8 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="text-xs">Search</span>
                <kbd className="ml-1 inline-flex h-5 items-center rounded border bg-muted px-1 text-[10px] font-mono text-muted-foreground">
                  ⌘K
                </kbd>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Global search</TooltipContent>
          </Tooltip>

          {/* Mobile search */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:hidden text-muted-foreground hover:text-foreground"
              >
                <Search className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search</TooltipContent>
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
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-teal-500 hover:bg-teal-500 text-white border-0">
                  8
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
