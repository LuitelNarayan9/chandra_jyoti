"use client";

import { useOptimistic, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bookmarkNews } from "@/lib/actions/news.actions";
import { toast } from "sonner";

interface BookmarkButtonProps {
  articleId: string;
  isBookmarked: boolean;
  size?: "sm" | "default";
}

export function BookmarkButton({
  articleId,
  isBookmarked,
  size = "default",
}: BookmarkButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(isBookmarked);

  const handleToggle = () => {
    setOptimistic(!optimistic);
    startTransition(async () => {
      const result = await bookmarkNews({ articleId });
      if (!result.success) {
        toast.error(result.error ?? "Failed to bookmark.");
        setOptimistic(isBookmarked); // Revert
      }
    });
  };

  return (
    <Button
      variant="outline"
      size={size === "sm" ? "icon" : "default"}
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "rounded-xl gap-2 transition-all duration-200",
        optimistic
          ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
          : "hover:bg-muted/50"
      )}
    >
      <Bookmark
        className={cn(
          "h-4 w-4 transition-all duration-200",
          optimistic && "fill-current"
        )}
      />
      {size !== "sm" && (optimistic ? "Bookmarked" : "Bookmark")}
    </Button>
  );
}
