import { z } from "zod";

// ─── Create Thread ────────────────────────────────────────────
export const CreateThreadSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(200, "Title must be at most 200 characters."),
  content: z.string().min(20, "Content must be at least 20 characters."),
  categoryId: z.string().min(1, "Category is required."),
  tags: z
    .array(z.object({ id: z.string().optional(), name: z.string() }))
    .max(3, "At most 3 tags.")
    .optional(),
  poll: z
    .object({
      question: z.string().min(5, "Poll question must be at least 5 characters."),
      options: z
        .array(z.string().min(1, "Option cannot be empty."))
        .min(2, "At least 2 options.")
        .max(6, "At most 6 options."),
      isMultiChoice: z.boolean().default(false),
    })
    .optional(),
});

export type CreateThreadValues = z.infer<typeof CreateThreadSchema>;

// ─── Update Thread ────────────────────────────────────────────
export const UpdateThreadSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required."),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(200, "Title must be at most 200 characters.")
    .optional(),
  content: z
    .string()
    .min(20, "Content must be at least 20 characters.")
    .optional(),
  categoryId: z.string().optional(),
});

export type UpdateThreadValues = z.infer<typeof UpdateThreadSchema>;

// ─── Delete Thread ────────────────────────────────────────────
export const DeleteThreadSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required."),
});

export type DeleteThreadValues = z.infer<typeof DeleteThreadSchema>;

// ─── Add Reply ────────────────────────────────────────────────
export const AddReplySchema = z.object({
  content: z.string().min(1, "Reply cannot be empty."),
  threadId: z.string().min(1, "Thread ID is required."),
  parentId: z.string().optional(),
});

export type AddReplyValues = z.infer<typeof AddReplySchema>;

// ─── Create Poll (standalone) ─────────────────────────────────
export const CreatePollSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required."),
  question: z
    .string()
    .min(5, "Poll question must be at least 5 characters.")
    .max(200, "Poll question must be at most 200 characters."),
  options: z
    .array(z.string().min(1, "Option cannot be empty.").max(100))
    .min(2, "At least 2 options.")
    .max(10, "At most 10 options."),
  isMultiChoice: z.boolean().default(false),
});

export type CreatePollValues = z.infer<typeof CreatePollSchema>;

// ─── Vote Poll ────────────────────────────────────────────────
export const VotePollSchema = z.object({
  pollId: z.string().min(1, "Poll ID is required."),
  optionIds: z
    .array(z.string().min(1))
    .min(1, "At least one option must be selected."),
});

export type VotePollValues = z.infer<typeof VotePollSchema>;

// ── Admin Poll ───────────────────────────────────────────────

export const CreateAdminPollSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  description: z.string().optional(),
  type: z.enum(["DISMISSIBLE", "NON_DISMISSIBLE"]).default("NON_DISMISSIBLE"),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least 2 options are required")
    .max(10, "Maximum 10 options allowed"),
  isMultiChoice: z.boolean().default(false),
  isPublished: z.boolean().default(false), // true if admin clicks "Publish now"
});

export const VoteAdminPollSchema = z.object({
  pollId: z.string().min(1, "Poll ID is required"),
  optionIds: z.array(z.string()).min(1, "At least one option is required"),
});

export type CreateAdminPollValues = z.infer<typeof CreateAdminPollSchema>;
export type VoteAdminPollValues = z.infer<typeof VoteAdminPollSchema>;
