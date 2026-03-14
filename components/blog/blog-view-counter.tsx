"use client";

import { useEffect, useRef } from "react";
import { incrementPostViews } from "@/lib/actions/blog.actions";

interface BlogViewCounterProps {
  postId: string;
}

/**
 * Client component that fires a view increment once per page load.
 * Uses a ref to prevent double-firing in React strict mode.
 */
export function BlogViewCounter({ postId }: BlogViewCounterProps) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;
    incrementPostViews(postId);
  }, [postId]);

  return null;
}
