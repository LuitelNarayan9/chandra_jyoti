"use client";

import { memo, useMemo, useState } from "react";
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface PollVote {
  userId: string;
}

interface PollOption {
  id: string;
  text: string;
  /** Populated only for the current user's own votes */
  votes?: PollVote[];
  _count: { votes: number };
}

interface PollCreator {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Poll {
  id: string;
  question: string;
  description?: string | null;
  type: "DISMISSIBLE" | "NON_DISMISSIBLE";
  isMultiChoice: boolean;
  isPublished: boolean;
  options: PollOption[];
  createdBy?: PollCreator | null;
}

interface ActiveAdminPollsProps {
  polls: Poll[];
  currentUserId: string;
}

interface PollCardProps {
  poll: Poll;
  isExpanded: boolean;
  onToggle: () => void;
  userHasVoted: boolean;
  isCreator: boolean;
}

// ─── Animation variants (module-scope → stable refs, no re-alloc) ─────────────

const cardLayoutTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const;

const expandVariants = {
  collapsed: { opacity: 0, height: 0 },
  expanded: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.22, ease: "easeIn" },
  },
} as const;

const barTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  delay: 0.1,
} as const;

const listStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
} as const;

const cardEntrance = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as const },
  },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcPercentage(votes: number, total: number): number {
  return total > 0 ? (votes / total) * 100 : 0;
}

// ─── OptionBar — shown when results are visible ───────────────────────────────

const OptionBar = memo(function OptionBar({
  option,
  totalVotes,
}: {
  option: PollOption;
  totalVotes: number;
}) {
  const percentage = useMemo(
    () => calcPercentage(option._count.votes, totalVotes),
    [option._count.votes, totalVotes]
  );
  const rounded = Math.round(percentage);

  return (
    <div
      className="relative w-full h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/60
        overflow-hidden flex items-center px-3"
      role="meter"
      aria-valuenow={rounded}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${option.text}: ${rounded}%`}
    >
      <motion.div
        className="absolute left-0 top-0 bottom-0 rounded-xl
          bg-emerald-500/20 dark:bg-emerald-500/25"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={barTransition}
        aria-hidden="true"
      />
      <div className="relative z-10 flex justify-between items-center w-full text-sm font-medium">
        <span className="truncate pr-4 text-zinc-800 dark:text-zinc-100">
          {option.text}
        </span>
        <span className="shrink-0 text-emerald-700 dark:text-emerald-400 font-bold tabular-nums">
          {rounded}%
        </span>
      </div>
    </div>
  );
});

// ─── OptionVoted — shows which option(s) the user selected ───────────────────

const OptionVoted = memo(function OptionVoted({
  option,
}: {
  option: PollOption;
}) {
  const isSelected = (option.votes?.length ?? 0) > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2.5 rounded-xl border text-sm transition-all duration-200",
        isSelected
          ? "border-emerald-500/40 bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm"
          : "border-zinc-200 dark:border-zinc-700/60 bg-white/40 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-400 font-medium opacity-70"
      )}
      aria-selected={isSelected}
    >
      <div
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          isSelected ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
        )}
        aria-hidden="true"
      />
      <span className="truncate flex-1">{option.text}</span>
      {isSelected && (
        <CheckCircle2
          className="h-3.5 w-3.5 shrink-0 text-emerald-500"
          aria-hidden="true"
        />
      )}
    </div>
  );
});

// ─── OptionUnvoted — shown to users who haven't voted yet ────────────────────

const OptionUnvoted = memo(function OptionUnvoted({
  option,
}: {
  option: PollOption;
}) {
  return (
    <div
      className="flex items-center gap-2 p-2.5 rounded-xl
        border border-zinc-200 dark:border-zinc-700/50
        bg-white/50 dark:bg-zinc-800/40
        text-sm font-medium text-zinc-700 dark:text-zinc-300"
    >
      <div
        className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0"
        aria-hidden="true"
      />
      <span>{option.text}</span>
    </div>
  );
});

// ─── PollCard ─────────────────────────────────────────────────────────────────

const PollCard = memo(function PollCard({
  poll,
  isExpanded,
  onToggle,
  userHasVoted,
  isCreator,
}: PollCardProps): React.JSX.Element {
  const totalVotes = useMemo(
    () => poll.options.reduce((sum, opt) => sum + opt._count.votes, 0),
    [poll.options]
  );

  // Show results bar if: user voted OR user is creator AND poll is published
  const showResults =
    (userHasVoted || isCreator) && (poll.isPublished || isCreator);
  // Show "your selection" chip if voted but results aren't published yet
  const showVotedPrivate =
    (userHasVoted || isCreator) && !poll.isPublished && !isCreator;

  return (
    <motion.div
      layout
      transition={cardLayoutTransition}
      className={cn(
        "overflow-hidden rounded-2xl border transition-colors duration-300",
        isExpanded
          ? "border-emerald-500/25 bg-white dark:bg-zinc-900 shadow-[0_4px_24px_rgba(16,185,129,0.10)]"
          : "border-zinc-200/80 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:shadow-md cursor-pointer backdrop-blur-sm"
      )}
      onClick={() => !isExpanded && onToggle()}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 flex items-start gap-4">
        <div className="flex-1 space-y-1.5 min-w-0">
          {/* Status + type badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {userHasVoted || isCreator ? (
              <span
                className="inline-flex items-center gap-1.5
                  px-2.5 py-0.5 rounded-full
                  bg-emerald-500/10 text-emerald-600 dark:text-emerald-400
                  text-[10px] uppercase font-bold tracking-wider
                  border border-emerald-500/20 shadow-sm"
              >
                <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                {isCreator ? "Your poll" : "Voted"}
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5
                  px-2.5 py-0.5 rounded-full
                  bg-amber-500/10 text-amber-600 dark:text-amber-400
                  text-[10px] uppercase font-bold tracking-wider
                  border border-amber-500/20 shadow-sm"
              >
                <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                Please Vote
              </span>
            )}

            <span
              className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400
                uppercase tracking-wider
                bg-zinc-100 dark:bg-zinc-800
                px-2 py-0.5 rounded-full
                border border-zinc-200 dark:border-zinc-700/60
                shadow-sm"
            >
              {poll.type === "DISMISSIBLE" ? "Soft" : "Mandatory"}
            </span>
          </div>

          {/* Question */}
          <p
            className={cn(
              "font-bold leading-snug transition-all duration-200 text-zinc-900 dark:text-zinc-50",
              isExpanded ? "text-base sm:text-lg" : "text-sm line-clamp-1"
            )}
          >
            {poll.question}
          </p>

          {/* Participants + multi-choice indicator */}
          <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Vote className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span aria-label={`${totalVotes} participants`}>
                {totalVotes} {totalVotes === 1 ? "participant" : "participants"}
              </span>
            </span>
            {poll.isMultiChoice && (
              <>
                <span aria-hidden="true">·</span>
                <span>Multiple choice</span>
              </>
            )}
          </div>
        </div>

        {/* Expand / collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "shrink-0 h-8 w-8 rounded-full transition-colors duration-200",
            isExpanded
              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
              : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-label={isExpanded ? "Collapse poll" : "Expand poll"}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* ── Expanded body ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="body"
            variants={expandVariants}
            initial="collapsed"
            animate="expanded"
            exit="exit"
          >
            <div
              className="px-4 sm:px-5 pb-5 space-y-4
                border-t border-zinc-100 dark:border-zinc-800 pt-4"
            >
              {/* Optional description */}
              {poll.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {poll.description}
                </p>
              )}

              {/* Options section */}
              <div className="space-y-2.5">
                <p
                  className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500
                  uppercase tracking-widest"
                >
                  Options
                </p>

                {showResults ? (
                  /* Results with animated progress bars */
                  <div
                    className="space-y-2"
                    role="group"
                    aria-label="Poll results"
                  >
                    {poll.options.map((option) => (
                      <OptionBar
                        key={option.id}
                        option={option}
                        totalVotes={totalVotes}
                      />
                    ))}
                  </div>
                ) : showVotedPrivate ? (
                  /* User voted but results not published yet */
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                    role="group"
                    aria-label="Your selections"
                  >
                    {poll.options.map((option) => (
                      <OptionVoted key={option.id} option={option} />
                    ))}
                  </div>
                ) : (
                  /* User hasn't voted — show options neutrally */
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                    role="group"
                    aria-label="Poll options"
                  >
                    {poll.options.map((option) => (
                      <OptionUnvoted key={option.id} option={option} />
                    ))}
                  </div>
                )}
              </div>

              {/* CTA nudge for non-voters */}
              {!userHasVoted && !isCreator && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 p-3 rounded-xl
                    bg-amber-50 dark:bg-amber-500/[0.08]
                    border border-amber-200 dark:border-amber-500/20
                    text-xs text-amber-800 dark:text-amber-200"
                >
                  <AlertCircle
                    className="h-4 w-4 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <p className="leading-relaxed">
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
});

// ─── Main component ───────────────────────────────────────────────────────────

export const ActiveAdminPolls = memo(function ActiveAdminPolls({
  polls,
  currentUserId,
}: ActiveAdminPollsProps): React.JSX.Element | null {
  // Show first poll expanded by default
  const [expandedPollId, setExpandedPollId] = useState<string | null>(
    polls[0]?.id ?? null
  );

  // Slice to 3 once here — not on every render inside JSX
  const visiblePolls = useMemo(() => polls.slice(0, 3), [polls]);

  if (visiblePolls.length === 0) return null;

  return (
    <section aria-labelledby="polls-heading">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          id="polls-heading"
          className="text-lg font-bold flex items-center gap-2.5
            text-zinc-900 dark:text-zinc-50
            font-[family-name:--font-outfit]"
        >
          <span
            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500"
            aria-hidden="true"
          >
            <BarChart3 className="h-4 w-4" />
          </span>
          Community Polls
        </h3>
      </div>

      {/* Poll cards */}
      <motion.div
        variants={listStagger}
        initial="hidden"
        animate="visible"
        className="space-y-3"
        role="list"
        aria-label="Active community polls"
      >
        {visiblePolls.map((poll) => {
          // Derived per-poll — stable because we memo the card itself
          const userHasVoted = poll.options.some(
            (opt) => (opt.votes?.length ?? 0) > 0
          );
          const isCreator = poll.createdBy?.id === currentUserId;

          return (
            <motion.div key={poll.id} variants={cardEntrance} role="listitem">
              <PollCard
                poll={poll}
                isExpanded={expandedPollId === poll.id}
                onToggle={() =>
                  setExpandedPollId((prev) =>
                    prev === poll.id ? null : poll.id
                  )
                }
                userHasVoted={userHasVoted}
                isCreator={isCreator}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
});
