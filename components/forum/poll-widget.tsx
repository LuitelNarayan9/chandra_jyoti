"use client";

import { useState, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Square,
  CheckSquare,
  Loader2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { votePoll } from "@/lib/actions/forum.actions";
import { toast } from "sonner";
import posthog from "posthog-js";

import { Button } from "@/components/ui/button";

// ── Types ────────────────────────────────────────────────────

interface PollOption {
  id: string;
  text: string;
  votes: { userId: string }[];
  _count: { votes: number };
}

interface Poll {
  id: string;
  question: string;
  isMultiChoice: boolean;
  options: PollOption[];
}

interface PollWidgetProps {
  poll: Poll;
  currentUserId: string;
}

// ── Color palette for bars ───────────────────────────────────

const COLORS = [
  {
    bg: "bg-violet-500",
    bar: "from-violet-500 to-violet-400",
    text: "text-violet-600 dark:text-violet-400",
  },
  {
    bg: "bg-emerald-500",
    bar: "from-emerald-500 to-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  {
    bg: "bg-amber-500",
    bar: "from-amber-500 to-amber-400",
    text: "text-amber-600 dark:text-amber-400",
  },
  {
    bg: "bg-sky-500",
    bar: "from-sky-500 to-sky-400",
    text: "text-sky-600 dark:text-sky-400",
  },
  {
    bg: "bg-pink-500",
    bar: "from-pink-500 to-pink-400",
    text: "text-pink-600 dark:text-pink-400",
  },
  {
    bg: "bg-orange-500",
    bar: "from-orange-500 to-orange-400",
    text: "text-orange-600 dark:text-orange-400",
  },
  {
    bg: "bg-teal-500",
    bar: "from-teal-500 to-teal-400",
    text: "text-teal-600 dark:text-teal-400",
  },
  {
    bg: "bg-indigo-500",
    bar: "from-indigo-500 to-indigo-400",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  {
    bg: "bg-rose-500",
    bar: "from-rose-500 to-rose-400",
    text: "text-rose-600 dark:text-rose-400",
  },
  {
    bg: "bg-lime-500",
    bar: "from-lime-500 to-lime-400",
    text: "text-lime-600 dark:text-lime-400",
  },
];

// ── Main Component ───────────────────────────────────────────

export function PollWidget({ poll, currentUserId }: PollWidgetProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const totalVotes = poll.options.reduce(
    (sum, opt) => sum + opt._count.votes,
    0
  );

  const hasVoted = poll.options.some((opt) =>
    opt.votes.some((v) => v.userId === currentUserId)
  );

  const userVotedOptions = poll.options
    .filter((opt) => opt.votes.some((v) => v.userId === currentUserId))
    .map((opt) => opt.id);

  const showResults = hasVoted;

  const toggleOption = useCallback(
    (optionId: string) => {
      if (hasVoted) return;
      setSelectedOptions((prev) => {
        if (poll.isMultiChoice) {
          return prev.includes(optionId)
            ? prev.filter((id) => id !== optionId)
            : [...prev, optionId];
        }
        return prev.includes(optionId) ? [] : [optionId];
      });
    },
    [hasVoted, poll.isMultiChoice]
  );

  const handleVote = useCallback(() => {
    if (selectedOptions.length === 0) {
      toast.error("Please select at least one option.");
      return;
    }

    startTransition(async () => {
      const result = await votePoll({
        pollId: poll.id,
        optionIds: selectedOptions,
      });

      if (result.success) {
        toast.success(result.message ?? "Vote recorded!");
        posthog.capture("forum_poll_voted", { pollId: poll.id, pollType: "STANDARD" });
      } else {
        toast.error(result.error ?? "Failed to vote.");
      }
    });
  }, [selectedOptions, poll.id, startTransition]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-violet-400/20 bg-linear-to-br from-violet-500/5 via-transparent to-transparent overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-violet-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">
              {poll.question}
            </h3>
            <p className="text-[10px] text-muted-foreground/50 mt-0.5">
              {poll.isMultiChoice ? "Multiple selections" : "Single choice"} •{" "}
              {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
            </p>
          </div>
        </div>
        {hasVoted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-400/20"
          >
            <CheckCircle2 className="h-3 w-3" />
            <span className="text-[10px] font-bold">Voted</span>
          </motion.div>
        )}
      </div>

      {/* Options */}
      <div className="px-5 pb-4 space-y-2">
        {poll.options.map((option, index) => {
          const color = COLORS[index % COLORS.length];
          const voteCount = option._count.votes;
          const percentage =
            totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          const isSelected = selectedOptions.includes(option.id);
          const isUserVoted = userVotedOptions.includes(option.id);

          return (
            <motion.button
              type="button"
              key={option.id}
              role={poll.isMultiChoice ? "checkbox" : "radio"}
              aria-checked={hasVoted ? isUserVoted : isSelected}
              aria-label={`${option.text}${showResults ? `, ${percentage.toFixed(0)} percent, ${voteCount} votes` : ""}`}
              onClick={() => toggleOption(option.id)}
              disabled={hasVoted || isPending}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={cn(
                "relative w-full text-left rounded-xl px-4 py-3 transition-all duration-300",
                "border overflow-hidden group",
                hasVoted
                  ? "cursor-default"
                  : "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
                isSelected && !hasVoted
                  ? "border-violet-400/40 bg-violet-500/5 shadow-sm"
                  : isUserVoted
                    ? "border-emerald-400/30 bg-emerald-500/5"
                    : "border-border/40 bg-card/50 hover:border-border/60"
              )}
            >
              {/* Results bar (animated) */}
              {showResults && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-xl opacity-10",
                    `bg-linear-to-r ${color.bar}`
                  )}
                />
              )}

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Selection indicator */}
                  {!hasVoted && (
                    <>
                      {poll.isMultiChoice ? (
                        isSelected ? (
                          <CheckSquare className="h-4 w-4 text-violet-500 shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/50 shrink-0 transition-colors" />
                        )
                      ) : isSelected ? (
                        <div className="h-4 w-4 rounded-full border-2 border-violet-500 flex items-center justify-center shrink-0">
                          <div className="h-2 w-2 rounded-full bg-violet-500" />
                        </div>
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/50 shrink-0 transition-colors" />
                      )}
                    </>
                  )}

                  {hasVoted && isUserVoted && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  )}

                  <span
                    className={cn(
                      "text-sm font-medium truncate",
                      isSelected && !hasVoted
                        ? "text-foreground"
                        : isUserVoted
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground group-hover:text-foreground transition-colors"
                    )}
                  >
                    {option.text}
                  </span>
                </div>

                {/* Vote count + percentage */}
                {showResults && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-2 shrink-0"
                  >
                    <span
                      className={cn(
                        "text-xs font-bold tabular-nums",
                        color.text
                      )}
                    >
                      {percentage.toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 font-medium tabular-nums">
                      ({voteCount})
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Vote button */}
      {!hasVoted && (
        <div className="px-5 pb-5">
          <Button
            type="button"
            onClick={handleVote}
            disabled={isPending || selectedOptions.length === 0}
            size="sm"
            className="w-full gap-2 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <BarChart3 className="h-3.5 w-3.5" />
            )}
            Cast Vote
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-border/30 bg-muted/20 flex items-center gap-1.5">
        <Users className="h-3 w-3 text-muted-foreground/40" />
        <span className="text-[10px] text-muted-foreground/50 font-medium">
          {totalVotes} total {totalVotes === 1 ? "vote" : "votes"}
        </span>
      </div>
    </motion.div>
  );
}
