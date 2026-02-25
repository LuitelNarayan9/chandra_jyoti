"use client";

import { useState, useEffect } from "react";

/**
 * Client-only TimeAgo component to avoid SSR hydration mismatches.
 * Renders an empty string on the server and computes relative time on the client.
 */
export function TimeAgo({ date }: { date: Date }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) {
      setLabel("just now");
      return;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      setLabel(`${minutes}m ago`);
      return;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      setLabel(`${hours}h ago`);
      return;
    }
    const days = Math.floor(hours / 24);
    if (days < 7) {
      setLabel(`${days}d ago`);
      return;
    }
    setLabel(
      new Date(date).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      })
    );
  }, [date]);

  return <>{label}</>;
}
