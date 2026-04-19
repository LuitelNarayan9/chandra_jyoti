"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Loader2,
  Send,
  ArrowLeft,
  Sparkles,
  Layers,
  Hash,
  Tag,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { PollCreator } from "@/components/forum/poll-creator";

import {
  CreateThreadSchema,
  type CreateThreadValues,
} from "@/lib/validations/forum";
import { createThread, updateThread } from "@/lib/actions/forum.actions";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────

interface CategoryItem {
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

interface SelectedTag {
  id?: string;
  name: string;
}

interface ThreadEditorProps {
  categories: CategoryItem[];
  tags: TagItem[];
  preselectedCategorySlug?: string;
  initialData?: {
    id: string;
    title: string;
    content: string;
    categoryId: string;
    tagIds: string[];
  };
}

// ─── Animations ───────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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
    transition: { duration: 0.45, ease: EASE },
  },
};

const tagVariants: Variants = {
  initial: { opacity: 0, scale: 0.8, y: 4 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.7, y: -4, transition: { duration: 0.15 } },
};

// ─── Section wrapper ──────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────

export function ThreadEditor({
  categories,
  tags,
  preselectedCategorySlug,
  initialData,
}: ThreadEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newTagInput, setNewTagInput] = useState("");
  const isEditing = !!initialData;

  const preselectedCategory = preselectedCategorySlug
    ? categories.find((c) => c.slug === preselectedCategorySlug)
    : initialData?.categoryId
      ? categories.find((c) => c.id === initialData.categoryId)
      : undefined;

  const [selectedCategory, setSelectedCategory] = useState<
    CategoryItem | undefined
  >(preselectedCategory);

  const [selectedTags, setSelectedTags] = useState<SelectedTag[]>(() => {
    if (!initialData?.tagIds) return [];
    return initialData.tagIds.map((id) => {
      const t = tags.find((t) => t.id === id);
      return { id, name: t?.name ?? "Unknown" };
    });
  });

  const form = useForm<CreateThreadValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreateThreadSchema) as any,
    defaultValues: {
      title: initialData?.title ?? "",
      content: initialData?.content ?? "",
      categoryId: selectedCategory?.id ?? "",
      tags: selectedTags,
    },
  });

  // ── Category ────────────────────────────────────────────────

  const toggleCategory = (cat: CategoryItem) => {
    const next = selectedCategory?.id === cat.id ? undefined : cat;
    setSelectedCategory(next);
    form.setValue("categoryId", next?.id ?? "");
  };

  // ── Tags ────────────────────────────────────────────────────

  const toggleTag = (tag: TagItem) => {
    setSelectedTags((prev) => {
      const isSelected = prev.some((t) => t.id === tag.id);
      const next = isSelected
        ? prev.filter((t) => t.id !== tag.id)
        : prev.length < 3
          ? [...prev, { id: tag.id, name: tag.name }]
          : prev;
      form.setValue("tags", next);
      return next;
    });
  };

  const removeTag = (name: string) => {
    setSelectedTags((prev) => {
      const next = prev.filter((t) => t.name !== name);
      form.setValue("tags", next);
      return next;
    });
  };

  const handleAddCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = newTagInput.trim();
    if (!val || selectedTags.length >= 3) return;
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

  // ── Submit ──────────────────────────────────────────────────

  const onSubmit = () => {
    form.handleSubmit(async (values) => {
      startTransition(async () => {
        try {
          if (isEditing && initialData) {
            const result = await updateThread({
              threadId: initialData.id,
              title: values.title,
              content: values.content,
              categoryId: values.categoryId,
            });
            if (result.success) {
              toast.success(result.message ?? "Thread updated!");
              router.push("/forum");
            } else {
              toast.error(result.error ?? "Failed to update thread.");
            }
          } else {
            const result = await createThread(values);
            if (result.success && result.data) {
              toast.success(result.message ?? "Thread created!");
              router.push(
                `/forum/${result.data.categorySlug}/${result.data.slug}`
              );
            } else {
              toast.error(result.error ?? "Failed to create thread.");
            }
          }
        } catch {
          toast.error("An unexpected error occurred.");
        }
      });
    })();
  };

  // ── Render ──────────────────────────────────────────────────

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-20 -left-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />

      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="relative flex items-center justify-between mb-10 pb-6 border-b border-border/50"
      >
        <div className="flex items-center gap-3.5">
          <div className="relative h-10 w-10 rounded-2xl flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-sm shadow-primary/10">
            <MessageSquare className="h-4.5 w-4.5 text-primary" />
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
          </div>
          <div>
            <h2 className="text-[1.05rem] font-bold tracking-tight">
              {isEditing ? "Edit Thread" : "New Thread"}
            </h2>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              {isEditing ? "Update your discussion" : "Start a new discussion"}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-2 text-muted-foreground rounded-xl hover:text-foreground hover:bg-accent/50 group transition-all duration-200"
        >
          <Link href="/forum">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="text-sm">Back</span>
          </Link>
        </Button>
      </motion.div>

      <Form {...form}>
        <form className="space-y-8">
          {/* Title */}
          <Section icon={Sparkles} label="Title" accent="#8b5cf6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Write a clear, descriptive title…"
                      {...field}
                      className={cn(
                        "text-[1.35rem] font-bold leading-tight tracking-tight",
                        "border-0 border-b-2 border-border/40 rounded-none px-0 shadow-none",
                        "focus-visible:ring-0 focus-visible:border-violet-400/70",
                        "bg-transparent placeholder:text-muted-foreground/25",
                        "transition-colors duration-200 h-auto py-3"
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />
          </Section>

          {/* Content */}
          <Section icon={MessageSquare} label="Content" accent="#10b981">
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
                        placeholder="Describe your question or topic in detail…"
                        minHeight={280}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />
          </Section>

          {/* Category */}
          <Section icon={Layers} label="Category" accent="#f59e0b">
            <div className="rounded-2xl border border-border/50 bg-linear-to-br from-muted/20 to-transparent p-4 space-y-4">
              {/* Selected */}
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
                      className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-400/25 shadow-sm"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {selectedCategory.name}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory(undefined);
                          form.setValue("categoryId", "");
                        }}
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

              {/* Category pills */}
              {categories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/40">
                    Select category
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
                            style={{
                              backgroundColor: cat.color ?? "#f59e0b",
                            }}
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

              {form.formState.errors.categoryId && (
                <p className="text-xs font-medium text-destructive">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>
          </Section>

          {/* Tags */}
          <Section
            icon={Hash}
            label="Tags"
            description={`${selectedTags.length}/3`}
            accent="#ec4899"
          >
            <div className="rounded-2xl border border-border/50 bg-linear-to-br from-muted/20 to-transparent p-4 space-y-4">
              {/* Custom tag input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-sm font-medium">
                  #
                </div>
                <Input
                  placeholder={
                    selectedTags.length >= 3
                      ? "Max 3 tags reached"
                      : "Type a tag and press Enter…"
                  }
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                  disabled={selectedTags.length >= 3}
                  className="rounded-xl border-border/50 bg-background/80 pl-7 text-sm placeholder:text-muted-foreground/30 focus:border-pink-400/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      {selectedTags.map((tag) => (
                        <motion.span
                          key={tag.id ?? tag.name}
                          variants={tagVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          layout
                          className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-400/25 shadow-sm"
                        >
                          <Tag className="h-2.5 w-2.5" />#{tag.name}
                          <button
                            type="button"
                            onClick={() => removeTag(tag.name)}
                            aria-label={`Remove tag ${tag.name}`}
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

          {/* Poll Section (create mode only) */}
          {!isEditing && (
            <motion.div variants={itemVariants}>
              <PollCreator
                value={form.watch("poll")}
                onChange={(poll) => form.setValue("poll", poll)}
              />
            </motion.div>
          )}

          {/* Divider */}
          <motion.div variants={itemVariants}>
            <div className="relative">
              <div className="h-px bg-linear-to-r from-transparent via-border/60 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-end gap-3"
          >
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isPending}
              size="lg"
              className="gap-2 rounded-full font-semibold px-8 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isEditing ? "Update Thread" : "Post Thread"}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}
