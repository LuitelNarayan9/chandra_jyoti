"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { memberNavSections } from "@/lib/nav-config";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

type ExpandMap = Record<string, boolean>;

// Each entry: idle = always-visible soft color, hover = clearly visible but not loud, active = stronger
const ICON_PALETTE = [
  {
    idle: "bg-indigo-50 text-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-400/70",
    hover:
      "group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-500/20 dark:group-hover:text-indigo-300",
    active:
      "bg-indigo-100 text-indigo-600 ring-1 ring-indigo-300/50 shadow-sm dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-indigo-400/30",
    bar: "from-indigo-400 to-violet-500",
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
    idle: "bg-sky-50 text-sky-400 dark:bg-sky-500/10 dark:text-sky-400/70",
    hover:
      "group-hover:bg-sky-100 group-hover:text-sky-600 dark:group-hover:bg-sky-500/20 dark:group-hover:text-sky-300",
    active:
      "bg-sky-100 text-sky-600 ring-1 ring-sky-300/50 shadow-sm dark:bg-sky-500/20 dark:text-sky-300 dark:ring-sky-400/30",
    bar: "from-sky-400 to-blue-500",
  },
  {
    idle: "bg-pink-50 text-pink-400 dark:bg-pink-500/10 dark:text-pink-400/70",
    hover:
      "group-hover:bg-pink-100 group-hover:text-pink-600 dark:group-hover:bg-pink-500/20 dark:group-hover:text-pink-300",
    active:
      "bg-pink-100 text-pink-600 ring-1 ring-pink-300/50 shadow-sm dark:bg-pink-500/20 dark:text-pink-300 dark:ring-pink-400/30",
    bar: "from-pink-400 to-rose-500",
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
    idle: "bg-amber-50 text-amber-400 dark:bg-amber-500/10 dark:text-amber-400/70",
    hover:
      "group-hover:bg-amber-100 group-hover:text-amber-600 dark:group-hover:bg-amber-500/20 dark:group-hover:text-amber-300",
    active:
      "bg-amber-100 text-amber-600 ring-1 ring-amber-300/50 shadow-sm dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-400/30",
    bar: "from-amber-400 to-orange-500",
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
    idle: "bg-cyan-50 text-cyan-400 dark:bg-cyan-500/10 dark:text-cyan-400/70",
    hover:
      "group-hover:bg-cyan-100 group-hover:text-cyan-600 dark:group-hover:bg-cyan-500/20 dark:group-hover:text-cyan-300",
    active:
      "bg-cyan-100 text-cyan-600 ring-1 ring-cyan-300/50 shadow-sm dark:bg-cyan-500/20 dark:text-cyan-300 dark:ring-cyan-400/30",
    bar: "from-cyan-400 to-sky-500",
  },
];

export function MemberSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<ExpandMap>({});
  const toggleExpand = useCallback(
    (href: string) => setExpanded((p) => ({ ...p, [href]: !p[href] })),
    []
  );

  const firstName = user?.firstName ?? "Member";
  const lastName = user?.lastName ?? "";
  const avatarUrl = user?.imageUrl ?? null;
  let gi = 0;

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
      {/* ── Nav — flex-1 so profile is pushed to bottom ─────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-none">
        {memberNavSections.map((section) => (
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
              {section.items.map((item) => {
                const pal = ICON_PALETTE[gi % ICON_PALETTE.length];
                gi++;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                const hasChildren =
                  "children" in item && Array.isArray((item as any).children);
                const isOpen = expanded[item.href];

                const rowClass = cn(
                  "group relative flex items-center rounded-xl text-sm font-medium w-full",
                  "transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                  collapsed ? "justify-center p-2" : "gap-3 px-2 py-[7px]",
                  isActive
                    ? "bg-neutral-50 dark:bg-white/[0.05] text-neutral-900 dark:text-white"
                    : "text-neutral-500 dark:text-white/50 hover:bg-neutral-50 dark:hover:bg-white/[0.04] hover:text-neutral-800 dark:hover:text-white/85"
                );

                // Icon wrapper: always has soft color bg+text, visibly shifts on hover, bolder on active
                const iconWrap = cn(
                  "shrink-0 flex items-center justify-center rounded-xl h-9 w-9 transition-all duration-200",
                  isActive ? pal.active : cn(pal.idle, pal.hover)
                );

                const iconEl = (
                  <span className={iconWrap}>
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
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left truncate">
                              {item.label}
                            </span>
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 shrink-0 text-neutral-300 dark:text-white/20 transition-transform duration-200",
                                isOpen && "rotate-180"
                              )}
                            />
                          </>
                        )}
                      </button>
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
                          <span className="flex-1 truncate">{item.label}</span>
                        )}
                      </Link>
                    )}
                    {hasChildren && isOpen && !collapsed && (
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
                              className={cn(
                                "block rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150",
                                ca
                                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
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

      {/* ── CTA card ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          "shrink-0 mx-3 rounded-2xl overflow-hidden transition-all duration-300",
          collapsed
            ? "opacity-0 h-0 mx-0 pointer-events-none mb-0"
            : "opacity-100 mb-3"
        )}
      >
        <div className="relative bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-4 overflow-hidden">
          <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-violet-300/20 blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                Let&apos;s start!
              </span>
            </div>
            <p className="text-[11px] text-indigo-100/80 leading-relaxed mb-3">
              Creating or adding new tasks couldn&apos;t be easier
            </p>
            <button className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-semibold py-2 transition-all duration-200 active:scale-[0.97]">
              <Plus className="h-3.5 w-3.5" /> Add New Task
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
              "rounded-full bg-gradient-to-br from-indigo-400 via-violet-500 to-pink-500 p-[2.5px]",
              "shadow-[0_0_12px_rgba(99,102,241,0.4)] dark:shadow-[0_0_16px_rgba(139,92,246,0.4)]",
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
                <div className="h-full w-full bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-white text-sm font-bold select-none">
                  {firstName[0]}
                  {lastName[0]}
                </div>
              )}
            </div>
          </div>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#111113] shadow-sm" />
        </div>

        {/* Name + role — hidden when collapsed */}
        <div
          className={cn(
            "flex flex-col overflow-hidden transition-all duration-300 min-w-0",
            collapsed
              ? "w-0 opacity-0 pointer-events-none"
              : "flex-1 opacity-100"
          )}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-500 dark:text-indigo-400 leading-none mb-0.5 truncate whitespace-nowrap">
            Member
          </span>
          <span className="text-[13px] font-semibold text-neutral-800 dark:text-white/90 leading-tight truncate whitespace-nowrap">
            {firstName} {lastName}
          </span>
        </div>

        {/* Collapse / expand button */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="shrink-0 h-7 w-7 flex items-center justify-center rounded-lg text-neutral-400 dark:text-white/25 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200 active:scale-95"
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
