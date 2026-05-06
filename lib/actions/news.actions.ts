"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import sanitizeHtmlLib from "sanitize-html";

import {
  CreateLocalNewsSchema,
  UpdateLocalNewsSchema,
  DeleteNewsSchema,
  BookmarkNewsSchema,
  type CreateLocalNewsValues,
  type UpdateLocalNewsValues,
  type DeleteNewsValues,
  type BookmarkNewsValues,
} from "@/lib/validations/news";

// ─── Types ────────────────────────────────────────────────────

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Helper: slugify ──────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let counter = 0;

  while (await db.newsArticle.findUnique({ where: { slug } })) {
    slug = `${base}-${++counter}`;
  }

  return slug;
}

// ─── Helper: sanitize HTML ────────────────────────────────────

function sanitizeHtml(html: string): string {
  return sanitizeHtmlLib(html, {
    allowedTags: sanitizeHtmlLib.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
    ]),
    allowedAttributes: {
      ...sanitizeHtmlLib.defaults.allowedAttributes,
      img: ["src", "alt", "title"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

// ─── Create Local News ────────────────────────────────────────

export async function createLocalNews(
  input: CreateLocalNewsValues
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireRole("ADMIN");
    const validated = CreateLocalNewsSchema.parse(input);

    const safeContent = sanitizeHtml(validated.content);

    const MAX_SLUG_RETRIES = 3;
    let article;

    for (let attempt = 0; attempt <= MAX_SLUG_RETRIES; attempt++) {
      const slug = await generateUniqueSlug(validated.title);

      try {
        article = await db.newsArticle.create({
          data: {
            title: validated.title,
            slug,
            content: safeContent,
            excerpt: validated.excerpt || null,
            coverImage: validated.coverImage || null,
            galleryImages:
              validated.galleryImages.length > 0
                ? JSON.stringify(validated.galleryImages)
                : null,
            source: "LOCAL",
            category: "LOCAL",
            localTag: validated.localTag || null,
            location: validated.location || null,
            urgency: validated.urgency,
            isFeatured: validated.urgency === "FEATURED" || validated.urgency === "URGENT",
          },
          select: { id: true, slug: true },
        });
        break;
      } catch (err: unknown) {
        const isUniqueViolation =
          err instanceof Error &&
          "code" in err &&
          (err as { code: string }).code === "P2002";
        if (attempt === MAX_SLUG_RETRIES || !isUniqueViolation) throw err;
      }
    }

    revalidatePath("/news");
    revalidatePath("/home");

    return {
      success: true,
      data: article!,
      message: "News article published successfully.",
    };
  } catch (error) {
    console.error("Error creating local news:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create article.",
    };
  }
}

// ─── Update Local News ────────────────────────────────────────

export async function updateLocalNews(
  input: UpdateLocalNewsValues
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireRole("ADMIN");
    const validated = UpdateLocalNewsSchema.parse(input);

    // Verify article exists and is LOCAL
    const existing = await db.newsArticle.findUnique({
      where: { id: validated.articleId },
      select: { id: true, source: true, slug: true },
    });

    if (!existing) {
      return { success: false, error: "Article not found." };
    }

    if (existing.source !== "LOCAL") {
      return {
        success: false,
        error: "Cannot edit external news articles.",
      };
    }

    const updateData: Record<string, unknown> = {};

    if (validated.title !== undefined) {
      updateData.title = validated.title;
    }

    if (validated.content !== undefined) {
      updateData.content = sanitizeHtml(validated.content);
    }

    if (validated.excerpt !== undefined) {
      updateData.excerpt = validated.excerpt || null;
    }

    if (validated.coverImage !== undefined) {
      updateData.coverImage = validated.coverImage || null;
    }

    if (validated.galleryImages !== undefined) {
      updateData.galleryImages =
        validated.galleryImages.length > 0
          ? JSON.stringify(validated.galleryImages)
          : null;
    }

    if (validated.localTag !== undefined) {
      updateData.localTag = validated.localTag || null;
    }

    if (validated.location !== undefined) {
      updateData.location = validated.location || null;
    }

    if (validated.urgency !== undefined) {
      updateData.urgency = validated.urgency;
      updateData.isFeatured =
        validated.urgency === "FEATURED" || validated.urgency === "URGENT";
    }

    const article = await db.newsArticle.update({
      where: { id: validated.articleId },
      data: updateData,
      select: { id: true, slug: true },
    });

    revalidatePath("/news");
    revalidatePath(`/news/${article.slug}`);
    revalidatePath("/home");

    return {
      success: true,
      data: article,
      message: "Article updated successfully.",
    };
  } catch (error) {
    console.error("Error updating local news:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update article.",
    };
  }
}

// ─── Delete News Article ──────────────────────────────────────

export async function deleteNewsArticle(
  input: DeleteNewsValues
): Promise<ActionResult> {
  try {
    await requireRole("ADMIN");
    const validated = DeleteNewsSchema.parse(input);

    const existing = await db.newsArticle.findUnique({
      where: { id: validated.articleId },
      select: { id: true, slug: true },
    });

    if (!existing) {
      return { success: false, error: "Article not found." };
    }

    // Transaction: delete bookmarks then article
    await db.$transaction([
      db.newsBookmark.deleteMany({
        where: { articleId: validated.articleId },
      }),
      db.newsArticle.delete({
        where: { id: validated.articleId },
      }),
    ]);

    revalidatePath("/news");
    revalidatePath("/home");

    return { success: true, message: "Article deleted successfully." };
  } catch (error) {
    console.error("Error deleting news article:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete article.",
    };
  }
}

// ─── Toggle Bookmark ──────────────────────────────────────────

export async function bookmarkNews(
  input: BookmarkNewsValues
): Promise<ActionResult<{ bookmarked: boolean }>> {
  try {
    const user = await requireRole("MEMBER");
    const validated = BookmarkNewsSchema.parse(input);

    // Verify article exists
    const article = await db.newsArticle.findUnique({
      where: { id: validated.articleId },
      select: { id: true, slug: true },
    });

    if (!article) {
      return { success: false, error: "Article not found." };
    }

    // Toggle bookmark
    const existing = await db.newsBookmark.findUnique({
      where: {
        userId_articleId: {
          userId: user.id,
          articleId: validated.articleId,
        },
      },
    });

    if (existing) {
      await db.newsBookmark.delete({ where: { id: existing.id } });
      revalidatePath(`/news/${article.slug}`);
      return { success: true, data: { bookmarked: false } };
    } else {
      await db.newsBookmark.create({
        data: {
          userId: user.id,
          articleId: validated.articleId,
        },
      });
      revalidatePath(`/news/${article.slug}`);
      return { success: true, data: { bookmarked: true } };
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to toggle bookmark.",
    };
  }
}

// ─── Increment Views (fire-and-forget) ────────────────────────

export async function incrementNewsViews(articleId: string): Promise<void> {
  try {
    await db.newsArticle.update({
      where: { id: articleId },
      data: { views: { increment: 1 } },
    });
  } catch {
    // Silently fail — views are non-critical
  }
}

// ─── Toggle Featured (admin quick action) ─────────────────────

export async function toggleNewsFeatured(
  articleId: string
): Promise<ActionResult> {
  try {
    await requireRole("ADMIN");

    const article = await db.newsArticle.findUnique({
      where: { id: articleId },
      select: { id: true, isFeatured: true },
    });

    if (!article) {
      return { success: false, error: "Article not found." };
    }

    await db.newsArticle.update({
      where: { id: articleId },
      data: { isFeatured: !article.isFeatured },
    });

    revalidatePath("/news");
    revalidatePath("/home");

    return {
      success: true,
      message: article.isFeatured
        ? "Article removed from featured."
        : "Article marked as featured.",
    };
  } catch (error) {
    console.error("Error toggling featured:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to toggle featured status.",
    };
  }
}
