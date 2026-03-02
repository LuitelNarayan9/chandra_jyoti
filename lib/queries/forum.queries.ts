import "server-only";

import { db } from "@/lib/db";
import { getCurrentDbUser, requireRole } from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────

export interface ForumThreadListOptions {
  page?: number;
  pageSize?: number;
  categorySlug: string;
  sortBy?: "latest" | "most-replied" | "unanswered";
}

// ─── Get all forum categories with counts ─────────────────────

export async function getForumCategories() {
  return db.forumCategory.findMany({
    include: {
      _count: { select: { threads: true } },
      threads: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
          author: {
            select: { firstName: true, lastName: true, avatar: true },
          },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

// ─── Get forum-wide stats ─────────────────────────────────────

export async function getForumStats() {
  const [totalThreads, totalReplies, activeMembers] = await Promise.all([
    db.forumThread.count(),
    db.forumReply.count(),
    db.forumThread
      .groupBy({ by: ["authorId"] })
      .then((groups) => groups.length),
  ]);

  return { totalThreads, totalReplies, activeMembers };
}

// ─── Get recent activity (latest threads) ─────────────────────

export async function getRecentActivity(limit = 5) {
  return db.forumThread.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
      category: { select: { slug: true, color: true } },
      author: {
        select: { firstName: true, lastName: true, avatar: true },
      },
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// ─── Get single category by slug ──────────────────────────────

export async function getCategoryBySlug(slug: string) {
  return db.forumCategory.findUnique({
    where: { slug },
    include: {
      _count: { select: { threads: true } },
    },
  });
}

// ─── Get paginated threads for a category ─────────────────────

export async function getCategoryThreads(
  options: ForumThreadListOptions
) {
  const {
    page = 1,
    pageSize = 15,
    categorySlug,
    sortBy = "latest",
  } = options;

  const category = await db.forumCategory.findUnique({
    where: { slug: categorySlug },
    select: { id: true },
  });

  if (!category) return null;

  const where = { categoryId: category.id };

  const orderBy =
    sortBy === "most-replied"
      ? [
          { isPinned: "desc" as const },
          { replies: { _count: "desc" as const } },
        ]
      : sortBy === "unanswered"
        ? [
            { isPinned: "desc" as const },
            { createdAt: "asc" as const },
          ]
        : [
            { isPinned: "desc" as const },
            { createdAt: "desc" as const },
          ];

  // For "unanswered", filter threads with 0 replies
  const unansweredFilter =
    sortBy === "unanswered"
      ? { replies: { none: {} } }
      : {};

  const finalWhere = { ...where, ...unansweredFilter };

  const [threads, totalCount] = await Promise.all([
    db.forumThread.findMany({
      where: finalWhere,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        tags: {
          include: { tag: { select: { id: true, name: true, slug: true } } },
        },
        _count: { select: { replies: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.forumThread.count({ where: finalWhere }),
  ]);

  return {
    threads,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      hasNext: page * pageSize < totalCount,
      hasPrev: page > 1,
    },
  };
}

// ─── Get forum tags ───────────────────────────────────────────

export async function getForumTags() {
  return db.forumTag.findMany({
    include: {
      _count: { select: { threads: true } },
    },
    orderBy: { name: "asc" },
  });
}

// ─── Get thread by slug (full detail) ─────────────────────────

export async function getThreadBySlug(
  categorySlug: string,
  threadSlug: string
) {
  const thread = await db.forumThread.findFirst({
    where: {
      slug: threadSlug,
      category: { slug: categorySlug },
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
        },
      },
      category: {
        select: { id: true, name: true, slug: true, color: true, icon: true },
      },
      tags: {
        include: { tag: { select: { id: true, name: true, slug: true } } },
      },
      polls: {
        include: {
          options: {
            include: {
              votes: { select: { userId: true } },
              _count: { select: { votes: true } },
            },
          },
        },
      },
      replies: {
        where: { parentId: null },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true,
            },
          },
          votes: { select: { id: true, userId: true, value: true } },
          children: {
            include: {
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  role: true,
                },
              },
              votes: { select: { id: true, userId: true, value: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { replies: true } },
      votes: { select: { id: true, userId: true, value: true } },
    },
  });

  return thread;
}

// ─── Get thread for editing ───────────────────────────────────

export async function getThreadForEdit(threadId: string) {
  return db.forumThread.findUnique({
    where: { id: threadId },
    include: {
      category: { select: { id: true, slug: true } },
      tags: {
        include: { tag: { select: { id: true, name: true, slug: true } } },
      },
    },
  });
}

// ─── Search forum threads ─────────────────────────────────────

export interface SearchForumOptions {
  query: string;
  page?: number;
  pageSize?: number;
  categorySlug?: string;
}

export async function searchForumThreads(options: SearchForumOptions) {
  const { query, page = 1, pageSize = 15, categorySlug } = options;

  const where: Record<string, unknown> = {
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
    ],
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const [threads, totalCount] = await Promise.all([
    db.forumThread.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: { select: { name: true, slug: true, color: true } },
        tags: {
          include: { tag: { select: { id: true, name: true, slug: true } } },
        },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.forumThread.count({ where }),
  ]);

  return {
    threads,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      hasNext: page * pageSize < totalCount,
      hasPrev: page > 1,
    },
  };
}

// ─── Get user's threads ───────────────────────────────────────

export interface UserThreadOptions {
  userId: string;
  page?: number;
  pageSize?: number;
  status?: "ALL" | "OPEN" | "RESOLVED" | "CLOSED";
}

export async function getUserThreads(options: UserThreadOptions) {
  const { userId, page = 1, pageSize = 15, status = "ALL" } = options;

  const where: Record<string, unknown> = { authorId: userId };
  if (status !== "ALL") {
    where.status = status;
  }

  const [threads, totalCount] = await Promise.all([
    db.forumThread.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true, color: true } },
        tags: {
          include: { tag: { select: { id: true, name: true, slug: true } } },
        },
        _count: { select: { replies: true } },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.forumThread.count({ where }),
  ]);

  return {
    threads,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      hasNext: page * pageSize < totalCount,
      hasPrev: page > 1,
    },
  };
}

// ============================================================================
// ADMIN POLLS
// ============================================================================

/**
/**
 * Gets all admin polls with user-specific vote data (published and draft).
 * If userId is provided, includes vote records for that user on each option.
 */
export async function getActiveAdminPollsForUser(userId?: string) {
  return await db.adminPoll.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      options: {
        include: {
          _count: { select: { votes: true } },
          ...(userId
            ? { votes: { where: { userId }, select: { id: true, userId: true } } }
            : {}),
        },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      _count: { select: { options: true } },
    },
    take: 5,
  });
}

/**
 * Gets the most recent admin poll that the current user hasn't voted on.
 * Excludes polls created by the user themselves.
 */
export async function getUnvotedAdminPoll() {
  const user = await getCurrentDbUser();
  if (!user) return null;

  const poll = await db.adminPoll.findFirst({
    where: {
      createdById: { not: user.id }, // Don't show creator their own poll to vote on
      options: {
        none: {
          votes: {
            some: { userId: user.id },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      options: true,
      createdBy: {
        select: { id: true, firstName: true, lastName: true, avatar: true, _count: { select: { adminPolls: true } } },
      },
    },
  });
  return poll;
}

/**
 * Gets all admin polls (published and draft) for the management dashboard.
 */
export async function getAdminPollsForAdmin() {
  const user = await requireRole("ADMIN"); // Ensure admin access
  
  return await db.adminPoll.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      options: {
        include: {
          _count: { select: { votes: true } },
        },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      _count: { select: { options: true } },
    },
  });
}

/**
 * Gets a specific admin poll with detailed voter information.
 * Included for admins to see exactly who voted for which option.
 */
export async function getAdminPollWithVoters(pollId: string) {
  await requireRole("ADMIN"); // Ensure admin access

  return await db.adminPoll.findUnique({
    where: { id: pollId },
    include: {
      options: {
        include: {
          _count: { select: { votes: true } },
          votes: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, avatar: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      _count: { select: { options: true } },
    },
  });
}

