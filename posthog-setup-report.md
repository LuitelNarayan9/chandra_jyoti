<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Chandra Jyoti Sanstha community platform.

## Summary of changes

- **`instrumentation-client.ts`** — Fixed `ui_host` from `https://eu.posthog.com` to `https://us.posthog.com` to match the project's US PostHog instance.
- **`next.config.ts`** — Updated reverse proxy destinations from EU (`eu-assets.i.posthog.com`, `eu.i.posthog.com`) to US (`us-assets.i.posthog.com`, `us.i.posthog.com`) endpoints.
- **`.env.example`** — Corrected env key name from `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` to `NEXT_PUBLIC_POSTHOG_TOKEN` to match the rest of the codebase.
- **`.env.local`** — Set correct values for `NEXT_PUBLIC_POSTHOG_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`.
- **`components/blog/comments/comment-form.tsx`** — Added `blog_comment_posted` event capture on successful comment or reply submission.
- **`components/forum/thread-actions.tsx`** — Added `forum_thread_deleted` and `forum_thread_moderated` (pin/lock actions) event captures.

The following were already in place from a prior integration: client-side PostHog init (`instrumentation-client.ts`), server-side PostHog client (`lib/posthog-server.ts`), user identification via Clerk (`components/providers/posthog-identifier.tsx`), and 12 tracked events across blog, forum, family tree, admin, and contact flows.

## Events instrumented

| Event | Description | File |
|---|---|---|
| `user_signed_up` | New user account created via Clerk webhook | `app/api/webhooks/clerk/route.ts` |
| `contact_form_submitted` | Contact form submitted successfully (server-side) | `app/api/contact/route.ts` |
| `family_tree_join_submitted` | User submitted a family tree join request | `components/family-tree/join-tree-form.tsx` |
| `forum_thread_created` | New forum thread created | `components/forum/thread-editor.tsx` |
| `forum_reply_posted` | Reply posted on a forum thread | `components/forum/reply-form.tsx` |
| `forum_content_voted` | Thread or reply upvoted/downvoted | `components/forum/vote-buttons.tsx` |
| `blog_post_published` | Blog post created or updated (draft or published) | `components/blog/blog-editor.tsx` |
| `blog_post_liked` | Blog post liked or unliked | `components/blog/blog-post-actions.tsx` |
| `blog_post_bookmarked` | Blog post bookmarked or removed from bookmarks | `components/blog/blog-post-actions.tsx` |
| `blog_post_shared` | Blog post shared via native share or clipboard | `components/blog/blog-post-actions.tsx` |
| `residency_request_approved` | Admin approved a family tree residency request | `components/admin/residency-requests-table.tsx` |
| `residency_request_rejected` | Admin rejected a family tree residency request | `components/admin/residency-requests-table.tsx` |
| `blog_comment_posted` ✨ | Comment or reply posted on a blog post | `components/blog/comments/comment-form.tsx` |
| `forum_thread_deleted` ✨ | Forum thread deleted by owner or moderator | `components/forum/thread-actions.tsx` |
| `forum_thread_moderated` ✨ | Forum thread pinned/unpinned or locked/unlocked | `components/forum/thread-actions.tsx` |

## Next steps

We've built a dashboard and five insights to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — [Analytics basics](/dashboard/1549764)**
- **Insight — [New User Signups](/insights/8H7aF86Z)** — Daily signup trend (last 30 days)
- **Insight — [Content Creation](/insights/UQ378Ovx)** — Blog posts published + forum threads created daily
- **Insight — [Community Engagement](/insights/XpO8IHO0)** — Forum replies, blog comments, and votes daily
- **Insight — [Family Tree Join Conversion](/insights/y8Murehq)** — Join requests submitted vs approvals (last 90 days, weekly)
- **Insight — [Blog Post Interactions](/insights/PeTshaTh)** — Blog post likes, bookmarks, and shares daily

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
