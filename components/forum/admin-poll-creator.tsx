"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Loader2,
  Send,
  Save,
  MessageCircleQuestion,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import posthog from "posthog-js";
import { createAdminPoll } from "@/lib/actions/forum.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

export function AdminPollCreator() {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const [poll, setPoll] = useState({
    question: "",
    description: "",
    type: "NON_DISMISSIBLE" as "DISMISSIBLE" | "NON_DISMISSIBLE",
    options: [
      { id: crypto.randomUUID(), text: "" },
      { id: crypto.randomUUID(), text: "" },
    ],
    isMultiChoice: false,
  });

  const updateField = (field: keyof typeof poll, value: any) => {
    setPoll((prev) => ({ ...prev, [field]: value }));
  };

  const updateOption = (id: string, text: string) => {
    setPoll((prev) => ({
      ...prev,
      options: prev.options.map((opt) => (opt.id === id ? { ...opt, text } : opt)),
    }));
  };

  const addOption = () => {
    if (poll.options.length >= 10) return;
    updateField("options", [...poll.options, { id: crypto.randomUUID(), text: "" }]);
  };

  const removeOption = (id: string) => {
    if (poll.options.length <= 2) return;
    updateField(
      "options",
      poll.options.filter((opt) => opt.id !== id)
    );
  };

  const onSubmit = (isPublished: boolean) => {
    // Basic validation
    const trimmedQuestion = poll.question.trim();
    if (trimmedQuestion.length < 5) {
      toast.error("Question must be at least 5 characters");
      return;
    }
    const filledOptions = poll.options
      .map((o) => o.text.trim())
      .filter((text) => text.length > 0);
    if (filledOptions.length < 2) {
      toast.error("At least 2 valid options are required");
      return;
    }

    startTransition(async () => {
      const result = await createAdminPoll({
        question: trimmedQuestion,
        description: poll.description,
        type: poll.type,
        options: filledOptions,
        isMultiChoice: poll.isMultiChoice,
        isPublished,
      });

      if (result.success) {
        toast.success(result.message);
        posthog.capture("forum_poll_created", { isPublished, type: poll.type });
        setIsOpen(false);
        setPoll({
          question: "",
          description: "",
          type: "NON_DISMISSIBLE",
          options: [
            { id: crypto.randomUUID(), text: "" },
            { id: crypto.randomUUID(), text: "" },
          ],
          isMultiChoice: false,
        });
      } else {
        toast.error(result.error || "Failed to create poll");
      }
    });
  };

  return (
    <div className="mb-8 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <BarChart3 className="h-5 w-5" />
          </div>
          Admin Polls
        </h2>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant={isOpen ? "secondary" : "default"}
          className={cn(
            "transition-all duration-300",
            !isOpen &&
              "bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
          )}
        >
          {isOpen ? "Cancel" : "Create Global Poll"}
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="relative rounded-2xl border border-emerald-500/30 bg-card/60 backdrop-blur-md p-6 shadow-xl shadow-emerald-500/5 mb-6">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 via-transparent to-amber-500/5 rounded-2xl pointer-events-none" />

              <div className="relative space-y-6">
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder="What is your poll question?"
                      value={poll.question}
                      onChange={(e) => updateField("question", e.target.value)}
                      className="text-lg font-semibold border-emerald-500/20 focus-visible:ring-emerald-500/30 py-6 placeholder:text-muted-foreground/50 bg-background/50"
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Optional description or context for this poll..."
                      value={poll.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      className="border-emerald-500/10 focus-visible:ring-emerald-500/30 resize-none h-20 bg-background/50"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column: Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Options ({poll.options.length}/10)
                      </p>
                    </div>

                    <AnimatePresence mode="popLayout">
                      {poll.options.map((option, index) => (
                        <motion.div
                          key={option.id}
                          variants={optionVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          layout
                          className="flex items-center gap-2"
                        >
                          <div className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {index + 1}
                          </div>
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option.text}
                            onChange={(e) =>
                              updateOption(option.id, e.target.value)
                            }
                            className="bg-background/50 border-emerald-500/10 focus-visible:ring-emerald-500/20"
                          />
                          {poll.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeOption(option.id)}
                              className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {poll.options.length < 10 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addOption}
                        className="w-full border-dashed border-emerald-500/30 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add option
                      </Button>
                    )}
                  </div>

                  {/* Right Column: Settings */}
                  <div className="space-y-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Settings
                    </p>

                    <div className="space-y-4">
                      {/* Poll Type Selection */}
                      <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          Delivery Method
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              updateField("type", "NON_DISMISSIBLE")
                            }
                            className={cn(
                              "flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all",
                              poll.type === "NON_DISMISSIBLE"
                                ? "border-amber-500 bg-amber-500/10"
                                : "border-transparent bg-muted hover:bg-muted/80"
                            )}
                          >
                            <span className="flex items-center gap-1.5 font-semibold text-sm">
                              <ShieldAlert className="h-4 w-4 text-amber-500" />
                              Mandatory
                            </span>
                            <span className="text-xs text-muted-foreground leading-tight">
                              Full-screen overlay. Users must vote to continue.
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => updateField("type", "DISMISSIBLE")}
                            className={cn(
                              "flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all",
                              poll.type === "DISMISSIBLE"
                                ? "border-emerald-500 bg-emerald-500/10"
                                : "border-transparent bg-muted hover:bg-muted/80"
                            )}
                          >
                            <span className="flex items-center gap-1.5 font-semibold text-sm">
                              <MessageCircleQuestion className="h-4 w-4 text-emerald-500" />
                              Dismissible
                            </span>
                            <span className="text-xs text-muted-foreground leading-tight">
                              Floating widget. Users can minimize it.
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="h-px bg-border/50" />

                      {/* Multi-choice Toggle */}
                      <button
                        type="button"
                        onClick={() =>
                          updateField("isMultiChoice", !poll.isMultiChoice)
                        }
                        className="flex items-center justify-between w-full p-3 rounded-xl border border-transparent hover:bg-muted hover:border-border/50 transition-all group"
                      >
                        <div className="text-left">
                          <p className="text-sm font-semibold">
                            Multiple Choices
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Allow users to select &gt;1 option
                          </p>
                        </div>
                        {poll.isMultiChoice ? (
                          <ToggleRight className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-muted-foreground group-hover:text-foreground" />
                        )}
                      </button>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                      <Button
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => onSubmit(false)}
                        className="gap-2"
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save Draft
                      </Button>
                      <Button
                        disabled={isPending}
                        onClick={() => onSubmit(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Publish Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
