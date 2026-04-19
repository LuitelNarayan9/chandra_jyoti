"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNavSections } from "@/lib/nav-config";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

type ExpandMap = Record<string, boolean>;

const ICON_PALETTE = [
  {
    idle: "bg-amber-50 text-amber-400 dark:bg-amber-500/10 dark:text-amber-400/70",
    hover:
      "group-hover:bg-amber-100 group-hover:text-amber-600 dark:group-hover:bg-amber-500/20 dark:group-hover:text-amber-300",
    active:
      "bg-amber-100 text-amber-600 ring-1 ring-amber-300/50 shadow-sm dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-400/30",
    bar: "from-amber-400 to-orange-500",
  },
  {
    idle: "bg-orange-50 text-orange-400 dark:bg-orange-500/10 dark:text-orange-400/70",
    hover:
      "group-hover:bg-orange-100 group-hover:text-orange-600 dark:group-hover:bg-orange-500/20 dark:group-hover:text-orange-300",
    active:
      "bg-orange-100 text-orange-600 ring-1 ring-orange-300/50 shadow-sm dark:bg-orange-500/20 dark:text-orange-300 dark:ring-orange-400/30",
    bar: "from-orange-400 to-red-500",
  },
  {
    idle: "bg-rose-50 text-rose-400 dark:bg-rose-500/10 dark:text-rose-400/70",
    hover:
      "group-hover:bg-rose-100 group-hover:text-rose-600 dark:group-hover:bg-rose-500/20 dark:group-hover:text-rose-300",
    active:
      "bg-rose-100 text-rose-600 ring-1 ring-rose-300/50 shadow-sm dark:bg-rose-500/20 dark:text-rose-300 dark:ring-rose-400/30",
    bar: "from-rose-400 to-pink-500",
  },
  {
    idle: "bg-indigo-50 text-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-400/70",
    hover:
      "group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-500/20 dark:group-hover:text-indigo-300",
    active:
      "bg-indigo-100 text-indigo-600 ring-1 ring-indigo-300/50 shadow-sm dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-indigo-400/30",
    bar: "from-indigo-400 to-violet-500",
  },
  {
    idle: "bg-sky-50 text-sky-400 dark:bg-sky-500/10 dark:text-sky-400/70",
    hover:
      "group-hover:bg-sky-100 group-hover:text-sky-600 dark:group-hover:bg-sky-500/20 dark:group-hover:text-sky-300",
    active:
      "bg-sky-100 text-sky-600 ring-1 ring-sky-300/50 shadow-sm dark:bg-sky-500/20 dark:text-sky-300 dark:ring-sky-400/30",
    bar: "from-sky-400 to-blue-500",
  },
  {
    idle: "bg-emerald-50 text-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-400/70",
    hover:
      "group-hover:bg-emerald-100 group-hover:text-emerald-600 dark:group-hover:bg-emerald-500/20 dark:group-hover:text-emerald-300",
    active:
      "bg-emerald-100 text-emerald-600 ring-1 ring-emerald-300/50 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/30",
    bar: "from-emerald-400 to-teal-500",
  },
  {
    idle: "bg-violet-50 text-violet-400 dark:bg-violet-500/10 dark:text-violet-400/70",
    hover:
      "group-hover:bg-violet-100 group-hover:text-violet-600 dark:group-hover:bg-violet-500/20 dark:group-hover:text-violet-300",
    active:
      "bg-violet-100 text-violet-600 ring-1 ring-violet-300/50 shadow-sm dark:bg-violet-500/20 dark:text-violet-300 dark:ring-violet-400/30",
    bar: "from-violet-400 to-purple-500",
  },
  {
    idle: "bg-pink-50 text-pink-400 dark:bg-pink-500/10 dark:text-pink-400/70",
    hover:
      "group-hover:bg-pink-100 group-hover:text-pink-600 dark:group-hover:bg-pink-500/20 dark:group-hover:text-pink-300",
    active:
      "bg-pink-100 text-pink-600 ring-1 ring-pink-300/50 shadow-sm dark:bg-pink-500/20 dark:text-pink-300 dark:ring-pink-400/30",
    bar: "from-pink-400 to-rose-500",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<ExpandMap>({});
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Precompute section offsets to avoid O(N^2) work in the render loop.
  const sectionOffsets = useMemo(() => {
    let currentOffset = 0;
    return adminNavSections.map((section) => {
      const offset = currentOffset;
      currentOffset += section.items.length;
      return offset;
    });
  }, []);

  // React 19 update-during-render pattern for syncing expanded state with route
  if (pathname !== prevPathname) {
    const init: ExpandMap = {};
    adminNavSections.forEach((sec) => {
      sec.items.forEach((item) => {
        if ("children" in item && Array.isArray((item as any).children)) {
          if (pathname.startsWith(item.href)) init[item.href] = true;
        }
      });
    });
    setPrevPathname(pathname);
    setExpanded((prev) => ({ ...prev, ...init }));
  }
  const toggleExpand = useCallback(
    (href: string) => setExpanded((p) => ({ ...p, [href]: !p[href] })),
    []
  );

  const firstName = user?.firstName ?? "Admin";
  const lastName = user?.lastName ?? "";
  const avatarUrl = user?.imageUrl ?? null;
  return (
    <aside
      style={{ width: collapsed ? 88 : 272 }}
      className={cn(
        "sticky top-0 hidden lg:flex flex-col shrink-0 z-40 h-screen",
        "bg-white border-r border-neutral-200/80 shadow-[2px_0_24px_-6px_rgba(0,0,0,0.08)]",
        "dark:bg-[#111113] dark:border-white/[0.06] dark:shadow-[2px_0_24px_-6px_rgba(0,0,0,0.55)]",
        "transition-[width] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] overflow-hidden"
      )}
    >
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-none">
        {adminNavSections.map((section, sIdx) => (
          <div key={section.title} className="mb-5">
            <div
              className={cn(
                "mb-2 text-[9px] font-bold uppercase tracking-[0.22em] select-none whitespace-nowrap overflow-hidden",
                "text-neutral-400 dark:text-white/20 transition-all duration-300",
                collapsed
                  ? "opacity-0 h-0 mb-0 px-0"
                  : "opacity-100 h-auto px-5"
              )}
            >
              {section.title}
            </div>

            <div className="space-y-0.5 px-3">
              {section.items.map((item, iIdx) => {
                const globalIdx = sectionOffsets[sIdx] + iIdx;
                const pal = ICON_PALETTE[globalIdx % ICON_PALETTE.length];
                const isActive = item.children
                  ? pathname === item.href ||
                    item.children.some((c) => pathname.startsWith(c.href))
                  : pathname === item.href ||
                    (!item.exact && pathname.startsWith(item.href + "/"));
                const hasChildren =
                  "children" in item && Array.isArray((item as any).children);
                const isOpen = expanded[item.href];

                const rowClass = cn(
                  "group relative flex items-center rounded-xl text-sm font-medium w-full",
                  "transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40",
                  collapsed ? "justify-center p-2" : "gap-3 px-2 py-[7px]",
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
                      // Split row: Link navigates, chevron toggles submenu
                      (<div className={cn(rowClass, "pr-1")}>
                        {isActive && !collapsed && (
                          <span
                            className={cn(
                              "absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-l-full bg-gradient-to-b",
                              pal.bar
                            )}
                          />
                        )}
                        <Link
                          href={item.href}
                          className="flex flex-1 items-center gap-3 min-w-0"
                        >
                          {iconEl}
                          {!collapsed && (
                            <span className="flex-1 truncate">
                              {item.label}
                            </span>
                          )}
                        </Link>
                        {!collapsed && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.href)}
                            aria-label="Toggle submenu"
                            className="shrink-0 flex items-center justify-center h-7 w-7 rounded-lg text-neutral-400 dark:text-white/30 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 ring-0 hover:ring-1 hover:ring-amber-200 dark:hover:ring-amber-500/20 transition-all duration-200 active:scale-90"
                          >
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
                                isOpen && "rotate-180"
                              )}
                            />
                          </button>
                        )}
                      </div>)
                    ) : (
                      <Link href={item.href} className={rowClass}>
                        {isActive && !collapsed && (
                          <span
                            className={cn(
                              "absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-l-full bg-gradient-to-b",
                              pal.bar
                            )}
                          />
                        )}
                        {iconEl}
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">
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
                          </>
                        )}
                      </Link>
                    )}
                    {/* ── Children (FAQ-style accordion) ── */}
                    {hasChildren && !collapsed && (
                      <div
                        className={cn(
                          "grid transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
                          isOpen
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        )}
                      >
                        <div className="overflow-hidden">
                          <div className="ml-[52px] mt-1 space-y-px border-l-2 border-neutral-100 dark:border-white/[0.06] pl-3 pb-1">
                            {(
                              (item as any).children as {
                                href: string;
                                label: string;
                                icon: React.ElementType;
                              }[]
                            ).map((child) => {
                              const ca =
                                pathname === child.href ||
                                pathname.startsWith(child.href + "/");
                              const ChildIcon = child.icon;
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={cn(
                                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150",
                                    ca
                                      ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10"
                                      : "text-neutral-400 dark:text-white/30 hover:text-neutral-700 dark:hover:text-white/70 hover:bg-neutral-50 dark:hover:bg-white/[0.04]"
                                  )}
                                >
                                  <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                                  {child.label}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      {/* ── CTA card ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          "shrink-0 mx-3 rounded-2xl overflow-hidden transition-all duration-300",
          collapsed
            ? "opacity-0 h-0 mx-0 pointer-events-none mb-0"
            : "opacity-100 mb-3"
        )}
      >
        <div className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-4 overflow-hidden">
          <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-orange-300/20 blur-xl" />
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
      {/* ── Profile footer — bottom of sidebar ───────────────────────── */}
      <div
        className={cn(
          "shrink-0 border-t border-neutral-100 dark:border-white/[0.05] py-3",
          collapsed
            ? "flex flex-col items-center gap-2 px-0"
            : "flex items-center gap-3 px-4"
        )}
      >
        {/* Gradient-ring avatar — Google AI Pro style */}
        <div className="relative shrink-0">
          <div
            className={cn(
              "rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-[2.5px]",
              "shadow-[0_0_12px_rgba(245,158,11,0.4)] dark:shadow-[0_0_16px_rgba(251,146,60,0.4)]",
              "transition-all duration-300",
              collapsed ? "h-11 w-11" : "h-[44px] w-[44px]"
            )}
          >
            <div className="rounded-full overflow-hidden w-full h-full bg-white dark:bg-[#111113]">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={firstName}
                  width={44}
                  height={44}
                  className="object-cover w-full h-full rounded-full"
                  priority
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold select-none">
                  {firstName?.[0] ?? ""}
                  {lastName?.[0] ?? ""}
                </div>
              )}
            </div>
          </div>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-amber-400 border-2 border-white dark:border-[#111113] shadow-sm animate-pulse" />
        </div>

        <div
          className={cn(
            "flex flex-col overflow-hidden transition-all duration-300 min-w-0",
            collapsed
              ? "w-0 opacity-0 pointer-events-none"
              : "flex-1 opacity-100"
          )}
        >
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-500 dark:text-amber-400 leading-none truncate whitespace-nowrap">
              Admin Console
            </span>
            <ShieldCheck className="h-3 w-3 text-amber-500 dark:text-amber-400 shrink-0" />
          </div>
          <span className="text-[13px] font-semibold text-neutral-800 dark:text-white/90 leading-tight truncate whitespace-nowrap">
            {firstName} {lastName}
          </span>
        </div>

        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="shrink-0 h-7 w-7 flex items-center justify-center rounded-lg text-neutral-400 dark:text-white/25 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all duration-200 active:scale-95"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
