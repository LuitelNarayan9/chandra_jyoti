"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import {
  CreatePostSchema,
  UpdatePostSchema,
  DeletePostSchema,
  type CreatePostValues,
  type UpdatePostValues,
  type DeletePostValues,
} from "@/lib/validations/blog";
import { sanitizeRichTextHtml } from "@/lib/sanitize-html";

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

  while (await db.blogPost.findUnique({ where: { slug } })) {
    slug = `${base}-${++counter}`;
  }

  return slug;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

// ─── Helper: estimate reading time ───────────────────────────

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

// ─── Create Post ──────────────────────────────────────────────

export async function createPost(input: CreatePostValues) {
  try {
    const user = await requireRole("MEMBER");
    const validated = CreatePostSchema.parse(input);

    // Sanitize HTML content to prevent XSS
    const safeContent = sanitizeRichTextHtml(validated.content);

    const readingTime = estimateReadingTime(safeContent);

    // Retry loop to handle slug collisions (TOCTOU-safe)
    const MAX_SLUG_RETRIES = 3;
    let post;

    for (let attempt = 0; attempt <= MAX_SLUG_RETRIES; attempt++) {
      const slug = await generateUniqueSlug(validated.title);

      try {
        post = await db.blogPost.create({
          data: {
            title: validated.title,
            slug,
            content: safeContent,
            excerpt: validated.excerpt || "",
            coverImage: validated.coverImage || null,
            status: validated.status,
            readingTime,
            publishedAt: validated.status === "PUBLISHED" ? new Date() : null,
            scheduledAt: validated.scheduledAt
              ? new Date(validated.scheduledAt)
              : null,
            author: { connect: { id: user.id } },
            ...(validated.category
              ? {
                  category: validated.category.id
                    ? { connect: { id: validated.category.id } }
                    : {
                        connectOrCreate: {
                          where: { name: validated.category.name },
                          create: {
                            name: validated.category.name,
                            slug: slugify(validated.category.name),
                            color: [
                              "#ef4444",
                              "#f97316",
                              "#f59e0b",
                              "#84cc16",
                              "#22c55e",
                              "#10b981",
                              "#14b8a6",
                              "#06b6d4",
                              "#0ea5e9",
                              "#3b82f6",
                              "#6366f1",
                              "#8b5cf6",
                              "#a855f7",
                              "#d946ef",
                              "#ec4899",
                              "#f43f5e",
                            ][Math.floor(Math.random() * 16)],
                          },
                        },
                      },
                }
              : {}),
            ...(validated.tags && validated.tags.length > 0
              ? {
                  tags: {
                    create: validated.tags.map((tag) => {
                      if (tag.id) return { tag: { connect: { id: tag.id } } };
                      return {
                        tag: {
                          connectOrCreate: {
                            where: { name: tag.name },
                            create: { name: tag.name, slug: slugify(tag.name) },
                          },
                        },
                      };
                    }),
                  },
                }
              : {}),
          },
        });

        break; // Success — exit retry loop
      } catch (err: unknown) {
        // Retry on slug collision, surface all other errors
        if (isUniqueConstraintError(err) && attempt < MAX_SLUG_RETRIES) {
          continue;
        }
        throw err;
      }
    }

    if (!post) {
      return { success: false, error: "Failed to create post after retries." };
    }

    revalidatePath("/blog");
    revalidatePath("/home");

    return {
      success: true,
      data: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        createdAt: post.createdAt.toISOString(),
        publishedAt: post.publishedAt?.toISOString() || null,
      },
      message:
        validated.status === "PUBLISHED"
          ? "Post published successfully!"
          : "Draft saved successfully!",
    };
  } catch (error: unknown) {
    console.error("Error creating post:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create post.";
    return { success: false, error: message };
  }
}

// ─── Update Post ──────────────────────────────────────────────

export async function updatePost(input: UpdatePostValues) {
  try {
    const user = await requireRole("MEMBER");
    const validated = UpdatePostSchema.parse(input);

    // Fetch the existing post to check ownership
    const existing = await db.blogPost.findUnique({
      where: { id: validated.postId },
      select: { authorId: true, slug: true, publishedAt: true },
    });

    if (!existing) {
      return { success: false, error: "Post not found." };
    }

    // Authorization: own post OR MODERATOR+
    const isOwner = existing.authorId === user.id;
    const isMod = hasPermission(user.role, "MODERATOR");
    if (!isOwner && !isMod) {
      return {
        success: false,
        error: "You do not have permission to edit this post.",
      };
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (validated.title !== undefined) {
      updateData.title = validated.title;
      // Slug is preserved on title updates to avoid breaking existing links
    }
    if (validated.content !== undefined) {
      const safeContent = sanitizeRichTextHtml(validated.content);
      updateData.content = safeContent;
      updateData.readingTime = estimateReadingTime(safeContent);
    }
    if (validated.excerpt !== undefined) updateData.excerpt = validated.excerpt;
    if (validated.coverImage !== undefined)
      updateData.coverImage = validated.coverImage || null;
    if (validated.category !== undefined) {
      if (validated.category) {
        updateData.category = validated.category.id
          ? { connect: { id: validated.category.id } }
          : {
              connectOrCreate: {
                where: { name: validated.category.name },
                create: {
                  name: validated.category.name,
                  slug: slugify(validated.category.name),
                  color: [
                    "#ef4444",
                    "#f97316",
                    "#f59e0b",
                    "#84cc16",
                    "#22c55e",
                    "#10b981",
                    "#14b8a6",
                    "#06b6d4",
                    "#0ea5e9",
                    "#3b82f6",
                    "#6366f1",
                    "#8b5cf6",
                    "#a855f7",
                    "#d946ef",
                    "#ec4899",
                    "#f43f5e",
                  ][Math.floor(Math.random() * 16)],
                },
              },
            };
      } else {
        updateData.category = { disconnect: true };
      }
    }
    if (validated.status !== undefined) {
      updateData.status = validated.status;
      // Only set publishedAt if not already published
      if (validated.status === "PUBLISHED" && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    // Handle tags: disconnect all, then reconnect
    const post = await db.$transaction(async (tx) => {
      // Handle tags: disconnect all, then reconnect
      if (validated.tags !== undefined) {
        await tx.blogPostTag.deleteMany({
          where: { postId: validated.postId },
        });
      }
      return tx.blogPost.update({
        where: { id: validated.postId },
        data: {
          ...updateData,
          ...(validated.tags && validated.tags.length > 0
            ? {
                tags: {
                  create: validated.tags.map((tag) => {
                    if (tag.id) return { tag: { connect: { id: tag.id } } };
                    return {
                      tag: {
                        connectOrCreate: {
                          where: { name: tag.name },
                          create: { name: tag.name, slug: slugify(tag.name) },
                        },
                      },
                    };
                  }),
                },
              }
            : {}),
        },
      });
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${existing.slug}`);
    if (post.slug !== existing.slug) {
      revalidatePath(`/blog/${post.slug}`);
    }

    return {
      success: true,
      data: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
      },
      message: "Post updated successfully!",
    };
  } catch (error: unknown) {
    console.error("Error updating post:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update post.";
    return { success: false, error: message };
  }
}

// ─── Delete Post ──────────────────────────────────────────────

export async function deletePost(input: DeletePostValues) {
  try {
    const user = await requireRole("MEMBER");
    const validated = DeletePostSchema.parse(input);

    const existing = await db.blogPost.findUnique({
      where: { id: validated.postId },
      select: { authorId: true },
    });

    if (!existing) {
      return { success: false, error: "Post not found." };
    }

    // Authorization: own post OR MODERATOR+
    const isOwner = existing.authorId === user.id;
    const isMod = hasPermission(user.role, "MODERATOR");
    if (!isOwner && !isMod) {
      return {
        success: false,
        error: "You do not have permission to delete this post.",
      };
    }

    // Hard-delete (cascade will remove comments, likes, bookmarks, tags)
    await db.blogPost.delete({
      where: { id: validated.postId },
    });

    revalidatePath("/blog");
    revalidatePath("/home");

    return { success: true, message: "Post deleted successfully." };
  } catch (error: unknown) {
    console.error("Error deleting post:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete post.";
    return { success: false, error: message };
  }
}

// ─── Like Post (Toggle) ───────────────────────────────────────

export async function likePost(postId: string) {
  try {
    const user = await requireRole("MEMBER");

    if (!postId || typeof postId !== "string") {
      return { success: false, error: "Invalid post ID." };
    }

    const existing = await db.like.findUnique({
      where: { userId_postId: { userId: user.id, postId } },
    });

    if (existing) {
      // Unlike
      await db.like.delete({ where: { id: existing.id } });
    } else {
      // Like
      await db.like.create({
        data: { userId: user.id, postId },
      });
    }

    const totalLikes = await db.like.count({ where: { postId } });

    // Get slug for revalidation
    const post = await db.blogPost.findUnique({
      where: { id: postId },
      select: { slug: true },
    });
    if (post) revalidatePath(`/blog/${post.slug}`);

    return {
      success: true,
      data: { liked: !existing, totalLikes },
    };
  } catch (error: unknown) {
    console.error("Error toggling like:", error);
    const message =
      error instanceof Error ? error.message : "Failed to toggle like.";
    return { success: false, error: message };
  }
}

// ─── Bookmark Post (Toggle) ──────────────────────────────────

export async function bookmarkPost(postId: string) {
  try {
    const user = await requireRole("MEMBER");

    if (!postId || typeof postId !== "string") {
      return { success: false, error: "Invalid post ID." };
    }

    const existing = await db.bookmark.findUnique({
      where: { userId_postId: { userId: user.id, postId } },
    });

    if (existing) {
      // Remove bookmark
      await db.bookmark.delete({ where: { id: existing.id } });
    } else {
      // Add bookmark
      await db.bookmark.create({
        data: { userId: user.id, postId },
      });
    }

    // Get slug for revalidation
    const post = await db.blogPost.findUnique({
      where: { id: postId },
      select: { slug: true },
    });
    if (post) {
      revalidatePath(`/blog/${post.slug}`);
      revalidatePath("/blog/bookmarks");
    }

    return {
      success: true,
      data: { bookmarked: !existing },
    };
  } catch (error: unknown) {
    console.error("Error toggling bookmark:", error);
    const message =
      error instanceof Error ? error.message : "Failed to toggle bookmark.";
    return { success: false, error: message };
  }
}

// ─── Increment Post Views ─────────────────────────────────────

export async function incrementPostViews(postId: string) {
  try {
    await db.blogPost.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });
    return { success: true };
  } catch (error: unknown) {
    console.error("Error incrementing views:", error);
    const message =
      error instanceof Error ? error.message : "Failed to increment views.";
    return { success: false, error: message };
  }
}
