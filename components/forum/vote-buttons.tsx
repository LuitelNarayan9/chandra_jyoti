"use client";

import { useTransition, useOptimistic, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { voteReply, voteThread } from "@/lib/actions/forum.actions";
import { toast } from "sonner";

interface Vote {
  id: string;
  userId: string;
  value: number;
}

interface VoteButtonsProps {
  targetId: string;
  targetType: "reply" | "thread";
  votes: Vote[];
  currentUserId: string;
}

export function VoteButtons({
  targetId,
  targetType,
  votes,
  currentUserId,
}: VoteButtonsProps) {
  const [isPending, startTransition] = useTransition();

  const score = votes.reduce((sum, v) => sum + v.value, 0);
  const userVote = votes.find((v) => v.userId === currentUserId);

  const [optimisticScore, setOptimisticScore] = useOptimistic(
    score,
    (_current: number, newScore: number) => newScore
  );
  const [optimisticUserVote, setOptimisticUserVote] = useOptimistic(
    userVote?.value ?? 0,
    (_current: number, newVote: number) => newVote
  );

  const handleVote = useCallback(
    (value: 1 | -1) => {
      const currentVote = userVote?.value ?? 0;
      const nextVote = currentVote === value ? 0 : value;
      const delta = nextVote - currentVote;

      startTransition(async () => {
        setOptimisticScore(score + delta);
        setOptimisticUserVote(nextVote);

        const result =
          targetType === "thread"
            ? await voteThread(targetId, value)
            : await voteReply(targetId, value);

        if (!result.success) {
          toast.error(result.error ?? "Failed to vote.");
        }
      });
    },
    [
      targetId,
      targetType,
      score,
      userVote,
      startTransition,
      setOptimisticScore,
      setOptimisticUserVote,
    ]
  );

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleVote(1)}
        className={cn(
          "h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200",
          "hover:bg-emerald-500/10 active:scale-90",
          optimisticUserVote === 1
            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
            : "text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400"
        )}
        aria-label="Upvote"
      >
        <ChevronUp className="h-4 w-4" strokeWidth={2.5} />
      </button>

      <span
        className={cn(
          "text-xs font-bold tabular-nums min-w-[20px] text-center",
          optimisticScore > 0
            ? "text-emerald-600 dark:text-emerald-400"
            : optimisticScore < 0
              ? "text-red-500 dark:text-red-400"
              : "text-muted-foreground"
        )}
      >
        {optimisticScore}
      </span>

      <button
        type="button"
        disabled={isPending}
        onClick={() => handleVote(-1)}
        className={cn(
          "h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200",
          "hover:bg-red-500/10 active:scale-90",
          optimisticUserVote === -1
            ? "text-red-500 dark:text-red-400 bg-red-500/10"
            : "text-muted-foreground hover:text-red-500 dark:hover:text-red-400"
        )}
        aria-label="Downvote"
      >
        <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
