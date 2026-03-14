import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getCurrentDbUser } from "@/lib/auth";
import { getBlogCategories, getBlogTags } from "@/lib/queries/blog.queries";
import { BlogEditor } from "@/components/blog/blog-editor";
import { PenLine, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Post | Blog | Chandra Jyoti Sanstha",
  description: "Write a new blog post for the community.",
};

export default async function CreatePostPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  const [categories, tags] = await Promise.all([
    getBlogCategories(),
    getBlogTags(),
  ]);

  return (
    <div className="min-h-screen pb-20">
      {/* ── Page hero ── */}
      <div className="relative overflow-hidden border-b border-border/60 bg-linear-to-b from-muted/40 to-transparent">
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
          className="pointer-events-none absolute -top-16 left-1/4 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-8 right-1/3 h-36 w-36 rounded-full bg-primary/5 blur-2xl"
        />

        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="space-y-3">
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <PenLine className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary/80">
                New Post
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight font-(family-name:--font-outfit) leading-[1.05]">
              Share your{" "}
              <span className="relative inline-block">
                thoughts
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-linear-to-r from-primary to-primary/40"
                />
              </span>
            </h1>

            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Write something meaningful for the Chandra Jyoti Sanstha
              community.
            </p>
          </div>
        </div>
      </div>

      {/* ── Editor card ── */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-10">
        <div className="rounded-3xl border border-border/50 bg-card shadow-sm shadow-black/5 dark:shadow-black/20 p-6 md:p-8 lg:p-10">
          <BlogEditor categories={categories} tags={tags} />
        </div>

        {/* Writing tip */}
        <div className="mt-5 flex items-start gap-2.5 px-1">
          <Sparkles className="h-3.5 w-3.5 text-muted-foreground/60 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Tip: A great post has a clear title, a short excerpt for previews,
            and a cover image that represents the story.
          </p>
        </div>
      </div>
    </div>
  );
}
