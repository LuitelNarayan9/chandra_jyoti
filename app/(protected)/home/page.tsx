import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";
import { hasPermission } from "@/lib/auth";
import {
  getDashboardStats,
  getRecentBlogPosts,
  getActiveForumThreads,
  getNewsHighlights,
  getCommunityActivity,
  getAdminOverview,
  getSystemHealth,
} from "@/lib/queries/dashboard.queries";

import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { RecentBlogPosts } from "@/components/dashboard/recent-blog-posts";
import { ActiveForumThreads } from "@/components/dashboard/active-forum-threads";
import { NewsHighlights } from "@/components/dashboard/news-highlights";
import { CommunityActivityFeed } from "@/components/dashboard/community-activity-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AdminOverview } from "@/components/dashboard/admin-overview";
import { SystemHealth } from "@/components/dashboard/system-health";

export const metadata = {
  title: "Dashboard",
  description: "Your community dashboard — everything at a glance.",
};

export default async function DashboardPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  const isAdmin = hasPermission(user.role, "ADMIN");
  const isSuperAdmin = hasPermission(user.role, "SUPER_ADMIN");

  // Fetch all data in parallel
  const [stats, recentPosts, activeThreads, newsArticles, activities] =
    await Promise.all([
      getDashboardStats(),
      getRecentBlogPosts(),
      getActiveForumThreads(),
      getNewsHighlights(),
      getCommunityActivity(),
    ]);

  // Admin-only data
  const adminData = isAdmin ? await getAdminOverview() : null;

  // Super Admin-only data
  const systemData = isSuperAdmin ? await getSystemHealth() : null;

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Banner */}
      <WelcomeBanner
        firstName={user.firstName}
        lastName={user.lastName}
        avatar={user.avatar}
        role={user.role}
        pendingApprovals={adminData?.pendingApprovals}
        pendingReports={adminData?.pendingReports}
        pendingFines={adminData?.pendingFines}
      />

      {/* Quick Stats */}
      <QuickStats stats={stats} role={user.role} />

      {/* Admin Overview (ADMIN+ only) */}
      {isAdmin && adminData && <AdminOverview data={adminData} />}

      {/* System Health (SUPER_ADMIN only) */}
      {isSuperAdmin && systemData && <SystemHealth data={systemData} />}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Blog Posts + Forum Threads */}
        <div className="lg:col-span-2 space-y-6">
          <RecentBlogPosts posts={recentPosts} />
          <ActiveForumThreads threads={activeThreads} />
        </div>

        {/* Right column: News + Activity Feed */}
        <div className="space-y-6">
          <NewsHighlights articles={newsArticles} />
          <CommunityActivityFeed activities={activities} />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions role={user.role} />
    </div>
  );
}
