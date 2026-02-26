import { z } from "zod";

// ─── Create Post ──────────────────────────────────────────────
export const CreatePostSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(200, "Title must be at most 200 characters."),
  content: z.string().min(50, "Content must be at least 50 characters."),
  excerpt: z
    .string()
    .max(300, "Excerpt must be at most 300 characters.")
    .optional(),
  coverImage: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  category: z.object({ id: z.string().optional(), name: z.string().min(1) }),
  tags: z.array(z.object({ id: z.string().optional(), name: z.string() })).max(5, "At most 5 tags.").optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  scheduledAt: z.string().datetime().optional(),
});

export type CreatePostValues = z.infer<typeof CreatePostSchema>;

// ─── Update Post ──────────────────────────────────────────────
export const UpdatePostSchema = z.object({
  postId: z.string().min(1, "Post ID is required."),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(200, "Title must be at most 200 characters.")
    .optional(),
  content: z
    .string()
    .min(50, "Content must be at least 50 characters.")
    .optional(),
  excerpt: z
    .string()
    .max(300, "Excerpt must be at most 300 characters.")
    .optional(),
  coverImage: z.string().url().optional().nullable(),
  category: z.object({ id: z.string().optional(), name: z.string().min(1) }).optional(),
  tags: z.array(z.object({ id: z.string().optional(), name: z.string() })).max(5).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export type UpdatePostValues = z.infer<typeof UpdatePostSchema>;

// ─── Delete Post ──────────────────────────────────────────────
export const DeletePostSchema = z.object({
  postId: z.string().min(1, "Post ID is required."),
});

export type DeletePostValues = z.infer<typeof DeletePostSchema>;
