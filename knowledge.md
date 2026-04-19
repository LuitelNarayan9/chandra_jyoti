# Project Knowledge — Chandra Jyoti Dhanbari

## What This Is

Full-stack village community platform for "Chandra Jyoti" Sanstha, Tumin Dhanbari, Gangtok District, Sikkim. Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui (new-york style), Clerk auth, Prisma ORM on self-hosted PostgreSQL, and MinIO for file storage.

## Commands

| Task          | Command                          |
|---------------|----------------------------------|
| Install       | `bun install`                    |
| Dev server    | `bun run dev`                    |
| Build         | `bun run build`                  |
| Lint          | `bun run lint`                   |
| Seed DB       | `bun run seed`                   |
| Prisma generate | `bunx prisma generate`         |
| Prisma migrate  | `bunx prisma migrate dev`      |
| Prisma studio   | `bunx prisma studio`           |
| Add shadcn component | `bunx shadcn@latest add <name>` |

## Key Directories

| Path                  | Purpose                                           |
|-----------------------|---------------------------------------------------|
| `app/(public)/`       | Public pages: landing, about, contact, legal      |
| `app/(auth)/`         | Clerk sign-in/sign-up pages                       |
| `app/(protected)/`    | Auth-required pages: home, blog, forum, family-tree, admin |
| `app/api/`            | API routes: webhooks (Clerk), upload (S3), contact |
| `app/profile/[id]/`   | Public user profile page                          |
| `components/ui/`      | shadcn/ui base components                         |
| `components/shared/`  | Shared components: navbars, sidebar, footer, editors |
| `components/layouts/` | Role-based layout shells (member, admin, super-admin) |
| `components/blog/`    | Blog-specific components                          |
| `components/forum/`   | Forum-specific components                         |
| `components/family-tree/` | D3.js family tree components                  |
| `components/dashboard/` | Dashboard widgets                               |
| `components/landing/` | Landing page sections                             |
| `components/emails/`  | React Email templates                             |
| `lib/actions/`        | Server actions (blog, forum, family-tree, contact, etc.) |
| `lib/queries/`        | Database query helpers                            |
| `lib/validations/`    | Zod schemas for forms                             |
| `prisma/`             | Schema, migrations, seed script                   |
| `types/`              | Shared TypeScript types                           |
| `docs/prd.md`         | Full product requirements document                |
| `tasklist.md`         | Phase-by-phase implementation checklist            |

## Architecture & Conventions

- **Package manager:** Bun (use `bun` for all installs and scripts)
- **Framework:** Next.js 16.1.6 with App Router, React Compiler enabled (`reactCompiler: true`)
- **Styling:** Tailwind CSS v4 with CSS variables; shadcn/ui "new-york" style
- **Auth:** Clerk (`@clerk/nextjs`). Middleware in `proxy.ts`. Webhook syncs users to DB.
- **Database:** Prisma 7 with standard PostgreSQL driver (self-hosted on Oracle Cloud VPS). Client singleton in `lib/db.ts`. Generated client at `lib/generated/prisma/client`.
- **Roles:** GUEST → MEMBER → MODERATOR → ADMIN → SUPER_ADMIN. Hierarchy in `lib/roles.ts` (client-safe). Auth helpers in `lib/auth.ts` (server-only).
- **Server actions pattern:** `"use server"` → authenticate with `requireRole()` → validate with Zod → execute Prisma query → `revalidatePath()` → return result.
- **File uploads:** MinIO (S3-compatible, self-hosted on Oracle Cloud VPS) via `lib/s3.ts`. Upload API at `app/api/upload/route.ts`.
- **Rich text:** Tiptap editor (`components/shared/rich-text-editor.tsx`) and viewer.
- **Icons:** Lucide React (`lucide-react`)
- **Animations:** Framer Motion (`framer-motion`)
- **Charts:** Recharts
- **Family tree visualization:** D3.js (d3-dag for DAG layout)
- **Forms:** React Hook Form + Zod (`@hookform/resolvers`)
- **Email:** Nodemailer via `lib/mailer.ts` with React Email templates
- **Toasts:** Sonner (`sonner`)
- **Path aliases:** `@/*` maps to project root
- **Fonts:** Outfit (headings) + Inter (body) via `next/font`
- **Dark mode:** `next-themes` with system preference detection

## Formatting

- Prettier: double quotes, semicolons, 2-space indent, trailing commas (es5), LF line endings
- ESLint: next/core-web-vitals + next/typescript + prettier config

## Current Progress (branch: phase6.3)

Phases 1–6 complete (foundation, public pages, dashboard, family tree, blog system, forum system). Phase 7 (News System) is next per `tasklist.md`.

## Gotchas

- Prisma client is generated to `lib/generated/prisma/client` — import from `@/lib/generated/prisma/client` for types, use `db` from `@/lib/db` for queries.
- Clerk middleware lives in `proxy.ts` (not `middleware.ts`).
- Tailwind v4 uses the new syntax: `bg-linear-to-r` instead of `bg-gradient-to-r`, `font-(family-name:--font-outfit)` instead of `font-[family-name:var(--font-outfit)]`.
- The `lib/roles.ts` module is safe for client components (no server imports). Use `lib/auth.ts` only in server contexts.
- Layout shell is role-based: `components/layouts/role-layout-shell.tsx` switches between member/admin/super-admin sidebars.
- Images are unoptimized in next.config (`images.unoptimized: true`).
- React Compiler is enabled via `babel-plugin-react-compiler`.
