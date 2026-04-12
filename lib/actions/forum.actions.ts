"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import sanitizeHtmlLib from "sanitize-html";
import {
  CreateThreadSchema,
  UpdateThreadSchema,
  DeleteThreadSchema,
  AddReplySchema,
  CreatePollSchema,
  VotePollSchema,
  CreateAdminPollSchema,
  VoteAdminPollSchema,
  type CreateThreadValues,
  type UpdateThreadValues,
  type DeleteThreadValues,
  type AddReplyValues,
  type CreatePollValues,
  type VotePollValues,
  type CreateAdminPollValues,
  type VoteAdminPollValues,
} from "@/lib/validations/forum";
import { AdminPollType } from "@/lib/generated/prisma/client";

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

  while (await db.forumThread.findUnique({ where: { slug } })) {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    slug = `${base}-${randomSuffix}`;
  }

  return slug;
}

// ─── Helper: sanitize HTML to prevent XSS ────────────────────

function sanitizeHtml(html: string): string {
  return sanitizeHtmlLib(html, {
    allowedTags: sanitizeHtmlLib.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "h3",
      "u",
      "s",
      "span",
    ]),
    allowedAttributes: {
      ...sanitizeHtmlLib.defaults.allowedAttributes,
      "*": ["class"],
    },
  });
}

// ─── Create Thread ────────────────────────────────────────────

export async function createThread(input: CreateThreadValues) {
  try {
    const user = await requireRole("MEMBER");
    const validated = CreateThreadSchema.parse(input);

    // Check category exists and user meets minimum role
    const category = await db.forumCategory.findUnique({
      where: { id: validated.categoryId },
      select: { id: true, slug: true, isLocked: true, minRoleToPost: true },
    });

    if (!category) {
      return { success: false, error: "Category not found." };
    }

    if (category.isLocked) {
      return { success: false, error: "This category is locked." };
    }

    if (!hasPermission(user.role, category.minRoleToPost)) {
      return {
        success: false,
        error: "You do not have permission to post in this category.",
      };
    }

    const safeContent = sanitizeHtml(validated.content);
    const slug = await generateUniqueSlug(validated.title);

    const thread = await db.$transaction(async (tx) => {
      const createdThread = await tx.forumThread.create({
        data: {
          title: validated.title,
          slug,
          content: safeContent,
          author: { connect: { id: user.id } },
          category: { connect: { id: category.id } },
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

      // Create poll if provided
      if (validated.poll) {
        await tx.forumPoll.create({
          data: {
            question: validated.poll.question,
            isMultiChoice: validated.poll.isMultiChoice,
            thread: { connect: { id: createdThread.id } },
            options: {
              create: validated.poll.options.map((text) => ({ text })),
            },
          },
        });
      }

      return createdThread;
    });

    revalidatePath("/forum");
    revalidatePath(`/forum/${category.slug}`);

    return {
      success: true,
      data: {
        id: thread.id,
        title: thread.title,
        slug: thread.slug,
        categorySlug: category.slug,
      },
      message: "Thread created successfully!",
    };
  } catch (error: unknown) {
    console.error("Error creating thread:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create thread.";
    return { success: false, error: message };
  }
}

// ─── Update Thread ────────────────────────────────────────────

export async function updateThread(input: UpdateThreadValues) {
  try {
    const user = await requireRole("MEMBER");
    const validated = UpdateThreadSchema.parse(input);

    const existing = await db.forumThread.findUnique({
      where: { id: validated.threadId },
      select: {
        authorId: true,
        slug: true,
        category: { select: { slug: true } },
      },
    });

    if (!existing) {
      return { success: false, error: "Thread not found." };
    }

    const isOwner = existing.authorId === user.id;
    const isMod = hasPermission(user.role, "MODERATOR");
    if (!isOwner && !isMod) {
      return {
        success: false,
        error: "You do not have permission to edit this thread.",
      };
    }

    const updateData: Record<string, unknown> = {};

    if (validated.title !== undefined) {
      updateData.title = validated.title;
      updateData.slug = await generateUniqueSlug(validated.title);
    }
    if (validated.content !== undefined) {
      updateData.content = sanitizeHtml(validated.content);
    }
    if (validated.categoryId !== undefined) {
      updateData.category = { connect: { id: validated.categoryId } };
    }

    const thread = await db.forumThread.update({
      where: { id: validated.threadId },
      data: updateData,
      select: { slug: true, category: { select: { slug: true } } },
    });

    revalidatePath("/forum");
    revalidatePath(`/forum/${existing.category.slug}`);
    revalidatePath(`/forum/${existing.category.slug}/${existing.slug}`);
    if (thread.category.slug !== existing.category.slug) {
      revalidatePath(`/forum/${thread.category.slug}`);
    }

    return { success: true, message: "Thread updated successfully!" };
  } catch (error: unknown) {
    console.error("Error updating thread:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update thread.";
    return { success: false, error: message };
  }
}

// ─── Delete Thread ────────────────────────────────────────────

export async function deleteThread(input: DeleteThreadValues) {
  try {
    await requireRole("MODERATOR");
    const validated = DeleteThreadSchema.parse(input);

    const existing = await db.forumThread.findUnique({
      where: { id: validated.threadId },
      select: { category: { select: { slug: true } } },
    });

    if (!existing) {
      return { success: false, error: "Thread not found." };
    }

    await db.forumThread.delete({
      where: { id: validated.threadId },
    });

    revalidatePath("/forum");
    revalidatePath(`/forum/${existing.category.slug}`);

    return { success: true, message: "Thread deleted successfully." };
  } catch (error: unknown) {
    console.error("Error deleting thread:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete thread.";
    return { success: false, error: message };
  }
}

// ─── Pin Thread (Toggle) ──────────────────────────────────────

export async function pinThread(threadId: string) {
  try {
    await requireRole("MODERATOR");

    const thread = await db.forumThread.findUnique({
      where: { id: threadId },
      select: { isPinned: true, category: { select: { slug: true } } },
    });

    if (!thread) {
      return { success: false, error: "Thread not found." };
    }

    await db.forumThread.update({
      where: { id: threadId },
      data: { isPinned: !thread.isPinned },
    });

    revalidatePath(`/forum/${thread.category.slug}`);

    return {
      success: true,
      data: { isPinned: !thread.isPinned },
      message: thread.isPinned ? "Thread unpinned." : "Thread pinned.",
    };
  } catch (error: unknown) {
    console.error("Error toggling pin:", error);
    const message =
      error instanceof Error ? error.message : "Failed to toggle pin.";
    return { success: false, error: message };
  }
}

// ─── Lock Thread (Toggle) ─────────────────────────────────────

export async function lockThread(threadId: string) {
  try {
    await requireRole("MODERATOR");

    const thread = await db.forumThread.findUnique({
      where: { id: threadId },
      select: {
        isLocked: true,
        category: { select: { slug: true } },
        slug: true,
      },
    });

    if (!thread) {
      return { success: false, error: "Thread not found." };
    }

    await db.forumThread.update({
      where: { id: threadId },
      data: { isLocked: !thread.isLocked },
    });

    revalidatePath(`/forum/${thread.category.slug}`);
    revalidatePath(`/forum/${thread.category.slug}/${thread.slug}`);

    return {
      success: true,
      data: { isLocked: !thread.isLocked },
      message: thread.isLocked ? "Thread unlocked." : "Thread locked.",
    };
  } catch (error: unknown) {
    console.error("Error toggling lock:", error);
    const message =
      error instanceof Error ? error.message : "Failed to toggle lock.";
    return { success: false, error: message };
  }
}

// ─── Increment Thread Views ───────────────────────────────────

export async function incrementThreadViews(threadId: string) {
  try {
    const cookieStore = await cookies();
    const cookieName = `viewed_thread_${threadId}`;
    if (cookieStore.get(cookieName)) {
      return { success: true };
    }

    await db.forumThread.update({
      where: { id: threadId },
      data: { views: { increment: 1 } },
    });

    try {
      cookieStore.set(cookieName, "1", { maxAge: 60 * 60 * 24 }); // 24 hours
    } catch (e) {
      // Ignore errors when setting cookies outside a proper context
    }
    return { success: true };
  } catch (error: unknown) {
    console.error("Error incrementing views:", error);
    const message =
      error instanceof Error ? error.message : "Failed to increment views.";
    return { success: false, error: message };
  }
}

// ─── Add Reply ────────────────────────────────────────────────

export async function addReply(input: AddReplyValues) {
  try {
    const user = await requireRole("MEMBER");
    const validated = AddReplySchema.parse(input);

    const thread = await db.forumThread.findUnique({
      where: { id: validated.threadId },
      select: {
        id: true,
        slug: true,
        isLocked: true,
        category: { select: { slug: true } },
      },
    });

    if (!thread) {
      return { success: false, error: "Thread not found." };
    }

    if (thread.isLocked) {
      return { success: false, error: "This thread is locked." };
    }

    const safeContent = sanitizeHtml(validated.content);

    const reply = await db.forumReply.create({
      data: {
        content: safeContent,
        author: { connect: { id: user.id } },
        thread: { connect: { id: thread.id } },
        ...(validated.parentId
          ? { parent: { connect: { id: validated.parentId } } }
          : {}),
      },
    });

    revalidatePath(`/forum/${thread.category.slug}/${thread.slug}`);
    revalidatePath(`/forum/${thread.category.slug}`);

    return {
      success: true,
      data: { id: reply.id },
      message: "Reply posted!",
    };
  } catch (error: unknown) {
    console.error("Error adding reply:", error);
    const message =
      error instanceof Error ? error.message : "Failed to post reply.";
    return { success: false, error: message };
  }
}

// ─── Vote Reply (Toggle / Upsert) ────────────────────────────

export async function voteReply(replyId: string, value: 1 | -1) {
  try {
    const user = await requireRole("MEMBER");

    const existing = await db.forumVote.findUnique({
      where: { userId_replyId: { userId: user.id, replyId } },
    });

    if (existing) {
      if (existing.value === value) {
        // Same vote → remove it
        await db.forumVote.delete({ where: { id: existing.id } });
      } else {
        // Different vote → update
        await db.forumVote.update({
          where: { id: existing.id },
          data: { value },
        });
      }
    } else {
      await db.forumVote.create({
        data: {
          value,
          user: { connect: { id: user.id } },
          reply: { connect: { id: replyId } },
        },
      });
    }

    // Get the reply's thread slug for revalidation
    const reply = await db.forumReply.findUnique({
      where: { id: replyId },
      select: {
        thread: {
          select: { slug: true, category: { select: { slug: true } } },
        },
      },
    });

    if (reply) {
      revalidatePath(
        `/forum/${reply.thread.category.slug}/${reply.thread.slug}`
      );
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Error voting:", error);
    const message = error instanceof Error ? error.message : "Failed to vote.";
    return { success: false, error: message };
  }
}

// ─── Mark Solution ────────────────────────────────────────────

export async function markSolution(replyId: string) {
  try {
    const user = await requireRole("MEMBER");

    const reply = await db.forumReply.findUnique({
      where: { id: replyId },
      select: {
        id: true,
        isSolution: true,
        thread: {
          select: {
            id: true,
            authorId: true,
            slug: true,
            category: { select: { slug: true } },
          },
        },
      },
    });

    if (!reply) {
      return { success: false, error: "Reply not found." };
    }

    // Only thread author can mark solutions
    if (reply.thread.authorId !== user.id) {
      return {
        success: false,
        error: "Only the thread author can mark a solution.",
      };
    }

    if (reply.isSolution) {
      // Unmark solution
      await db.$transaction([
        db.forumReply.update({
          where: { id: replyId },
          data: { isSolution: false },
        }),
        db.forumThread.update({
          where: { id: reply.thread.id },
          data: { status: "OPEN" },
        }),
      ]);
    } else {
      // Clear any existing solution and mark this one
      await db.$transaction([
        db.forumReply.updateMany({
          where: { threadId: reply.thread.id, isSolution: true },
          data: { isSolution: false },
        }),
        db.forumReply.update({
          where: { id: replyId },
          data: { isSolution: true },
        }),
        db.forumThread.update({
          where: { id: reply.thread.id },
          data: { status: "RESOLVED" },
        }),
      ]);
    }

    revalidatePath(`/forum/${reply.thread.category.slug}/${reply.thread.slug}`);
    revalidatePath(`/forum/${reply.thread.category.slug}`);

    return {
      success: true,
      message: reply.isSolution ? "Solution unmarked." : "Solution marked!",
    };
  } catch (error: unknown) {
    console.error("Error marking solution:", error);
    const message =
      error instanceof Error ? error.message : "Failed to mark solution.";
    return { success: false, error: message };
  }
}

// ─── Vote Thread (Toggle / Upsert) ───────────────────────────

export async function voteThread(threadId: string, value: 1 | -1) {
  try {
    const user = await requireRole("MEMBER");

    const existing = await db.forumThreadVote.findUnique({
      where: { userId_threadId: { userId: user.id, threadId } },
    });

    if (existing) {
      if (existing.value === value) {
        await db.forumThreadVote.delete({ where: { id: existing.id } });
      } else {
        await db.forumThreadVote.update({
          where: { id: existing.id },
          data: { value },
        });
      }
    } else {
      await db.forumThreadVote.create({
        data: {
          value,
          user: { connect: { id: user.id } },
          thread: { connect: { id: threadId } },
        },
      });
    }

    const thread = await db.forumThread.findUnique({
      where: { id: threadId },
      select: { slug: true, category: { select: { slug: true } } },
    });

    if (thread) {
      revalidatePath(`/forum/${thread.category.slug}/${thread.slug}`);
      revalidatePath(`/forum/${thread.category.slug}`);
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Error voting on thread:", error);
    const message = error instanceof Error ? error.message : "Failed to vote.";
    return { success: false, error: message };
  }
}

// ─── Create Poll ──────────────────────────────────────────────

export async function createPoll(input: CreatePollValues) {
  try {
    const user = await requireRole("MEMBER");
    const parsed = CreatePollSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const { threadId, question, options, isMultiChoice } = parsed.data;

    const thread = await db.forumThread.findUnique({
      where: { id: threadId },
      select: {
        authorId: true,
        slug: true,
        category: { select: { slug: true } },
        _count: { select: { polls: true } },
      },
    });

    if (!thread) return { success: false, error: "Thread not found." };
    if (thread.authorId !== user.id) {
      return {
        success: false,
        error: "Only the thread author can create a poll.",
      };
    }
    // Fast-path check (non-atomic, but avoids unnecessary DB writes in the common case)
    if (thread._count.polls > 0) {
      return { success: false, error: "This thread already has a poll." };
    }

    try {
      await db.forumPoll.create({
        data: {
          question,
          isMultiChoice,
          thread: { connect: { id: threadId } },
          options: {
            create: options.map((text) => ({ text })),
          },
        },
      });
    } catch (createError: any) {
      // Handle race condition: unique constraint on threadId prevents duplicates
      if (createError?.code === "P2002") {
        return { success: false, error: "This thread already has a poll." };
      }
      throw createError;
    }

    revalidatePath(`/forum/${thread.category.slug}/${thread.slug}`);

    return { success: true, message: "Poll created!" };
  } catch (error: unknown) {
    console.error("Error creating poll:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create poll.";
    return { success: false, error: message };
  }
}

// ─── Vote Poll ────────────────────────────────────────────────

export async function votePoll(input: VotePollValues) {
  try {
    const user = await requireRole("MEMBER");
    const parsed = VotePollSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const { pollId, optionIds } = parsed.data;

    const poll = await db.forumPoll.findUnique({
      where: { id: pollId },
      include: {
        options: { select: { id: true } },
        thread: {
          select: { slug: true, category: { select: { slug: true } } },
        },
      },
    });

    if (!poll) return { success: false, error: "Poll not found." };

    // Validate option IDs belong to this poll
    const validOptionIds = poll.options.map((o) => o.id);
    const allValid = optionIds.every((id) => validOptionIds.includes(id));
    if (!allValid) return { success: false, error: "Invalid option selected." };

    // Single choice: exactly 1 option
    if (!poll.isMultiChoice && optionIds.length > 1) {
      return {
        success: false,
        error: "Only one option allowed for single-choice polls.",
      };
    }

    // Check if user already voted on any option in this poll
    const existingVotes = await db.pollVote.findMany({
      where: {
        userId: user.id,
        optionId: { in: validOptionIds },
      },
    });

    if (existingVotes.length > 0) {
      return { success: false, error: "You have already voted in this poll." };
    }

    // Create votes
    await db.pollVote.createMany({
      data: optionIds.map((optionId) => ({
        userId: user.id,
        optionId,
      })),
    });

    revalidatePath(`/forum/${poll.thread.category.slug}/${poll.thread.slug}`);

    return { success: true, message: "Vote recorded!" };
  } catch (error: unknown) {
    console.error("Error voting in poll:", error);
    const message = error instanceof Error ? error.message : "Failed to vote.";
    return { success: false, error: message };
  }
}

// ============================================================================
// ADMIN POLLS
// ============================================================================

export async function createAdminPoll(values: unknown) {
  try {
    const user = await requireRole("ADMIN");

    const parsed = CreateAdminPollSchema.safeParse(values);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid poll data",
        issues: parsed.error.issues,
      };
    }

    const data = parsed.data;

    await db.adminPoll.create({
      data: {
        question: data.question,
        description: data.description || null,
        type: data.type as AdminPollType,
        isMultiChoice: data.isMultiChoice,
        isPublished: data.isPublished,
        publishedAt: data.isPublished ? new Date() : null,
        createdById: user.id,
        options: {
          create: data.options.map((opt) => ({ text: opt })),
        },
      },
    });

    revalidatePath("/forum");
    revalidatePath("/home");
    return {
      success: true,
      message: data.isPublished ? "Poll published!" : "Poll saved as draft",
    };
  } catch (error) {
    console.error("[CREATE_ADMIN_POLL]", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function publishAdminPoll(pollId: string) {
  try {
    const user = await requireRole("ADMIN");

    const poll = await db.adminPoll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      return { success: false, error: "Poll not found" };
    }

    await db.adminPoll.update({
      where: { id: pollId },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    // TODO: Notify users via notification when poll is published

    revalidatePath("/forum");
    revalidatePath("/home");
    revalidatePath("/forum/manage-polls");
    return { success: true, message: "Poll published successfully!" };
  } catch (error) {
    console.error("[PUBLISH_ADMIN_POLL]", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function cancelAdminPoll(pollId: string) {
  try {
    const user = await requireRole("ADMIN");

    const poll = await db.adminPoll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      return { success: false, error: "Poll not found" };
    }

    await db.adminPoll.delete({
      where: { id: pollId },
    });

    revalidatePath("/forum");
    revalidatePath("/home");
    revalidatePath("/forum/manage-polls");
    return { success: true, message: "Poll deleted successfully!" };
  } catch (error) {
    console.error("[CANCEL_ADMIN_POLL]", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function voteAdminPoll(values: unknown) {
  try {
    const user = await requireRole("MEMBER");

    const parsed = VoteAdminPollSchema.safeParse(values);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid vote data",
        issues: parsed.error.issues,
      };
    }

    const { pollId, optionIds } = parsed.data;

    // Run interactively so we guarantee all checks pass
    const result = await db.$transaction(async (tx) => {
      // 1. Fetch poll
      const poll = await tx.adminPoll.findUnique({
        where: { id: pollId },
        include: { options: true },
      });

      if (!poll) return { success: false, error: "Poll not found" };
      if (!poll.isPublished)
        return { success: false, error: "Poll is not active" };

      // Prevent creator from participating in their own prompt
      if (poll.createdById === user.id) {
        return {
          success: false,
          error: "Creators cannot vote on their own polls",
        };
      }

      // 2. Validate options
      const validOptionIds = poll.options.map((o) => o.id);
      const allSelectedAreValid = optionIds.every((id) =>
        validOptionIds.includes(id)
      );
      if (!allSelectedAreValid) {
        return { success: false, error: "Invalid option selected" };
      }

      // 3. Choice rules
      if (!poll.isMultiChoice && optionIds.length > 1) {
        return {
          success: false,
          error: "This poll only allows a single choice",
        };
      }

      // 4. Check existing votes
      const existingVote = await tx.adminPollVote.findFirst({
        where: {
          userId: user.id,
          option: { pollId: poll.id },
        },
      });

      if (existingVote) {
        return { success: false, error: "You have already voted on this poll" };
      }

      // 5. Create votes
      await tx.adminPollVote.createMany({
        data: optionIds.map((optId) => ({
          userId: user.id,
          optionId: optId,
        })),
      });

      return { success: true, message: "Vote recorded!" };
    });

    if (result.success) {
      revalidatePath("/forum");
      revalidatePath("/home");
      revalidatePath("/forum/manage-polls");
    }

    return result;
  } catch (error) {
    console.error("[VOTE_ADMIN_POLL]", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function fetchAdminPollVoters(pollId: string) {
  try {
    const user = await requireRole("ADMIN");
    const poll = await db.adminPoll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            votes: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });
    return { success: true, data: poll };
  } catch (error) {
    console.error("[FETCH_ADMIN_POLL_VOTERS]", error);
    return { success: false, error: "Internal server error" };
  }
}
