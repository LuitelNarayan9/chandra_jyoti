"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, MessageSquare, Reply, Shield } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { VoteButtons } from "@/components/forum/vote-buttons";
import { ReplyForm } from "@/components/forum/reply-form";
import { RichTextViewer } from "@/components/shared/rich-text-viewer";
import { markSolution } from "@/lib/actions/forum.actions";
import { hasPermission, type Role } from "@/lib/roles";

// ── Types ────────────────────────────────────────────────────

interface ReplyAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: string;
}

interface Vote {
  id: string;
  userId: string;
  value: number;
}

interface ReplyData {
  id: string;
  content: string;
  isSolution: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: ReplyAuthor;
  votes: Vote[];
  children?: ReplyData[];
}

interface ReplyListProps {
  replies: ReplyData[];
  threadId: string;
  threadAuthorId: string;
  currentUserId: string;
  currentUserRole: Role;
  isLocked: boolean;
}

// ── Main Component ───────────────────────────────────────────

export function ReplyList({
  replies,
  threadId,
  threadAuthorId,
  currentUserId,
  currentUserRole,
  isLocked,
}: ReplyListProps) {
  if (replies.length === 0) {
    return (
      <div className="py-12 text-center">
        <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">
          No replies yet — be the first to respond!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {replies.map((reply, i) => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          threadId={threadId}
          threadAuthorId={threadAuthorId}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          isLocked={isLocked}
          index={i}
          depth={0}
        />
      ))}
    </div>
  );
}

// ── Single Reply ─────────────────────────────────────────────

function ReplyItem({
  reply,
  threadId,
  threadAuthorId,
  currentUserId,
  currentUserRole,
  isLocked,
  index,
  depth,
}: {
  reply: ReplyData;
  threadId: string;
  threadAuthorId: string;
  currentUserId: string;
  currentUserRole: Role;
  isLocked: boolean;
  index: number;
  depth: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const initials =
    (reply.author.firstName?.[0] ?? "") + (reply.author.lastName?.[0] ?? "");
  const isThreadAuthor = reply.author.id === threadAuthorId;
  const isMod = hasPermission(reply.author.role as Role, "MODERATOR");
  const canMarkSolution = currentUserId === threadAuthorId;

  const handleMarkSolution = () => {
    startTransition(async () => {
      const result = await markSolution(reply.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error ?? "Failed to mark solution.");
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.03,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div
        className={cn(
          "group rounded-xl p-4 transition-colors duration-200",
          reply.isSolution &&
            "bg-emerald-50/60 dark:bg-emerald-500/5 border border-emerald-200/50 dark:border-emerald-500/15",
          !reply.isSolution && "hover:bg-muted/30",
          depth > 0 && "ml-10 border-l-2 border-border/40 pl-4"
        )}
      >
        <div className="flex gap-3">
          {/* Vote buttons */}
          <VoteButtons
            targetId={reply.id}
            targetType="reply"
            votes={reply.votes}
            currentUserId={currentUserId}
          />

          {/* Reply content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <Avatar className="h-6 w-6 ring-1 ring-background shadow-sm">
                <AvatarImage src={reply.author.avatar ?? undefined} />
                <AvatarFallback className="text-[9px] font-semibold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <span className="text-xs font-semibold">
                {reply.author.firstName} {reply.author.lastName}
              </span>

              {isThreadAuthor && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 rounded-full bg-primary/5 text-primary border-primary/20"
                >
                  OP
                </Badge>
              )}

              {isMod && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 rounded-full bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-400/20"
                >
                  <Shield className="h-2.5 w-2.5 mr-0.5" />
                  Mod
                </Badge>
              )}

              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(reply.createdAt), {
                  addSuffix: true,
                })}
              </span>

              {reply.isSolution && (
                <Badge className="text-[9px] px-1.5 py-0 h-4 rounded-full bg-emerald-500 text-white border-0 gap-0.5">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Solution
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
              <RichTextViewer content={reply.content} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              {!isLocked && depth < 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground rounded-md"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <Reply className="h-3 w-3" />
                  Reply
                </Button>
              )}

              {canMarkSolution && !isLocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-2 text-[11px] gap-1 rounded-md",
                    reply.isSolution
                      ? "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                      : "text-muted-foreground hover:text-emerald-600"
                  )}
                  onClick={handleMarkSolution}
                  disabled={isPending}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {reply.isSolution ? "Unmark Solution" : "Mark as Solution"}
                </Button>
              )}
            </div>

            {/* Inline reply form */}
            {showReplyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <ReplyForm
                  threadId={threadId}
                  parentId={reply.id}
                  isLocked={isLocked}
                  compact
                  placeholder={`Reply to ${reply.author.firstName}…`}
                  onSuccess={() => setShowReplyForm(false)}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Nested children (1 level deep) */}
      {reply.children && reply.children.length > 0 && (
        <div className="mt-1">
          {reply.children.map((child, ci) => (
            <ReplyItem
              key={child.id}
              reply={child}
              threadId={threadId}
              threadAuthorId={threadAuthorId}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              isLocked={isLocked}
              index={ci}
              depth={1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
