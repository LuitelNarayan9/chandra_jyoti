"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Loader2,
  Save,
  Send,
  ArrowLeft,
  FileText,
  Hash,
  Tag,
  Layers,
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { ImageUpload } from "@/components/shared/image-upload";

import {
  CreatePostSchema,
  type CreatePostValues,
} from "@/lib/validations/blog";
import { createPost, updatePost } from "@/lib/actions/blog.actions";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

interface TagItem {
  id: string;
  name: string;
  slug: string;
}

interface BlogEditorProps {
  categories: Category[];
  tags: TagItem[];
  initialData?: {
    id: string;
    title: string;
    content: string;
    excerpt: string | null;
    coverImage: string | null;
    categoryId: string | null;
    tagIds: string[];
    status: "DRAFT" | "PUBLISHED";
  };
}

interface SelectedTag {
  id?: string;
  name: string;
}

// ─── Animation variants ───────────────────────────────────────────────────────

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: EASE_OUT_EXPO },
  },
};

const tagVariants: Variants = {
  initial: { opacity: 0, scale: 0.8, y: 4 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.7, y: -4, transition: { duration: 0.15 } },
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  label,
  description,
  children,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <motion.div variants={itemVariants} className="group">
      <div className="flex items-start gap-4">
        {/* Left accent line + icon */}
        <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
          <div
            className="h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{
              background: accent ? `${accent}15` : "hsl(var(--primary) / 0.1)",
            }}
          >
            <Icon
              className="h-4 w-4 transition-colors duration-200"
              style={{ color: accent ?? "hsl(var(--primary))" }}
            />
          </div>
          <div
            className="w-px flex-1 min-h-4 opacity-20 rounded-full"
            style={{ background: accent ?? "hsl(var(--primary))" }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 pb-2">
          <div className="flex items-baseline gap-2 mb-1">
            <span
              className="text-[0.7rem] font-bold tracking-[0.12em] uppercase"
              style={{ color: accent ?? "hsl(var(--primary))" }}
            >
              {label}
            </span>
            {description && (
              <span className="text-[0.65rem] text-muted-foreground/50">
                {description}
              </span>
            )}
          </div>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BlogEditor({ categories, tags, initialData }: BlogEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newCatInput, setNewCatInput] = useState("");
  const [newTagInput, setNewTagInput] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<
    SelectedTag | undefined
  >(() => {
    if (!initialData?.categoryId) return undefined;
    const cat = categories.find((c) => c.id === initialData.categoryId);
    return cat ? { id: cat.id, name: cat.name } : undefined;
  });

  const [selectedTags, setSelectedTags] = useState<SelectedTag[]>(() => {
    if (!initialData?.tagIds) return [];
    return initialData.tagIds.map((id) => {
      const t = tags.find((t) => t.id === id);
      return { id, name: t?.name ?? "Unknown" };
    });
  });

  const isEditing = !!initialData;

  const form = useForm<CreatePostValues>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      content: initialData?.content ?? "",
      excerpt: initialData?.excerpt ?? "",
      coverImage: initialData?.coverImage ?? "",
      category: selectedCategory,
      tags: selectedTags,
      status: initialData?.status ?? "DRAFT",
    },
  });

  // ─── Category ──────────────────────────────────────────────────────────────

  const toggleCategory = (cat: Category) => {
    const next =
      selectedCategory?.id === cat.id
        ? undefined
        : { id: cat.id, name: cat.name };
    setSelectedCategory(next);
    form.setValue("category", next as any);
  };

  const removeCategory = () => {
    setSelectedCategory(undefined);
    form.setValue("category", undefined as any);
  };

  const handleAddCustomCategory = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = newCatInput.trim();
    if (!val) return;
    const existing = categories.find(
      (c) => c.name.toLowerCase() === val.toLowerCase()
    );
    if (existing) {
      const next = { id: existing.id, name: existing.name };
      setSelectedCategory(next);
      form.setValue("category", next as any);
    } else {
      const next = { name: val };
      setSelectedCategory(next);
      form.setValue("category", next as any);
    }
    setNewCatInput("");
  };

  // ─── Tags ──────────────────────────────────────────────────────────────────

  const toggleTag = (tag: TagItem) => {
    setSelectedTags((prev) => {
      const isSelected = prev.some((t) => t.id === tag.id);
      const next = isSelected
        ? prev.filter((t) => t.id !== tag.id)
        : prev.length < 5
          ? [...prev, { id: tag.id, name: tag.name }]
          : prev;
      form.setValue("tags", next);
      return next;
    });
  };

  const removeTag = (tagName: string) => {
    setSelectedTags((prev) => {
      const next = prev.filter((t) => t.name !== tagName);
      form.setValue("tags", next);
      return next;
    });
  };

  const handleAddCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = newTagInput.trim();
    if (!val) return;
    if (selectedTags.length >= 5) {
      toast.error("Maximum 5 tags allowed.");
      return;
    }
    const existing = tags.find(
      (t) => t.name.toLowerCase() === val.toLowerCase()
    );
    if (existing) {
      if (!selectedTags.some((t) => t.id === existing.id)) {
        const next = [
          ...selectedTags,
          { id: existing.id, name: existing.name },
        ];
        setSelectedTags(next);
        form.setValue("tags", next);
      }
    } else {
      if (
        !selectedTags.some((t) => t.name.toLowerCase() === val.toLowerCase())
      ) {
        const next = [...selectedTags, { name: val }];
        setSelectedTags(next);
        form.setValue("tags", next);
      }
    }
    setNewTagInput("");
  };

  // ─── Submit ────────────────────────────────────────────────────────────────

  const onSubmit = (status: "DRAFT" | "PUBLISHED") => {
    form.setValue("status", status);
    form.handleSubmit(async (values) => {
      startTransition(async () => {
        try {
          if (isEditing && initialData) {
            const result = await updatePost({
              postId: initialData.id,
              ...values,
            });
            if (result.success) {
              toast.success(result.message ?? "Post updated!");
              router.push(`/blog/${result.data?.slug ?? initialData.id}`);
              router.refresh();
            } else {
              toast.error(result.error ?? "Failed to update post.");
            }
          } else {
            const result = await createPost(values);
            if (result.success) {
              toast.success(result.message ?? "Post created!");
              router.push(`/blog/${result.data?.slug}`);
              router.refresh();
            } else {
              toast.error(result.error ?? "Failed to create post.");
            }
          }
        } catch {
          toast.error("An unexpected error occurred.");
        }
      });
    })();
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* ── Ambient background glow ── */}
      <div
        className="pointer-events-none absolute -top-20 -left-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-10 right-0 h-48 w-96 rounded-full bg-violet-500/4 blur-3xl"
        aria-hidden
      />

      {/* ── Header ── */}
      <motion.div
        variants={itemVariants}
        className={cn(
          "relative flex items-center justify-between mb-10",
          "pb-6 border-b border-border/50"
        )}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={cn(
              "relative h-10 w-10 rounded-2xl flex items-center justify-center",
              "bg-linear-to-br from-primary/20 to-primary/5",
              "border border-primary/20 shadow-sm shadow-primary/10"
            )}
          >
            <FileText className="h-4.5 w-4.5 text-primary" />
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
          </div>
          <div>
            <h2 className="text-[1.05rem] font-bold tracking-tight">
              {isEditing ? "Edit Post" : "New Post"}
            </h2>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              {isEditing
                ? "Update your existing content"
                : "Craft and share your story"}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className={cn(
            "gap-2 text-muted-foreground rounded-xl",
            "hover:text-foreground hover:bg-accent/50",
            "group transition-all duration-200"
          )}
        >
          <Link href="/blog">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="text-sm">Back</span>
          </Link>
        </Button>
      </motion.div>

      <Form {...form}>
        <form className="space-y-8">
          {/* ── Title ── */}
          <Section icon={Sparkles} label="Title" accent="#8b5cf6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Write a compelling title…"
                        {...field}
                        className={cn(
                          "text-[1.35rem] font-bold leading-tight tracking-tight",
                          "border-0 border-b-2 border-border/40 rounded-none px-0 shadow-none",
                          "focus-visible:ring-0 focus-visible:border-violet-400/70",
                          "bg-transparent placeholder:text-muted-foreground/25",
                          "transition-colors duration-200 h-auto py-3"
                        )}
                      />
                      <div
                        className="absolute bottom-0 left-0 h-0.5 w-0 bg-linear-to-r from-violet-500 to-primary
                        group-focus-within:w-full transition-all duration-500 ease-out"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />
          </Section>

          {/* ── Cover Image ── */}
          <Section icon={Layers} label="Cover Image" description="Optional">
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div
                      className={cn(
                        "rounded-2xl overflow-hidden",
                        "border border-border/50 hover:border-border/80",
                        "transition-colors duration-200",
                        "shadow-sm hover:shadow-md transition-shadow"
                      )}
                    >
                      <ImageUpload
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />
          </Section>

          {/* ── Excerpt ── */}
          <Section
            icon={FileText}
            label="Excerpt"
            description="Optional · shown on listing cards"
            accent="#06b6d4"
          >
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="A short, punchy summary of your post…"
                      rows={2}
                      {...field}
                      className={cn(
                        "resize-none rounded-xl text-sm",
                        "border-border/50 bg-muted/20 hover:bg-muted/30",
                        "focus:bg-background focus:border-cyan-400/50",
                        "transition-all duration-200 leading-relaxed",
                        "placeholder:text-muted-foreground/30"
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />
          </Section>

          {/* ── Content ── */}
          <Section icon={FileText} label="Content" accent="#10b981">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div
                      className={cn(
                        "rounded-2xl overflow-hidden",
                        "border border-border/50 hover:border-emerald-400/30",
                        "focus-within:border-emerald-400/50 focus-within:shadow-lg",
                        "focus-within:shadow-emerald-500/5",
                        "transition-all duration-300"
                      )}
                    >
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Start writing your post…"
                        minHeight={380}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />
          </Section>

          {/* ── Category ── */}
          <Section icon={Layers} label="Category" accent="#f59e0b">
            <div
              className={cn(
                "rounded-2xl border border-border/50",
                "bg-linear-to-br from-muted/20 to-transparent",
                "p-4 space-y-4"
              )}
            >
              {/* Custom category input */}
              <div className="relative">
                <Input
                  placeholder={
                    selectedCategory
                      ? "Category selected — remove to change"
                      : "Type a new category and press Enter…"
                  }
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  onKeyDown={handleAddCustomCategory}
                  disabled={!!selectedCategory}
                  className={cn(
                    "rounded-xl border-border/50 bg-background/80",
                    "text-sm placeholder:text-muted-foreground/30",
                    "focus:border-amber-400/60 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                />
              </div>

              {/* Selected category */}
              <AnimatePresence>
                {selectedCategory && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-[0.68rem] font-semibold uppercase tracking-wide text-amber-500/70">
                      Selected:
                    </span>
                    <motion.span
                      variants={tagVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className={cn(
                        "inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-semibold",
                        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-400/25",
                        "shadow-sm"
                      )}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {selectedCategory.name}
                      <button
                        type="button"
                        onClick={removeCategory}
                        className="ml-0.5 h-4 w-4 rounded-full hover:bg-amber-500/20 flex items-center justify-center transition-colors"
                      >
                        <span className="text-[0.7rem] leading-none font-bold">
                          ×
                        </span>
                      </button>
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Existing categories */}
              {categories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/40">
                    Quick select
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const isSelected = selectedCategory?.id === cat.id;
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => toggleCategory(cat)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                            "text-xs font-semibold border transition-all duration-200",
                            "hover:scale-105 active:scale-95",
                            isSelected
                              ? "shadow-sm scale-105"
                              : "bg-background/60 text-muted-foreground border-border/50 hover:text-foreground hover:border-border"
                          )}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: `${cat.color ?? "#f59e0b"}18`,
                                  color: cat.color ?? "#f59e0b",
                                  borderColor: `${cat.color ?? "#f59e0b"}40`,
                                }
                              : {}
                          }
                        >
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color ?? "#f59e0b" }}
                          />
                          {cat.name}
                          {isSelected && (
                            <CheckCircle2 className="h-3 w-3 ml-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {form.formState.errors.category && (
                <p className="text-xs font-medium text-destructive">
                  {form.formState.errors.category.message as string}
                </p>
              )}
            </div>
          </Section>

          {/* ── Tags ── */}
          <Section
            icon={Hash}
            label="Tags"
            description={`${selectedTags.length}/5`}
            accent="#ec4899"
          >
            <div
              className={cn(
                "rounded-2xl border border-border/50",
                "bg-linear-to-br from-muted/20 to-transparent",
                "p-4 space-y-4"
              )}
            >
              {/* Custom tag input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-sm font-medium">
                  #
                </div>
                <Input
                  placeholder={
                    selectedTags.length >= 5
                      ? "Max 5 tags reached"
                      : "Type a tag and press Enter…"
                  }
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                  disabled={selectedTags.length >= 5}
                  className={cn(
                    "rounded-xl border-border/50 bg-background/80 pl-7",
                    "text-sm placeholder:text-muted-foreground/30",
                    "focus:border-pink-400/60 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                />
              </div>

              {/* Selected tags */}
              <AnimatePresence mode="popLayout">
                {selectedTags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/40">
                      Selected tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag, idx) => (
                        <motion.span
                          key={tag.id ?? tag.name}
                          variants={tagVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          layout
                          className={cn(
                            "inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full",
                            "text-xs font-semibold",
                            "bg-pink-500/10 text-pink-600 dark:text-pink-400",
                            "border border-pink-400/25 shadow-sm"
                          )}
                        >
                          <Tag className="h-2.5 w-2.5" />#{tag.name}
                          <button
                            type="button"
                            onClick={() => removeTag(tag.name)}
                            className="ml-0.5 h-4 w-4 rounded-full hover:bg-pink-500/20 flex items-center justify-center transition-colors"
                          >
                            <span className="text-[0.7rem] leading-none font-bold">
                              ×
                            </span>
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Existing tags */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/40">
                    Quick select
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const selected = selectedTags.some(
                        (t) => t.id === tag.id
                      );
                      return (
                        <button
                          type="button"
                          key={tag.id}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full",
                            "text-xs font-semibold border transition-all duration-200",
                            "hover:scale-105 active:scale-95",
                            selected
                              ? "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-400/30 shadow-sm scale-105"
                              : "bg-background/60 text-muted-foreground border-border/50 hover:text-foreground hover:border-border"
                          )}
                        >
                          #{tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* ── Divider ── */}
          <motion.div variants={itemVariants}>
            <div className="relative">
              <div className="h-px bg-linear-to-r from-transparent via-border/60 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
            </div>
          </motion.div>

          {/* ── Actions ── */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end"
          >
            {/* Draft status indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground/50 mr-auto">
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-pulse" />
              {isEditing
                ? `Editing ${initialData?.status === "PUBLISHED" ? "published" : "draft"} post`
                : "Unsaved draft"}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => onSubmit("DRAFT")}
              disabled={isPending}
              className={cn(
                "gap-2 rounded-xl border-border/60",
                "hover:bg-muted/50 hover:border-border",
                "transition-all duration-200",
                "font-medium text-sm"
              )}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save Draft
            </Button>

            <Button
              type="button"
              onClick={() => onSubmit("PUBLISHED")}
              disabled={isPending}
              className={cn(
                "gap-2 rounded-xl font-semibold text-sm",
                "bg-linear-to-r from-primary to-primary/80",
                "hover:shadow-lg hover:shadow-primary/20",
                "hover:-translate-y-0.5 active:translate-y-0",
                "transition-all duration-200",
                "group"
              )}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
              )}
              {isEditing ? "Update Post" : "Publish Post"}
              {!isPending && (
                <ChevronRight className="h-3.5 w-3.5 opacity-60 -ml-1 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
              )}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}
