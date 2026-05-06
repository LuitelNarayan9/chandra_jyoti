import { z } from "zod";

// ─── Local News Tags (for admin editor) ──────────────────────
export const LOCAL_NEWS_TAGS = [
  "GPU_MEETING",
  "WARD_UPDATE",
  "NOTICE",
  "EVENT",
  "DEVELOPMENT",
  "EMERGENCY",
] as const;

export const LOCAL_NEWS_TAG_LABELS: Record<
  (typeof LOCAL_NEWS_TAGS)[number],
  string
> = {
  GPU_MEETING: "GPU Meeting",
  WARD_UPDATE: "Ward Update",
  NOTICE: "Notice",
  EVENT: "Event",
  DEVELOPMENT: "Development",
  EMERGENCY: "Emergency",
};

export const LOCAL_NEWS_TAG_COLORS: Record<
  (typeof LOCAL_NEWS_TAGS)[number],
  string
> = {
  GPU_MEETING: "#3b82f6",
  WARD_UPDATE: "#8b5cf6",
  NOTICE: "#f59e0b",
  EVENT: "#06b6d4",
  DEVELOPMENT: "#22c55e",
  EMERGENCY: "#ef4444",
};

export const NEWS_URGENCY_OPTIONS = ["NORMAL", "FEATURED", "URGENT"] as const;

// ─── Create Local News Schema ─────────────────────────────────
export const CreateLocalNewsSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(200, "Title must be at most 200 characters."),
  content: z.string().min(20, "Content must be at least 20 characters."),
  excerpt: z
    .string()
    .max(500, "Summary must be at most 500 characters.")
    .optional()
    .or(z.literal("")),
  coverImage: z
    .string()
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "Must be a valid URL.",
    })
    .optional()
    .nullable(),
  galleryImages: z
    .array(z.string().url("Each gallery image must be a valid URL."))
    .max(5, "Maximum 5 gallery images allowed.")
    .default([]),
  localTag: z.enum(LOCAL_NEWS_TAGS).optional().nullable(),
  location: z
    .string()
    .max(200, "Location must be at most 200 characters.")
    .optional()
    .or(z.literal("")),
  urgency: z.enum(NEWS_URGENCY_OPTIONS).default("NORMAL"),
});

export type CreateLocalNewsValues = z.infer<typeof CreateLocalNewsSchema>;

// ─── Update Local News Schema ─────────────────────────────────
export const UpdateLocalNewsSchema = z.object({
  articleId: z.string().min(1, "Article ID is required."),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(200, "Title must be at most 200 characters.")
    .optional(),
  content: z
    .string()
    .min(20, "Content must be at least 20 characters.")
    .optional(),
  excerpt: z
    .string()
    .max(500, "Summary must be at most 500 characters.")
    .optional()
    .or(z.literal("")),
  coverImage: z
    .string()
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "Must be a valid URL.",
    })
    .optional()
    .nullable(),
  galleryImages: z
    .array(z.string().url("Each gallery image must be a valid URL."))
    .max(5, "Maximum 5 gallery images allowed.")
    .optional(),
  localTag: z.enum(LOCAL_NEWS_TAGS).optional().nullable(),
  location: z
    .string()
    .max(200, "Location must be at most 200 characters.")
    .optional()
    .or(z.literal("")),
  urgency: z.enum(NEWS_URGENCY_OPTIONS).optional(),
});

export type UpdateLocalNewsValues = z.infer<typeof UpdateLocalNewsSchema>;

// ─── Delete News Schema ───────────────────────────────────────
export const DeleteNewsSchema = z.object({
  articleId: z.string().min(1, "Article ID is required."),
});

export type DeleteNewsValues = z.infer<typeof DeleteNewsSchema>;

// ─── Bookmark News Schema ─────────────────────────────────────
export const BookmarkNewsSchema = z.object({
  articleId: z.string().min(1, "Article ID is required."),
});

export type BookmarkNewsValues = z.infer<typeof BookmarkNewsSchema>;
