"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  /** Optional icon shown in the eyebrow label */
  icon?: React.ReactNode;
  /** Optional short eyebrow label above the title */
  eyebrow?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  icon,
  eyebrow,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/40 to-transparent",
        className
      )}
    >
      {/* Dot-grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      {/* Glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/3 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 right-1/4 h-40 w-40 rounded-full bg-primary/5 blur-2xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          {/* Left: eyebrow + title + description */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-3"
          >
            {/* Eyebrow row */}
            {(eyebrow || icon) && (
              <div className="flex items-center gap-2.5">
                {icon && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-primary [&>svg]:h-3.5 [&>svg]:w-3.5">
                      {icon}
                    </span>
                  </div>
                )}
                {eyebrow && (
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary/80">
                    {eyebrow}
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight font-(family-name:--font-outfit) leading-[1.05]">
              <span className="relative inline-block">
                {title}
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-[3px] w-3/4 rounded-full bg-gradient-to-r from-primary to-primary/30"
                />
              </span>
            </h1>

            {/* Description */}
            {description && (
              <p className="text-sm md:text-base text-muted-foreground max-w-md leading-relaxed">
                {description}
              </p>
            )}
          </motion.div>

          {/* Right: action slot */}
          {children && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex items-center gap-2.5 shrink-0"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
