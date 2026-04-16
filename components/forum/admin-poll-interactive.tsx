"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageCircleQuestion,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { voteAdminPoll } from "@/lib/actions/forum.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type PollProps = {
  id: string;
  question: string;
  description: string | null;
  type: "DISMISSIBLE" | "NON_DISMISSIBLE";
  isMultiChoice: boolean;
  options: { id: string; text: string }[];
};

export function AdminPollInteractive({ poll }: { poll: PollProps }) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // becomes false after voting

  const toggleOption = (optionId: string) => {
    if (poll.isMultiChoice) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = () => {
    if (selectedOptions.length === 0) return;

    startTransition(async () => {
      const result = await voteAdminPoll({
        pollId: poll.id,
        optionIds: selectedOptions,
      });

      if (result.success) {
        toast.success("Thank you for participating!");
        setIsVisible(false);
      } else {
        toast.error(result.error || "Failed to submit vote. Please try again.");
      }
    });
  };

  if (!isVisible) return null;

  // Poll Form Content
  const PollContent = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        {poll.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          return (
            <button
              key={option.id}
              onClick={() => toggleOption(option.id)}
              disabled={isPending}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                isSelected
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50"
                  : "border-border/50 bg-background hover:border-emerald-500/50 hover:bg-muted"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center shrink-0 transition-all",
                  poll.isMultiChoice
                    ? "w-5 h-5 rounded border"
                    : "w-5 h-5 rounded-full border",
                  isSelected
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-muted-foreground/30 bg-background"
                )}
              >
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
              <span className="font-medium">{option.text}</span>
            </button>
          );
        })}
      </div>

      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-emerald-500/20"
        disabled={selectedOptions.length === 0 || isPending}
        onClick={handleVote}
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : (
          "Submit Vote"
        )}
      </Button>
    </div>
  );

  // 1. NON-DISMISSIBLE UI (Mandatory Full-Screen Modal)
  if (poll.type === "NON_DISMISSIBLE") {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md p-0 overflow-hidden border-amber-500/30 shadow-2xl shadow-amber-500/10"
          showCloseButton={false} // Custom prop or handled by CSS if needed, typically we can override or just not use the Dialog primitive fully, but we'll use a hack to hide the default close button
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {/* Internal Header styling */}
          <div className="bg-linear-to-br from-amber-500/10 to-orange-500/5 p-6 pb-4 relative z-10 border-b border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-500">
                <AlertCircle className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
                Mandatory Poll
              </span>
            </div>
            <DialogHeader className="text-left space-y-2">
              <DialogTitle className="text-xl sm:text-2xl font-bold leading-tight">
                {poll.question}
              </DialogTitle>
              {poll.description && (
                <DialogDescription className="text-base">
                  {poll.description}
                </DialogDescription>
              )}
            </DialogHeader>
          </div>
          <div className="p-6">
            <PollContent />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 2. DISMISSIBLE UI (Chatbot Widget)
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence mode="wait">
        {!isMinimized ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl border border-emerald-500/30 bg-card/95 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-emerald-500 text-white p-4 flex items-center justify-between shadow-sm relative z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold tracking-wide">
                  Community Poll
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="w-8 h-8 rounded-full hover:bg-white/20 text-white transition-colors"
                title="Minimize for now"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {/* Body */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              <div className="mb-4 space-y-2">
                <h3 className="text-lg font-bold leading-tight">
                  {poll.question}
                </h3>
                {poll.description && (
                  <p className="text-sm text-muted-foreground">
                    {poll.description}
                  </p>
                )}
              </div>
              <PollContent />
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="minimized"
            onClick={() => setIsMinimized(false)}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center transition-colors"
          >
            <MessageCircleQuestion className="w-6 h-6" />

            {/* Notification Dot */}
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-background rounded-full" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
