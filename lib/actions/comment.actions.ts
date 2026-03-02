"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import {
  CreateCommentSchema,
  DeleteCommentSchema,
  PinCommentSchema,
  LikeCommentSchema,
  ReportCommentSchema,
  type CreateCommentValues,
  type DeleteCommentValues,
  type PinCommentValues,
  type ReportCommentValues,
} from "@/lib/validations/comment";

// Helper for XSS sanitization
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\bon\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\bon\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript\s*:/gi, "");
}

// ─── Add Comment / Reply ──────────────────────────────────────

export async function addComment(input: CreateCommentValues) {
  try {
    const user = await requireRole("MEMBER");
    const validated = CreateCommentSchema.parse(input);

    const safeContent = sanitizeHtml(validated.content);

    // Verify post exists
    const post = await db.blogPost.findUnique({
      where: { id: validated.postId },
      select: { id: true, slug: true, status: true },
    });

    if (!post || post.status !== "PUBLISHED") {
      return { success: false, error: "Post not found or not published." };
    }

    // Verify parent comment exists if this is a reply
    if (validated.parentId) {
      const parent = await db.comment.findUnique({
        where: { id: validated.parentId },
        select: { id: true, postId: true },
      });

      if (!parent || parent.postId !== validated.postId) {
        return { success: false, error: "Invalid parent comment." };
      }
    }

    const comment = await db.comment.create({
      data: {
        content: safeContent,
        authorId: user.id,
        postId: validated.postId,
        parentId: validated.parentId || null,
      },
    });

    revalidatePath(`/blog/${post.slug}`);

    // Create notification if reply (we skip self-notifs here for simplicity, typically you'd add this)
    
    return { success: true, message: "Comment added successfully.", data: { id: comment.id } };
  } catch (error: unknown) {
    console.error("Error adding comment:", error);
    const message = error instanceof Error ? error.message : "Failed to add comment.";
    return { success: false, error: message };
  }
}

// ─── Delete Comment ──────────────────────────────────────────

export async function deleteComment(input: DeleteCommentValues) {
  try {
    const user = await requireRole("MEMBER");
    const validated = DeleteCommentSchema.parse(input);

    const existing = await db.comment.findUnique({
      where: { id: validated.commentId },
      include: {
        post: { select: { slug: true } }
      }
    });

    if (!existing) {
      return { success: false, error: "Comment not found." };
    }

    // Authorization: comment author OR MODERATOR+
    const isOwner = existing.authorId === user.id;
    const isMod = hasPermission(user.role, "MODERATOR");
    
    if (!isOwner && !isMod) {
      return { success: false, error: "Not authorized to delete this comment." };
    }

    // Hard-delete
    await db.comment.delete({
      where: { id: validated.commentId },
    });

    revalidatePath(`/blog/${existing.post.slug}`);

    return { success: true, message: "Comment deleted." };
  } catch (error: unknown) {
    console.error("Error deleting comment:", error);
    return { success: false, error: "Failed to delete comment." };
  }
}

// ─── Pin Comment ──────────────────────────────────────────────

export async function pinComment(input: PinCommentValues) {
  try {
    const user = await requireRole("MEMBER");
    const validated = PinCommentSchema.parse(input);

    const existing = await db.comment.findUnique({
      where: { id: validated.commentId },
      include: { post: { select: { slug: true, authorId: true } } }
    });

    if (!existing) {
      return { success: false, error: "Comment not found." };
    }

    // Must be top-level comment
    if (existing.parentId) {
       return { success: false, error: "Cannot pin a reply." };
    }

    // Authorization: post author OR MODERATOR+
    const isPostAuthor = existing.post.authorId === user.id;
    const isMod = hasPermission(user.role, "MODERATOR");

    if (!isPostAuthor && !isMod) {
      return { success: false, error: "Not authorized to pin comments on this post." };
    }

    // Toggle pin status
    await db.comment.update({
      where: { id: validated.commentId },
      data: { isPinned: !existing.isPinned },
    });

    revalidatePath(`/blog/${existing.post.slug}`);

    return { success: true, message: existing.isPinned ? "Comment unpinned." : "Comment pinned." };
  } catch (error: unknown) {
    console.error("Error pinning comment:", error);
    return { success: false, error: "Failed to pin comment." };
  }
}

// ─── Like Comment ─────────────────────────────────────────────

export async function likeComment(commentId: string) {
  try {
     const user = await requireRole("MEMBER");

     const existingLike = await db.like.findUnique({
        where: { userId_commentId: { userId: user.id, commentId } }
     });

     let comment;
     if (existingLike) {
        await db.like.delete({ where: { id: existingLike.id } });
        comment = await db.comment.findUnique({ where: { id: commentId }, include: { post: { select: { slug: true } } } });
     } else {
        await db.like.create({ data: { userId: user.id, commentId } });
        comment = await db.comment.findUnique({ where: { id: commentId }, include: { post: { select: { slug: true } } } });
     }

     if (comment?.post?.slug) {
         revalidatePath(`/blog/${comment.post.slug}`);
     }

     return { success: true, data: { liked: !existingLike } };
  } catch (error: unknown) {
      console.error("Error liking comment:", error);
      return { success: false, error: "Failed to toggle like." };
  }
}

// ─── Report Comment ───────────────────────────────────────────

export async function reportComment(input: ReportCommentValues) {
  try {
     const user = await requireRole("MEMBER");
     const validated = ReportCommentSchema.parse(input);

     // Check if already reported by this user (prevent spam)
     // For simplicity in this PRD, creating a new report.

     await db.report.create({
        data: {
           reporterId: user.id,
           commentId: validated.commentId,
           reason: validated.reason,
           status: "PENDING"
        }
     });

     return { success: true, message: "Comment reported. Thank you." };
  } catch (error: unknown) {
      console.error("Error reporting comment:", error);
      return { success: false, error: "Failed to submit report." };
  }
}
