"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Shield, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { superAdminNavSections } from "@/lib/nav-config";

export function SuperAdminMobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">Super Admin Navigation</SheetTitle>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-4">
            <Logo />
          </div>

          {/* Mission control badge */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 px-3 py-2.5">
              <div className="relative">
                <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-teal-700 dark:text-teal-300">
                  Super Admin
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Full System Access
                </p>
              </div>
            </div>
          </div>

          {/* System status */}
          <div className="mx-4 mb-2 flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 border">
            <CircleDot className="h-2.5 w-2.5 text-teal-500" />
            <span className="text-[10px] text-muted-foreground">
              All systems nominal
            </span>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            {superAdminNavSections.map((section, sIdx) => (
              <div key={section.title}>
                {sIdx > 0 && <Separator className="my-2" />}
                <p className="mb-1.5 mt-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-teal-600/60 dark:text-teal-400/50">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-teal-500/10 text-teal-700 dark:text-teal-300"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-teal-600 dark:text-teal-400" : ""
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="h-5 min-w-5 px-1.5 text-[10px] bg-teal-500/15 text-teal-700 dark:text-teal-300 border-0"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
