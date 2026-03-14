"use client";

import { useState, useTransition } from "react";
import { Loader2, Send, Lock, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { addReply } from "@/lib/actions/forum.actions";
import { cn } from "@/lib/utils";

interface ReplyFormProps {
  threadId: string;
  parentId?: string;
  isLocked: boolean;
  onSuccess?: () => void;
  compact?: boolean;
  placeholder?: string;
}

export function ReplyForm({
  threadId,
  parentId,
  isLocked,
  onSuccess,
  compact = false,
  placeholder = "Write your reply…",
}: ReplyFormProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  if (isLocked) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-amber-400/30 bg-amber-50/50 dark:bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-400">
        <Lock className="h-4 w-4 shrink-0" />
        <span>This thread is locked and no longer accepts replies.</span>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error("Reply cannot be empty.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await addReply({ content, threadId, parentId });
        if (result.success) {
          toast.success(result.message ?? "Reply posted!");
          setContent("");
          onSuccess?.();
        } else {
          toast.error(result.error ?? "Failed to post reply.");
        }
      } catch {
        toast.error("An unexpected error occurred.");
      }
    });
  };

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">
            {parentId ? "Reply" : "Leave a Reply"}
          </h3>
        </div>
      )}

      <div
        className={cn(
          "rounded-xl overflow-hidden border border-border/50",
          "hover:border-border/80 focus-within:border-primary/40",
          "focus-within:shadow-md focus-within:shadow-primary/5",
          "transition-all duration-300"
        )}
      >
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder={placeholder}
          minHeight={compact ? 100 : 160}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
          size={compact ? "sm" : "default"}
          className="gap-2 rounded-full font-semibold shadow-sm hover:shadow-md transition-all duration-200"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {parentId ? "Reply" : "Post Reply"}
        </Button>
      </div>
    </div>
  );
}
