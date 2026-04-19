"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Tag, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  _count: { posts: number };
}

interface TagItem {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
}

interface BlogSidebarProps {
  categories: Category[];
  tags: TagItem[];
  activeCategorySlug?: string;
  activeTagSlug?: string;
}

// ── Fix: cast cubic-bezier arrays `as const` so TS narfers as BezierDefinition
const EASE_SPRING = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: EASE_SPRING },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      delay: i * 0.12,
      ease: EASE_SPRING,
    },
  }),
};

export function BlogSidebar({
  categories,
  tags,
  activeCategorySlug,
  activeTagSlug,
}: BlogSidebarProps) {
  return (
    <aside className="space-y-4 font-[system-ui]">
      {/* ── Categories card ── */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border) / 0.6)",
          boxShadow:
            "0 1px 2px hsl(var(--foreground) / 0.04), 0 4px 16px hsl(var(--foreground) / 0.04)",
        }}
      >
        {/* subtle top-left glow accent */}
        <div
          className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--primary) / 0.35) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />

        {/* Header */}
        <div className="relative flex items-center gap-3 px-5 py-4 border-b border-border/40">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--primary) / 0.06))",
              border: "1px solid hsl(var(--primary) / 0.2)",
            }}
          >
            <Folder className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
          </motion.div>
          <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground/70">
            Categories
          </h3>
        </div>

        {/* List */}
        <motion.div
          className="p-2 space-y-0.5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* All Posts */}
          <motion.div variants={itemVariants}>
            <Link href="/blog">
              <div
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.04))",
                  border: "1px solid hsl(var(--primary) / 0.25)",
                  borderRadius: "0.75rem",
                }}
              >
                <CategoryRow
                  label="All Posts"
                  count={categories.reduce((s, c) => s + c._count.posts, 0)}
                  isActive={!activeCategorySlug}
                  color="hsl(var(--primary))"
                />
              </div>
            </Link>
          </motion.div>

          {categories.map((cat) => (
            <motion.div key={cat.id} variants={itemVariants}>
              <Link href={`/blog/categories/${cat.slug}`}>
                <CategoryRow
                  label={cat.name}
                  count={cat._count.posts}
                  isActive={activeCategorySlug === cat.slug}
                  color={cat.color}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Tags card ── */}
      {tags.length > 0 && (
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border) / 0.6)",
            boxShadow:
              "0 1px 2px hsl(var(--foreground) / 0.04), 0 4px 16px hsl(var(--foreground) / 0.04)",
          }}
        >
          {/* accent glow */}
          <div
            className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--primary) / 0.5) 0%, transparent 70%)",
              filter: "blur(18px)",
            }}
          />

          {/* Header */}
          <div className="relative flex items-center gap-3 px-5 py-4 border-b border-border/40">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 6 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--primary) / 0.06))",
                border: "1px solid hsl(var(--primary) / 0.2)",
              }}
            >
              <Tag className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            </motion.div>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground/70">
              Popular Tags
            </h3>
          </div>

          {/* Tags */}
          <motion.div
            className="p-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <motion.div
                  key={tag.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                >
                  <Link href={`/blog/tags/${tag.slug}`}>
                    <TagChip
                      name={tag.name}
                      count={tag._count.posts}
                      isActive={activeTagSlug === tag.slug}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </aside>
  );
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

function CategoryRow({
  label,
  count,
  isActive,
  color,
}: {
  label: string;
  count: number;
  isActive: boolean;
  color: string | null;
}) {
  const dotColor = color ?? "hsl(var(--muted-foreground) / 0.5)";
  const activeColor = color ?? "hsl(var(--primary))";

  return (
    <motion.div
      whileHover={{ x: 3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm cursor-pointer transition-colors duration-200",
        isActive
          ? "font-semibold"
          : "text-muted-foreground hover:text-foreground"
      )}
      style={
        isActive
          ? {
              backgroundColor: `${activeColor}14`,
              color: activeColor,
              boxShadow: `inset 3px 0 0 0 ${activeColor}`,
            }
          : {}
      }
    >
      {/* hover bg */}
      {!isActive && (
        <div
          className="absolute inset-0 rounded-xl bg-muted/0 group-hover:bg-muted/50 transition-colors duration-200"
          aria-hidden
        />
      )}

      <div className="relative flex items-center gap-2.5">
        {/* animated dot */}
        <motion.span
          className="relative flex h-2 w-2 flex-shrink-0"
          animate={isActive ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={
            isActive
              ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
              : {}
          }
        >
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full",
              isActive && "animate-ping opacity-40"
            )}
            style={{ backgroundColor: activeColor }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: isActive ? activeColor : dotColor }}
          />
        </motion.span>

        {/* ── slightly larger label text ── */}
        <span className="text-[13.5px]">{label}</span>
      </div>

      {/* count badge */}
      <span
        className="relative z-10 min-w-[24px] text-center text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-full transition-all duration-200"
        style={
          isActive
            ? {
                backgroundColor: `${activeColor}22`,
                color: activeColor,
              }
            : {
                backgroundColor: "hsl(var(--muted))",
                color: "hsl(var(--muted-foreground))",
              }
        }
      >
        {count}
      </span>
    </motion.div>
  );
}

function TagChip({
  name,
  count,
  isActive,
}: {
  name: string;
  count: number;
  isActive: boolean;
}) {
  return (
    <span
      className={cn(
        // ── text-xs → text-[13px] for larger tag text ──
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 cursor-pointer select-none",
        isActive
          ? // active: solid primary fill + matching border
            "bg-primary text-primary-foreground border border-primary shadow-md shadow-primary/20"
          : // inactive: muted bg + always-visible subtle border (was border-border/60, now more opaque)
            "bg-muted/40 text-muted-foreground border border-border hover:bg-muted hover:text-foreground hover:border-border/80 hover:shadow-sm"
      )}
    >
      <span
        className="opacity-50 text-[11px]"
        style={{ letterSpacing: "0.02em" }}
      >
        #
      </span>
      {name}
      <span
        className={cn(
          "text-[11px] font-bold tabular-nums px-1 py-px rounded-full",
          isActive
            ? "bg-white/20 text-primary-foreground"
            : "bg-muted text-muted-foreground/70"
        )}
      >
        {count}
      </span>
    </span>
  );
}
