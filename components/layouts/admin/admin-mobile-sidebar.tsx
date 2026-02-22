"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Shield } from "lucide-react";
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
import { adminNavSections } from "@/lib/nav-config";

export function AdminMobileSidebar() {
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
        <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-4">
            <Logo />
          </div>

          {/* Admin badge */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 border border-amber-500/20">
              <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                Admin Console
              </p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            {adminNavSections.map((section, sIdx) => (
              <div key={section.title}>
                {sIdx > 0 && <Separator className="my-2 opacity-50" />}
                <p className="mb-1.5 mt-2 px-3 text-[10px] font-bold uppercase tracking-widest text-amber-600/60 dark:text-amber-400/40">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (!item.exact && pathname.startsWith(item.href + "/"));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-amber-500/10 text-amber-800 dark:text-amber-200"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-amber-600 dark:text-amber-400" : ""
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="h-5 min-w-5 px-1.5 text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border-0"
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
