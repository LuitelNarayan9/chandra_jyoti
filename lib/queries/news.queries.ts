import "server-only";

import { db } from "@/lib/db";
import type { NewsCategory, NewsSource } from "@/lib/generated/prisma/client";

// ─── Types ────────────────────────────────────────────────────

export interface NewsListOptions {
  page?: number;
  pageSize?: number;
  category?: NewsCategory;
  source?: NewsSource;
  search?: string;
  sortBy?: "latest" | "popular" | "oldest";
}

// ─── Get paginated news articles ──────────────────────────────

export async function getNewsArticles(options: NewsListOptions = {}) {
  const {
    page: rawPage = 1,
    pageSize: rawPageSize = 12,
    category,
    source,
    search,
    sortBy = "latest",
  } = options;

  const page = Math.max(1, rawPage);
  const pageSize = Math.max(1, rawPageSize);

  const where: Record<string, unknown> = {};

  if (category) {
    where.category = category;
  }

  if (source) {
    where.source = source;
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

  const [articles, totalCount] = await Promise.all([
    db.newsArticle.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        galleryImages: true,
        source: true,
        sourceUrl: true,
        sourceName: true,
        category: true,
        localTag: true,
        location: true,
        urgency: true,
        isFeatured: true,
        views: true,
        publishedAt: true,
        createdAt: true,
        _count: { select: { bookmarks: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.newsArticle.count({ where }),
  ]);

  return {
    articles,
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

// ─── Get single news article by slug ──────────────────────────

export async function getNewsArticleBySlug(
  slug: string,
  userId?: string | null
) {
  const article = await db.newsArticle.findUnique({
    where: { slug },
    include: {
      _count: { select: { bookmarks: true } },
    },
  });

  if (!article) return null;

  // Check if user has bookmarked this article
  let isBookmarked = false;
  if (userId) {
    const bookmark = await db.newsBookmark.findUnique({
      where: {
        userId_articleId: { userId, articleId: article.id },
      },
    });
    isBookmarked = !!bookmark;
  }

  // Parse gallery images from JSON
  let gallery: string[] = [];
  if (article.galleryImages) {
    try {
      gallery = JSON.parse(article.galleryImages);
    } catch {
      gallery = [];
    }
  }

  return {
    ...article,
    gallery,
    isBookmarked,
  };
}

// ─── Get featured / urgent news for hero section ──────────────

export async function getFeaturedNews(limit = 3) {
  return db.newsArticle.findMany({
    where: {
      OR: [{ isFeatured: true }, { urgency: "URGENT" }, { urgency: "FEATURED" }],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      source: true,
      sourceName: true,
      category: true,
      urgency: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

// ─── Get user's bookmarked news ───────────────────────────────

export async function getUserBookmarkedNews(
  userId: string,
  page = 1,
  pageSize = 12
) {
  const safePage = Math.max(1, page);

  const [bookmarks, totalCount] = await Promise.all([
    db.newsBookmark.findMany({
      where: { userId },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            source: true,
            sourceName: true,
            category: true,
            localTag: true,
            urgency: true,
            views: true,
            publishedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
    }),
    db.newsBookmark.count({ where: { userId } }),
  ]);

  return {
    articles: bookmarks.map((b) => b.article),
    pagination: {
      page: safePage,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      hasNext: safePage * pageSize < totalCount,
      hasPrev: safePage > 1,
    },
  };
}

// ─── Get news category counts ─────────────────────────────────

export async function getNewsCategoryCounts() {
  const counts = await db.newsArticle.groupBy({
    by: ["category"],
    _count: { _all: true },
  });

  const total = counts.reduce((sum, c) => sum + c._count._all, 0);

  return {
    total,
    categories: counts.map((c) => ({
      category: c.category,
      count: c._count._all,
    })),
  };
}

// ─── Get news article by ID (for edit page) ───────────────────

export async function getNewsArticleById(id: string) {
  const article = await db.newsArticle.findUnique({
    where: { id },
  });

  if (!article) return null;

  let gallery: string[] = [];
  if (article.galleryImages) {
    try {
      gallery = JSON.parse(article.galleryImages);
    } catch {
      gallery = [];
    }
  }

  return { ...article, gallery };
}

// ─── Admin: get all articles for management ───────────────────

export async function getAdminNewsArticles(options: NewsListOptions = {}) {
  const {
    page: rawPage = 1,
    pageSize: rawPageSize = 20,
    category,
    source,
    search,
    sortBy = "latest",
  } = options;

  const page = Math.max(1, rawPage);
  const pageSize = Math.max(1, rawPageSize);

  const where: Record<string, unknown> = {};

  if (category) where.category = category;
  if (source) where.source = source;
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

  const [articles, totalCount] = await Promise.all([
    db.newsArticle.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        source: true,
        sourceName: true,
        category: true,
        localTag: true,
        location: true,
        urgency: true,
        isFeatured: true,
        views: true,
        publishedAt: true,
        createdAt: true,
        _count: { select: { bookmarks: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.newsArticle.count({ where }),
  ]);

  return {
    articles,
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
