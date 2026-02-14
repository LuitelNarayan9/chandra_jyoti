# API Implementation Document

# Chandra Jyoti Sanstha — Complete API Reference

> Comprehensive API documentation covering all endpoints, server actions, webhooks,
> middleware, and data flows for the Chandra Jyoti Sanstha community platform.

**Version:** 1.0.0
**Date:** February 14, 2026
**Based on:** PRD v1.0.0

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Authentication & Middleware](#2-authentication--middleware)
3. [API Route Handlers](#3-api-route-handlers)
4. [Server Actions — User Module](#4-server-actions--user-module)
5. [Server Actions — Blog Module](#5-server-actions--blog-module)
6. [Server Actions — Forum Module](#6-server-actions--forum-module)
7. [Server Actions — Family Tree Module](#7-server-actions--family-tree-module)
8. [Server Actions — News Module](#8-server-actions--news-module)
9. [Server Actions — Payment Module](#9-server-actions--payment-module)
10. [Server Actions — Analytics Module](#10-server-actions--analytics-module)
11. [Server Actions — Notification Module](#11-server-actions--notification-module)
12. [Server Actions — Contact & Testimonials](#12-server-actions--contact--testimonials)
13. [Server Actions — Admin Module](#13-server-actions--admin-module)
14. [Webhook Implementations](#14-webhook-implementations)
15. [Cron Job Endpoints](#15-cron-job-endpoints)
16. [Error Handling](#16-error-handling)
17. [Rate Limiting](#17-rate-limiting)
18. [Type Definitions & Zod Schemas](#18-type-definitions--zod-schemas)

---

## 1. Architecture Overview

### 1.1 API Strategy

This platform uses a **hybrid API architecture**:

| Layer                 | Technology             | Use Case                                                       |
| --------------------- | ---------------------- | -------------------------------------------------------------- |
| **Server Actions**    | Next.js `"use server"` | All data mutations (create, update, delete)                    |
| **API Routes**        | Next.js `app/api/`     | Webhooks, file uploads, external APIs, cron jobs, data exports |
| **Server Components** | React RSC              | All data fetching (reads) via direct Prisma queries            |

### 1.2 Server Action Pattern

Every server action follows this standardized pipeline:

```typescript
"use server";

import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function actionName(input: z.infer<typeof InputSchema>) {
  // 1. AUTHENTICATE — verify user session via Clerk
  const user = await requireRole("MEMBER");

  // 2. VALIDATE — parse and validate input with Zod
  const validated = InputSchema.parse(input);

  // 3. AUTHORIZE — check ownership or role-specific permissions
  // e.g., check if user owns the resource or has elevated role

  // 4. EXECUTE — perform the database operation via Prisma
  const result = await db.model.create({ data: validated });

  // 5. TRACK — log analytics event (async, non-blocking)
  trackEvent("action_name", { userId: user.id, ...metadata }).catch(() => {});

  // 6. NOTIFY — send notifications to relevant users (async)
  sendNotification({ ... }).catch(() => {});

  // 7. REVALIDATE — invalidate Next.js cache for affected paths
  revalidatePath("/affected/path");

  // 8. RETURN — return result or redirect
  return { success: true, data: result };
}
```

### 1.3 API Response Format

All server actions and API routes return a consistent response shape:

```typescript
// Success Response
type ActionSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

// Error Response
type ActionError = {
  success: false;
  error: string;
  code?: string; // "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "CONFLICT" | "RATE_LIMITED"
};

// Paginated Response
type PaginatedResponse<T> = {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};
```

### 1.4 Role Hierarchy

```
SUPER_ADMIN (Level 4) → Full platform control
    └── ADMIN (Level 3) → Manage content, users, finances
        └── MODERATOR (Level 2) → Moderate content
            └── MEMBER (Level 1) → Create content, interact
                └── GUEST (Level 0) → Public pages only
```

---

## 2. Authentication & Middleware

### 2.1 Clerk Middleware (`proxy.ts`)

**Purpose:** Protects routes, syncs sessions, tracks page views.

```typescript
// proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/contact",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/cron(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

**Route Protection Rules:**

| Route Pattern       | Access    | Description                                |
| ------------------- | --------- | ------------------------------------------ |
| `/`                 | Public    | Landing page                               |
| `/about`            | Public    | About us page                              |
| `/contact`          | Public    | Contact page                               |
| `/sign-in(.*)`      | Public    | Clerk sign-in                              |
| `/sign-up(.*)`      | Public    | Clerk sign-up                              |
| `/api/webhooks(.*)` | Public    | Webhook endpoints                          |
| `/api/cron(.*)`     | Public    | Cron endpoints (secured via `CRON_SECRET`) |
| Everything else     | Protected | Requires Clerk session                     |

### 2.2 Authorization Helper (`lib/auth.ts`)

```typescript
// lib/auth.ts
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

const ROLE_HIERARCHY: Record<Role, number> = {
  GUEST: 0,
  MEMBER: 1,
  MODERATOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

/**
 * Get current user from database (returns null if not authenticated)
 */
export async function getCurrentDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return db.user.findUnique({ where: { clerkId: userId } });
}

/**
 * Require minimum role — throws if user doesn't have sufficient permissions
 * @throws Error("Unauthorized") if not logged in
 * @throws Error("Insufficient permissions") if role too low
 */
export async function requireRole(minimumRole: Role) {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("Unauthorized");
  if (ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[minimumRole]) {
    throw new Error("Insufficient permissions");
  }
  return user;
}

/**
 * Check if a user's role meets the required level
 */
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
```

### 2.3 Rate Limiting (`lib/rate-limit.ts`)

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// General API rate limit: 60 requests/minute
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "api",
});

// Auth rate limit: 10 attempts/minute
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "auth",
});

// Upload rate limit: 10 uploads/minute
export const uploadRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "upload",
});

// Payment rate limit: 5 payments/minute
export const paymentRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "payment",
});
```

---

## 3. API Route Handlers

### 3.1 File Upload — `POST /api/upload`

**Purpose:** Generate presigned URL for S3 uploads or upload file directly.
**Auth:** MEMBER+
**Rate Limit:** 10/minute

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { uploadRateLimit } from "@/lib/rate-limit";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("MEMBER");

    // Rate limit check
    const { success: allowed } = await uploadRateLimit.limit(user.id);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded", code: "RATE_LIMITED" },
        { status: 429 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size: 10MB" },
        { status: 400 },
      );
    }

    // Generate unique key
    const ext = file.name.split(".").pop();
    const key = `${folder}/${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    // Upload to S3
    const buffer = Buffer.from(await file.arrayBuffer());
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({
      success: true,
      data: { url, key, fileName: file.name, fileSize: file.size },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Upload failed" },
      { status: error.message === "Unauthorized" ? 401 : 500 },
    );
  }
}
```

**Request:** `multipart/form-data`

| Field    | Type   | Required | Description                                                                                       |
| -------- | ------ | -------- | ------------------------------------------------------------------------------------------------- |
| `file`   | File   | Yes      | The file to upload                                                                                |
| `folder` | string | No       | S3 folder (default: `"uploads"`) — options: `avatars`, `blog`, `news`, `family-tree`, `documents` |

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://bucket.s3.region.amazonaws.com/blog/userId/timestamp-uuid.jpg",
    "key": "blog/userId/timestamp-uuid.jpg",
    "fileName": "photo.jpg",
    "fileSize": 245760
  }
}
```

---

### 3.2 External News — `GET /api/news/external`

**Purpose:** Fetch external news from NewsAPI and cache in database.
**Auth:** MEMBER+

```typescript
// app/api/news/external/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = "https://newsapi.org/v2";

export async function GET(req: NextRequest) {
  try {
    await requireRole("MEMBER");

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "STATE"; // LOCAL | STATE | NATIONAL | INTERNATIONAL
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    // First check DB cache
    const cached = await db.newsArticle.findMany({
      where: {
        source: "EXTERNAL",
        category: category as any,
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalCount = await db.newsArticle.count({
      where: { source: "EXTERNAL", category: category as any },
    });

    return NextResponse.json({
      success: true,
      data: cached,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNext: page * pageSize < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
```

**Query Parameters:**

| Param      | Type   | Default   | Options                                       |
| ---------- | ------ | --------- | --------------------------------------------- |
| `category` | string | `"STATE"` | `LOCAL`, `STATE`, `NATIONAL`, `INTERNATIONAL` |
| `page`     | number | `1`       | —                                             |
| `pageSize` | number | `20`      | Max: 50                                       |

---

### 3.3 Export Analytics — `GET /api/export/analytics`

**Purpose:** Export analytics data as CSV.
**Auth:** ADMIN+

```typescript
// app/api/export/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN");

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const format = searchParams.get("format") || "csv"; // csv | json

    const where: any = {};
    if (startDate) where.createdAt = { gte: new Date(startDate) };
    if (endDate)
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

    const events = await db.analyticsEvent.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10000, // cap at 10k rows
    });

    if (format === "json") {
      return NextResponse.json({ success: true, data: events });
    }

    // Generate CSV
    const headers = "ID,Event Type,Page URL,User,Device,Browser,Created At\n";
    const rows = events
      .map(
        (e) =>
          `${e.id},${e.eventType},${e.pageUrl || ""},${e.user?.firstName || "Anonymous"},${e.deviceType || ""},${e.browser || ""},${e.createdAt.toISOString()}`,
      )
      .join("\n");

    return new NextResponse(headers + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=analytics-${Date.now()}.csv`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
```

**Query Parameters:**

| Param       | Type       | Required | Description               |
| ----------- | ---------- | -------- | ------------------------- |
| `startDate` | ISO string | No       | Filter from date          |
| `endDate`   | ISO string | No       | Filter to date            |
| `format`    | string     | No       | `csv` (default) or `json` |

---

### 3.4 Export Family Tree — `GET /api/export/family-tree`

**Purpose:** Export family tree data as JSON or CSV.
**Auth:** ADMIN+

```typescript
// app/api/export/family-tree/route.ts
export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN");

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";
    const clan = searchParams.get("clan");

    const where: any = { isApproved: true };
    if (clan) where.familyClan = clan;

    const members = await db.familyMember.findMany({
      where,
      include: {
        lifeEvents: true,
        addedByUser: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    if (format === "json") {
      return NextResponse.json({ success: true, data: members });
    }

    // CSV export
    const headers =
      "ID,Full Name,Clan,Gender,Birth Date,Death Date,Father ID,Mother ID,Spouse ID,Added By\n";
    const rows = members
      .map(
        (m) =>
          `${m.id},"${m.fullName}",${m.familyClan || ""},${m.gender},${m.birthDate?.toISOString() || ""},${m.deathDate?.toISOString() || ""},${m.fatherId || ""},${m.motherId || ""},${m.spouseId || ""},"${m.addedByUser?.firstName || ""} ${m.addedByUser?.lastName || ""}"`,
      )
      .join("\n");

    return new NextResponse(headers + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=family-tree-${Date.now()}.csv`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
```

---

### 3.5 Export Financial Data — `GET /api/export/financial`

**Purpose:** Export donations, fines, and campaign data.
**Auth:** ADMIN+

**Query Parameters:**

| Param       | Type       | Default | Options                                  |
| ----------- | ---------- | ------- | ---------------------------------------- |
| `type`      | string     | `"all"` | `all`, `donations`, `fines`, `campaigns` |
| `startDate` | ISO string | —       | Filter from                              |
| `endDate`   | ISO string | —       | Filter to                                |
| `format`    | string     | `"csv"` | `csv`, `json`, `pdf`                     |

**Response:** File download (CSV/PDF) or JSON object.
---

## 4. Server Actions — User Module

**File:** `actions/user.ts`

### 4.1 `syncUser` — Clerk Webhook User Sync

Called internally by the Clerk webhook handler, not by client code.

| Property | Value |
|----------|-------|
| **Trigger** | Clerk webhook (`user.created`, `user.updated`, `user.deleted`) |
| **Auth** | SYSTEM (webhook signature verified) |
| **Revalidates** | — |

```typescript
"use server";

export async function syncUser(clerkData: ClerkWebhookUserData) {
  // Upsert user in database from Clerk data
  const user = await db.user.upsert({
    where: { clerkId: clerkData.id },
    update: {
      email: clerkData.email_addresses[0]?.email_address,
      firstName: clerkData.first_name,
      lastName: clerkData.last_name,
      avatar: clerkData.image_url,
      isActive: !clerkData.banned,
    },
    create: {
      clerkId: clerkData.id,
      email: clerkData.email_addresses[0]?.email_address!,
      firstName: clerkData.first_name || "",
      lastName: clerkData.last_name || "",
      avatar: clerkData.image_url,
      role: "MEMBER", // default role
    },
  });
  return user;
}
```

### 4.2 `updateProfile` — Update Own Profile

| Property | Value |
|----------|-------|
| **Auth** | MEMBER+ |
| **Input** | `UpdateProfileSchema` |
| **Revalidates** | `/profile`, `/home` |

**Input Schema:**

```typescript
const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
});
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "firstName": "Rajesh",
    "lastName": "Sharma",
    "email": "rajesh@example.com",
    "phoneNumber": "+919876543210",
    "bio": "Village resident",
    "avatar": "https://s3.../avatars/avatar.jpg"
  }
}
```

### 4.3 `updateUserRole` — Change User Role

| Property | Value |
|----------|-------|
| **Auth** | SUPER_ADMIN for promoting to ADMIN; ADMIN for promoting to MODERATOR |
| **Input** | `{ userId: string, newRole: Role }` |
| **Revalidates** | `/admin/users` |
| **Notifications** | Sends notification to affected user |

```typescript
const UpdateUserRoleSchema = z.object({
  userId: z.string().cuid(),
  newRole: z.enum(["MEMBER", "MODERATOR", "ADMIN", "SUPER_ADMIN"]),
});
```

**Authorization Rules:**
- ADMIN can assign: MEMBER, MODERATOR
- SUPER_ADMIN can assign: MEMBER, MODERATOR, ADMIN, SUPER_ADMIN
- Cannot change own role
- Cannot demote a user above own level

### 4.4 `deactivateUser` — Soft-Delete User

| Property | Value |
|----------|-------|
| **Auth** | ADMIN+ |
| **Input** | `{ userId: string, reason?: string }` |
| **Revalidates** | `/admin/users` |

Sets `isActive = false` on the user record. Does **not** delete from Clerk.

---

## 5. Server Actions — Blog Module

**File:** `actions/blog.ts`

### 5.1 `createPost` — Create Blog Post

| Property         | Value                         |
| ---------------- | ----------------------------- |
| **Auth**         | MEMBER+                       |
| **Input**        | `CreatePostSchema`            |
| **Revalidates**  | `/blog`, `/home`              |
| **Notification** | Notifies followers on publish |

```typescript
const CreatePostSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(50), // Rich HTML from Tiptap
  excerpt: z.string().max(300).optional(),
  coverImage: z.string().url().optional(),
  categoryId: z.string().cuid(),
  tagIds: z.array(z.string().cuid()).max(5).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  scheduledAt: z.string().datetime().optional(), // for scheduled publishing
});
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "title": "Village Festival 2026",
    "slug": "village-festival-2026",
    "status": "DRAFT",
    "createdAt": "2026-02-14T18:00:00.000Z"
  }
}
```

**Slug Generation:** Auto-generated from title using `slugify(title)`. If slug exists, appends `-2`, `-3`, etc.

### 5.2 `updatePost` — Edit Blog Post

| Property        | Value                            |
| --------------- | -------------------------------- |
| **Auth**        | MEMBER (own) or MODERATOR+ (any) |
| **Input**       | `UpdatePostSchema`               |
| **Revalidates** | `/blog`, `/blog/[slug]`          |

```typescript
const UpdatePostSchema = z.object({
  postId: z.string().cuid(),
  title: z.string().min(5).max(200).optional(),
  content: z.string().min(50).optional(),
  excerpt: z.string().max(300).optional(),
  coverImage: z.string().url().optional().nullable(),
  categoryId: z.string().cuid().optional(),
  tagIds: z.array(z.string().cuid()).max(5).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});
```

### 5.3 `deletePost` — Delete Blog Post

| Property        | Value                            |
| --------------- | -------------------------------- |
| **Auth**        | MEMBER (own) or MODERATOR+ (any) |
| **Input**       | `{ postId: string }`             |
| **Revalidates** | `/blog`                          |

Soft-deletes the post (sets `isDeleted: true`) instead of hard delete to preserve data integrity.

### 5.4 `publishPost` — Publish a Draft Post

| Property         | Value                                             |
| ---------------- | ------------------------------------------------- |
| **Auth**         | MEMBER+ (own post)                                |
| **Input**        | `{ postId: string }`                              |
| **Revalidates**  | `/blog`, `/blog/[slug]`, `/home`                  |
| **Side Effects** | Sets `publishedAt` to now, tracks analytics event |

### 5.5 `likePost` — Toggle Like on Post

| Property         | Value                                      |
| ---------------- | ------------------------------------------ |
| **Auth**         | MEMBER+                                    |
| **Input**        | `{ postId: string }`                       |
| **Revalidates**  | `/blog/[slug]`                             |
| **Notification** | Notifies post author (on like, not unlike) |

```typescript
// Toggle behavior:
// - If like exists → delete it (unlike)
// - If like doesn't exist → create it (like)
// Uses upsert with @@unique([userId, postId])
```

**Response:**

```json
{
  "success": true,
  "data": { "liked": true, "totalLikes": 42 }
}
```

### 5.6 `bookmarkPost` — Toggle Bookmark

| Property        | Value                             |
| --------------- | --------------------------------- |
| **Auth**        | MEMBER+                           |
| **Input**       | `{ postId: string }`              |
| **Revalidates** | `/blog/[slug]`, `/blog/bookmarks` |

Same toggle pattern as `likePost`. Uses `@@unique([userId, postId])`.

### 5.7 `addComment` — Add Comment (Supports Nesting)

| Property         | Value                                                   |
| ---------------- | ------------------------------------------------------- |
| **Auth**         | MEMBER+                                                 |
| **Input**        | `AddCommentSchema`                                      |
| **Revalidates**  | `/blog/[slug]`                                          |
| **Notification** | Notifies post author + parent comment author (if reply) |

```typescript
const AddCommentSchema = z.object({
  postId: z.string().cuid(),
  content: z.string().min(1).max(2000),
  parentId: z.string().cuid().optional(), // for nested replies
});
```

**Nesting:** Comments support 2 levels of nesting (`parentId` → parent comment). Deeper replies are flattened to level 2.

### 5.8 `deleteComment` — Delete Comment

| Property        | Value                            |
| --------------- | -------------------------------- |
| **Auth**        | MEMBER (own) or MODERATOR+ (any) |
| **Input**       | `{ commentId: string }`          |
| **Revalidates** | `/blog/[slug]`                   |

Cascading delete: removes all child comments as well.

### 5.9 `pinComment` — Pin Comment on Own Post

| Property        | Value                     |
| --------------- | ------------------------- |
| **Auth**        | MEMBER (post author only) |
| **Input**       | `{ commentId: string }`   |
| **Revalidates** | `/blog/[slug]`            |

Only the **post author** can pin a comment. Only one comment can be pinned per post (unpins previous).

### 5.10 `reportComment` — Report Inappropriate Comment

| Property         | Value                     |
| ---------------- | ------------------------- |
| **Auth**         | MEMBER+                   |
| **Input**        | `ReportSchema`            |
| **Notification** | Notifies MODERATOR+ users |

```typescript
const ReportSchema = z.object({
  commentId: z.string().cuid(),
  reason: z.string().min(10).max(500),
  description: z.string().max(2000).optional(),
});
```

---

## 6. Server Actions — Forum Module

**File:** `actions/forum.ts`

### 6.1 `createThread` — Create Forum Thread

| Property        | Value                                          |
| --------------- | ---------------------------------------------- |
| **Auth**        | MEMBER+ (respects `minRoleToPost` on category) |
| **Input**       | `CreateThreadSchema`                           |
| **Revalidates** | `/forum`, `/forum/[categorySlug]`              |

```typescript
const CreateThreadSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(20), // Rich HTML from Tiptap
  categoryId: z.string().cuid(),
  tags: z.array(z.string()).max(5).optional(),
  poll: z
    .object({
      question: z.string().min(5).max(200),
      options: z.array(z.string().min(1).max(100)).min(2).max(10),
      isMultiChoice: z.boolean().default(false),
    })
    .optional(),
});
```

**Notes:**

- Some categories (e.g., "Announcements", "Sanstha Business") require ADMIN role
- Optionally creates an attached poll in the same transaction
- Slug auto-generated from title

### 6.2 `updateThread` — Edit Thread

| Property        | Value                                                                         |
| --------------- | ----------------------------------------------------------------------------- |
| **Auth**        | MEMBER (own) or MODERATOR+ (any)                                              |
| **Input**       | `{ threadId: string, title?: string, content?: string, categoryId?: string }` |
| **Revalidates** | `/forum/[categorySlug]/[threadSlug]`                                          |

### 6.3 `deleteThread` — Delete Thread

| Property        | Value                             |
| --------------- | --------------------------------- |
| **Auth**        | MODERATOR+                        |
| **Input**       | `{ threadId: string }`            |
| **Revalidates** | `/forum`, `/forum/[categorySlug]` |

Cascade deletes all replies, votes, polls, and poll votes.

### 6.4 `lockThread` — Lock/Unlock Thread

| Property        | Value                                     |
| --------------- | ----------------------------------------- |
| **Auth**        | MODERATOR+                                |
| **Input**       | `{ threadId: string, isLocked: boolean }` |
| **Revalidates** | `/forum/[categorySlug]/[threadSlug]`      |

Locked threads prevent new replies but remain visible.

### 6.5 `pinThread` — Pin/Unpin Thread

| Property        | Value                                     |
| --------------- | ----------------------------------------- |
| **Auth**        | MODERATOR+                                |
| **Input**       | `{ threadId: string, isPinned: boolean }` |
| **Revalidates** | `/forum/[categorySlug]`                   |

Pinned threads appear at the top of the category listing.

### 6.6 `addReply` — Reply to Thread

| Property         | Value                                        |
| ---------------- | -------------------------------------------- |
| **Auth**         | MEMBER+                                      |
| **Input**        | `AddReplySchema`                             |
| **Revalidates**  | `/forum/[categorySlug]/[threadSlug]`         |
| **Notification** | Notifies thread author + parent reply author |

```typescript
const AddReplySchema = z.object({
  threadId: z.string().cuid(),
  content: z.string().min(1).max(10000),
  parentId: z.string().cuid().optional(), // for nested replies
});
```

**Guard:** Fails if thread `isLocked === true`.

### 6.7 `voteReply` — Upvote/Downvote Reply

| Property        | Value                                |
| --------------- | ------------------------------------ | ----- |
| **Auth**        | MEMBER+                              |
| **Input**       | `{ replyId: string, value: 1         | -1 }` |
| **Revalidates** | `/forum/[categorySlug]/[threadSlug]` |

```typescript
// Toggle behavior using @@unique([userId, replyId]):
// - Same vote value → remove vote
// - Different value → update vote
// - No existing vote → create vote
// Cannot vote on own replies
```

**Response:**

```json
{
  "success": true,
  "data": { "voteScore": 15, "userVote": 1 }
}
```

### 6.8 `markSolution` — Mark Reply as Solution

| Property         | Value                                                       |
| ---------------- | ----------------------------------------------------------- |
| **Auth**         | MEMBER (thread author only)                                 |
| **Input**        | `{ replyId: string }`                                       |
| **Revalidates**  | `/forum/[categorySlug]/[threadSlug]`                        |
| **Side Effects** | Sets thread status to `RESOLVED`, unmarks previous solution |

### 6.9 `createPoll` — Create Poll in Thread

| Property        | Value                                |
| --------------- | ------------------------------------ |
| **Auth**        | MEMBER (thread author only)          |
| **Input**       | `CreatePollSchema`                   |
| **Revalidates** | `/forum/[categorySlug]/[threadSlug]` |

```typescript
const CreatePollSchema = z.object({
  threadId: z.string().cuid(),
  question: z.string().min(5).max(200),
  options: z.array(z.string().min(1).max(100)).min(2).max(10),
  isMultiChoice: z.boolean().default(false),
});
```

### 6.10 `votePoll` — Vote in Poll

| Property        | Value                                     |
| --------------- | ----------------------------------------- |
| **Auth**        | MEMBER+                                   |
| **Input**       | `{ pollId: string, optionIds: string[] }` |
| **Revalidates** | `/forum/[categorySlug]/[threadSlug]`      |

```typescript
// Single choice: optionIds must have exactly 1 element
// Multi choice: optionIds can have multiple elements
// Uses @@unique([userId, optionId]) to prevent duplicate votes
// Cannot change vote after casting
```

### 6.11 `reportThread` / `reportReply` — Report Content

| Property         | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Auth**         | MEMBER+                                                      |
| **Input**        | `{ targetId: string, reason: string, description?: string }` |
| **Notification** | Notifies MODERATOR+                                          |

Creates a `Report` record with the polymorphic reference (`threadId` or `replyId`).

---

## 7. Server Actions — Family Tree Module

**File:** `actions/family-tree.ts`

### 7.1 `addFamilyMember` — Add Member to Tree

| Property         | Value                                 |
| ---------------- | ------------------------------------- |
| **Auth**         | MEMBER+                               |
| **Input**        | `AddFamilyMemberSchema`               |
| **Revalidates**  | `/family-tree`                        |
| **Notification** | Notifies ADMIN for approval           |
| **Note**         | ADMIN-added members are auto-approved |

```typescript
const AddFamilyMemberSchema = z.object({
  fullName: z.string().min(2).max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  birthDate: z.string().datetime().optional(),
  deathDate: z.string().datetime().optional(),
  birthPlace: z.string().max(200).optional(),
  familyClan: z.string().max(100).optional(),
  occupation: z.string().max(100).optional(),
  photo: z.string().url().optional(),
  bio: z.string().max(1000).optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  isAlive: z.boolean().default(true),
  fatherId: z.string().cuid().optional(),
  motherId: z.string().cuid().optional(),
  spouseId: z.string().cuid().optional(),
});
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "fullName": "Dorjee Sherpa",
    "isApproved": false,
    "message": "Family member submitted for admin approval"
  }
}
```

### 7.2 `updateFamilyMember` — Edit Member Details

| Property        | Value                                         |
| --------------- | --------------------------------------------- |
| **Auth**        | MEMBER (own family / added by self) or ADMIN+ |
| **Input**       | Same as `AddFamilyMemberSchema` + `memberId`  |
| **Revalidates** | `/family-tree`, `/family-tree/[memberId]`     |

### 7.3 `approveFamilyMember` — Approve Pending Member

| Property         | Value                                  |
| ---------------- | -------------------------------------- |
| **Auth**         | ADMIN+                                 |
| **Input**        | `{ memberId: string }`                 |
| **Revalidates**  | `/family-tree`, `/admin/family-tree`   |
| **Notification** | Notifies the user who added the member |

### 7.4 `rejectFamilyMember` — Reject with Reason

| Property         | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Auth**         | ADMIN+                                                       |
| **Input**        | `{ memberId: string, reason: string }`                       |
| **Revalidates**  | `/admin/family-tree`                                         |
| **Notification** | Notifies the user who added the member with rejection reason |

### 7.5 `deleteFamilyMember` — Remove from Tree

| Property        | Value                                |
| --------------- | ------------------------------------ |
| **Auth**        | ADMIN+                               |
| **Input**       | `{ memberId: string }`               |
| **Revalidates** | `/family-tree`, `/admin/family-tree` |

**Warning:** Nullifies all `fatherId`, `motherId`, `spouseId` references pointing to this member before deleting.

### 7.6 `addLifeEvent` — Add Life Event to Member

| Property        | Value                     |
| --------------- | ------------------------- |
| **Auth**        | MEMBER+                   |
| **Input**       | `AddLifeEventSchema`      |
| **Revalidates** | `/family-tree/[memberId]` |

```typescript
const AddLifeEventSchema = z.object({
  memberId: z.string().cuid(),
  title: z.string().min(2).max(100), // e.g., "Graduated Engineering"
  date: z.string().datetime().optional(),
  description: z.string().max(500).optional(),
  type: z.enum([
    "BIRTH",
    "MARRIAGE",
    "DEATH",
    "EDUCATION",
    "CAREER",
    "MIGRATION",
    "OTHER",
  ]),
});
```

---

## 8. Server Actions — News Module

**File:** `actions/news.ts`

### 8.1 `createNewsArticle` — Create Local News

| Property         | Value                                  |
| ---------------- | -------------------------------------- |
| **Auth**         | ADMIN+                                 |
| **Input**        | `CreateNewsSchema`                     |
| **Revalidates**  | `/news`                                |
| **Notification** | Notifies all members of new local news |

```typescript
const CreateNewsSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(50),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  category: z
    .enum(["LOCAL", "STATE", "NATIONAL", "INTERNATIONAL"])
    .default("LOCAL"),
  isFeatured: z.boolean().default(false),
});
```

**Note:** `source` is automatically set to `"LOCAL"`. Slug auto-generated from title.

### 8.2 `updateNewsArticle` — Edit Local News

| Property        | Value                                               |
| --------------- | --------------------------------------------------- |
| **Auth**        | ADMIN+                                              |
| **Input**       | `{ articleId: string } & Partial<CreateNewsSchema>` |
| **Revalidates** | `/news`, `/news/[slug]`                             |

### 8.3 `deleteNewsArticle` — Delete Local News

| Property        | Value                   |
| --------------- | ----------------------- |
| **Auth**        | ADMIN+                  |
| **Input**       | `{ articleId: string }` |
| **Revalidates** | `/news`                 |

### 8.4 `bookmarkNews` — Toggle News Bookmark

| Property        | Value                             |
| --------------- | --------------------------------- |
| **Auth**        | MEMBER+                           |
| **Input**       | `{ articleId: string }`           |
| **Revalidates** | `/news/[slug]`, `/news/bookmarks` |

Toggle pattern using `@@unique([userId, articleId])`.

---

## 9. Server Actions — Payment Module

**File:** `actions/payment.ts`

### 9.1 `createDonation` — Initiate Donation

| Property         | Value                                                         |
| ---------------- | ------------------------------------------------------------- |
| **Auth**         | MEMBER+                                                       |
| **Rate Limit**   | 5/minute                                                      |
| **Input**        | `CreateDonationSchema`                                        |
| **Revalidates**  | `/payments`, `/payments/history`                              |
| **Side Effects** | Creates Razorpay order, returns `orderId` for client checkout |

```typescript
const CreateDonationSchema = z.object({
  amount: z.number().min(10).max(1000000), // INR 10 to 10L
  message: z.string().max(500).optional(),
  isAnonymous: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurringFreq: z.enum(["monthly", "yearly"]).optional(),
  campaignId: z.string().cuid().optional(), // links to campaign if applicable
});
```

**Response:**

```json
{
  "success": true,
  "data": {
    "donationId": "cuid",
    "razorpayOrderId": "order_xyz123",
    "amount": 1000,
    "currency": "INR",
    "keyId": "rzp_live_xxx" // Razorpay public key for client
  }
}
```

**Client Flow:**

1. Call `createDonation()` → get Razorpay order ID
2. Open Razorpay checkout with order ID on client
3. On payment success → Razorpay webhook verifies and updates DB
4. On payment failure → status stays `PENDING`

### 9.2 `createCampaign` — Create Emergency Campaign

| Property         | Value                  |
| ---------------- | ---------------------- |
| **Auth**         | ADMIN+                 |
| **Input**        | `CreateCampaignSchema` |
| **Revalidates**  | `/payments/campaigns`  |
| **Notification** | Notifies all members   |

```typescript
const CreateCampaignSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(50),
  coverImage: z.string().url().optional(),
  targetAmount: z.number().min(100),
  deadline: z.string().datetime().optional(),
});
```

### 9.3 `updateCampaign` — Edit/Close Campaign

| Property        | Value                                                                 |
| --------------- | --------------------------------------------------------------------- |
| **Auth**        | ADMIN+                                                                |
| **Input**       | `{ campaignId: string, status?: CampaignStatus, ...updatableFields }` |
| **Revalidates** | `/payments/campaigns`, `/payments/campaigns/[campaignId]`             |

### 9.4 `addCampaignUpdate` — Post Campaign Update

| Property         | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Auth**         | ADMIN+                                                   |
| **Input**        | `{ campaignId: string, title: string, content: string }` |
| **Revalidates**  | `/payments/campaigns/[campaignId]`                       |
| **Notification** | Notifies all campaign donors                             |

### 9.5 `assignFine` — Assign Fine to Member

| Property         | Value                   |
| ---------------- | ----------------------- |
| **Auth**         | ADMIN+                  |
| **Input**        | `AssignFineSchema`      |
| **Revalidates**  | `/admin/payments/fines` |
| **Notification** | Notifies the fined user |

```typescript
const AssignFineSchema = z.object({
  userId: z.string().cuid(),
  amount: z.number().min(1),
  reason: z.string().min(10).max(500),
  dueDate: z.string().datetime(),
});
```

**Response:**

```json
{
  "success": true,
  "data": {
    "fineId": "cuid",
    "amount": 500,
    "reason": "Missed community meeting",
    "dueDate": "2026-03-15T00:00:00.000Z",
    "status": "PENDING"
  }
}
```

### 9.6 `payFine` — Initiate Fine Payment

| Property         | Value                                  |
| ---------------- | -------------------------------------- |
| **Auth**         | MEMBER+ (own fines only)               |
| **Input**        | `{ fineId: string }`                   |
| **Side Effects** | Creates Razorpay order for fine amount |

Same flow as `createDonation` — returns Razorpay order for client checkout.

### 9.7 `disputeFine` — Dispute Assigned Fine

| Property         | Value                              |
| ---------------- | ---------------------------------- |
| **Auth**         | MEMBER+ (own fines only)           |
| **Input**        | `{ fineId: string, note: string }` |
| **Revalidates**  | `/payments/fines`                  |
| **Notification** | Notifies ADMIN users               |

Sets `isDisputed = true` and `disputeNote` on the Fine record. Status changes to `DISPUTED`.

### 9.8 `resolveFineDispute` — Waive or Uphold Fine

| Property         | Value                                      |
| ---------------- | ------------------------------------------ | -------------------------- |
| **Auth**         | ADMIN+                                     |
| **Input**        | `{ fineId: string, resolution: "WAIVE"     | "UPHOLD", note?: string }` |
| **Revalidates**  | `/admin/payments/fines`, `/payments/fines` |
| **Notification** | Notifies the fined user                    |

- `WAIVE` → sets status to `WAIVED`, `disputeResolvedAt = now()`
- `UPHOLD` → sets status back to `PENDING`, resets `isDisputed = false`

---

## 10. Server Actions — Analytics Module

**File:** `actions/analytics.ts`

### 10.1 `trackEvent` — Log Analytics Event

| Property  | Value                                    |
| --------- | ---------------------------------------- |
| **Auth**  | SYSTEM (called internally, non-blocking) |
| **Input** | `TrackEventSchema`                       |

```typescript
const TrackEventSchema = z.object({
  eventType: z.string(), // "page_view", "post_created", "donation_made", etc.
  pageUrl: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  sessionId: z.string().optional(),
  deviceType: z.string().optional(),
  browser: z.string().optional(),
  duration: z.number().optional(), // time on page in seconds
});
```

**Called from:** Middleware (page_view), server actions (mutations), client hooks (duration tracking).

### 10.2 `getMyAnalytics` — Personal Analytics Dashboard

| Property    | Value                     |
| ----------- | ------------------------- |
| **Auth**    | MEMBER+                   |
| **Returns** | Personal activity summary |

```json
{
  "success": true,
  "data": {
    "postsWritten": 12,
    "totalLikes": 156,
    "totalComments": 89,
    "threadsCreated": 5,
    "repliesMade": 34,
    "donationsMade": 3,
    "totalDonated": 5000,
    "familyMembersAdded": 8,
    "joinedDate": "2026-01-15T00:00:00.000Z",
    "lastActive": "2026-02-14T18:30:00.000Z",
    "activityChart": [
      /* daily activity data for last 30 days */
    ]
  }
}
```

### 10.3 `getAdminDashboard` — Admin Overview

| Property    | Value                 |
| ----------- | --------------------- |
| **Auth**    | ADMIN+                |
| **Returns** | Platform-wide metrics |

```json
{
  "success": true,
  "data": {
    "totalUsers": 450,
    "activeUsersToday": 78,
    "activeUsersThisWeek": 234,
    "totalPosts": 156,
    "totalThreads": 89,
    "totalDonations": 125000,
    "pendingApprovals": 4,
    "pendingReports": 2,
    "recentActivity": [
      /* last 20 events */
    ],
    "userGrowthChart": [
      /* monthly signups */
    ],
    "engagementChart": [
      /* daily page views */
    ]
  }
}
```

### 10.4 `getContentAnalytics` — Content Metrics

| Property  | Value           |
| --------- | --------------- | ----- | ----- | ------- |
| **Auth**  | ADMIN+          |
| **Input** | `{ period: "7d" | "30d" | "90d" | "1y" }` |

Returns: top posts by views/likes, top forum threads, category distribution, content creation trends.

### 10.5 `getFinancialAnalytics` — Financial Metrics

| Property  | Value           |
| --------- | --------------- | ----- | ----- | ------- |
| **Auth**  | ADMIN+          |
| **Input** | `{ period: "7d" | "30d" | "90d" | "1y" }` |

Returns: total revenue, donations by month, campaign progress, fine collection rate, top donors.

### 10.6 `getUserAnalytics` — User Behavior

| Property | Value  |
| -------- | ------ |
| **Auth** | ADMIN+ |

Returns: user engagement metrics, retention rates, device breakdown, active hours heatmap.

---

## 11. Server Actions — Notification Module

**File:** `actions/notification.ts`

### 11.1 `markAsRead` — Mark Single Notification Read

| Property        | Value                        |
| --------------- | ---------------------------- |
| **Auth**        | MEMBER+                      |
| **Input**       | `{ notificationId: string }` |
| **Revalidates** | `/notifications`             |

### 11.2 `markAllAsRead` — Mark All Notifications Read

| Property        | Value            |
| --------------- | ---------------- |
| **Auth**        | MEMBER+          |
| **Input**       | —                |
| **Revalidates** | `/notifications` |

```typescript
await db.notification.updateMany({
  where: { userId: user.id, isRead: false },
  data: { isRead: true },
});
```

### 11.3 `getUnreadCount` — Get Unread Count

| Property    | Value               |
| ----------- | ------------------- |
| **Auth**    | MEMBER+             |
| **Returns** | `{ count: number }` |

Used by the `notification-bell.tsx` component for the badge count.

### 11.4 Notification Types Reference

| Type          | Trigger                         | Message Template                                     |
| ------------- | ------------------------------- | ---------------------------------------------------- |
| `COMMENT`     | New comment on user's post      | "**{name}** commented on your post **{title}**"      |
| `REPLY`       | Reply to user's comment/thread  | "**{name}** replied to your {type}"                  |
| `LIKE`        | Like on user's post             | "**{name}** liked your post **{title}**"             |
| `FINE`        | Fine assigned or updated        | "A fine of ₹{amount} has been assigned"              |
| `CAMPAIGN`    | New campaign or campaign update | "New campaign: **{title}**"                          |
| `APPROVAL`    | Family member approved/rejected | "Your family tree entry for **{name}** was {status}" |
| `ROLE_CHANGE` | User role changed               | "Your role has been updated to **{role}**"           |
| `REPORT`      | Content reported (to mods)      | "New report: {reason}"                               |
| `MENTION`     | Mentioned in post/comment       | "**{name}** mentioned you in **{title}**"            |

---

## 12. Server Actions — Contact & Testimonials

**File:** `actions/contact.ts` and `actions/testimonial.ts`

### 12.1 `submitContactForm` — Submit Contact Form

| Property         | Value                           |
| ---------------- | ------------------------------- |
| **Auth**         | ANY (public + authenticated)    |
| **Rate Limit**   | 3/hour per IP                   |
| **Input**        | `ContactFormSchema`             |
| **Notification** | Sends email to admin via Resend |

```typescript
const ContactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(20).max(5000),
  attachment: z.string().url().optional(), // S3 URL if file attached
});
```

### 12.2 `updateContactStatus` — Update Submission Status

| Property        | Value                                          |
| --------------- | ---------------------------------------------- | ------------- |
| **Auth**        | ADMIN+                                         |
| **Input**       | `{ submissionId: string, status: "IN_PROGRESS" | "RESOLVED" }` |
| **Revalidates** | `/admin/contact-submissions`                   |

### 12.3 `submitTestimonial` — Submit Testimonial

| Property         | Value                                 |
| ---------------- | ------------------------------------- |
| **Auth**         | MEMBER+                               |
| **Input**        | `{ content: string, rating: number }` |
| **Notification** | Notifies ADMIN for approval           |

```typescript
const TestimonialSchema = z.object({
  content: z.string().min(20).max(1000),
  rating: z.number().int().min(1).max(5),
});
```

### 12.4 `approveTestimonial` — Approve/Reject

| Property        | Value                                            |
| --------------- | ------------------------------------------------ |
| **Auth**        | ADMIN+                                           |
| **Input**       | `{ testimonialId: string, isApproved: boolean }` |
| **Revalidates** | `/admin/testimonials`, `/` (landing page)        |

### 12.5 `featureTestimonial` — Feature on Landing Page

| Property        | Value                                            |
| --------------- | ------------------------------------------------ |
| **Auth**        | ADMIN+                                           |
| **Input**       | `{ testimonialId: string, isFeatured: boolean }` |
| **Revalidates** | `/` (landing page)                               |

---

## 13. Server Actions — Admin Module

**File:** `actions/admin.ts`

### 13.1 `getSiteSettings` — Get All Settings

| Property    | Value                                 |
| ----------- | ------------------------------------- |
| **Auth**    | ADMIN+                                |
| **Returns** | All key-value pairs from SiteSettings |

```json
{
  "success": true,
  "data": {
    "site_title": "Chandra Jyoti Sanstha",
    "site_description": "Village Community Platform",
    "contact_email": "admin@chandrajyoti.org",
    "contact_phone": "+91-XXXXXXXXXX",
    "address": "Tumin Dhanbari Village, Gangtok, Sikkim",
    "social_facebook": "https://facebook.com/...",
    "social_instagram": "https://instagram.com/...",
    "moderation_enabled": "true"
  }
}
```

### 13.2 `updateSiteSettings` — Update Settings

| Property        | Value                                  |
| --------------- | -------------------------------------- |
| **Auth**        | SUPER_ADMIN                            |
| **Input**       | `{ settings: Record<string, string> }` |
| **Revalidates** | All pages (full revalidation)          |

```typescript
// Bulk upsert settings
for (const [key, value] of Object.entries(settings)) {
  await db.siteSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
```

### 13.3 `getSystemHealth` — System Metrics

| Property    | Value              |
| ----------- | ------------------ |
| **Auth**    | SUPER_ADMIN        |
| **Returns** | System health data |

```json
{
  "success": true,
  "data": {
    "database": { "status": "healthy", "connectionCount": 5, "latencyMs": 12 },
    "storage": { "totalFilesUploaded": 1234, "totalSizeGB": 2.5 },
    "users": { "total": 450, "activeToday": 78, "newThisWeek": 12 },
    "performance": { "avgResponseTimeMs": 150, "errorRate": 0.02 },
    "uptime": "99.97%"
  }
}
```
---

## 14. Webhook Implementations

### 14.1 Clerk Webhook — `POST /api/webhooks/clerk`

**Purpose:** Syncs Clerk user data with the local database.
**Auth:** Verified via Svix signature (Clerk's webhook delivery system).

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  // 1. Get Svix headers for verification
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  // 2. Verify webhook signature
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 3. Handle events
  switch (event.type) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name, image_url } = event.data;
      await db.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0]?.email_address!,
          firstName: first_name || "",
          lastName: last_name || "",
          avatar: image_url,
          role: "MEMBER",
        },
      });
      // Optional: send welcome email via Resend
      break;
    }

    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url, banned } = event.data;
      await db.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses[0]?.email_address,
          firstName: first_name || undefined,
          lastName: last_name || undefined,
          avatar: image_url || undefined,
          isActive: !banned,
        },
      });
      break;
    }

    case "user.deleted": {
      const { id } = event.data;
      if (id) {
        await db.user.update({
          where: { clerkId: id },
          data: { isActive: false },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
```

**Supported Events:**

| Event | Action |
|-------|--------|
| `user.created` | Create user in DB with `MEMBER` role, send welcome email |
| `user.updated` | Update user fields (name, email, avatar, ban status) |
| `user.deleted` | Soft-delete user (`isActive = false`) |

---

### 14.2 Razorpay Webhook — `POST /api/webhooks/razorpay`

**Purpose:** Verifies payment completion and updates donation/fine records.
**Auth:** HMAC-SHA256 signature verification.

```typescript
// app/api/webhooks/razorpay/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // 1. Verify HMAC signature
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 2. Parse payload
  const payload = JSON.parse(body);
  const event = payload.event;

  switch (event) {
    case "payment.captured": {
      const payment = payload.payload.payment.entity;
      const orderId = payment.order_id;
      const transactionId = payment.id;

      // Check if it's a donation
      const donation = await db.donation.findFirst({
        where: { razorpayOrderId: orderId },
      });

      if (donation) {
        await db.donation.update({
          where: { id: donation.id },
          data: {
            status: "COMPLETED",
            transactionId,
            paymentMethod: payment.method,
          },
        });

        // Update campaign raised amount if applicable
        if (donation.campaignId) {
          await db.donationCampaign.update({
            where: { id: donation.campaignId },
            data: {
              raisedAmount: { increment: donation.amount },
              donorCount: { increment: 1 },
            },
          });
        }

        // Generate receipt URL (async)
        // Send confirmation email via Resend
        break;
      }

      // Check if it's a fine payment
      const fine = await db.fine.findFirst({
        where: { razorpayOrderId: orderId },
      });

      if (fine) {
        await db.fine.update({
          where: { id: fine.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            transactionId,
          },
        });
        break;
      }

      break;
    }

    case "payment.failed": {
      const payment = payload.payload.payment.entity;
      const orderId = payment.order_id;

      await db.donation.updateMany({
        where: { razorpayOrderId: orderId },
        data: { status: "FAILED" },
      });

      await db.fine.updateMany({
        where: { razorpayOrderId: orderId },
        data: { status: "PENDING" }, // stays pending for retry
      });

      break;
    }

    case "refund.processed": {
      const refund = payload.payload.refund.entity;
      const paymentId = refund.payment_id;

      await db.donation.updateMany({
        where: { transactionId: paymentId },
        data: { status: "REFUNDED" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
```

**Supported Events:**

| Event              | Action                                                    |
| ------------------ | --------------------------------------------------------- |
| `payment.captured` | Mark donation/fine as `COMPLETED`, update campaign totals |
| `payment.failed`   | Mark donation as `FAILED`, fine stays `PENDING`           |
| `refund.processed` | Mark donation as `REFUNDED`                               |

---

## 15. Cron Job Endpoints

### 15.1 External News Refresh — `GET /api/cron/news-refresh`

**Schedule:** Every 15 minutes
**Auth:** `CRON_SECRET` header verification

```typescript
// app/api/cron/news-refresh/route.ts
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch news from NewsAPI for each category
  const categories = [
    { query: "Sikkim", category: "STATE" },
    { query: "India news", category: "NATIONAL" },
    { query: "world news", category: "INTERNATIONAL" },
  ];

  let totalAdded = 0;

  for (const { query, category } of categories) {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`,
    );
    const data = await response.json();

    for (const article of data.articles || []) {
      const slug = slugify(article.title);
      // Upsert to avoid duplicates
      await db.newsArticle.upsert({
        where: { slug },
        update: {}, // don't update if exists
        create: {
          title: article.title,
          slug,
          content: article.content,
          excerpt: article.description,
          coverImage: article.urlToImage,
          source: "EXTERNAL",
          sourceUrl: article.url,
          sourceName: article.source?.name,
          category: category as any,
          publishedAt: new Date(article.publishedAt),
        },
      });
      totalAdded++;
    }
  }

  return NextResponse.json({ success: true, articlesProcessed: totalAdded });
}
```

**Vercel Cron Config (`vercel.json`):**

```json
{
  "crons": [
    {
      "path": "/api/cron/news-refresh",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### 15.2 Overdue Fines Check — `GET /api/cron/overdue-fines`

**Schedule:** Daily at midnight
**Auth:** `CRON_SECRET` header

```typescript
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mark overdue fines
  const result = await db.fine.updateMany({
    where: {
      status: "PENDING",
      dueDate: { lt: new Date() },
    },
    data: { status: "OVERDUE" },
  });

  // Notify users with overdue fines
  const overdueFines = await db.fine.findMany({
    where: { status: "OVERDUE" },
    include: { user: true },
  });

  for (const fine of overdueFines) {
    await db.notification.create({
      data: {
        userId: fine.userId,
        title: "Fine Overdue",
        message: `Your fine of ₹${fine.amount} is overdue. Please pay immediately.`,
        type: "FINE",
        link: "/payments/fines",
      },
    });
  }

  return NextResponse.json({
    success: true,
    finesMarkedOverdue: result.count,
  });
}
```

### 15.3 Scheduled Posts Publisher — `GET /api/cron/scheduled-posts`

**Schedule:** Every 5 minutes

```typescript
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db.blogPost.updateMany({
    where: {
      status: "DRAFT",
      scheduledAt: { lte: new Date() },
    },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    postsPublished: result.count,
  });
}
```

**Complete Vercel Cron Configuration:**

```json
{
  "crons": [
    { "path": "/api/cron/news-refresh", "schedule": "*/15 * * * *" },
    { "path": "/api/cron/overdue-fines", "schedule": "0 0 * * *" },
    { "path": "/api/cron/scheduled-posts", "schedule": "*/5 * * * *" }
  ]
}
```

---

## 16. Error Handling

### 16.1 Error Codes

| Code               | HTTP Status | Description                     |
| ------------------ | ----------- | ------------------------------- |
| `UNAUTHORIZED`     | 401         | Not logged in                   |
| `FORBIDDEN`        | 403         | Insufficient role/permissions   |
| `NOT_FOUND`        | 404         | Resource doesn't exist          |
| `VALIDATION_ERROR` | 400         | Input failed Zod validation     |
| `CONFLICT`         | 409         | Duplicate resource (e.g., slug) |
| `RATE_LIMITED`     | 429         | Too many requests               |
| `INTERNAL_ERROR`   | 500         | Unexpected server error         |

### 16.2 Server Action Error Wrapper

```typescript
// lib/action-wrapper.ts
import { z } from "zod";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export function createAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (input: TInput) => Promise<TOutput>,
): (input: TInput) => Promise<ActionResult<TOutput>> {
  return async (input: TInput) => {
    try {
      const validated = schema.parse(input);
      const result = await handler(validated);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", "),
          code: "VALIDATION_ERROR",
        };
      }
      if (error instanceof Error) {
        if (error.message === "Unauthorized") {
          return {
            success: false,
            error: "Please log in",
            code: "UNAUTHORIZED",
          };
        }
        if (error.message === "Insufficient permissions") {
          return {
            success: false,
            error: "You don't have permission",
            code: "FORBIDDEN",
          };
        }
        return { success: false, error: error.message, code: "INTERNAL_ERROR" };
      }
      return {
        success: false,
        error: "An unexpected error occurred",
        code: "INTERNAL_ERROR",
      };
    }
  };
}
```

### 16.3 API Route Error Handler

```typescript
// lib/api-error.ts
import { NextResponse } from "next/server";

export function apiError(message: string, status: number, code?: string) {
  return NextResponse.json(
    { success: false, error: message, code },
    { status },
  );
}

// Usage in API routes:
// return apiError("Not found", 404, "NOT_FOUND");
// return apiError("Rate limit exceeded", 429, "RATE_LIMITED");
```

---

## 17. Rate Limiting

### 17.1 Rate Limit Configuration

| Endpoint/Action    | Limit | Window   | Identifier |
| ------------------ | ----- | -------- | ---------- |
| General API routes | 60    | 1 minute | User ID    |
| Auth attempts      | 10    | 1 minute | IP address |
| File uploads       | 10    | 1 minute | User ID    |
| Payment actions    | 5     | 1 minute | User ID    |
| Contact form       | 3     | 1 hour   | IP address |
| Report content     | 5     | 1 hour   | User ID    |

### 17.2 Usage in Server Actions

```typescript
import { apiRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function someAction(input: InputType) {
  const user = await requireRole("MEMBER");

  // Apply rate limit
  const { success, remaining, reset } = await apiRateLimit.limit(user.id);
  if (!success) {
    throw new Error("Rate limit exceeded. Try again later.");
  }

  // ... action logic
}
```

---

## 18. Type Definitions & Zod Schemas

### 18.1 Shared Enums

```typescript
// lib/validations/enums.ts
import { z } from "zod";

export const RoleEnum = z.enum(["MEMBER", "MODERATOR", "ADMIN", "SUPER_ADMIN"]);
export const PostStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const ThreadStatusEnum = z.enum(["OPEN", "RESOLVED", "CLOSED"]);
export const PaymentStatusEnum = z.enum([
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);
export const FineStatusEnum = z.enum([
  "PENDING",
  "PAID",
  "OVERDUE",
  "DISPUTED",
  "WAIVED",
]);
export const CampaignStatusEnum = z.enum([
  "ACTIVE",
  "COMPLETED",
  "EXPIRED",
  "CANCELLED",
]);
export const NewsCategoryEnum = z.enum([
  "LOCAL",
  "STATE",
  "NATIONAL",
  "INTERNATIONAL",
]);
export const NewsSourceEnum = z.enum(["LOCAL", "EXTERNAL"]);
export const ContactStatusEnum = z.enum(["NEW", "IN_PROGRESS", "RESOLVED"]);
export const ReportStatusEnum = z.enum([
  "PENDING",
  "REVIEWED",
  "RESOLVED",
  "DISMISSED",
]);
export const GenderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);
export const LifeEventTypeEnum = z.enum([
  "BIRTH",
  "MARRIAGE",
  "DEATH",
  "EDUCATION",
  "CAREER",
  "MIGRATION",
  "OTHER",
]);
```

### 18.2 Pagination Schema

```typescript
// lib/validations/pagination.ts
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});
```

### 18.3 File Path Summary

| File                      | Module              | Actions Count  |
| ------------------------- | ------------------- | -------------- |
| `actions/user.ts`         | User Management     | 4              |
| `actions/blog.ts`         | Blog System         | 10             |
| `actions/forum.ts`        | Forum System        | 11             |
| `actions/family-tree.ts`  | Family Tree         | 6              |
| `actions/news.ts`         | News System         | 4              |
| `actions/payment.ts`      | Payment & Donations | 8              |
| `actions/analytics.ts`    | Analytics           | 6              |
| `actions/notification.ts` | Notifications       | 3              |
| `actions/contact.ts`      | Contact Form        | 2              |
| `actions/testimonial.ts`  | Testimonials        | 3              |
| `actions/admin.ts`        | Admin Settings      | 3              |
| **Total**                 | **11 modules**      | **60 actions** |

### 18.4 API Routes Summary

| Route                       | Method | Auth           | Purpose                      |
| --------------------------- | ------ | -------------- | ---------------------------- |
| `/api/webhooks/clerk`       | POST   | Svix signature | Clerk user sync              |
| `/api/webhooks/razorpay`    | POST   | HMAC-SHA256    | Payment verification         |
| `/api/upload`               | POST   | MEMBER+        | S3 file upload               |
| `/api/news/external`        | GET    | MEMBER+        | External news fetch          |
| `/api/export/analytics`     | GET    | ADMIN+         | Analytics CSV/JSON export    |
| `/api/export/family-tree`   | GET    | ADMIN+         | Family tree JSON/CSV export  |
| `/api/export/financial`     | GET    | ADMIN+         | Financial data export        |
| `/api/cron/news-refresh`    | GET    | CRON_SECRET    | Refresh external news (15m)  |
| `/api/cron/overdue-fines`   | GET    | CRON_SECRET    | Check overdue fines (daily)  |
| `/api/cron/scheduled-posts` | GET    | CRON_SECRET    | Publish scheduled posts (5m) |

---

## 19. Environment Variables

```bash
# .env.local

# ---- Clerk Auth ----
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home

# ---- Database ----
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

# ---- AWS S3 ----
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=chandra-jyoti-uploads

# ---- Razorpay ----
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx

# ---- Resend (Email) ----
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@chandrajyoti.org

# ---- NewsAPI ----
NEWS_API_KEY=xxx

# ---- Upstash Redis (Rate Limiting) ----
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# ---- Cron Security ----
CRON_SECRET=xxx

# ---- App ----
NEXT_PUBLIC_APP_URL=https://chandrajyoti.org
NODE_ENV=production
```

---

_This document serves as the complete API reference for the Chandra Jyoti Sanstha platform. All server actions, API routes, webhooks, and cron jobs are detailed with their authentication requirements, input schemas, response formats, and side effects._
