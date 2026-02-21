"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TreeSearchProps {
  value: string;
  onChange: (query: string) => void;
  matchCount: number;
}

export function TreeSearch({ value, onChange, matchCount }: TreeSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  // Keyboard shortcut: Ctrl+F to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="relative group">
      <div
        className={`relative flex items-center transition-all duration-300 ${
          focused
            ? "w-72 ring-2 ring-primary/20 shadow-lg shadow-primary/5"
            : "w-56"
        } rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm overflow-hidden`}
      >
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search members... (Ctrl+F)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="border-0 bg-transparent pl-9 pr-20 h-10 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <>
              <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded-md">
                {matchCount} found
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => onChange("")}
              >
                <X className="h-3. w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
