"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Pin,
  Lock,
  Pencil,
  Trash2,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  pinThread,
  lockThread,
  deleteThread,
} from "@/lib/actions/forum.actions";
import { hasPermission, type Role } from "@/lib/roles";
import posthog from "posthog-js";

interface ThreadActionsProps {
  threadId: string;
  isPinned: boolean;
  isLocked: boolean;
  categorySlug: string;
  threadSlug: string;
  authorId: string;
  currentUserId: string;
  currentUserRole: Role;
}

export function ThreadActions({
  threadId,
  isPinned,
  isLocked,
  categorySlug,
  threadSlug,
  authorId,
  currentUserId,
  currentUserRole,
}: ThreadActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isOwner = currentUserId === authorId;
  const isMod = hasPermission(currentUserRole, "MODERATOR");
  const canEdit = isOwner || isMod;
  const canModerate = isMod;

  if (!canEdit && !canModerate) return null;

  const handlePin = () => {
    startTransition(async () => {
      const result = await pinThread(threadId);
      if (result.success) {
        toast.success(result.message);
        posthog.capture("forum_thread_moderated", {
          thread_id: threadId,
          action: isPinned ? "unpinned" : "pinned",
        });
      } else {
        toast.error(result.error ?? "Failed to toggle pin.");
      }
    });
  };

  const handleLock = () => {
    startTransition(async () => {
      const result = await lockThread(threadId);
      if (result.success) {
        toast.success(result.message);
        posthog.capture("forum_thread_moderated", {
          thread_id: threadId,
          action: isLocked ? "unlocked" : "locked",
        });
      } else {
        toast.error(result.error ?? "Failed to toggle lock.");
      }
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        "Are you sure you want to delete this thread? This action cannot be undone."
      )
    )
      return;
    startTransition(async () => {
      const result = await deleteThread({ threadId });
      if (result.success) {
        toast.success(result.message);
        posthog.capture("forum_thread_deleted", {
          thread_id: threadId,
          category_slug: categorySlug,
          deleted_by_owner: isOwner,
        });
        router.push(`/forum/${categorySlug}`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete thread.");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {canEdit && (
          <DropdownMenuItem asChild>
            <Link href={`/forum/${categorySlug}/${threadSlug}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Thread
            </Link>
          </DropdownMenuItem>
        )}

        {canModerate && (
          <>
            <DropdownMenuItem onClick={handlePin}>
              <Pin className="h-4 w-4 mr-2" />
              {isPinned ? "Unpin" : "Pin"} Thread
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLock}>
              <Lock className="h-4 w-4 mr-2" />
              {isLocked ? "Unlock" : "Lock"} Thread
            </DropdownMenuItem>
          </>
        )}

        {(isOwner || canModerate) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Thread
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
