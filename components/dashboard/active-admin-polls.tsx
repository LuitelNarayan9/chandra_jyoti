"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Vote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ActiveAdminPollsProps = {
  polls: any[];
  currentUserId: string;
};

export function ActiveAdminPolls({
  polls,
  currentUserId,
}: ActiveAdminPollsProps) {
  const [expandedPollId, setExpandedPollId] = useState<string | null>(
    polls.length > 0 ? polls[0].id : null
  );

  if (!polls || polls.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <BarChart3 className="h-4 w-4" />
          </div>
          Community Polls
        </h3>
      </div>

      <div className="space-y-3">
        {polls.slice(0, 3).map((poll) => {
          // Check if user has voted (votes array is conditionally included for the user)
          const userHasVoted = poll.options.some(
            (opt: any) => opt.votes && opt.votes.length > 0
          );

          // Check if user is the poll creator
          const isCreator = poll.createdBy?.id === currentUserId;

          return (
            <PollCard
              key={poll.id}
              poll={poll}
              isExpanded={expandedPollId === poll.id}
              onToggle={() =>
                setExpandedPollId(expandedPollId === poll.id ? null : poll.id)
              }
              userHasVoted={userHasVoted}
              isCreator={isCreator}
            />
          );
        })}
      </div>
    </div>
  );
}

function PollCard({
  poll,
  isExpanded,
  onToggle,
  userHasVoted,
  isCreator,
}: {
  poll: any;
  isExpanded: boolean;
  onToggle: () => void;
  userHasVoted: boolean;
  isCreator: boolean;
}) {
  const totalVotes = poll.options.reduce(
    (sum: number, opt: any) => sum + opt._count.votes,
    0
  );

  return (
    <motion.div
      layout
      className={cn(
        "overflow-hidden rounded-2xl border transition-all",
        isExpanded
          ? "border-emerald-500/30 bg-card/60 shadow-lg shadow-emerald-500/5 backdrop-blur-md"
          : "border-border/50 bg-muted/20 hover:bg-muted/40 cursor-pointer"
      )}
      onClick={() => !isExpanded && onToggle()}
    >
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 mb-1">
            {userHasVoted || isCreator ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold tracking-wider border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" />
                {isCreator ? "Your poll" : "Voted"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] uppercase font-bold tracking-wider border border-amber-500/20">
                <AlertCircle className="h-3 w-3" />
                Please Vote
              </span>
            )}
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {poll.type === "DISMISSIBLE" ? "Soft" : "Mandatory"}
            </span>
          </div>

          <p
            className={cn(
              "font-semibold leading-snug",
              isExpanded ? "text-base" : "text-sm line-clamp-1"
            )}
          >
            {poll.question}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <Vote className="h-3.5 w-3.5" />
              {totalVotes} {totalVotes === 1 ? "participant" : "participants"}
            </span>
            {poll.isMultiChoice && <span>• Multiple choice</span>}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8 text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Expanded Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="p-4 pt-0 space-y-3 border-t border-border/50 mt-2">
              {poll.description && (
                <p className="text-sm text-foreground/80 mt-3 leading-relaxed">
                  {poll.description}
                </p>
              )}

              <div className="space-y-2 mt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Options
                </p>
                {userHasVoted || isCreator ? (
                  poll.isPublished || isCreator ? (
                    <div className="space-y-2.5">
                      {poll.options.map((option: any) => {
                        const optionVotes = option._count.votes;
                        const percentage =
                          totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;

                        return (
                          <div
                            key={option.id}
                            className="relative w-full h-10 rounded-xl bg-muted overflow-hidden flex items-center px-3 z-0"
                          >
                            <motion.div
                              className="absolute left-0 top-0 bottom-0 bg-emerald-500/20 z-10 rounded-xl"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{
                                type: "spring",
                                stiffness: 100,
                                damping: 20,
                                delay: 0.1,
                              }}
                            />
                            <div className="relative z-20 flex justify-between items-center w-full text-sm font-medium">
                              <span className="truncate pr-4">
                                {option.text}
                              </span>
                              <span className="shrink-0 text-emerald-700 dark:text-emerald-400 font-bold">
                                {Math.round(percentage)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {poll.options.map((option: any) => {
                        const isSelected =
                          option.votes && option.votes.length > 0;
                        return (
                          <div
                            key={option.id}
                            className={cn(
                              "flex items-center gap-2 p-2.5 rounded-xl border text-sm transition-all",
                              isSelected
                                ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm"
                                : "border-border/50 bg-background/30 text-foreground/80 font-medium opacity-70"
                            )}
                          >
                            <div
                              className={cn(
                                "h-1.5 w-1.5 rounded-full shrink-0",
                                isSelected
                                  ? "bg-emerald-500"
                                  : "bg-muted-foreground/40"
                              )}
                            />
                            <span className="truncate flex-1">
                              {option.text}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {poll.options.map((option: any) => (
                      <div
                        key={option.id}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-border/50 bg-background/50 text-sm"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400/50 dark:bg-slate-600/50 shrink-0" />
                        <span className="font-medium text-foreground/90">
                          {option.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!userHasVoted && !isCreator && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>
                    {poll.type === "DISMISSIBLE"
                      ? "Use the voting widget in the bottom right corner to participate."
                      : "Please submit your vote in the active poll window."}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
