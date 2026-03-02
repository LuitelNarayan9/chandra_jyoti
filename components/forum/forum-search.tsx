"use client";

import { useState, useRef, useEffect, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchForumThreadsAction } from "@/lib/actions/search.actions";

export function ForumSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Handle click-outside and Escape only when open
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Autofocus when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced search handler
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (!value.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      timeoutRef.current = setTimeout(() => {
        startTransition(async () => {
          const result = await searchForumThreadsAction(value, 1);
          if (result.success && result.data) {
            setResults(result.data.threads);
          } else {
            setResults([]);
          }
          setHasSearched(true);
        });
      }, 300);
    },
    [startTransition]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  }, []);

  const closeAndNavigate = useCallback(
    (path: string) => {
      setIsOpen(false);
      router.push(path);
    },
    [router]
  );

  return (
    <div className="relative flex items-center h-10" ref={containerRef}>
      <AnimatePresence mode="popLayout">
        {!isOpen ? (
          <motion.div
            key="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              variant="outline"
              className="gap-2 rounded-full h-10 px-4 transition-all hover:bg-muted"
              onClick={() => setIsOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex items-center overflow-hidden"
          >
            <div className="relative w-[260px] sm:w-[350px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search discussions..."
                value={query}
                onChange={handleInput}
                className="w-full pl-9 pr-10 h-10 rounded-full border-primary/20 focus-visible:ring-emerald-500/30 transition-all bg-background"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isPending && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {query && !isPending && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-muted"
                    onClick={clearSearch}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && query.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-[450px] max-w-[450px] bg-card rounded-2xl border border-border/50 shadow-2xl overflow-hidden z-50 origin-top-left sm:origin-top-right"
          >
            <div className="p-2 max-h-[60vh] sm:max-h-[400px] overflow-y-auto">
              {isPending && !hasSearched ? (
                <div className="p-8 flex flex-col items-center justify-center text-muted-foreground space-y-3">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                  <p className="text-sm">Searching threads...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((thread) => (
                    <Link
                      key={thread.id}
                      href={`/forum/${thread.category.slug}/${thread.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex flex-col p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h4 className="text-sm font-semibold leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {thread.title}
                        </h4>
                        <span className="shrink-0 text-[10px] text-muted-foreground uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted">
                          {thread.category.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-background">
                            {thread.author.avatar ? (
                              <img
                                src={thread.author.avatar}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon />
                            )}
                          </span>
                          {thread.author.firstName}
                        </span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(thread.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {thread._count.replies}
                        </span>
                      </div>
                    </Link>
                  ))}

                  {/* View all results link */}
                  <div className="pt-2 px-1">
                    <Button
                      variant="ghost"
                      className="w-full text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                      onClick={() =>
                        closeAndNavigate(
                          `/forum/search?q=${encodeURIComponent(query)}`
                        )
                      }
                    >
                      View all results for &quot;{query}&quot;
                    </Button>
                  </div>
                </div>
              ) : hasSearched && !isPending ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">
                    No discussions found for &quot;{query}&quot;
                  </p>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const UserIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
