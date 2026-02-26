"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowUpDown, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface BlogFiltersProps {
  search?: string;
  sortBy?: string;
  totalResults?: number;
}

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "oldest", label: "Oldest" },
] as const;

const DEBOUNCE_MS = 350;

export function BlogFilters({
  search = "",
  sortBy = "latest",
  totalResults,
}: BlogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [hasValue, setHasValue] = useState(!!search);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== search) {
      inputRef.current.value = search;
      setHasValue(!!search);
    }
  }, [search]);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "latest") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const updateParamsRef = useRef(updateParams);
  useEffect(() => {
    updateParamsRef.current = updateParams;
  });

  const handleChange = useCallback(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    const value = inputRef.current?.value ?? "";
    setHasValue(!!value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParamsRef.current("search", value);
    }, DEBOUNCE_MS);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateParamsRef.current("search", inputRef.current?.value ?? "");
  }, []);

  const clearSearch = useCallback(() => {
    if (inputRef.current) inputRef.current.value = "";
    setHasValue(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateParamsRef.current("search", "");
  }, []);

  // Only show count after server has responded (not while pending)
  // Hide when 0 (empty state in the grid already handles that messaging)
  const showCount = !!search && !isPending && !!totalResults;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Filter row ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        {/* Search */}
        <form
          onSubmit={handleSubmit}
          className="relative flex-1 max-w-sm group"
        >
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            {isPending ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
            )}
          </div>
          <Input
            ref={inputRef}
            defaultValue={search}
            onChange={handleChange}
            placeholder="Search posts…"
            className="pl-10 pr-10 h-10 rounded-full border-border/60 bg-muted/40 focus:bg-background transition-colors duration-200 focus:ring-1 focus:ring-primary/30"
            aria-label="Search blog posts"
          />
          {hasValue && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-150"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        {/* Sort pills */}
        <div className="flex items-center gap-1 p-1 rounded-full border border-border/60 bg-muted/30 w-fit">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground ml-2 mr-1 shrink-0" />
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => updateParamsRef.current("sortBy", option.value)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
                sortBy === option.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Result count — animates in below filters ── */}
      <AnimatePresence>
        {showCount && (
          <motion.div
            key="result-count"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center gap-2 mt-2 mb-1"
          >
            {/* Muted pill count badge */}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground tabular-nums">
              {totalResults}
            </span>
            <span className="text-xs text-muted-foreground">
              {totalResults === 1 ? "result" : "results"} for{" "}
              <span className="font-semibold text-foreground">"{search}"</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
