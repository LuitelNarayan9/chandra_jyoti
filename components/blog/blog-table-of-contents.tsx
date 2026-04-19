"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface BlogTableOfContentsProps {
  content: string;
}

export function BlogTableOfContents({ content }: BlogTableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // Parse headings from HTML
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const headings = doc.querySelectorAll("h1, h2, h3");
    const tocItems: TocItem[] = Array.from(headings).map((heading, i) => ({
      id: `heading-${i}`,
      text: heading.textContent ?? "",
      level: parseInt(heading.tagName[1]),
    }));
    setItems(tocItems);
  }, [content]);

  // Observe headings in DOM
  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    const contentEl = document.querySelector("[data-blog-content]");
    if (contentEl) {
      contentEl.querySelectorAll("h1, h2, h3").forEach((heading, i) => {
        heading.id = `heading-${i}`;
        observer.observe(heading);
      });
    }
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  const scrollToHeading = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.nav
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Table of contents"
      className="sticky top-20"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-px flex-1 bg-border/60" />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60 whitespace-nowrap">
          On this page
        </span>
        <div className="h-px flex-1 bg-border/60" />
      </div>

      {/* Items */}
      <div className="relative space-y-0.5">
        {/* Active indicator track */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border/60" />

        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollToHeading(item.id)}
              className={cn(
                "relative block w-full text-left py-1.5 text-[13px] transition-all duration-200",
                item.level === 1 ? "pl-4" : item.level === 2 ? "pl-6" : "pl-9",
                isActive
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active left bar */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    layoutId="toc-indicator"
                    className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full bg-primary"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </AnimatePresence>

              <span className="line-clamp-2 leading-relaxed">{item.text}</span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
