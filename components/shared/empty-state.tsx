"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50",
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
