import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { PenLine, Sparkles } from "lucide-react";

import { getCurrentDbUser } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";
import {
  getThreadBySlug,
  getForumCategories,
  getForumTags,
} from "@/lib/queries/forum.queries";
import { ThreadEditor } from "@/components/forum/thread-editor";

export const metadata: Metadata = {
  title: "Edit Thread | Forum | Chandra Jyoti Sanstha",
  description: "Edit your forum thread.",
};

interface PageProps {
  params: Promise<{ categorySlug: string; threadSlug: string }>;
}

export default async function EditThreadPage({ params }: PageProps) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  const { categorySlug, threadSlug } = await params;

  const [thread, categories, tags] = await Promise.all([
    getThreadBySlug(categorySlug, threadSlug),
    getForumCategories(),
    getForumTags(),
  ]);

  if (!thread) notFound();

  // Only author or moderator+ can edit
  const isOwner = thread.author.id === user.id;
  const isMod = hasPermission(user.role, "MODERATOR");
  if (!isOwner && !isMod) redirect(`/forum/${categorySlug}/${threadSlug}`);

  return (
    <div className="min-h-screen pb-20">
      {/* ── Page hero ── */}
      <div className="relative overflow-hidden border-b border-border/60 bg-linear-to-b from-muted/40 to-transparent">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 left-1/4 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <PenLine className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary/80">
                Edit Thread
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight font-(family-name:--font-outfit) leading-[1.05]">
              Edit your thread
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Update the title, content, category, or tags of your thread.
            </p>
          </div>
        </div>
      </div>

      {/* ── Editor card ── */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-10">
        <div className="max-w-3xl mx-auto rounded-3xl border border-border/50 bg-card shadow-sm shadow-black/5 dark:shadow-black/20 p-6 md:p-8 lg:p-10">
          <ThreadEditor
            categories={categories}
            tags={tags}
            initialData={{
              id: thread.id,
              title: thread.title,
              content: thread.content,
              categoryId: thread.category.id,
              tagIds: thread.tags.map(({ tag }) => tag.id),
            }}
          />
        </div>

        <div className="max-w-3xl mx-auto mt-5 flex items-start gap-2.5 px-1">
          <Sparkles className="h-3.5 w-3.5 text-muted-foreground/60 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Changes will be visible to all community members immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
