"use client";

import { useState, useOptimistic, useTransition } from "react";
import { type Role } from "@/lib/generated/prisma/client";
import { MessageSquare, Sparkles } from "lucide-react";

import { CommentForm } from "./comment-form";
import { CommentItem, type CommentData } from "./comment-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { addComment } from "@/lib/actions/comment.actions";

// ─── Types ───────────────────────────────────────────────────────

interface CommentSectionProps {
  comments: CommentData[];
  postId: string;
  /** Count of top-level comments only (not replies) */
  totalComments: number;
  postAuthorId: string;
  currentUser: {
    id: string;
    role: Role;
    avatar?: string | null;
    firstName?: string;
    lastName?: string;
  } | null;
}

// ─── Component ───────────────────────────────────────────────────

export function CommentSection({
  comments: initialComments,
  postId,
  totalComments: initialTotal,
  postAuthorId,
  currentUser,
}: CommentSectionProps) {
  const [isPending, startTransition] = useTransition();

  // Optimistic comment list — new comments appear immediately
  const [optimisticComments, addOptimisticComment] = useOptimistic<
    CommentData[],
    CommentData
  >(initialComments, (state, newComment) => [newComment, ...state]);

  // Track top-level count optimistically
  const [optimisticTotal, setOptimisticTotal] = useState(initialTotal);

  const initials = currentUser
    ? `${currentUser.firstName?.[0] ?? ""}${currentUser.lastName?.[0] ?? ""}`.toUpperCase() ||
      "?"
    : "?";

  // Called by CommentForm on successful submission
  function handleNewComment(content: string) {
    if (!currentUser) return;

    const optimistic: CommentData = {
      id: `optimistic-${Date.now()}`,
      content,
      isPinned: false,
      isEdited: false,
      createdAt: new Date(),
      author: {
        id: currentUser.id,
        firstName: currentUser.firstName ?? "",
        lastName: currentUser.lastName ?? "",
        avatar: currentUser.avatar ?? null,
      },
      replies: [],
      _count: { likes: 0 },
      likedByMe: false,
    };

    startTransition(() => {
      addOptimisticComment(optimistic);
      setOptimisticTotal((prev) => prev + 1);
    });
  }

  // Sorted: pinned first, then by original server order
  const sortedComments = [...optimisticComments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <section id="comments-section" className="space-y-8 scroll-mt-20">
      {/* ── Divider ── */}
      <div className="relative" aria-hidden>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/30" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground/40">
            Discussion
          </span>
        </div>
      </div>

      {/* ── Title Row ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-primary/10 border border-primary/10 flex items-center justify-center shadow-sm">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight leading-none">
              Comments
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {optimisticTotal > 0
                ? `${optimisticTotal} ${optimisticTotal === 1 ? "comment" : "comments"}`
                : "No comments yet"}
            </p>
          </div>
        </div>

        {optimisticTotal === 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 font-medium bg-muted/40 px-3 py-1.5 rounded-full border border-border/30">
            <Sparkles className="h-3 w-3" />
            Be first
          </span>
        )}
      </div>

      {/* ── Comment Form Card ── */}
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md">
        {currentUser ? (
          <div className="flex gap-3 p-4 sm:p-5">
            <Avatar className="h-9 w-9 shrink-0 border border-border/50 shadow-sm ring-2 ring-background mt-0.5">
              <AvatarImage
                src={currentUser.avatar ?? undefined}
                alt={currentUser.firstName}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CommentForm postId={postId} onOptimisticAdd={handleNewComment} />
            </div>
          </div>
        ) : (
          <div className="text-center py-10 px-6">
            <div className="h-12 w-12 rounded-2xl bg-muted/60 border border-border/40 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">
              Join the conversation
            </h4>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Sign in to leave a comment, reply, or like others&apos; thoughts.
            </p>
          </div>
        )}
      </div>

      {/* ── Comment List ── */}
      {sortedComments.length > 0 ? (
        <div className="space-y-px">
          {sortedComments.map((comment, i) => (
            <div
              key={comment.id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{
                animationDelay: `${i * 50}ms`,
                animationFillMode: "both",
              }}
            >
              <div className="py-5">
                <CommentItem
                  comment={comment}
                  postId={postId}
                  currentUser={currentUser}
                  postAuthorId={postAuthorId}
                />
              </div>
              {i < sortedComments.length - 1 && (
                <div className="border-t border-border/15" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/40 bg-muted/10 px-8 py-16 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-muted/60 border border-border/40 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-muted-foreground/30" />
            </div>
            <h4 className="text-base font-semibold text-foreground mb-1.5">
              No comments yet
            </h4>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Be the first to share your thoughts on this post!
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
