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
        className={`relative flex items-center transition-all duration-300 ease-out flex-1 sm:flex-none ${
          focused
            ? "w-full sm:w-[440px] md:w-[500px] ring-[3px] ring-amber-500/20 border-amber-500/60 shadow-xl shadow-amber-500/10 bg-background/95"
            : "w-full sm:w-[400px] md:w-[450px] border-border/60 hover:border-border bg-background/60 hover:bg-background/80 shadow-sm"
        } rounded-xl border backdrop-blur-md overflow-hidden group/search`}
      >
        <div className="absolute left-3.5 flex items-center justify-center">
          <Search
            className={`h-[1.1rem] w-[1.1rem] transition-colors duration-300 pointer-events-none ${focused ? "text-amber-500" : "text-muted-foreground/70 group-hover/search:text-muted-foreground"}`}
          />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search members... (Ctrl+F)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="border-0 bg-transparent pl-11 pr-24 h-11 text-sm md:text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
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
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
