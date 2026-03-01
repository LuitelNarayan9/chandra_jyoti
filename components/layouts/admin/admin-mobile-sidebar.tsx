"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { adminNavSections } from "@/lib/nav-config";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

type ExpandMap = Record<string, boolean>;

const ICON_PALETTE = [
  {
    idle: "bg-amber-50 text-amber-400 dark:bg-amber-500/10 dark:text-amber-400/70",
    hover:
      "group-hover:bg-amber-100 group-hover:text-amber-600 dark:group-hover:bg-amber-500/20 dark:group-hover:text-amber-300",
    active:
      "bg-amber-100 text-amber-600 ring-1 ring-amber-300/50 shadow-sm dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-400/30",
  },
  {
    idle: "bg-orange-50 text-orange-400 dark:bg-orange-500/10 dark:text-orange-400/70",
    hover:
      "group-hover:bg-orange-100 group-hover:text-orange-600 dark:group-hover:bg-orange-500/20 dark:group-hover:text-orange-300",
    active:
      "bg-orange-100 text-orange-600 ring-1 ring-orange-300/50 shadow-sm dark:bg-orange-500/20 dark:text-orange-300 dark:ring-orange-400/30",
  },
  {
    idle: "bg-rose-50 text-rose-400 dark:bg-rose-500/10 dark:text-rose-400/70",
    hover:
      "group-hover:bg-rose-100 group-hover:text-rose-600 dark:group-hover:bg-rose-500/20 dark:group-hover:text-rose-300",
    active:
      "bg-rose-100 text-rose-600 ring-1 ring-rose-300/50 shadow-sm dark:bg-rose-500/20 dark:text-rose-300 dark:ring-rose-400/30",
  },
  {
    idle: "bg-indigo-50 text-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-400/70",
    hover:
      "group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-500/20 dark:group-hover:text-indigo-300",
    active:
      "bg-indigo-100 text-indigo-600 ring-1 ring-indigo-300/50 shadow-sm dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-indigo-400/30",
  },
  {
    idle: "bg-sky-50 text-sky-400 dark:bg-sky-500/10 dark:text-sky-400/70",
    hover:
      "group-hover:bg-sky-100 group-hover:text-sky-600 dark:group-hover:bg-sky-500/20 dark:group-hover:text-sky-300",
    active:
      "bg-sky-100 text-sky-600 ring-1 ring-sky-300/50 shadow-sm dark:bg-sky-500/20 dark:text-sky-300 dark:ring-sky-400/30",
  },
  {
    idle: "bg-emerald-50 text-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-400/70",
    hover:
      "group-hover:bg-emerald-100 group-hover:text-emerald-600 dark:group-hover:bg-emerald-500/20 dark:group-hover:text-emerald-300",
    active:
      "bg-emerald-100 text-emerald-600 ring-1 ring-emerald-300/50 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/30",
  },
  {
    idle: "bg-violet-50 text-violet-400 dark:bg-violet-500/10 dark:text-violet-400/70",
    hover:
      "group-hover:bg-violet-100 group-hover:text-violet-600 dark:group-hover:bg-violet-500/20 dark:group-hover:text-violet-300",
    active:
      "bg-violet-100 text-violet-600 ring-1 ring-violet-300/50 shadow-sm dark:bg-violet-500/20 dark:text-violet-300 dark:ring-violet-400/30",
  },
  {
    idle: "bg-pink-50 text-pink-400 dark:bg-pink-500/10 dark:text-pink-400/70",
    hover:
      "group-hover:bg-pink-100 group-hover:text-pink-600 dark:group-hover:bg-pink-500/20 dark:group-hover:text-pink-300",
    active:
      "bg-pink-100 text-pink-600 ring-1 ring-pink-300/50 shadow-sm dark:bg-pink-500/20 dark:text-pink-300 dark:ring-pink-400/30",
  },
];

export function AdminMobileSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<ExpandMap>({});
  const toggleExpand = useCallback(
    (href: string) => setExpanded((p) => ({ ...p, [href]: !p[href] })),
    []
  );

  const firstName = user?.firstName ?? "Admin";
  const lastName = user?.lastName ?? "";
  const avatarUrl = user?.imageUrl ?? null;
  let gi = 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden rounded-xl"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[280px] p-0 border-r border-neutral-200/80 dark:border-white/[0.07] bg-white dark:bg-[#111113] flex flex-col"
      >
        <SheetTitle className="sr-only">Admin Navigation</SheetTitle>

        {/* Nav — flex-1 */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-none">
          {adminNavSections.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="px-5 mb-2 text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400 dark:text-white/20 select-none">
                {section.title}
              </p>
              <div className="space-y-0.5 px-3">
                {section.items.map((item) => {
                  const pal = ICON_PALETTE[gi % ICON_PALETTE.length];
                  gi++;
                  const isActive =
                    pathname === item.href ||
                    (!item.exact && pathname.startsWith(item.href + "/"));
                  const hasChildren =
                    "children" in item && Array.isArray((item as any).children);
                  const isOpen = expanded[item.href];

                  const rowClass = cn(
                    "group relative flex items-center gap-3 px-2 py-[7px] rounded-xl text-sm font-medium w-full transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40",
                    isActive
                      ? "bg-neutral-50 dark:bg-white/[0.05] text-neutral-900 dark:text-white"
                      : "text-neutral-500 dark:text-white/50 hover:bg-neutral-50 dark:hover:bg-white/[0.04] hover:text-neutral-800 dark:hover:text-white/85"
                  );

                  const iconEl = (
                    <span
                      className={cn(
                        "shrink-0 flex items-center justify-center rounded-xl h-9 w-9 transition-all duration-200",
                        isActive ? pal.active : cn(pal.idle, pal.hover)
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px] transition-colors duration-150" />
                    </span>
                  );

                  return (
                    <div key={item.href}>
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.href)}
                          className={rowClass}
                        >
                          {iconEl}
                          <span className="flex-1 text-left truncate">
                            {item.label}
                          </span>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="h-4 px-1.5 text-[9px] bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border-0 shrink-0"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 text-neutral-300 dark:text-white/20 transition-transform duration-200",
                              isOpen && "rotate-180"
                            )}
                          />
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={rowClass}
                        >
                          {isActive && (
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-l-full bg-gradient-to-b from-amber-400 to-orange-500" />
                          )}
                          {iconEl}
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="h-4 px-1.5 text-[9px] bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border-0 shrink-0"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      )}
                      {hasChildren && isOpen && (
                        <div className="ml-[52px] mt-0.5 space-y-px border-l-2 border-neutral-100 dark:border-white/[0.06] pl-3">
                          {(
                            (item as any).children as {
                              href: string;
                              label: string;
                            }[]
                          ).map((child) => {
                            const ca = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                  "block rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150",
                                  ca
                                    ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10"
                                    : "text-neutral-400 dark:text-white/30 hover:text-neutral-700 dark:hover:text-white/70 hover:bg-neutral-50 dark:hover:bg-white/[0.04]"
                                )}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* CTA */}
        <div className="shrink-0 mx-3 mb-3 rounded-2xl overflow-hidden">
          <div className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-4 overflow-hidden">
            <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-white/90" />
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                  Quick Action!
                </span>
              </div>
              <p className="text-[11px] text-orange-100/80 leading-relaxed mb-3">
                Manage users, settings and content in one place.
              </p>
              <button className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-semibold py-2 transition-all duration-200 active:scale-[0.97]">
                <Plus className="h-3.5 w-3.5" /> New Action
              </button>
            </div>
          </div>
        </div>

        {/* Profile footer — bottom */}
        <div className="shrink-0 border-t border-neutral-100 dark:border-white/[0.05] flex items-center gap-3 px-4 py-3">
          <div className="relative shrink-0">
            <div className="h-[44px] w-[44px] rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-[2.5px] shadow-[0_0_12px_rgba(245,158,11,0.35)] dark:shadow-[0_0_16px_rgba(251,146,60,0.35)]">
              <div className="rounded-full overflow-hidden w-full h-full bg-white dark:bg-[#111113]">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={firstName}
                    width={44}
                    height={44}
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold select-none">
                    {firstName[0]}
                    {lastName[0]}
                  </div>
                )}
              </div>
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-amber-400 border-2 border-white dark:border-[#111113] shadow-sm animate-pulse" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-500 dark:text-amber-400 leading-none truncate">
                Admin Console
              </span>
              <ShieldCheck className="h-3 w-3 text-amber-500 dark:text-amber-400 shrink-0" />
            </div>
            <span className="text-[13px] font-semibold text-neutral-800 dark:text-white/90 leading-tight truncate">
              {firstName} {lastName}
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
