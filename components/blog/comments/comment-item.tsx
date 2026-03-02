"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { type Role } from "@/lib/generated/prisma/client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RichTextViewer } from "@/components/shared/rich-text-viewer";

import {
  Heart,
  MessageSquare,
  MoreHorizontal,
  Pin,
  Flag,
  Trash2,
  PenLine,
  Loader2,
} from "lucide-react";

import { CommentForm } from "./comment-form";
import {
  likeComment,
  deleteComment,
  pinComment,
  reportComment,
} from "@/lib/actions/comment.actions";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────

type CommentAuthor = {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
};

export type CommentData = {
  id: string;
  content: string;
  isPinned: boolean;
  isEdited: boolean;
  createdAt: Date;
  author: CommentAuthor;
  replies?: CommentData[];
  _count: { likes: number };
  likedByMe?: boolean;
};

interface CommentItemProps {
  comment: CommentData;
  postId: string;
  currentUser: { id: string; role: Role } | null;
  postAuthorId: string;
  depth?: number;
}

// ─── Thread connector colors by depth ────────────────────────────
const depthConnectorClass = [
  "border-border/30",
  "border-border/20",
  "border-border/15",
];

// ─── Component ───────────────────────────────────────────────────

export function CommentItem({
  comment,
  postId,
  currentUser,
  postAuthorId,
  depth = 0,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [likeCount, setLikeCount] = useState(comment._count.likes);
  const [likedByMe, setLikedByMe] = useState(comment.likedByMe ?? false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isOwner = currentUser?.id === comment.author.id;
  const isPostAuthor = currentUser?.id === postAuthorId;
  const isMod =
    currentUser?.role === "MODERATOR" ||
    currentUser?.role === "ADMIN" ||
    currentUser?.role === "SUPER_ADMIN";

  const canDelete = Boolean(currentUser && (isOwner || isMod));
  const canPin = Boolean(currentUser && (isPostAuthor || isMod) && depth === 0);
  const canReport = Boolean(currentUser && !isOwner);
  // Allow replies up to depth 2 (comment → reply → reply-to-reply)
  const canReply = depth < 3 && Boolean(currentUser);

  const initialInitials = `${comment.author.firstName[0]}${comment.author.lastName[0]}`;
  const fullName = `${comment.author.firstName} ${comment.author.lastName}`;
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  // ─── Handlers ───

  function handleLike() {
    if (!currentUser) {
      toast.error("Please log in to like comments.");
      return;
    }
    // Optimistic update
    setLikedByMe((prev) => !prev);
    setLikeCount((prev) => (likedByMe ? prev - 1 : prev + 1));

    startTransition(async () => {
      try {
        const res = await likeComment(comment.id);
        if (!res.success) {
          // Revert on error
          setLikedByMe((prev) => !prev);
          setLikeCount((prev) => (likedByMe ? prev + 1 : prev - 1));
          toast.error(res.error);
        }
      } catch {
        setLikedByMe((prev) => !prev);
        setLikeCount((prev) => (likedByMe ? prev + 1 : prev - 1));
        toast.error("Something went wrong");
      }
    });
  }

  function handleDelete() {
    setDeleteDialogOpen(true);
  }

  function confirmDelete() {
    startTransition(async () => {
      try {
        const res = await deleteComment({ commentId: comment.id });
        if (res.success) toast.success(res.message);
        else toast.error(res.error);
      } catch {
        toast.error("Failed to delete comment.");
      }
    });
  }

  function handlePin() {
    startTransition(async () => {
      try {
        const res = await pinComment({ commentId: comment.id });
        if (res.success) toast.success(res.message);
        else toast.error(res.error);
      } catch {
        toast.error("Failed to pin comment.");
      }
    });
  }

  function handleReport() {
    const reason = prompt("Why are you reporting this comment?");
    if (reason) {
      startTransition(async () => {
        try {
          const res = await reportComment({ commentId: comment.id, reason });
          if (res.success) toast.success(res.message);
          else toast.error(res.error);
        } catch {
          toast.error("Failed to report comment.");
        }
      });
    }
  }

  // Avatar size gets slightly smaller with depth
  const avatarSize = depth === 0 ? "h-9 w-9" : "h-7 w-7";

  return (
    <div
      className={cn(
        "group/comment relative animate-in fade-in slide-in-from-bottom-1 duration-300",
        depth > 0 && "mt-3"
      )}
      style={{ animationDelay: `${depth * 50}ms`, animationFillMode: "both" }}
    >
      {/* ── Delete Confirmation Dialog (portal, not in layout flow) ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl max-w-sm border-border/50 shadow-xl">
          <AlertDialogHeader className="gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/15 mx-auto mb-1">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center text-base font-bold">
              Delete comment?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-muted-foreground">
              This will permanently delete this comment
              {comment.replies && comment.replies.length > 0
                ? ` and all ${comment.replies.length} ${comment.replies.length === 1 ? "reply" : "replies"} in this thread`
                : ""}
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:gap-2 mt-1">
            <AlertDialogCancel className="flex-1 rounded-xl h-9 text-sm font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isPending}
              className="flex-1 rounded-xl h-9 text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm transition-all active:scale-[0.97]"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Comment layout ── */}
      <div className="flex gap-3">
        {/* Avatar column with thread line */}
        <div className="flex flex-col items-center">
          <Avatar
            className={cn(
              "shrink-0 border border-border/50 shadow-sm ring-2 ring-background transition-shadow group-hover/comment:shadow-md",
              avatarSize,
              comment.isPinned && "ring-primary/20"
            )}
          >
            <AvatarImage
              src={comment.author.avatar ?? undefined}
              alt={fullName}
            />
            <AvatarFallback className="bg-primary/8 text-primary text-xs font-semibold">
              {initialInitials}
            </AvatarFallback>
          </Avatar>
          {/* Vertical thread line */}
          {((comment.replies && comment.replies.length > 0) || isReplying) && (
            <div
              className={cn(
                "mt-2 w-px flex-1 min-h-[16px] border-l-2 border-dashed transition-colors",
                depthConnectorClass[Math.min(depth, 2)]
              )}
            />
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0 pb-1">
          {/* Bubble */}
          <div
            className={cn(
              "rounded-2xl border bg-card transition-all duration-200",
              "group-hover/comment:border-border/80 group-hover/comment:shadow-sm",
              comment.isPinned
                ? "border-primary/20 bg-primary/[0.02] shadow-sm"
                : "border-border/40 shadow-[0_1px_3px_hsl(0_0%_0%/0.04)]"
            )}
          >
            {/* Header inside bubble */}
            <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                <span className="font-semibold text-sm text-foreground truncate">
                  {fullName}
                </span>

                {comment.author.id === postAuthorId && (
                  <span className="inline-flex items-center text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/15">
                    Author
                  </span>
                )}

                {comment.isPinned && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15">
                    <Pin className="h-2.5 w-2.5" />
                    Pinned
                  </span>
                )}

                <span className="text-[11px] text-muted-foreground/70 tabular-nums">
                  {timeAgo}
                </span>

                {comment.isEdited && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/50">
                    <PenLine className="h-2.5 w-2.5" />
                    edited
                  </span>
                )}
              </div>

              {/* Options menu */}
              {currentUser && (canDelete || canPin || canReport) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-xl text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/60 opacity-0 group-hover/comment:opacity-100 transition-all duration-150 shrink-0 -mt-0.5 -mr-1"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-44 rounded-xl shadow-lg border-border/50"
                  >
                    {canPin && (
                      <DropdownMenuItem
                        onClick={handlePin}
                        className="gap-2 text-sm rounded-lg"
                      >
                        <Pin className="h-3.5 w-3.5" />
                        {comment.isPinned ? "Unpin comment" : "Pin comment"}
                      </DropdownMenuItem>
                    )}
                    {canReport && (
                      <DropdownMenuItem
                        onClick={handleReport}
                        className="gap-2 text-sm rounded-lg text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/30"
                      >
                        <Flag className="h-3.5 w-3.5" />
                        Report
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="gap-2 text-sm rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Comment body */}
            <div className="px-4 py-2 prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline">
              <RichTextViewer content={comment.content} />
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-1 px-3 pb-2.5 pt-1">
              {/* Like */}
              <button
                type="button"
                onClick={handleLike}
                disabled={isPending || !currentUser}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150",
                  "hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-95",
                  likedByMe
                    ? "text-rose-500 bg-rose-50 dark:bg-rose-950/20"
                    : "text-muted-foreground hover:text-rose-500"
                )}
              >
                <Heart
                  className={cn(
                    "h-3.5 w-3.5 transition-all duration-150",
                    likedByMe && "fill-rose-500 scale-110"
                  )}
                />
                {likeCount > 0 && (
                  <span className="tabular-nums">{likeCount}</span>
                )}
              </button>

              {/* Reply */}
              {canReply && (
                <button
                  type="button"
                  onClick={() => setIsReplying(!isReplying)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150",
                    "hover:bg-muted/60 active:scale-95",
                    isReplying
                      ? "text-primary bg-primary/8"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {isReplying ? "Cancel" : "Reply"}
                </button>
              )}
            </div>
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3 ml-1 animate-in slide-in-from-top-1 fade-in duration-200">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onCancel={() => setIsReplying(false)}
                onSuccess={() => setIsReplying(false)}
                autoFocus
              />
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div
              className={cn(
                "mt-3 ml-1 space-y-0 border-l-2 pl-4 transition-colors",
                depthConnectorClass[Math.min(depth, 2)]
              )}
            >
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  currentUser={currentUser}
                  postAuthorId={postAuthorId}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
