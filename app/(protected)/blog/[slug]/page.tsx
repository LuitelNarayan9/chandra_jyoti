import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getCurrentDbUser } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";
import {
  getBlogPostBySlug,
  getUserPostInteractions,
  getRelatedPosts,
  getPostComments,
  getTopLevelCommentCount,
} from "@/lib/queries/blog.queries";

import { RichTextViewer } from "@/components/shared/rich-text-viewer";
import { BlogDetailHeader } from "@/components/blog/blog-detail-header";
import { BlogTableOfContents } from "@/components/blog/blog-table-of-contents";
import { BlogAuthorBio } from "@/components/blog/blog-author-bio";
import { BlogRelatedPosts } from "@/components/blog/blog-related-posts";
import { BlogPostActions } from "@/components/blog/blog-post-actions";
import { BlogViewCounter } from "@/components/blog/blog-view-counter";
import { CommentSection } from "@/components/blog/comments/comment-section";

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

  const [interactions, relatedPosts, rawComments, topLevelCount] =
    await Promise.all([
      user
        ? getUserPostInteractions(user.id, post.id)
        : { liked: false, bookmarked: false },
      getRelatedPosts(post.id, post.categoryId),
      getPostComments(post.id),
      getTopLevelCommentCount(post.id),
    ]);

  // Recursively map likedByMe onto comments
  const mapComments = (comments: any[]): any[] => {
    return comments.map((c) => ({
      ...c,
      likedByMe: user ? c.likes?.some((l: any) => l.userId === user.id) : false,
      replies: c.replies ? mapComments(c.replies) : [],
    }));
  };
  const comments = mapComments(rawComments);

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
            <CommentSection
              comments={comments}
              postId={post.id}
              totalComments={topLevelCount}
              postAuthorId={post.authorId}
              currentUser={user as any}
            />

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
