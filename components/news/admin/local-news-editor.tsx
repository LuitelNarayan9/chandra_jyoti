"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, type Variants } from "framer-motion";
import {
  Loader2,
  Save,
  Send,
  ArrowLeft,
  FileText,
  Layers,
  MapPin,
  Tag,
  AlertTriangle,
  ImageIcon,
  Sparkles,
  Megaphone,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { ImageUpload } from "@/components/shared/image-upload";
import { GalleryUpload } from "@/components/news/admin/gallery-upload";

import {
  CreateLocalNewsSchema,
  type CreateLocalNewsValues,
  LOCAL_NEWS_TAGS,
  LOCAL_NEWS_TAG_LABELS,
  LOCAL_NEWS_TAG_COLORS,
  NEWS_URGENCY_OPTIONS,
} from "@/lib/validations/news";
import { createLocalNews, updateLocalNews } from "@/lib/actions/news.actions";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────

interface LocalNewsEditorProps {
  initialData?: {
    id: string;
    title: string;
    content: string | null;
    excerpt: string | null;
    coverImage: string | null;
    gallery: string[];
    localTag: string | null;
    location: string | null;
    urgency: string;
  };
}

// ─── Animation variants ───────────────────────────────────────

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

// ─── Urgency Labels ───────────────────────────────────────────

const URGENCY_META: Record<
  string,
  { label: string; color: string; icon: React.ElementType; description: string }
> = {
  NORMAL: {
    label: "Normal",
    color: "#6b7280",
    icon: FileText,
    description: "Regular community news",
  },
  FEATURED: {
    label: "Featured",
    color: "#f59e0b",
    icon: Sparkles,
    description: "Highlighted in news feed",
  },
  URGENT: {
    label: "Urgent",
    color: "#ef4444",
    icon: AlertTriangle,
    description: "Critical community alert",
  },
};

// ─── Main component ───────────────────────────────────────────

export function LocalNewsEditor({ initialData }: LocalNewsEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<CreateLocalNewsValues>({
    resolver: zodResolver(CreateLocalNewsSchema) as any,
    defaultValues: {
      title: initialData?.title ?? "",
      content: initialData?.content ?? "",
      excerpt: initialData?.excerpt ?? "",
      coverImage: initialData?.coverImage ?? "",
      galleryImages: initialData?.gallery ?? [],
      localTag: (initialData?.localTag as CreateLocalNewsValues["localTag"]) ?? undefined,
      location: initialData?.location ?? "",
      urgency: (initialData?.urgency as CreateLocalNewsValues["urgency"]) ?? "NORMAL",
    },
  });

  const selectedTag = form.watch("localTag");
  const selectedUrgency = form.watch("urgency");
  const galleryImages = form.watch("galleryImages");

  // ─── Submit ──────────────────────────────────────────────────

  const onSubmit = () => {
    form.handleSubmit(async (values) => {
      startTransition(async () => {
        try {
          if (isEditing && initialData) {
            const result = await updateLocalNews({
              articleId: initialData.id,
              ...values,
            });
            if (result.success) {
              toast.success(result.message ?? "Article updated!");
              router.push("/admin/news");
              router.refresh();
            } else {
              toast.error(result.error ?? "Failed to update article.");
            }
          } else {
            const result = await createLocalNews(values);
            if (result.success) {
              toast.success(result.message ?? "Article published!");
              router.push("/admin/news");
              router.refresh();
            } else {
              toast.error(result.error ?? "Failed to create article.");
            }
          }
        } catch {
          toast.error("An unexpected error occurred.");
        }
      });
    })();
  };

  // ─── Render ──────────────────────────────────────────────────

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute -top-20 -left-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-10 right-0 h-48 w-96 rounded-full bg-emerald-500/4 blur-3xl"
        aria-hidden
      />

      {/* Header */}
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
              "bg-linear-to-br from-emerald-500/20 to-emerald-500/5",
              "border border-emerald-500/20 shadow-sm shadow-emerald-500/10"
            )}
          >
            <Megaphone className="h-4.5 w-4.5 text-emerald-500" />
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
          </div>
          <div>
            <h2 className="text-[1.05rem] font-bold tracking-tight">
              {isEditing ? "Edit News Article" : "Publish Local News"}
            </h2>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              {isEditing
                ? "Update your community news article"
                : "Share important updates with the community"}
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
          <Link href="/admin/news">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="text-sm">Back</span>
          </Link>
        </Button>
      </motion.div>

      <Form {...form}>
        <form className="space-y-8">
          {/* ── Title ── */}
          <Section icon={Sparkles} label="Headline" accent="#8b5cf6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Write a compelling headline…"
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

          {/* ── Quick Info: Category Tag + Location ── */}
          <Section
            icon={Tag}
            label="Quick Info"
            description="Category & location"
            accent="#06b6d4"
          >
            <div
              className={cn(
                "rounded-2xl border border-border/50",
                "bg-linear-to-br from-muted/20 to-transparent",
                "p-4 space-y-5"
              )}
            >
              {/* Category Tags */}
              <div className="space-y-2">
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/40">
                  Category Tag
                </p>
                <div className="flex flex-wrap gap-2">
                  {LOCAL_NEWS_TAGS.map((tag) => {
                    const isSelected = selectedTag === tag;
                    const color = LOCAL_NEWS_TAG_COLORS[tag];
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() =>
                          form.setValue(
                            "localTag",
                            isSelected ? undefined : tag,
                            { shouldValidate: true }
                          )
                        }
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
                                backgroundColor: `${color}18`,
                                color,
                                borderColor: `${color}40`,
                              }
                            : {}
                        }
                      >
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        {LOCAL_NEWS_TAG_LABELS[tag]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-1.5">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/40">
                        Location
                      </p>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                        <FormControl>
                          <Input
                            placeholder="e.g., Ward 3, Tumin-Lingee"
                            {...field}
                            className={cn(
                              "rounded-xl border-border/50 bg-background/80 pl-9",
                              "text-sm placeholder:text-muted-foreground/30",
                              "focus:border-cyan-400/60 transition-colors"
                            )}
                          />
                        </FormControl>
                      </div>
                    </div>
                    <FormMessage className="text-xs mt-1" />
                  </FormItem>
                )}
              />
            </div>
          </Section>

          {/* ── Urgency ── */}
          <Section
            icon={AlertTriangle}
            label="Urgency Level"
            accent="#f59e0b"
          >
            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {NEWS_URGENCY_OPTIONS.map((option) => {
                        const meta = URGENCY_META[option];
                        const UrgencyIcon = meta.icon;
                        const isSelected = field.value === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              form.setValue("urgency", option, {
                                shouldValidate: true,
                              })
                            }
                            className={cn(
                              "flex-1 flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200",
                              "hover:scale-[1.02] active:scale-[0.98]",
                              isSelected
                                ? "shadow-sm"
                                : "border-border/50 bg-background/60 hover:border-border"
                            )}
                            style={
                              isSelected
                                ? {
                                    borderColor: `${meta.color}50`,
                                    backgroundColor: `${meta.color}08`,
                                  }
                                : {}
                            }
                          >
                            <div
                              className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                                option === "URGENT" && isSelected && "animate-pulse"
                              )}
                              style={{
                                backgroundColor: `${meta.color}15`,
                              }}
                            >
                              <UrgencyIcon
                                className="h-4 w-4"
                                style={{ color: meta.color }}
                              />
                            </div>
                            <div className="text-left">
                              <p
                                className="text-sm font-semibold"
                                style={isSelected ? { color: meta.color } : {}}
                              >
                                {meta.label}
                              </p>
                              <p className="text-[0.65rem] text-muted-foreground/60">
                                {meta.description}
                              </p>
                            </div>
                            {/* Radio indicator */}
                            <div
                              className={cn(
                                "ml-auto h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                                isSelected
                                  ? ""
                                  : "border-border/50"
                              )}
                              style={
                                isSelected
                                  ? { borderColor: meta.color }
                                  : {}
                              }
                            >
                              {isSelected && (
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: meta.color }}
                                />
                              )}
                            </div>
                          </button>
                        );
                      })}
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

          {/* ── Photo Gallery ── */}
          <Section
            icon={ImageIcon}
            label="Photo Gallery"
            description={`${galleryImages.length}/5 photos`}
            accent="#ec4899"
          >
            <FormField
              control={form.control}
              name="galleryImages"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div
                      className={cn(
                        "rounded-2xl border border-border/50",
                        "bg-linear-to-br from-muted/20 to-transparent",
                        "p-4"
                      )}
                    >
                      <GalleryUpload
                        value={field.value}
                        onChange={field.onChange}
                        maxImages={5}
                        maxSizeMB={2}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />
          </Section>

          {/* ── Summary ── */}
          <Section
            icon={FileText}
            label="Summary"
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
                      placeholder="A short, punchy summary for the news feed…"
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

          {/* ── Full Article Content ── */}
          <Section icon={FileText} label="Full Article" accent="#10b981">
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
                        placeholder="Write the full news article…"
                        minHeight={320}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />
          </Section>

          {/* ── Action buttons ── */}
          <motion.div
            variants={itemVariants}
            className={cn(
              "flex items-center justify-between pt-6",
              "border-t border-border/50"
            )}
          >
            <Button
              type="button"
              variant="ghost"
              asChild
              className="rounded-xl text-muted-foreground"
            >
              <Link href="/admin/news">Cancel</Link>
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onSubmit}
                disabled={isPending}
                className={cn(
                  "rounded-xl gap-2 border-border/60",
                  "hover:bg-muted/50"
                )}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isEditing ? "Update Article" : "Save Draft"}
              </Button>

              <Button
                type="button"
                onClick={onSubmit}
                disabled={isPending}
                className={cn(
                  "rounded-xl gap-2",
                  "bg-linear-to-r from-emerald-600 to-emerald-500",
                  "hover:from-emerald-500 hover:to-emerald-400",
                  "shadow-md shadow-emerald-500/20",
                  "text-white"
                )}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Publish
              </Button>
            </div>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}
