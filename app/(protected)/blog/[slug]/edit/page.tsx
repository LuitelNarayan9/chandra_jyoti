import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";

import { getCurrentDbUser } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";
import {
  getBlogPostBySlug,
  getBlogCategories,
  getBlogTags,
} from "@/lib/queries/blog.queries";

import { BlogEditor } from "@/components/blog/blog-editor";
import { Pencil, Sparkles } from "lucide-react";

interface EditPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: EditPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  return {
    title: post ? `Edit: ${post.title}` : "Post Not Found",
    description: "Edit your blog post.",
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  const isOwner = post.authorId === user.id;
  const isMod = hasPermission(user.role, "MODERATOR");
  if (!isOwner && !isMod) redirect("/blog");

  const [categories, tags] = await Promise.all([
    getBlogCategories(),
    getBlogTags(),
  ]);

  return (
    <div className="min-h-screen pb-20">
      {/* ── Page hero ── */}
      <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/40 to-transparent">
        {/* Dot-grid */}
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

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="space-y-3">
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Pencil className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary/80">
                Editing Post
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight font-(family-name:--font-outfit) leading-[1.05]">
              Refine your{" "}
              <span className="relative inline-block">
                story
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-primary to-primary/40"
                />
              </span>
            </h1>

            {/* Post title pill */}
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center max-w-xs truncate px-3 py-1 rounded-full text-xs font-semibold border border-border/60 bg-background/60 text-muted-foreground backdrop-blur-sm">
                "{post.title}"
              </span>
              {post.status === "DRAFT" && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/40">
                  Draft
                </span>
              )}
              {post.status === "PUBLISHED" && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-700/40">
                  Published
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Editor card ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        <div className="rounded-3xl border border-border/50 bg-card shadow-sm shadow-black/5 dark:shadow-black/20 p-6 md:p-8 lg:p-10">
          <BlogEditor
            categories={categories}
            tags={tags}
            initialData={{
              id: post.id,
              title: post.title,
              content: post.content,
              excerpt: post.excerpt,
              coverImage: post.coverImage,
              categoryId: post.categoryId,
              tagIds: post.tags.map((t) => t.tag.id),
              status: post.status as "DRAFT" | "PUBLISHED",
            }}
          />
        </div>

        {/* Tip */}
        <div className="mt-5 flex items-start gap-2.5 px-1">
          <Sparkles className="h-3.5 w-3.5 text-muted-foreground/60 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Tip: Updating the excerpt and cover image keeps your post looking
            fresh on the blog listing.
          </p>
        </div>
      </div>
    </div>
  );
}
