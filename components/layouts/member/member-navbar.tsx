"use client";

import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MemberNavbarProps {
  firstName: string;
  lastName: string;
  avatar: string | null;
  mobileSidebar: React.ReactNode;
}

export function MemberNavbar({ firstName, mobileSidebar }: MemberNavbarProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background/80 backdrop-blur-xl px-4">
      {/* Mobile sidebar trigger */}
      {mobileSidebar}

      {/* Logo */}
      <div className="ml-2 lg:ml-0">
        <Logo />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <TooltipProvider delayDuration={0}>
        <div className="flex items-center gap-2">
          {/* Search */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
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
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-indigo-500 hover:bg-indigo-500">
                  3
                </Badge>
                <span className="sr-only">Notifications</span>
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
