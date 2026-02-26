import "server-only";

import { db } from "@/lib/db";
import { PostStatus } from "@/lib/generated/prisma/client";

// ─── Types ────────────────────────────────────────────────────

export interface BlogPostListOptions {
  page?: number;
  pageSize?: number;
  status?: PostStatus;
  categorySlug?: string;
  tagSlug?: string;
  authorId?: string;
  search?: string;
  sortBy?: "latest" | "popular" | "oldest";
}

// ─── Get paginated blog posts ─────────────────────────────────

export async function getBlogPosts(options: BlogPostListOptions = {}) {
  const {
    page = 1,
    pageSize = 12,
    status = "PUBLISHED",
    categorySlug,
    tagSlug,
    authorId,
    search,
    sortBy = "latest",
  } = options;

  const where: Record<string, unknown> = { status };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (tagSlug) {
    where.tags = { some: { tag: { slug: tagSlug } } };
  }

  if (authorId) {
    where.authorId = authorId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy =
    sortBy === "popular"
      ? { views: "desc" as const }
      : sortBy === "oldest"
        ? { publishedAt: "asc" as const }
        : { publishedAt: "desc" as const };

  const [posts, totalCount] = await Promise.all([
    db.blogPost.findMany({
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
        category: {
          select: { id: true, name: true, slug: true, color: true },
        },
        tags: {
          include: { tag: { select: { id: true, name: true, slug: true } } },
        },
        _count: { select: { comments: true, likes: true, bookmarks: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.blogPost.count({ where }),
  ]);

  return {
    posts,
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

// ─── Get single blog post by slug ─────────────────────────────

export async function getBlogPostBySlug(slug: string) {
  return db.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          bio: true,
        },
      },
      category: {
        select: { id: true, name: true, slug: true, color: true },
      },
      tags: {
        include: { tag: { select: { id: true, name: true, slug: true } } },
      },
      _count: { select: { comments: true, likes: true, bookmarks: true } },
    },
  });
}

// ─── Get featured posts ───────────────────────────────────────

export async function getFeaturedPosts(limit = 3) {
  return db.blogPost.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      category: {
        select: { id: true, name: true, slug: true, color: true },
      },
      _count: { select: { comments: true, likes: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

// ─── Get all categories ───────────────────────────────────────

export async function getBlogCategories() {
  return db.blogCategory.findMany({
    include: {
      _count: { select: { posts: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

// ─── Get all tags ─────────────────────────────────────────────

export async function getBlogTags() {
  return db.blogTag.findMany({
    include: {
      _count: { select: { posts: true } },
    },
    orderBy: { name: "asc" },
  });
}

// ─── Check if user liked / bookmarked a post ──────────────────

export async function getUserPostInteractions(userId: string, postId: string) {
  const [like, bookmark] = await Promise.all([
    db.like.findUnique({
      where: { userId_postId: { userId, postId } },
    }),
    db.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    }),
  ]);

  return { liked: !!like, bookmarked: !!bookmark };
}

// ─── Get posts by author (for "My Posts" page) ────────────────

export async function getMyPosts(authorId: string, status?: PostStatus) {
  const where: Record<string, unknown> = { authorId };
  if (status) where.status = status;

  return db.blogPost.findMany({
    where,
    include: {
      category: {
        select: { id: true, name: true, slug: true, color: true },
      },
      _count: { select: { comments: true, likes: true, bookmarks: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

// ─── Get related posts (same category, excluding current) ─────

export async function getRelatedPosts(
  postId: string,
  categoryId: string | null,
  limit = 3
) {
  return db.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: postId },
      ...(categoryId ? { categoryId } : {}),
    },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      category: {
        select: { id: true, name: true, slug: true, color: true },
      },
      _count: { select: { comments: true, likes: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

// ─── Get post comments (threaded, max 2 levels) ──────────────

export async function getPostComments(postId: string) {
  return db.comment.findMany({
    where: { postId, parentId: null },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      replies: {
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          _count: { select: { likes: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { likes: true } },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });
}
