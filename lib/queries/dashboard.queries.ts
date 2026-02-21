import { db } from "@/lib/db";

// ─── Dashboard Stats ─────────────────────────────────────────

export async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalMembers,
    newMembersThisMonth,
    totalBlogPosts,
    newPostsToday,
    totalForumThreads,
    newThreadsToday,
    donationsThisMonth,
    donationsLastMonth,
    totalFamilyMembers,
    pendingFines,
    pendingApprovals,
    pendingReports,
  ] = await Promise.all([
    db.user.count({ where: { isActive: true } }),
    db.user.count({
      where: { isActive: true, createdAt: { gte: startOfMonth } },
    }),
    db.blogPost.count({ where: { status: "PUBLISHED" } }),
    db.blogPost.count({
      where: { status: "PUBLISHED", publishedAt: { gte: startOfToday } },
    }),
    db.forumThread.count({ where: { status: "OPEN" } }),
    db.forumThread.count({
      where: { createdAt: { gte: startOfToday } },
    }),
    db.donation.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    db.donation.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
      _sum: { amount: true },
    }),
    db.familyMember.count({ where: { isApproved: true } }),
    db.fine.count({ where: { status: "PENDING" } }),
    db.familyMember.count({ where: { isApproved: false } }),
    db.report.count({ where: { status: "PENDING" } }),
  ]);

  return {
    totalMembers,
    newMembersThisMonth,
    totalBlogPosts,
    newPostsToday,
    totalForumThreads,
    newThreadsToday,
    donationsThisMonth: Number(donationsThisMonth._sum.amount ?? 0),
    donationsLastMonth: Number(donationsLastMonth._sum.amount ?? 0),
    totalFamilyMembers,
    pendingFines,
    pendingApprovals,
    pendingReports,
  };
}

// ─── Recent Blog Posts ───────────────────────────────────────

export async function getRecentBlogPosts(limit = 4) {
  return db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      category: { select: { name: true, slug: true, color: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
}

// ─── Active Forum Threads ────────────────────────────────────

export async function getActiveForumThreads(limit = 5) {
  return db.forumThread.findMany({
    where: { status: "OPEN" },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      category: { select: { name: true, slug: true, color: true } },
      _count: { select: { replies: true } },
    },
  });
}

// ─── News Highlights ─────────────────────────────────────────

export async function getNewsHighlights(limit = 3) {
  return db.newsArticle.findMany({
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      source: true,
      sourceName: true,
      category: true,
      publishedAt: true,
    },
  });
}

// ─── Community Activity Feed ─────────────────────────────────

export type ActivityItem = {
  id: string;
  type: "USER_JOINED" | "BLOG_PUBLISHED" | "DONATION_MADE" | "THREAD_CREATED";
  title: string;
  description: string;
  userAvatar: string | null;
  userName: string;
  createdAt: Date;
  link: string | null;
};

export async function getCommunityActivity(limit = 10): Promise<ActivityItem[]> {
  const [recentUsers, recentPosts, recentDonations, recentThreads] =
    await Promise.all([
      db.user.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          createdAt: true,
        },
      }),
      db.blogPost.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 5,
        include: {
          author: {
            select: { firstName: true, lastName: true, avatar: true },
          },
        },
      }),
      db.donation.findMany({
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          donor: {
            select: { firstName: true, lastName: true, avatar: true },
          },
        },
      }),
      db.forumThread.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          author: {
            select: { firstName: true, lastName: true, avatar: true },
          },
        },
      }),
    ]);

  const activities: ActivityItem[] = [
    ...recentUsers.map((u) => ({
      id: `user-${u.id}`,
      type: "USER_JOINED" as const,
      title: "New member joined",
      description: `${u.firstName} ${u.lastName} joined the community`,
      userAvatar: u.avatar,
      userName: `${u.firstName} ${u.lastName}`,
      createdAt: u.createdAt,
      link: null,
    })),
    ...recentPosts.map((p) => ({
      id: `post-${p.id}`,
      type: "BLOG_PUBLISHED" as const,
      title: "Blog post published",
      description: `${p.author.firstName} published "${p.title}"`,
      userAvatar: p.author.avatar,
      userName: `${p.author.firstName} ${p.author.lastName}`,
      createdAt: p.publishedAt ?? p.createdAt,
      link: `/blog/${p.slug}`,
    })),
    ...recentDonations.map((d) => ({
      id: `donation-${d.id}`,
      type: "DONATION_MADE" as const,
      title: "Donation received",
      description: d.isAnonymous
        ? `Anonymous donated ₹${Number(d.amount).toLocaleString("en-IN")}`
        : `${d.donor.firstName} donated ₹${Number(d.amount).toLocaleString("en-IN")}`,
      userAvatar: d.isAnonymous ? null : d.donor.avatar,
      userName: d.isAnonymous
        ? "Anonymous"
        : `${d.donor.firstName} ${d.donor.lastName}`,
      createdAt: d.createdAt,
      link: null,
    })),
    ...recentThreads.map((t) => ({
      id: `thread-${t.id}`,
      type: "THREAD_CREATED" as const,
      title: "Forum thread created",
      description: `${t.author.firstName} started "${t.title}"`,
      userAvatar: t.author.avatar,
      userName: `${t.author.firstName} ${t.author.lastName}`,
      createdAt: t.createdAt,
      link: `/forum/${t.category ? t.categoryId : "general"}/${t.slug}`,
    })),
  ];

  // Sort all by date, newest first
  activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return activities.slice(0, limit);
}

// ─── Admin Overview (ADMIN+ only) ───────────────────────────

export async function getAdminOverview() {
  const [
    pendingApprovals,
    pendingReports,
    pendingFines,
    overdueFinies,
    recentUsers,
    pendingTestimonials,
    newContactSubmissions,
  ] = await Promise.all([
    db.familyMember.count({ where: { isApproved: false } }),
    db.report.count({ where: { status: "PENDING" } }),
    db.fine.count({ where: { status: "PENDING" } }),
    db.fine.count({ where: { status: "OVERDUE" } }),
    db.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    }),
    db.testimonial.count({ where: { isApproved: false } }),
    db.contactSubmission.count({ where: { status: "NEW" } }),
  ]);

  return {
    pendingApprovals,
    pendingReports,
    pendingFines,
    overdueFinies,
    recentUsers,
    pendingTestimonials,
    newContactSubmissions,
  };
}

// ─── System Health (SUPER_ADMIN only) ────────────────────────

export async function getSystemHealth() {
  const [
    totalUsers,
    totalPosts,
    totalThreads,
    totalFamilyMembers,
    totalDonations,
    totalAnalyticsEvents,
    totalNotifications,
    userGrowth,
  ] = await Promise.all([
    db.user.count(),
    db.blogPost.count(),
    db.forumThread.count(),
    db.familyMember.count(),
    db.donation.count(),
    db.analyticsEvent.count(),
    db.notification.count(),
    // User growth last 7 days
    Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayStart = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        const dayEnd = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + 1
        );
        return db.user.count({
          where: { createdAt: { gte: dayStart, lt: dayEnd } },
        });
      })
    ),
  ]);

  return {
    totalUsers,
    totalPosts,
    totalThreads,
    totalFamilyMembers,
    totalDonations,
    totalAnalyticsEvents,
    totalNotifications,
    userGrowth,
  };
}
