import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getCurrentDbUser } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";
import {
  getBlogPostBySlug,
  getUserPostInteractions,
  getRelatedPosts,
} from "@/lib/queries/blog.queries";

import { RichTextViewer } from "@/components/shared/rich-text-viewer";
import { BlogDetailHeader } from "@/components/blog/blog-detail-header";
import { BlogTableOfContents } from "@/components/blog/blog-table-of-contents";
import { BlogAuthorBio } from "@/components/blog/blog-author-bio";
import { BlogRelatedPosts } from "@/components/blog/blog-related-posts";
import { BlogPostActions } from "@/components/blog/blog-post-actions";
import { BlogViewCounter } from "@/components/blog/blog-view-counter";
import { MessageSquare } from "lucide-react";

// ─── Dynamic metadata ──────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const description =
    post.excerpt ?? post.content.replace(/<[^>]*>/g, "").substring(0, 160);

  return {
    title: `${post.title} | Blog`,
    description,
    openGraph: {
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : [],
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [`${post.author.firstName} ${post.author.lastName}`],
    },
  };
}

// ─── Page component ────────────────────────────────────────────────────────

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const [post, user] = await Promise.all([
    getBlogPostBySlug(slug),
    getCurrentDbUser(),
  ]);

  if (!post || (post.status !== "PUBLISHED" && post.authorId !== user?.id)) {
    notFound();
  }

  const [interactions, relatedPosts] = await Promise.all([
    user
      ? getUserPostInteractions(user.id, post.id)
      : { liked: false, bookmarked: false },
    getRelatedPosts(post.id, post.categoryId),
  ]);

  const canEdit =
    user &&
    (user.id === post.authorId || hasPermission(user.role, "MODERATOR"));

  return (
    <div className="min-h-screen pb-20">
      {/* Fire view counter silently */}
      <BlogViewCounter postId={post.id} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-0">
        {/* ── Header: back nav, category, title, author, cover image ── */}
        <BlogDetailHeader post={post} canEdit={!!canEdit} />

        {/* ── Top actions bar ── */}
        <div className="mt-6 flex items-center justify-between py-3 border-y border-border/50">
          <BlogPostActions
            postId={post.id}
            slug={post.slug}
            initialLiked={interactions.liked}
            initialBookmarked={interactions.bookmarked}
            totalLikes={post._count.likes}
            totalComments={post._count.comments}
          />
          {/* Draft badge */}
          {post.status !== "PUBLISHED" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/40">
              Draft
            </span>
          )}
        </div>

        {/* ── Main content + TOC sidebar ── */}
        <div className="mt-10 grid lg:grid-cols-[1fr_220px] gap-12 xl:gap-16 items-start">
          {/* Article */}
          <article className="min-w-0 space-y-10">
            {/* Rich text body */}
            <div
              data-blog-content
              className="prose prose-neutral dark:prose-invert max-w-none
                prose-headings:font-(family-name:--font-outfit) prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-24
                prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                prose-p:leading-relaxed prose-p:text-[15px]
                prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline
                prose-blockquote:border-l-primary/40 prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-blockquote:font-normal
                prose-img:rounded-2xl prose-img:shadow-md
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                prose-pre:rounded-2xl prose-pre:border prose-pre:border-border/50
                prose-hr:border-border/50
              "
            >
              <RichTextViewer content={post.content} />
            </div>

            {/* Bottom actions */}
            <div className="flex items-center justify-between py-3 border-y border-border/50">
              <BlogPostActions
                postId={post.id}
                slug={post.slug}
                initialLiked={interactions.liked}
                initialBookmarked={interactions.bookmarked}
                totalLikes={post._count.likes}
                totalComments={post._count.comments}
              />
            </div>

            {/* Author bio */}
            <BlogAuthorBio author={post.author} />

            {/* Comments section */}
            <section id="comments-section" className="space-y-5 scroll-mt-20">
              {/* Section header */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60 whitespace-nowrap">
                  ✦ Discussion
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border" />
              </div>

              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-lg font-black font-(family-name:--font-outfit) tracking-tight">
                  Comments
                  <span className="ml-2 text-sm font-semibold text-muted-foreground">
                    ({post._count.comments})
                  </span>
                </h3>
              </div>

              {/* Placeholder */}
              <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/60 bg-muted/20 px-8 py-14 text-center">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: "24px 24px",
                  }}
                />
                <p className="relative text-sm text-muted-foreground">
                  Comments coming soon — stay tuned!
                </p>
              </div>
            </section>

            {/* Related posts */}
            <BlogRelatedPosts posts={relatedPosts} />
          </article>

          {/* Sticky TOC sidebar */}
          <aside className="hidden lg:block">
            <BlogTableOfContents content={post.content} />
          </aside>
        </div>
      </div>
    </div>
  );
}
