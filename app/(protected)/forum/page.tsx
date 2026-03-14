import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MessageSquare, PenLine } from "lucide-react";

import { getCurrentDbUser, hasPermission } from "@/lib/auth";
import {
  getForumCategories,
  getForumStats,
  getRecentActivity,
} from "@/lib/queries/forum.queries";

import { CategoryCard } from "@/components/forum/category-card";
import { ForumSidebar } from "@/components/forum/forum-sidebar";
import { AdminPollCreator } from "@/components/forum/admin-poll-creator";
import { ForumSearch } from "@/components/forum/forum-search";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Forum | Chandra Jyoti Sanstha",
  description: "Join the community discussion on Chandra Jyoti Sanstha Forum.",
};

export default async function ForumPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  const isAdmin = hasPermission(user.role, "ADMIN");

  const [categories, stats, recentActivity] = await Promise.all([
    getForumCategories(),
    getForumStats(),
    getRecentActivity(),
  ]);

  return (
    <div className="min-h-screen pb-16">
      {/* ── Hero header ── */}
      <PageHeader
        title="Community Forum"
        description="Ask questions, share ideas, and connect with fellow members of Chandra Jyoti Sanstha."
        eyebrow="Discussions"
        icon={<MessageSquare />}
      >
        <div className="flex flex-wrap gap-2">
          <ForumSearch />
          <Button
            asChild
            size="lg"
            className="gap-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            <Link href="/forum/create">
              <PenLine className="h-4 w-4" />
              Start a Thread
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* ── Page body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        {/* Admin Poll Creator (Admins only) */}
        {isAdmin && <AdminPollCreator />}

        {/* Section label */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground/70">
            ✦ Categories
          </span>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        {/* Main content + Sidebar */}
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          {/* Left: categories grid */}
          <div>
            {categories.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {categories.map((category, i) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <ForumSidebar
            stats={stats}
            categories={categories}
            recentActivity={recentActivity}
          />
        </div>
      </div>
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-border/50 border-dashed bg-muted/20 py-24 text-center gap-4">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-3xl">
        💬
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold font-(family-name:--font-outfit)">
          No categories yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Forum categories will appear here once they are set up by an
          administrator.
        </p>
      </div>
    </div>
  );
}
