"use client";

import { useTransition, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Bookmark, Share2, MessageCircle, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { likePost, bookmarkPost } from "@/lib/actions/blog.actions";
import { cn } from "@/lib/utils";

interface BlogPostActionsProps {
  postId: string;
  slug: string;
  initialLiked: boolean;
  initialBookmarked: boolean;
  totalLikes: number;
  totalComments: number;
}

export function BlogPostActions({
  postId,
  slug,
  initialLiked,
  initialBookmarked,
  totalLikes,
  totalComments,
}: BlogPostActionsProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [likes, setLikes] = useState(totalLikes);
  const [copied, setCopied] = useState(false);
  const [isLiking, startLike] = useTransition();
  const [isBookmarking, startBookmark] = useTransition();

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
    startLike(async () => {
      const result = await likePost(postId);
      if (!result.success) {
        setLiked((prev) => !prev);
        setLikes((prev) => (liked ? prev + 1 : prev - 1));
        toast.error(result.error ?? "Failed to toggle like.");
      }
    });
  };

  const handleBookmark = () => {
    setBookmarked((prev) => !prev);
    startBookmark(async () => {
      const result = await bookmarkPost(postId);
      if (!result.success) {
        setBookmarked((prev) => !prev);
        toast.error(result.error ?? "Failed to toggle bookmark.");
      } else {
        toast.success(
          bookmarked ? "Removed from bookmarks" : "Saved to bookmarks"
        );
      }
    });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  const scrollToComments = () => {
    document
      .getElementById("comments-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-1 p-1 rounded-full border border-border/60 bg-background/80 backdrop-blur-sm shadow-sm w-fit"
      >
        {/* Like */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 select-none",
                liked
                  ? "bg-red-50 text-red-500 dark:bg-red-950/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <motion.div
                animate={liked ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    liked && "fill-red-500 text-red-500"
                  )}
                />
              </motion.div>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={likes}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                >
                  {likes}
                </motion.span>
              </AnimatePresence>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {liked ? "Unlike" : "Like"}
          </TooltipContent>
        </Tooltip>

        {/* Comments */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={scrollToComments}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4" />
              {totalComments}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Comments
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="w-px h-5 bg-border/60 mx-0.5" />

        {/* Bookmark */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleBookmark}
              disabled={isBookmarking}
              className={cn(
                "flex items-center p-2 rounded-full text-xs font-semibold transition-all duration-200",
                bookmarked
                  ? "bg-amber-50 text-amber-500 dark:bg-amber-950/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <motion.div
                animate={bookmarked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Bookmark
                  className={cn(
                    "h-4 w-4",
                    bookmarked && "fill-amber-500 text-amber-500"
                  )}
                />
              </motion.div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {bookmarked ? "Unsave" : "Save"}
          </TooltipContent>
        </Tooltip>

        {/* Share */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleShare}
              className="flex items-center p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="share"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Share2 className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Share
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </TooltipProvider>
  );
}
