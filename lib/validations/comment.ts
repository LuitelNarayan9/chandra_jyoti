import { z } from "zod";

export const CreateCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000, "Comment is too long"),
  postId: z.string().cuid("Invalid post ID"),
  parentId: z.string().cuid("Invalid parent ID").optional(),
});

export type CreateCommentValues = z.infer<typeof CreateCommentSchema>;

export const DeleteCommentSchema = z.object({
  commentId: z.string().cuid("Invalid comment ID"),
});

export type DeleteCommentValues = z.infer<typeof DeleteCommentSchema>;

export const PinCommentSchema = z.object({
  commentId: z.string().cuid("Invalid comment ID"),
});

export type PinCommentValues = z.infer<typeof PinCommentSchema>;

export const LikeCommentSchema = z.object({
  commentId: z.string().cuid("Invalid comment ID"),
});

export type LikeCommentValues = z.infer<typeof LikeCommentSchema>;

export const ReportCommentSchema = z.object({
  commentId: z.string().cuid("Invalid comment ID"),
  reason: z.string().min(1, "Please provide a reason").max(500, "Reason is too long"),
});

export type ReportCommentValues = z.infer<typeof ReportCommentSchema>;
