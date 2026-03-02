"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  TreePine,
  BookOpen,
  MessageSquare,
  Newspaper,
  CreditCard,
  BarChart3,
  User,
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { hasPermission, Role } from "@/lib/roles";
import { useUser } from "@clerk/nextjs";

// ─── Nav config ────────────────────────────────────────────────

type NavItem =
  | { href: string; label: string; icon: React.ElementType; children?: never }
  | {
      href: string;
      label: string;
      icon: React.ElementType;
      children: { href: string; label: string; icon: React.ElementType }[];
    };

const mainNav: NavItem[] = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/family-tree", label: "Family Tree", icon: TreePine },
  {
    href: "/blog",
    label: "Blog",
    icon: BookOpen,
    children: [
      { href: "/blog/my-posts", label: "My Posts", icon: FileText },
      { href: "/blog/bookmarks", label: "Bookmarks", icon: Bookmark },
    ],
  },
  { href: "/forum", label: "Forum", icon: MessageSquare },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Admin Panel", icon: Shield },
];

// ─── Sidebar ────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useUser();

  // Blog submenu open state — default open when on any /blog route
  const [blogOpen, setBlogOpen] = useState(() => pathname.startsWith("/blog"));

  const isAdmin = hasPermission(user?.publicMetadata?.role as Role, "ADMIN");

  // Is the top-level item "active" (any descendant matches)
  const isItemActive = (item: NavItem) => {
    if (item.children) {
      return (
        pathname === item.href ||
        item.children.some((c) => pathname.startsWith(c.href))
      );
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const renderItem = (item: NavItem) => {
    const active = isItemActive(item);

    // ── Item with children (submenu) ──────────────────────────
    if (item.children) {
      const isOpen = blogOpen && !collapsed;

      return (
        <div key={item.href}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => {
                  if (collapsed) return; // collapsed: navigate directly
                  setBlogOpen((o) => !o);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                    />
                  </>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">{item.label}</TooltipContent>
            )}
          </Tooltip>

          {/* Sub-items */}
          {!collapsed && (
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border/50 pl-3 py-1">
                {item.children.map((child) => {
                  const childActive =
                    pathname === child.href ||
                    pathname.startsWith(child.href + "/");
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                        childActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <child.icon className="h-3.5 w-3.5 shrink-0" />
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    // ── Regular item (no children) ────────────────────────────
    return (
      <Tooltip key={item.href}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right">{item.label}</TooltipContent>
        )}
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative hidden h-[calc(100vh-4rem)] flex-col border-r bg-muted/30 transition-all duration-300 lg:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Nav links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {mainNav.map(renderItem)}

          {isAdmin && (
            <>
              <Separator className="my-3" />
              {adminNav.map(renderItem)}
            </>
          )}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
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
