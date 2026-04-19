"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BlogAuthorBioProps {
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    bio: string | null;
  };
}

export function BlogAuthorBio({ author }: BlogAuthorBioProps) {
  const initials = (author.firstName?.[0] ?? "") + (author.lastName?.[0] ?? "");

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      aria-label="About the author"
    >
      {/* Decorative separator */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border" />
        <span className="text-muted-foreground/30 text-sm">✦</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border" />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-muted/50 to-muted/20 p-6 md:p-8">
        {/* Background decoration */}
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with ring */}
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
              <AvatarImage src={author.avatar ?? undefined} />
              <AvatarFallback className="text-xl font-black bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[9px] font-bold shadow-md">
              ✓
            </span>
          </div>

          {/* Text */}
          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/70">
              Written by
            </p>
            <h3 className="text-xl font-black font-(family-name:--font-outfit) tracking-tight">
              {author.firstName} {author.lastName}
            </h3>
            {author.bio ? (
              <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-prose line-clamp-3">
                {author.bio}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-2 italic leading-relaxed">
                Community member of Chandra Jyoti Sanstha.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
