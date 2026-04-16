"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Plus,
  X,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Types ────────────────────────────────────────────────────

interface PollCreatorProps {
  value?: {
    question: string;
    options: string[];
    isMultiChoice: boolean;
  };
  onChange: (
    poll:
      | { question: string; options: string[]; isMultiChoice: boolean }
      | undefined
  ) => void;
}

// ── Animations ───────────────────────────────────────────────

const optionVariants = {
  initial: { opacity: 0, height: 0, y: -8 },
  animate: {
    opacity: 1,
    height: "auto",
    y: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 28 },
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -4,
    transition: { duration: 0.15 },
  },
};

// ── Main Component ───────────────────────────────────────────

export function PollCreator({ value, onChange }: PollCreatorProps) {
  const isOpen = !!value;

  const poll = value ?? {
    question: "",
    options: ["", ""],
    isMultiChoice: false,
  };

  const [internalOptions, setInternalOptions] = useState<
    { id: string; text: string }[]
  >(() => poll.options.map((text) => ({ id: crypto.randomUUID(), text })));

  useEffect(() => {
    setInternalOptions((prev) => {
      // If parent strings exactly match our internal text strings, preserve IDs
      if (
        prev.length === poll.options.length &&
        prev.every((opt, i) => opt.text === poll.options[i])
      ) {
        return prev;
      }
      // If it's an external reset to initial state, regenerate fresh pairs
      if (poll.options.length === 2 && poll.options.every((o) => o === "")) {
        return [
          { id: crypto.randomUUID(), text: "" },
          { id: crypto.randomUUID(), text: "" },
        ];
      }
      // Otherwise, sync the latest text to our IDs or create new ones
      return poll.options.map((text, i) => {
        if (prev[i]) return { ...prev[i], text };
        return { id: crypto.randomUUID(), text };
      });
    });
  }, [poll.options]);

  const toggleOpen = () => {
    if (isOpen) {
      onChange(undefined);
    } else {
      onChange({ question: "", options: ["", ""], isMultiChoice: false });
    }
  };

  const updateQuestion = (question: string) => {
    onChange({ ...poll, question });
  };

  const updateOption = (id: string, text: string) => {
    const updated = internalOptions.map((o) =>
      o.id === id ? { ...o, text } : o
    );
    setInternalOptions(updated);
    onChange({ ...poll, options: updated.map((o) => o.text) });
  };

  const addOption = () => {
    if (internalOptions.length >= 10) return;
    const newOptions = [
      ...internalOptions,
      { id: crypto.randomUUID(), text: "" },
    ];
    setInternalOptions(newOptions);
    onChange({ ...poll, options: newOptions.map((o) => o.text) });
  };

  const removeOption = (id: string) => {
    if (internalOptions.length <= 2) return;
    const newOptions = internalOptions.filter((o) => o.id !== id);
    setInternalOptions(newOptions);
    onChange({ ...poll, options: newOptions.map((o) => o.text) });
  };

  const toggleMultiChoice = () => {
    onChange({ ...poll, isMultiChoice: !poll.isMultiChoice });
  };

  return (
    <div className="space-y-3">
      {/* Toggle button */}
      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300",
          "border hover:scale-[1.02] active:scale-[0.98]",
          isOpen
            ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-400/30 shadow-sm"
            : "bg-muted/40 text-muted-foreground border-border/50 hover:text-foreground hover:border-border"
        )}
      >
        <BarChart3 className="h-4 w-4" />
        {isOpen ? "Remove Poll" : "Add Poll"}
        {isOpen ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Poll form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-violet-400/20 bg-linear-to-br from-violet-500/5 to-transparent p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase text-violet-500/80">
                  Poll
                </span>
              </div>

              {/* Question */}
              <Input
                placeholder="What's your question?"
                value={poll.question}
                onChange={(e) => updateQuestion(e.target.value)}
                className={cn(
                  "font-semibold text-base border-0 border-b-2 border-violet-400/20 rounded-none px-0 shadow-none",
                  "focus-visible:ring-0 focus-visible:border-violet-400/60",
                  "bg-transparent placeholder:text-muted-foreground/30",
                  "h-auto py-2.5 transition-colors duration-200"
                )}
              />

              {/* Options */}
              <div className="space-y-2">
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/40">
                  Options ({internalOptions.length}/10)
                </p>
                <AnimatePresence mode="popLayout">
                  {internalOptions.map((option, index) => (
                    <motion.div
                      key={option.id}
                      variants={optionVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      layout
                      className="flex items-center gap-2"
                    >
                      <span className="text-xs font-bold text-muted-foreground/40 w-5 text-center shrink-0">
                        {index + 1}
                      </span>
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) =>
                          updateOption(option.id, e.target.value)
                        }
                        className="rounded-xl border-border/40 bg-background/60 text-sm placeholder:text-muted-foreground/25 focus:border-violet-400/50 transition-colors"
                      />
                      {internalOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(option.id)}
                          aria-label={`Remove option ${index + 1}`}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {internalOptions.length < 10 && (
                  <motion.button
                    type="button"
                    onClick={addOption}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex items-center gap-2 w-full py-2 px-3 rounded-xl border border-dashed border-border/50 text-xs font-medium text-muted-foreground hover:text-violet-500 hover:border-violet-400/40 transition-all duration-200"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add option
                  </motion.button>
                )}
              </div>

              {/* Multi-choice toggle */}
              <button
                type="button"
                onClick={toggleMultiChoice}
                aria-pressed={poll.isMultiChoice}
                className="flex items-center gap-3 py-2 group"
              >
                {poll.isMultiChoice ? (
                  <ToggleRight className="h-6 w-6 text-violet-500 transition-colors" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    poll.isMultiChoice
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-muted-foreground/60"
                  )}
                >
                  Allow multiple selections
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
