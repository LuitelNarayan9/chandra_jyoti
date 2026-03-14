"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal } from "lucide-react";

interface ForumFiltersProps {
  sortBy: string;
  totalResults: number;
}

export function ForumFilters({ sortBy, totalResults }: ForumFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSort = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "latest") {
        params.delete("sortBy");
      } else {
        params.set("sortBy", value);
      }
      params.delete("page");
      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground tabular-nums">
          {totalResults}
        </span>{" "}
        {totalResults === 1 ? "thread" : "threads"}
      </p>

      {/* Sort control */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
        <select
          value={sortBy}
          onChange={(e) => updateSort(e.target.value)}
          className="text-sm font-medium bg-transparent border border-border/60 rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition-all duration-200 hover:border-border"
          aria-label="Sort threads"
        >
          <option value="latest">Latest</option>
          <option value="most-replied">Most Replied</option>
          <option value="unanswered">Unanswered</option>
        </select>
      </div>
    </div>
  );
}
