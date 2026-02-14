# Product Requirements Document (PRD)

# Chandra Jyoti Sanstha — Village Community Platform

> A comprehensive, modern full-stack community platform for Tumin Dhanbari Village,
> Gangtok District, Sikkim — digitizing village governance, preserving family heritage,
> and fostering community engagement.

**Version:** 1.0.0  
**Date:** February 14, 2026  
**Author:** Development Team  
**Status:** Draft  
**Last Updated:** February 14, 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Vision & Goals](#2-project-vision--goals)
3. [Target Audience](#3-target-audience)
4. [Technical Architecture](#4-technical-architecture)
5. [Project Structure & Skeleton](#5-project-structure--skeleton)
6. [User Roles & Permissions](#6-user-roles--permissions)
7. [Feature Specifications](#7-feature-specifications)
   - 7.1 [Landing Page](#71-landing-page-public)
   - 7.2 [Authentication System](#72-authentication-system)
   - 7.3 [Homepage Dashboard](#73-homepage-dashboard-protected)
   - 7.4 [Family Tree](#74-family-tree)
   - 7.5 [Blog System](#75-blog-system)
   - 7.6 [Forum System](#76-forum-system)
   - 7.7 [About Us Page](#77-about-us-page)
   - 7.8 [Contact Us Page](#78-contact-us-page)
   - 7.9 [News Page](#79-news-page)
   - 7.10 [Payment & Donation System](#710-payment--donation-system)
   - 7.11 [Analytics Dashboard](#711-analytics-dashboard)
   - 7.12 [User Profile](#712-user-profile)
   - 7.13 [Notification System](#713-notification-system)
   - 7.14 [Admin Panel](#714-admin-panel)
8. [Database Schema (Prisma)](#8-database-schema-prisma)
9. [API Design](#9-api-design)
10. [UI/UX Design System](#10-uiux-design-system)
11. [Component Library](#11-component-library)
12. [Page-by-Page Wireframes](#12-page-by-page-wireframes)
13. [Deployment & Infrastructure](#13-deployment--infrastructure)
14. [Security Requirements](#14-security-requirements)
15. [Performance Requirements](#15-performance-requirements)
16. [Testing Strategy](#16-testing-strategy)
17. [Incremental Implementation Plan](#17-incremental-implementation-plan)
18. [Future Roadmap](#18-future-roadmap)
19. [Appendix](#19-appendix)

---

## 1. Executive Summary

**Chandra Jyoti Sanstha** is a full-stack, production-grade community web platform purpose-built
for the residents, diaspora members, and administrators of **Tumin Dhanbari Village** in
**Gangtok District, Sikkim, India**. The platform serves as the single digital hub for:

- **Community Governance** — Transparent financial management, member fines, and emergency fundraising
- **Family Heritage** — Interactive D3.js-powered family tree visualizing every village family's lineage
- **Social Engagement** — Feature-rich blog and forum for discussions, announcements, and knowledge sharing
- **News Dissemination** — Multi-source news aggregation (local, state, national, international)
- **Financial Operations** — Donation management, emergency campaigns, and penalty/fine collection
- **Analytics & Insights** — Role-based dashboards for both individual members and administrators

The platform is designed with a **sleek, modern, premium UI/UX** featuring glassmorphism effects,
micro-animations, dark mode support, and responsive design that works flawlessly across all devices.

### Key Differentiators

- **Village-First Design** — Every feature is tailored to village community operations
- **Family Lineage Preservation** — Interactive D3.js family tree with multi-generational support
- **Transparent Finances** — All donations, campaigns, and fines are traceable and auditable
- **Role-Based Everything** — From content access to analytics, everything respects user roles
- **Modern Tech Stack** — Built with Next.js 16, React 19, Tailwind CSS v4 for peak performance

---

## 2. Project Vision & Goals

### Vision Statement

> To create the most comprehensive, beautiful, and functional digital community platform
> that connects every family of Tumin Dhanbari — preserving our heritage, strengthening
> our bonds, and empowering our collective future.

### Primary Goals

| #   | Goal                                    | Success Metric                              |
| --- | --------------------------------------- | ------------------------------------------- |
| G1  | Digitize all village family records     | 90%+ families registered within 6 months    |
| G2  | Create an active community forum        | 50+ posts/month within 3 months of launch   |
| G3  | Enable transparent financial management | 100% of transactions traceable              |
| G4  | Preserve family lineage digitally       | 500+ family members in tree within 6 months |
| G5  | Deliver premium user experience         | 4.5+ app rating from community feedback     |
| G6  | Ensure platform accessibility           | Works on 2G/3G networks, all device sizes   |

### Non-Goals (Out of Scope for v1.0)

- Native mobile applications (iOS/Android)
- Multi-language support (Nepali, Sikkimese) — planned for v2.0
- Real-time chat/messaging between members
- E-commerce / marketplace features
- Government service integrations
- Offline/PWA mode

---

## 3. Target Audience

### Primary Users

| Persona               | Description                           | Key Needs                                                         |
| --------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| **Village Resident**  | Lives in Tumin Dhanbari, 18-65 years  | Stay connected, view family tree, read news, participate in forum |
| **Village Elder**     | Senior members, 60+ years             | View family tree, read news, minimal interaction needed           |
| **Diaspora Member**   | Moved away but still connected        | Stay updated, donate, view family tree remotely                   |
| **Sanstha Committee** | Village governance body (5-10 people) | Manage finances, post announcements, moderate content             |
| **Youth Member**      | Young adults 18-30                    | Blog, forum engagement, event coordination                        |

### User Personas

#### Persona 1: Rajesh (Village Resident, Age 42)

- **Role:** MEMBER
- **Tech Comfort:** Moderate (uses WhatsApp, Facebook)
- **Device:** Android phone (mid-range), occasional laptop
- **Goals:** Check family tree, read village news, participate in discussions
- **Pain Points:** Slow internet (3G), small screen, not tech-savvy
- **Design Implications:** Large touch targets, fast loading, simple navigation

#### Persona 2: Sunita (Diaspora Member, Age 35)

- **Role:** MEMBER
- **Tech Comfort:** High (works in IT in Bangalore)
- **Device:** iPhone, MacBook
- **Goals:** Stay connected with village, make donations, view family updates
- **Pain Points:** Distance from village, missing community events
- **Design Implications:** Rich content experience, easy donation flow

#### Persona 3: Dorjee (Sanstha President, Age 55)

- **Role:** SUPER_ADMIN
- **Tech Comfort:** Low to moderate
- **Device:** Android phone
- **Goals:** Post announcements, manage finances, assign fines
- **Pain Points:** Complex admin interfaces, too many options
- **Design Implications:** Simplified admin dashboard, clear action buttons

#### Persona 4: Priya (Youth Blogger, Age 24)

- **Role:** MEMBER → MODERATOR
- **Tech Comfort:** Very high
- **Device:** Laptop, phone
- **Goals:** Write blogs about village culture, moderate forum, organize events
- **Pain Points:** Wants rich editor, media uploads, engagement metrics
- **Design Implications:** Full-featured editor, analytics for own content

---

## 4. Technical Architecture

### 4.1 Tech Stack Overview

| Layer                 | Technology            | Version | Purpose                                          |
| --------------------- | --------------------- | ------- | ------------------------------------------------ |
| **Framework**         | Next.js (App Router)  | 16.1.6  | Full-stack React framework with SSR/SSG/PPR      |
| **UI Library**        | React                 | 19.2.3  | Component-based UI with Server Components        |
| **Styling**           | Tailwind CSS          | v4      | Utility-first CSS framework                      |
| **Component Library** | shadcn/ui             | Latest  | Accessible, customizable UI components           |
| **Authentication**    | Clerk                 | Latest  | Auth, user management, session handling          |
| **Database**          | Neon Postgres         | Latest  | Serverless PostgreSQL                            |
| **ORM**               | Prisma                | Latest  | Type-safe database access                        |
| **File Storage**      | AWS S3                | v3 SDK  | Image/file storage                               |
| **Family Tree**       | D3.js                 | v7+     | Interactive tree visualization                   |
| **Payments**          | Razorpay              | Latest  | Indian payment gateway (UPI, cards, net banking) |
| **Charts**            | Recharts              | Latest  | Analytics visualization                          |
| **Rich Text Editor**  | Tiptap                | Latest  | Blog/forum content editor                        |
| **Animations**        | Framer Motion         | Latest  | Page transitions, micro-animations               |
| **Form Validation**   | Zod + React Hook Form | Latest  | Schema validation                                |
| **Email**             | Resend                | Latest  | Transactional emails                             |
| **Rate Limiting**     | Upstash Ratelimit     | Latest  | API protection                                   |
| **Deployment**        | Vercel                | —       | Hosting and CI/CD                                |
| **Package Manager**   | bun                   | 1.3.9   | Package management                               |

### 4.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  React 19 + shadcn/ui + Tailwind CSS v4 + Framer Motion    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │   │
│  │  │ Landing  │ │ Auth     │ │Protected │ │ Admin        │   │   │
│  │  │ Pages    │ │ Pages    │ │ Pages    │ │ Dashboard    │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │   │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐    │   │
│  │  │ D3.js Family Tree│  │ Tiptap Editor (Blog/Forum)   │    │   │
│  │  └──────────────────┘  └──────────────────────────────┘    │   │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐    │   │
│  │  │ Recharts         │  │ React Hook Form + Zod        │    │   │
│  │  │ (Analytics)      │  │ (Validation)                 │    │   │
│  │  └──────────────────┘  └──────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ HTTPS
┌─────────────────────────────────▼───────────────────────────────────┐
│                      VERCEL (Edge Network)                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                Next.js 16 (App Router)                      │   │
│  │                                                             │   │
│  │  ┌───────────────┐  ┌────────────────┐  ┌───────────────┐  │   │
│  │  │ Server        │  │ API Routes     │  │ Middleware     │  │   │
│  │  │ Components    │  │ (Webhooks,     │  │ (Auth check,  │  │   │
│  │  │ (RSC)         │  │  Uploads,      │  │  Rate limit,  │  │   │
│  │  │               │  │  Payments)     │  │  Analytics)   │  │   │
│  │  └───────────────┘  └────────────────┘  └───────────────┘  │   │
│  │                                                             │   │
│  │  ┌───────────────┐  ┌────────────────┐  ┌───────────────┐  │   │
│  │  │ Server        │  │ Prisma Client  │  │ Clerk SDK     │  │   │
│  │  │ Actions       │  │ (ORM)          │  │ (Auth)        │  │   │
│  │  └───────────────┘  └────────────────┘  └───────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────┬──────────────────┬──────────────────┬───────────────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Neon        │  │  AWS S3      │  │  Clerk       │
│  Postgres    │  │  (File       │  │  (Auth       │
│  (Database)  │  │   Storage)   │  │   Service)   │
│              │  │              │  │              │
│  - Users     │  │  - Avatars   │  │  - Sessions  │
│  - Posts     │  │  - Blog imgs │  │  - Users     │
│  - Forum     │  │  - Documents │  │  - Webhooks  │
│  - Payments  │  │  - Exports   │  │  - OAuth     │
│  - Analytics │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
       │
       ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Razorpay    │  │  Resend      │  │  NewsAPI     │
│  (Payments)  │  │  (Email)     │  │  (External   │
│              │  │              │  │   News)      │
│  - UPI       │  │  - Receipts  │  │              │
│  - Cards     │  │  - Alerts    │  │  - State     │
│  - NetBank   │  │  - Notifs    │  │  - National  │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 4.2.1 Clerk vs Resend — Email Responsibilities

```
| Email Type                        | Clerk Handles It? | Resend Needed? |
|-----------------------------------|-------------------|----------------|
| Email verification on sign-up     | ✅ Use Clerk      |                |
| Magic link / passwordless login   | ✅ Use Clerk      |                |
| Password reset emails             | ✅ Use Clerk      |                |
| OTP / 2FA codes                   | ✅ Use Clerk      |                |
| Welcome email after sign-up       |                   | ✅ Use Resend  |
| Order confirmation / receipts     |                   | ✅ Use Resend  |
| Contact form submissions          |                   | ✅ Use Resend  |
| Custom notifications / alerts     |                   | ✅ Use Resend  |
| Newsletter / marketing emails     |                   | ✅ Use Resend  |
```

### 4.3 Data Flow Architecture

```
User Action → Client Component → Server Action/API Route
    → Validation (Zod) → Auth Check (Clerk) → Role Check
    → Business Logic → Prisma Query → Neon Postgres
    → Response → Client Update (React State/Revalidation)
    → Analytics Event Logged (async, non-blocking)
```

### 4.4 Caching Strategy (enable cacheComponents: true and use "use cache" + <Suspense> boundaries)

```
| Content Type     | Strategy                                        | TTL           | Invalidation                  |
| ---------------- | ----------------------------------------------- | ------------- | ----------------------------- |
| Landing page     | SSG (static shell, no `"use cache"` needed)     | Build-time    | On deploy                     |
| Blog posts       | PPR (`"use cache"` + `cacheLife`)               | 60 seconds    | `revalidatePath`              |
| Forum threads    | SSR (Server Components, no cache)               | Real-time     | Automatic                     |
| News (external)  | PPR (`"use cache"` + DB cache)                  | 15 minutes    | Cron + `revalidateTag`        |
| News (local)     | PPR (`"use cache"` + `cacheLife`)               | 60 seconds    | `revalidatePath` on edit      |
| Family tree data | Client-side (SWR)                               | 5 minutes     | On mutation                   |
| Analytics data   | SSR (Server Components, no cache)               | Real-time     | Automatic                     |
| User profile     | Client-side (Clerk session)                     | Session-based | On update                     |
| Static assets    | SSG + CDN (Vercel Edge)                         | 1 year        | Content hash                  |
```

## 5. Project Structure & Skeleton

### 5.1 Complete Directory Structure

```

chandra_jyoti_dhanbari/
│
├── app/ # Next.js App Router
│ │
│ ├── (public)/ # PUBLIC ROUTES (no auth required)
│ │ ├── layout.tsx # Public layout (public navbar + footer)
│ │ ├── page.tsx # Landing page (hero, features, testimonials)
│ │ ├── about/
│ │ │ └── page.tsx # About Us page
│ │ └── contact/
│ │ └── page.tsx # Contact Us page
│ │
│ ├── (auth)/ # AUTH ROUTES (Clerk pages)
│ │ ├── layout.tsx # Centered auth layout
│ │ ├── sign-in/
│ │ │ └── [[...sign-in]]/
│ │ │ └── page.tsx # Sign in page
│ │ └── sign-up/
│ │ └── [[...sign-up]]/
│ │ └── page.tsx # Sign up page
│ │
│ ├── (protected)/ # PROTECTED ROUTES (auth required)
│ │ ├── layout.tsx # Protected layout (sidebar + topbar)
│ │ │
│ │ ├── home/
│ │ │ └── page.tsx # Community dashboard/homepage
│ │ │
│ │ ├── family-tree/
│ │ │ ├── page.tsx # Main family tree visualization
│ │ │ ├── add/
│ │ │ │ └── page.tsx # Add family member form
│ │ │ ├── [memberId]/
│ │ │ │ ├── page.tsx # Member detail view
│ │ │ │ └── edit/
│ │ │ │ └── page.tsx # Edit member form
│ │ │ └── search/
│ │ │ └── page.tsx # Search family members
│ │ │
│ │ ├── blog/
│ │ │ ├── page.tsx # Blog listing (all posts)
│ │ │ ├── create/
│ │ │ │ └── page.tsx # Create new blog post
│ │ │ ├── [slug]/
│ │ │ │ ├── page.tsx # Blog post detail view
│ │ │ │ └── edit/
│ │ │ │ └── page.tsx # Edit blog post
│ │ │ ├── categories/
│ │ │ │ └── [categorySlug]/
│ │ │ │ └── page.tsx # Posts by category
│ │ │ ├── tags/
│ │ │ │ └── [tagSlug]/
│ │ │ │ └── page.tsx # Posts by tag
│ │ │ ├── bookmarks/
│ │ │ │ └── page.tsx # User's bookmarked posts
│ │ │ └── my-posts/
│ │ │ └── page.tsx # User's own posts (drafts included)
│ │ │
│ │ ├── forum/
│ │ │ ├── page.tsx # Forum categories overview
│ │ │ ├── create/
│ │ │ │ └── page.tsx # Create new thread
│ │ │ ├── [categorySlug]/
│ │ │ │ ├── page.tsx # Threads in category
│ │ │ │ └── [threadSlug]/
│ │ │ │ └── page.tsx # Thread detail with replies
│ │ │ ├── search/
│ │ │ │ └── page.tsx # Search forum
│ │ │ └── my-threads/
│ │ │ └── page.tsx # User's threads
│ │ │
│ │ ├── news/
│ │ │ ├── page.tsx # News page with tabs
│ │ │ ├── [slug]/
│ │ │ │ └── page.tsx # News article detail
│ │ │ └── bookmarks/
│ │ │ └── page.tsx # Saved news articles
│ │ │
│ │ ├── payments/
│ │ │ ├── page.tsx # Payment dashboard
│ │ │ ├── donate/
│ │ │ │ └── page.tsx # Make a donation
│ │ │ ├── campaigns/
│ │ │ │ ├── page.tsx # Active campaigns list
│ │ │ │ └── [campaignId]/
│ │ │ │ └── page.tsx # Campaign detail + donate
│ │ │ ├── fines/
│ │ │ │ └── page.tsx # My fines (member view)
│ │ │ └── history/
│ │ │ └── page.tsx # Payment history + receipts
│ │ │
│ │ ├── analytics/
│ │ │ ├── page.tsx # Personal analytics dashboard
│ │ │ └── admin/
│ │ │ ├── page.tsx # Admin analytics overview
│ │ │ ├── users/
│ │ │ │ └── page.tsx # User analytics
│ │ │ ├── content/
│ │ │ │ └── page.tsx # Content analytics
│ │ │ ├── financial/
│ │ │ │ └── page.tsx # Financial analytics
│ │ │ └── system/
│ │ │ └── page.tsx # System health
│ │ │
│ │ ├── profile/
│ │ │ ├── page.tsx # User profile view
│ │ │ └── edit/
│ │ │ └── page.tsx # Edit profile
│ │ │
│ │ ├── notifications/
│ │ │ └── page.tsx # All notifications
│ │ │
│ │ └── admin/
│ │ ├── page.tsx # Admin dashboard
│ │ ├── users/
│ │ │ ├── page.tsx # User management
│ │ │ └── [userId]/
│ │ │ └── page.tsx # User detail/edit
│ │ ├── blog/
│ │ │ └── page.tsx # Blog moderation queue
│ │ ├── forum/
│ │ │ ├── page.tsx # Forum moderation
│ │ │ └── categories/
│ │ │ └── page.tsx # Manage forum categories
│ │ ├── family-tree/
│ │ │ └── page.tsx # Approve family tree entries
│ │ ├── news/
│ │ │ ├── page.tsx # Manage local news
│ │ │ └── create/
│ │ │ └── page.tsx # Create news article
│ │ ├── payments/
│ │ │ ├── page.tsx # Payment management
│ │ │ ├── campaigns/
│ │ │ │ ├── page.tsx # Manage campaigns
│ │ │ │ └── create/
│ │ │ │ └── page.tsx # Create campaign
│ │ │ └── fines/
│ │ │ ├── page.tsx # Manage fines
│ │ │ └── assign/
│ │ │ └── page.tsx # Assign fine to member
│ │ ├── testimonials/
│ │ │ └── page.tsx # Manage testimonials
│ │ ├── contact-submissions/
│ │ │ └── page.tsx # View contact form submissions
│ │ └── settings/
│ │ └── page.tsx # Site-wide settings
│ │
│ ├── api/ # API ROUTES
│ │ ├── webhooks/
│ │ │ ├── clerk/
│ │ │ │ └── route.ts # Clerk webhook (user sync)
│ │ │ └── razorpay/
│ │ │ └── route.ts # Razorpay payment webhook
│ │ ├── upload/
│ │ │ └── route.ts # AWS S3 file upload
│ │ ├── news/
│ │ │ └── external/
│ │ │ └── route.ts # Fetch external news
│ │ ├── export/
│ │ │ ├── analytics/
│ │ │ │ └── route.ts # Export analytics (CSV/PDF)
│ │ │ └── family-tree/
│ │ │ └── route.ts # Export family tree data
│ │ └── cron/
│ │ ├── news-refresh/
│ │ │ └── route.ts # Cron: refresh external news
│ │ └── overdue-fines/
│ │ └── route.ts # Cron: check overdue fines
│ │
│ ├── layout.tsx # Root layout
│ ├── globals.css # Global styles + Tailwind directives
│ ├── not-found.tsx # Custom 404 page
│ ├── error.tsx # Custom error boundary
│ └── loading.tsx # Global loading state
│
├── components/ # REACT COMPONENTS
│ │
│ ├── ui/ # shadcn/ui base components
│ │ ├── button.tsx
│ │ ├── card.tsx
│ │ ├── dialog.tsx
│ │ ├── dropdown-menu.tsx
│ │ ├── input.tsx
│ │ ├── label.tsx
│ │ ├── select.tsx
│ │ ├── textarea.tsx
│ │ ├── toast.tsx
│ │ ├── toaster.tsx
│ │ ├── tabs.tsx
│ │ ├── table.tsx
│ │ ├── badge.tsx
│ │ ├── avatar.tsx
│ │ ├── skeleton.tsx
│ │ ├── separator.tsx
│ │ ├── sheet.tsx
│ │ ├── command.tsx
│ │ ├── popover.tsx
│ │ ├── calendar.tsx
│ │ ├── pagination.tsx
│ │ ├── progress.tsx
│ │ ├── accordion.tsx
│ │ ├── alert.tsx
│ │ ├── breadcrumb.tsx
│ │ ├── chart.tsx
│ │ └── tooltip.tsx
│ │
│ ├── shared/ # Shared/global components
│ │ ├── public-navbar.tsx # Navbar for public pages
│ │ ├── protected-navbar.tsx # Top navbar for protected pages
│ │ ├── sidebar.tsx # Sidebar navigation (protected)
│ │ ├── mobile-sidebar.tsx # Mobile sidebar (sheet)
│ │ ├── footer.tsx # Site footer
│ │ ├── logo.tsx # Logo component
│ │ ├── theme-toggle.tsx # Dark/light mode toggle
│ │ ├── user-button.tsx # User avatar + menu
│ │ ├── search-command.tsx # Global search (Cmd+K)
│ │ ├── notification-bell.tsx # Notification icon + dropdown
│ │ ├── breadcrumbs.tsx # Dynamic breadcrumbs
│ │ ├── page-header.tsx # Reusable page header
│ │ ├── empty-state.tsx # Empty state illustration
│ │ ├── loading-spinner.tsx # Loading spinner
│ │ ├── error-boundary.tsx # Error boundary wrapper
│ │ ├── confirm-dialog.tsx # Confirmation modal
│ │ ├── image-upload.tsx # S3 image upload component
│ │ ├── file-upload.tsx # S3 file upload component
│ │ ├── rich-text-editor.tsx # Tiptap editor wrapper
│ │ ├── rich-text-viewer.tsx # Tiptap content renderer
│ │ ├── date-picker.tsx # Date picker component
│ │ ├── data-table.tsx # Reusable data table
│ │ ├── stats-card.tsx # Statistics card
│ │ ├── share-buttons.tsx # Social share buttons
│ │ └── scroll-to-top.tsx # Scroll to top button
│ │
│ ├── landing/ # Landing page components
│ │ ├── hero-section.tsx # Hero with CTA
│ │ ├── village-section.tsx # About the village
│ │ ├── features-section.tsx # Platform features showcase
│ │ ├── sanstha-section.tsx # About the Sanstha
│ │ ├── testimonials-section.tsx # User testimonials carousel
│ │ ├── stats-counter.tsx # Animated statistics
│ │ ├── cta-banner.tsx # Call-to-action banner
│ │ ├── screenshot-carousel.tsx # Platform screenshots
│ │ └── floating-particles.tsx # Background animation
│ │
│ ├── family-tree/ # Family tree components
│ │ ├── tree-visualization.tsx # Main D3.js tree canvas
│ │ ├── tree-controls.tsx # Zoom, pan, layout controls
│ │ ├── member-node.tsx # Individual node in tree
│ │ ├── member-detail-card.tsx # Click-to-expand member card
│ │ ├── member-form.tsx # Add/edit member form
│ │ ├── tree-search.tsx # Search within tree
│ │ ├── tree-filters.tsx # Filter controls
│ │ ├── tree-legend.tsx # Color legend
│ │ ├── tree-minimap.tsx # Minimap for navigation
│ │ └── tree-export.tsx # Export controls
│ │
│ ├── blog/ # Blog components
│ │ ├── blog-card.tsx # Blog post card (listing)
│ │ ├── blog-card-featured.tsx # Featured post card (large)
│ │ ├── blog-content.tsx # Blog post content renderer
│ │ ├── blog-sidebar.tsx # Sidebar (categories, tags, recent)
│ │ ├── blog-author.tsx # Author info section
│ │ ├── blog-toc.tsx # Table of contents
│ │ ├── blog-comments.tsx # Comments section
│ │ ├── comment-item.tsx # Single comment (nested)
│ │ ├── comment-form.tsx # Write comment form
│ │ ├── blog-reactions.tsx # Like, bookmark, share
│ │ ├── related-posts.tsx # Related posts section
│ │ ├── blog-filters.tsx # Filter/sort controls
│ │ └── blog-editor.tsx # Blog post editor (Tiptap)
│ │
│ ├── forum/ # Forum components
│ │ ├── category-card.tsx # Forum category card
│ │ ├── thread-card.tsx # Thread preview card
│ │ ├── thread-content.tsx # Thread detail content
│ │ ├── reply-item.tsx # Single reply (nested)
│ │ ├── reply-form.tsx # Write reply form
│ │ ├── thread-form.tsx # Create thread form
│ │ ├── forum-sidebar.tsx # Forum sidebar (categories, stats)
│ │ ├── poll-widget.tsx # Poll display + voting
│ │ ├── poll-form.tsx # Create poll form
│ │ ├── vote-buttons.tsx # Upvote/downvote buttons
│ │ └── forum-filters.tsx # Filter/sort controls
│ │
│ ├── news/ # News components
│ │ ├── news-card.tsx # News article card
│ │ ├── news-tabs.tsx # Category tabs
│ │ ├── news-content.tsx # Article content
│ │ ├── news-source-badge.tsx # Source indicator
│ │ └── news-filters.tsx # Filter controls
│ │
│ ├── payments/ # Payment components
│ │ ├── donation-form.tsx # Donation form
│ │ ├── amount-selector.tsx # Preset + custom amount
│ │ ├── campaign-card.tsx # Campaign card with progress
│ │ ├── campaign-progress.tsx # Progress bar
│ │ ├── campaign-donors.tsx # Donor list
│ │ ├── fine-card.tsx # Fine/penalty card
│ │ ├── fine-dispute-form.tsx # Dispute a fine
│ │ ├── payment-receipt.tsx # Payment receipt view
│ │ ├── payment-history-table.tsx # Transaction history
│ │ └── razorpay-button.tsx # Razorpay checkout button
│ │
│ ├── analytics/ # Analytics components
│ │ ├── line-chart.tsx # Recharts line chart
│ │ ├── bar-chart.tsx # Recharts bar chart
│ │ ├── pie-chart.tsx # Recharts pie chart
│ │ ├── area-chart.tsx # Recharts area chart
│ │ ├── stats-overview.tsx # Stats cards row
│ │ ├── activity-feed.tsx # Activity timeline
│ │ ├── top-content-table.tsx # Top performing content
│ │ ├── user-engagement-chart.tsx # Engagement metrics
│ │ ├── device-breakdown.tsx # Device/browser pie chart
│ │ ├── date-range-picker.tsx # Date range selector
│ │ └── export-button.tsx # Export data button
│ │
│ ├── admin/ # Admin components
│ │ ├── admin-sidebar.tsx # Admin navigation
│ │ ├── user-table.tsx # Users data table
│ │ ├── role-select.tsx # Role assignment dropdown
│ │ ├── moderation-queue.tsx # Content moderation list
│ │ ├── fine-assign-form.tsx # Assign fine form
│ │ ├── campaign-form.tsx # Create/edit campaign
│ │ ├── news-editor.tsx # News article editor
│ │ ├── settings-form.tsx # Site settings form
│ │ ├── testimonial-manager.tsx # Approve/reject testimonials
│ │ └── system-health.tsx # System health dashboard
│ │
│ └── providers/ # Context providers
│ ├── theme-provider.tsx # Dark/light theme
│ ├── clerk-provider.tsx # Clerk auth wrapper
│ └── toast-provider.tsx # Toast notifications
│
├── lib/ # UTILITY LIBRARIES
│ ├── db.ts # Prisma client singleton
│ ├── s3.ts # AWS S3 client + helpers
│ ├── utils.ts # General utility functions
│ ├── analytics.ts # Analytics tracking helpers
│ ├── constants.ts # App-wide constants
│ ├── validations/ # Zod schemas
│ │ ├── auth.ts # Auth-related schemas
│ │ ├── blog.ts # Blog schemas
│ │ ├── forum.ts # Forum schemas
│ │ ├── family-tree.ts # Family tree schemas
│ │ ├── payments.ts # Payment schemas
│ │ ├── news.ts # News schemas
│ │ ├── contact.ts # Contact form schema
│ │ └── profile.ts # Profile schemas
│ ├── actions/ # Server actions
│ │ ├── user.actions.ts # User CRUD actions
│ │ ├── blog.actions.ts # Blog CRUD actions
│ │ ├── forum.actions.ts # Forum CRUD actions
│ │ ├── family-tree.actions.ts # Family tree actions
│ │ ├── payment.actions.ts # Payment actions
│ │ ├── news.actions.ts # News actions
│ │ ├── analytics.actions.ts # Analytics actions
│ │ ├── notification.actions.ts # Notification actions
│ │ ├── contact.actions.ts # Contact form actions
│ │ ├── admin.actions.ts # Admin actions
│ │ └── testimonial.actions.ts # Testimonial actions
│ ├── queries/ # Database query helpers
│ │ ├── user.queries.ts
│ │ ├── blog.queries.ts
│ │ ├── forum.queries.ts
│ │ ├── family-tree.queries.ts
│ │ ├── payment.queries.ts
│ │ ├── news.queries.ts
│ │ └── analytics.queries.ts
│ └── email/ # Email templates
│ ├── welcome.tsx # Welcome email
│ ├── donation-receipt.tsx # Donation confirmation
│ ├── fine-notice.tsx # Fine notification
│ └── campaign-alert.tsx # New campaign alert
│
├── hooks/ # CUSTOM HOOKS
│ ├── use-debounce.ts # Debounce hook
│ ├── use-media-query.ts # Media query hook
│ ├── use-intersection.ts # Intersection observer
│ ├── use-local-storage.ts # Local storage hook
│ ├── use-scroll-position.ts # Scroll position hook
│ └── use-analytics.ts # Analytics tracking hook
│
├── types/ # TYPESCRIPT TYPES
│ ├── index.ts # Barrel exports
│ ├── blog.ts # Blog types
│ ├── forum.ts # Forum types
│ ├── family-tree.ts # Family tree types
│ ├── payments.ts # Payment types
│ ├── news.ts # News types
│ ├── analytics.ts # Analytics types
│ └── admin.ts # Admin types
│
├── prisma/ # PRISMA
│ ├── schema.prisma # Database schema
│ ├── seed.ts # Seed data
│ └── migrations/ # Migration history
│
├── public/ # STATIC FILES
│ ├── images/
│ │ ├── village/ # Village photos
│ │ ├── screenshots/ # Platform screenshots
│ │ ├── team/ # Committee member photos
│ │ └── icons/ # Custom icons
│ ├── fonts/ # Custom fonts (if self-hosted)
│ ├── favicon.ico
│ ├── og-image.png # Open Graph image
│ └── robots.txt
│
├── docs/ # DOCUMENTATION
│ └── prd.md # This document
│
├── proxy.ts # CLERK MIDDLEWARE
├── next.config.ts # Next.js configuration
├── tailwind.config.ts # Tailwind CSS configuration (v4)
├── postcss.config.mjs # PostCSS configuration
├── tsconfig.json # TypeScript configuration
├── package.json # Dependencies
├── .env.local # Environment variables (local)
├── .env.example # Environment template
├── .eslintrc.json # ESLint configuration
├── .prettierrc # Prettier configuration
├── .gitignore # Git ignore rules
└── README.md # Project README

```

### 5.2 Key File Explanations

#### `proxy.ts` — Clerk Auth Middleware

```typescript
// Purpose: Protects routes, syncs user sessions, tracks analytics
// - Public routes: /, /about, /contact, /api/webhooks/*
// - Auth routes: /sign-in, /sign-up
// - Everything else: requires authentication
// - After auth check: logs page view to analytics (async)

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

#### `lib/db.ts` — Prisma Client Singleton

```typescript
// Purpose: Single Prisma client instance to prevent connection exhaustion
// - In development: stores client on global object to survive HMR
// - In production: creates single instance

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

#### `lib/s3.ts` — AWS S3 Client

```typescript
// Purpose: AWS S3 file upload/delete/get operations
// - Upload files (images, documents) to S3 bucket
// - Generate presigned URLs for secure access
// - Delete files on content removal
// - Supports: jpg, png, webp, gif, pdf (max 10MB)

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
): Promise<string> {
  /* ... */
}

export async function deleteFromS3(key: string): Promise<void> {
  /* ... */
}
export async function getSignedFileUrl(key: string): Promise<string> {
  /* ... */
}
```

---

## 6. User Roles & Permissions

### 6.1 Role Hierarchy

```
SUPER_ADMIN (Level 5)
    └── ADMIN (Level 4)
        └── MODERATOR (Level 3)
            └── MEMBER (Level 2)
                └── GUEST (Level 1 — unauthenticated)
```

### 6.2 Role Definitions

#### GUEST (Unauthenticated)

- **Who:** Anyone visiting the website without logging in
- **Access:** Landing page, About Us, Contact Us only
- **Cannot:** View any protected content, create any content, make payments

#### MEMBER (Default for registered users)

- **Who:** Any registered and verified village resident or diaspora member
- **Access:** All protected pages
- **Can:**
  - View homepage dashboard, family tree, blog, forum, news
  - Create blog posts, forum threads, forum replies
  - Like, comment, bookmark content
  - Make voluntary donations
  - Pay assigned fines
  - View personal analytics dashboard
  - Add family members (subject to admin approval)
  - Update own profile
  - Submit testimonials
  - Submit contact form
- **Cannot:**
  - Moderate other users' content
  - Access admin panel
  - Assign fines
  - Create emergency campaigns
  - View admin analytics
  - Change user roles

#### MODERATOR

- **Who:** Trusted community members appointed by admin
- **Inherits:** All MEMBER permissions, plus:
- **Additional Can:**
  - Approve/reject blog posts (if moderation enabled)
  - Edit/delete any blog post or forum thread
  - Pin/lock forum threads
  - Hide/remove reported content
  - View moderation queue
  - Warn users for violations

#### ADMIN (Sanstha Committee Members)

- **Who:** Village Sanstha committee members (typically 5-10 people)
- **Inherits:** All MODERATOR permissions, plus:
- **Additional Can:**
  - Access full admin panel
  - Manage users (view all, deactivate, change roles up to MODERATOR)
  - Create/manage emergency donation campaigns
  - Assign fines/penalties to members
  - Manage fine disputes (waive, modify)
  - Create/manage local news articles
  - Manage forum categories
  - Manage blog categories and tags
  - View admin analytics dashboard
  - Approve family tree additions
  - Manage testimonials
  - View contact form submissions
  - Export data (analytics, financial, family tree)

#### SUPER_ADMIN (Platform Owner)

- **Who:** Sanstha President or technical administrator (1-2 people)
- **Inherits:** All ADMIN permissions, plus:
- **Additional Can:**
  - Promote/demote users to any role including ADMIN
  - Access site-wide settings
  - View system health metrics
  - Manage Clerk integration settings
  - Delete any user account
  - Access all data exports

### 6.3 Complete Permission Matrix

| Feature / Action         | GUEST | MEMBER               | MODERATOR | ADMIN              | SUPER_ADMIN    |
| ------------------------ | ----- | -------------------- | --------- | ------------------ | -------------- |
| **Public Pages**         |       |                      |           |                    |                |
| View landing page        | ✅    | ✅                   | ✅        | ✅                 | ✅             |
| View about us            | ✅    | ✅                   | ✅        | ✅                 | ✅             |
| View contact us          | ✅    | ✅                   | ✅        | ✅                 | ✅             |
| Submit contact form      | ✅    | ✅                   | ✅        | ✅                 | ✅             |
| **Authentication**       |       |                      |           |                    |                |
| Register                 | ✅    | —                    | —         | —                  | —              |
| Login                    | ✅    | ✅                   | ✅        | ✅                 | ✅             |
| **Homepage**             |       |                      |           |                    |                |
| View dashboard           | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| **Family Tree**          |       |                      |           |                    |                |
| View tree                | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Search tree              | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Add family member        | ❌    | ✅ (approval needed) | ✅        | ✅ (auto-approved) | ✅             |
| Edit family member       | ❌    | Own family only      | ✅        | ✅                 | ✅             |
| Delete family member     | ❌    | ❌                   | ❌        | ✅                 | ✅             |
| Approve additions        | ❌    | ❌                   | ❌        | ✅                 | ✅             |
| Export tree data         | ❌    | ❌                   | ❌        | ✅                 | ✅             |
| **Blog**                 |       |                      |           |                    |                |
| View blog posts          | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Create blog post         | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Edit own post            | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Edit any post            | ❌    | ❌                   | ✅        | ✅                 | ✅             |
| Delete own post          | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Delete any post          | ❌    | ❌                   | ✅        | ✅                 | ✅             |
| Feature a post           | ❌    | ❌                   | ❌        | ✅                 | ✅             |
| Comment                  | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Like / Bookmark          | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Manage categories/tags   | ❌    | ❌                   | ❌        | ✅                 | ✅             |
| **Forum**                |       |                      |           |                    |                |
| View forum               | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Create thread            | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Reply to thread          | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Edit own thread/reply    | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Edit any thread/reply    | ❌    | ❌                   | ✅        | ✅                 | ✅             |
| Delete any thread/reply  | ❌    | ❌                   | ✅        | ✅                 | ✅             |
| Pin/Lock thread          | ❌    | ❌                   | ✅        | ✅                 | ✅             |
| Create poll              | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Vote in poll             | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Manage categories        | ❌    | ❌                   | ❌        | ✅                 | ✅             |
| **News**                 |       |                      |           |                    |                |
| View all news            | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Create local news        | ❌    | ❌                   | ❌        | ✅                 | ✅             |
| Edit/Delete local news   | ❌    | ❌                   | ❌        | ✅                 | ✅             |
| Bookmark news            | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| **Payments**             |       |                      |           |                    |                |
| Make donation            | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| View own payment history | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| View own fines           | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Pay fine                 | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Dispute fine             | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| Create campaign          | ❌    | ❌                   | ❌        | ✅                 | ✅             |
| Assign fine              | ❌    | ❌                   | ❌        | ✅                 | ✅             |
| View all transactions    | ❌    | ❌                   | ❌        | ✅                 | ✅             |
| Waive fine               | ❌    | ❌                   | ❌        | ✅                 | ✅             |
| Export financial data    | ❌    | ❌                   | ❌        | ✅                 | ✅             |
| **Analytics**            |       |                      |           |                    |                |
| View personal analytics  | ❌    | ✅                   | ✅        | ✅                 | ✅             |
| View admin analytics     | ❌    | ❌                   | ❌        | ✅                 | ✅             |
| View system health       | ❌    | ❌                   | ❌        | ❌                 | ✅             |
| Export analytics         | ❌    | ❌                   | ❌        | ✅                 | ✅             |
| **Admin**                |       |                      |           |                    |                |
| Access admin panel       | ❌    | ❌                   | ❌        | ✅                 | ✅             |
| Manage users             | ❌    | ❌                   | ❌        | ✅ (up to MOD)     | ✅ (all roles) |
| Site settings            | ❌    | ❌                   | ❌        | ❌                 | ✅             |

### 6.4 Role Authorization Implementation

```typescript
// lib/auth.ts — Authorization helper

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

export async function getCurrentDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  return db.user.findUnique({
    where: { clerkId: userId },
  });
}

export async function requireRole(minimumRole: Role) {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("Unauthorized");
  if (ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[minimumRole]) {
    throw new Error("Insufficient permissions");
  }
  return user;
}

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
```

---

## 7. Feature Specifications

### 7.1 Landing Page (Public)

The landing page is the **only publicly accessible main page** and serves as the community's digital front door. It must make a **stunning first impression**.

**Route:** `/` (public)
**Layout:** Full-width, no sidebar, public navbar with Login/Register buttons

#### 7.1.1 Public Navbar

- **Logo:** Left-aligned, clickable (returns to /)
- **Nav Links:** Home, About, Contact
- **Auth Buttons:** Login (outlined) + Register (filled, primary gradient)
- **Behavior:** Sticky on scroll, glassmorphism background on scroll (`backdrop-blur-md bg-white/70 dark:bg-slate-900/70`)
- **Mobile:** Hamburger menu with shadcn Sheet slide-out
- **Animation:** Framer Motion for smooth height/bg transitions when scrolled past 50px

#### 7.1.2 Hero Section

- **Background:** Dark gradient (slate-900 to indigo-950) with 3-4 animated floating gradient orbs (indigo, emerald, amber)
- **Headline:** `text-5xl md:text-7xl font-bold` Outfit font, gradient text (`bg-gradient-to-r from-white via-indigo-200 to-emerald-200 bg-clip-text text-transparent`)
- **Subtitle:** `text-xl md:text-2xl text-muted-foreground` Inter font
- **CTA Buttons:**
  - "Get Started" -> `/sign-up` (primary gradient button with hover glow)
  - "Learn More" -> smooth scroll to features section (outlined button)
- **Stats Row:** Mini animated counters below CTAs (500+ Members, 100+ Families, etc.)
- **Animation:** Framer Motion stagger: heading -> subtitle -> buttons -> stats (200ms delays)

#### 7.1.3 About the Village Section

- **Title:** "Discover Tumin Dhanbari"
- **Layout:** Bento grid for village images (3 columns, varying heights)
- **Images:** Next.js Image with blur placeholder, lazy loading
- **Description:** Brief paragraph about village history and significance
- **Stats Cards (4):** Location (Gangtok District), Elevation (5000ft), Population (2000+), Homes (300+)
  - Each card: icon + animated counter + label
- **Animation:** Scroll-triggered reveal with `whileInView`

#### 7.1.4 Platform Features Showcase

- **Title:** "What We Offer"
- **Layout:** 3-column responsive grid (1 col mobile, 2 tablet, 3 desktop)
- **Feature Cards (6):** Family Tree, Blog, Forum, News, Donations, Analytics
  - Glassmorphism: `bg-white/5 backdrop-blur-sm border border-white/10 hover:border-indigo-500/50`
  - Each card: Lucide icon, title, description, screenshot of actual feature
- **Animation:** Staggered fade-in on scroll

#### 7.1.5 Testimonials Section

- **Title:** "What Our Members Say"
- **Auto-scrolling carousel:** Pause on hover, manual dots navigation
- **Each testimonial card:** Large italic quote, 5-star rating, author avatar (circular 60px), name, role
- **Decorative:** Large quote icon as background decoration
- **Data Source:** Approved testimonials from database

#### 7.1.6 Statistics Counter Section

- **Full-width section** with dark gradient background
- **4 animated counters:** Total Members, Families Connected, Blog Posts Published, Funds Raised
- **Animation:** Numbers animate from 0 to target when section enters viewport (Intersection Observer)

#### 7.1.7 Call-to-Action Banner

- **Full-width gradient:** indigo to emerald animated mesh gradient
- **Headline:** "Join Our Community Today"
- **Subtitle:** "Be part of Tumin Dhanbari's digital transformation"
- **CTA button:** "Register Now" with animated shine/shimmer effect

#### 7.1.8 Footer

- **3-column layout** (stacks on mobile)
  - Column 1: Logo, tagline, village address
  - Column 2: Quick Links (Home, About, Contact, Blog, Forum, News)
  - Column 3: Contact info (email, phone, address), Social links (Facebook, Instagram, YouTube)
- **Bottom bar:** Copyright year, "Made with heart for Tumin Dhanbari"

---

### 7.2 Authentication System

**Provider:** Clerk
**Routes:** `/sign-in/*`, `/sign-up/*`

#### 7.2.1 Sign Up Flow

1. User clicks "Register" on landing page
2. Clerk Sign Up UI renders (customized styling to match theme)
3. Options: Email+Password, Google OAuth, Phone Number
4. Email verification via OTP
5. Account created in Clerk
6. Clerk webhook fires to `/api/webhooks/clerk`
7. Server creates User record in Neon Postgres (role = MEMBER)
8. AnalyticsEvent logged (ACCOUNT_CREATED)
9. Welcome email sent via Resend
10. Redirect to `/home`

#### 7.2.2 Sign In Flow

1. User clicks "Login"
2. Clerk Sign In UI renders
3. Email+Password or Google OAuth
4. Clerk validates -> JWT session created
5. Redirect to `/home`
6. AnalyticsEvent logged (USER_LOGIN)

#### 7.2.3 Clerk Webhook Handler

Handles events: `user.created`, `user.updated`, `user.deleted`

- **user.created:** Create User in DB with role MEMBER, send welcome email
- **user.updated:** Sync profile changes (name, email, avatar) to DB
- **user.deleted:** Soft-delete (set isActive=false)

#### 7.2.4 Sign Up Page Customization

- Centered layout with dark gradient background
- Custom heading: "Join Chandra Jyoti Sanstha"
- Clerk appearance customization: glassmorphism card, themed input fields
- Fallback redirect to `/home`

---

### 7.3 Homepage Dashboard (Protected)

**Route:** `/home` (protected, MEMBER+)

The authenticated homepage is the community dashboard, the first thing users see after login.

#### 7.3.1 Layout Structure

- **Top Navbar:** Logo, Global Search (Cmd+K), Notification Bell, User Avatar Menu
- **Left Sidebar:** Navigation links (Home, Family Tree, Blog, Forum, News, Payments, Analytics, Profile, Admin)
- **Main Content:** Dashboard grid

#### 7.3.2 Dashboard Sections

**1. Welcome Banner**

- Personalized greeting: "Welcome back, {firstName}!"
- User avatar, today's date, motivational community quote
- Admin-specific: pending actions count badge (approvals, reports, fines)

**2. Quick Stats Cards (4 columns, responsive)**

| Card                 | Data            | Trend                           |
| -------------------- | --------------- | ------------------------------- |
| Total Members        | Count from DB   | +N new this month (green arrow) |
| Blog Posts           | Published count | +N new today                    |
| Forum Threads        | Active count    | +N new today                    |
| Donations This Month | Sum in INR      | Comparison to last month        |

- Design: Glassmorphism cards with subtle gradient backgrounds
- Numbers: Animated counter on page load

**3. Recent Blog Posts (2x2 grid)**

- Latest 4 published posts
- Card: cover image, title, author avatar+name, date, reading time
- "View All" link to `/blog`

**4. Active Forum Threads (list, 5 items)**

- Top 5 by recent activity
- Each: title, category badge, reply count, last activity timestamp
- "View All" link to `/forum`

**5. News Highlights (list, 3 items)**

- Latest 3 news items (mix of local + external)
- Each: headline, source badge, time ago
- "View All" link to `/news`

**6. Community Activity Feed (timeline)**

- Last 10 events: new member, blog post, donation, forum thread
- Each: user avatar, action description, relative timestamp
- "Load More" button

**7. Quick Action Buttons (row of 4)**

- Create Post, Start Thread, Make Donation, View Family Tree
- Each: large icon + label, links to respective page

---

### 7.4 Family Tree

**Route:** `/family-tree` (protected)
**Library:** D3.js v7+

#### 7.4.1 Overview

The family tree is the **flagship feature** -- an interactive, zoomable D3.js visualization of every family in Tumin Dhanbari village showing parent-child relationships, spousal connections, and generational groupings.

#### 7.4.2 Page Layout

- **Header:** "Family Tree of Tumin Dhanbari" with search bar and layout toggle
- **Filters Bar:** Family/Clan dropdown, Generation filter, Living/Deceased toggles, Gender filter
- **Main Canvas:** D3.js SVG rendering area (full-width, 600px+ height)
- **Controls:** Zoom in/out/reset, Fullscreen toggle, Export dropdown
- **Legend:** Color coding (Male=blue, Female=pink, Deceased=gray), Line types (parent/child=solid, spouse=dashed)
- **Minimap:** Small overview map in corner for navigation
- **Add Button:** "+ Add Family Member" button (opens form modal)

#### 7.4.3 Member Node Design

Each person rendered as a D3 custom node:

- **Avatar:** 40x40px circular photo (or initials fallback)
- **Name:** First + Last name (bold, white text)
- **Birth Year:** "b. YYYY" format
- **Relation Count:** "Father of X" / "Mother of X"
- **Color Coding:** Male=blue border, Female=pink border, Deceased=gray border + opacity
- **Click:** Opens detail card overlay

#### 7.4.4 Member Detail Card (Overlay)

Appears on node click with full member info:

- Large avatar, full name, gender, age/birth-death dates
- Family clan name
- Parents (linked, clickable)
- Spouse (linked, clickable)
- Children count + names (linked)
- Bio text
- Action buttons: Edit (if own family), View Family Branch

#### 7.4.5 Tree Layout Options

| Layout             | Best For           | Description                           |
| ------------------ | ------------------ | ------------------------------------- |
| Vertical (default) | Small-medium trees | Top-down hierarchy, most intuitive    |
| Horizontal         | Wide families      | Left-to-right, good for many siblings |
| Radial             | Large trees (500+) | Circular layout, compact              |

#### 7.4.6 D3.js Implementation Details

- **Zoom:** `d3.zoom()` with scale extent [0.1, 4]
- **Pan:** Drag to pan across the tree
- **Hierarchy:** `d3.tree()` layout from flat data via `buildHierarchy()`
- **Links:** `d3.linkVertical()` for parent-child, dashed paths for spouse connections
- **Transitions:** Smooth 300ms transitions on expand/collapse, zoom, pan
- **Initial Fit:** Auto-zoom to fit entire tree on load

#### 7.4.7 Search and Filter

- **Search:** Instant search by name; matching nodes highlighted with amber border/glow
- **Family/Clan Filter:** Dropdown of all clans; non-matching nodes faded
- **Generation Filter:** Filter by generation number
- **Living/Deceased Toggle:** Show/hide based on isAlive status

#### 7.4.8 Add Family Member Form

Fields:

- First Name (required), Last Name (required)
- Date of Birth (date picker), Date of Death (optional)
- Gender (Male/Female/Other radio)
- Family Clan (dropdown)
- Father (searchable dropdown of existing members)
- Mother (searchable dropdown)
- Spouse (searchable dropdown)
- Photo (image upload to S3)
- Bio (textarea, optional)

Behavior:

- MEMBER submissions require admin approval (`isApproved = false`)
- ADMIN submissions auto-approved (`isApproved = true`)
- After submit: revalidate `/family-tree` path

#### 7.4.9 Export Options

- **PNG:** High-res screenshot of current view via html2canvas
- **SVG:** Native SVG export
- **PDF:** Formatted document with jsPDF
- **JSON/CSV:** Raw data export (ADMIN only)

---

### 7.5 Blog System

**Routes:** `/blog/*` (protected)

#### 7.5.1 Blog Listing Page (`/blog`)

- **Header:** "Community Blog" + "Create Post" button
- **Featured Post:** Full-width large card at top (admin-marked featured posts)
- **Filter Bar:** Category dropdown, Sort (Latest/Popular/Most Commented), Search input
- **Post Grid:** 3-column responsive grid (1 mobile, 2 tablet, 3 desktop)
- **Post Card:** Cover image, title (2 lines max), excerpt, author avatar+name, date, reading time, like count, comment count
- **Pagination:** Numbered pages with prev/next
- **Sidebar (desktop):** Categories with post count, Popular Tags cloud, Top Authors

#### 7.5.2 Blog Post Detail Page (`/blog/[slug]`)

- **Breadcrumb:** Blog > Category > Post Title
- **Category Badge:** Colored badge
- **Title:** Large heading (Outfit font)
- **Author Info:** Avatar, name, publish date, update date, reading time, view count
- **Action Bar:** Like button (with count), Comment count, Bookmark toggle, Share dropdown (copy link, social)
- **Cover Image:** Full-width with rounded corners
- **Table of Contents:** Auto-generated from headings (sticky sidebar on desktop)
- **Content:** Tiptap rendered HTML with prose typography (serif body text)
- **Tags:** Tag badges at bottom
- **Author Bio:** Card with avatar, name, bio, post count
- **Related Posts:** 3 related posts based on category/tags
- **Comments Section:**
  - Comment count in header
  - Write comment form (rich text with Tiptap)
  - Threaded comments (up to 3 levels deep)
  - Each comment: author avatar, name, timestamp, content, like button, reply button
  - Pinned comment (author can pin one)
  - Report button on each comment

#### 7.5.3 Blog Editor (`/blog/create`, `/blog/[slug]/edit`)

- **Title Input:** Large text input
- **Cover Image Upload:** Drag-and-drop zone, uploads to S3 (max 5MB, JPG/PNG/WebP)
- **Excerpt Input:** Short text area (max 300 chars)
- **Category Selector:** Dropdown
- **Tags Selector:** Multi-select (max 5 tags)
- **Rich Text Editor (Tiptap):**
  - Toolbar: Bold, Italic, Underline, Strikethrough, H1-H3, Bullet List, Numbered List, Checklist, Code Block, Blockquote, Table, Image Upload, YouTube Embed, Horizontal Rule, Text Alignment, Undo/Redo
  - Image upload: Drag-and-drop within editor, uploads to S3
  - Auto-save: Every 30 seconds to draft
  - Last saved indicator
- **Publishing Options:**
  - Publish now
  - Schedule for later (date+time picker)
  - Save as draft
  - Feature post checkbox (ADMIN only)
- **Action Buttons:** "Save Draft" (secondary) + "Publish Post" (primary)

#### 7.5.4 Blog Zod Validation

```typescript
// lib/validations/blog.ts
export const blogPostSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(50),
  excerpt: z.string().max(300).optional(),
  coverImage: z.string().url().optional().nullable(),
  categoryId: z.string().cuid().optional().nullable(),
  tags: z.array(z.string().cuid()).max(5).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).default("DRAFT"),
  scheduledAt: z.string().datetime().optional().nullable(),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  postId: z.string().cuid(),
  parentId: z.string().cuid().optional().nullable(),
});
```

#### 7.5.5 My Posts Page (`/blog/my-posts`)

- Lists all posts by current user (all statuses: Draft, Published, Archived, Scheduled)
- Status badge on each post
- Edit and Delete actions
- Stats: views, likes, comments per post

#### 7.5.6 Bookmarks Page (`/blog/bookmarks`)

- Grid of bookmarked posts
- Remove bookmark action
- Sort by date bookmarked

---

### 7.6 Forum System

**Routes:** `/forum/*` (protected)

#### 7.6.1 Forum Categories Page (`/forum`)

- **Header:** "Community Forum" + "Start New Thread" button
- **Categories Grid:** Cards for each forum category
  - Icon, Name, Description (1 line), Color accent
  - Thread count, Reply count
  - Latest thread title + timestamp
  - Example categories: General Discussion, Announcements, Events, Help & Support, Off-Topic, Sanstha Business

- **Sidebar:**
  - Forum Stats (total threads, total replies, active users today)
  - Recent Activity list
  - Your Threads link

#### 7.6.2 Category Threads Page (`/forum/[categorySlug]`)

- **Category Header:** Category icon, name, description
- **Pinned Threads:** Displayed first with pin badge
- **Thread List:** Table/card format
  - Title, Author avatar+name, Reply count, View count, Last activity
  - Status badges: Open (green), Resolved (blue), Closed (gray)
  - Locked icon if locked
- **Creation:** "New Thread in {category}" button
- **Sort:** Latest, Most Replied, Unanswered
- **Pagination:** Standard next/prev

#### 7.6.3 Thread Detail Page (`/forum/[categorySlug]/[threadSlug]`)

- **Thread Header:** Title, Author, Created date, View count, Status badge
- **Thread Content:** Rich text rendered from Tiptap
- **Thread Actions:** Pin/Lock (MODERATOR+), Edit/Delete (author or MODERATOR+), Change Status
- **Poll Widget (if thread has poll):**
  - Question text
  - Radio/checkbox options with vote counts
  - Vote button (one vote per user)
  - Results bar chart (visible after voting)

- **Replies Section:**
  - Sort: Oldest First (default), Newest First, Most Upvoted
  - Each reply:
    - Author avatar, name, role badge, join date, post count
    - Content (rich text)
    - Upvote/Downvote buttons with count
    - Reply button, Quote button
    - "Mark as Solution" button (thread author or MODERATOR+)
    - Edit/Delete (own or MODERATOR+)
    - Nested replies (up to 2 levels)
    - Solution badge (green checkmark) if marked
  - Reply form at bottom: Rich text editor, Submit button

#### 7.6.4 Create Thread Page (`/forum/create`)

- Category selector (dropdown with category names)
- Title input
- Content editor (Tiptap, similar to blog but simpler toolbar)
- Tags (multi-select, max 3)
- Optional: Add Poll checkbox
  - Poll question input
  - Poll options (2-6 options, add/remove)
  - Poll type: Single choice or Multiple choice
- Submit button: "Post Thread"

#### 7.6.5 Forum Features Summary

| Feature         | Description                          |
| --------------- | ------------------------------------ |
| Thread Status   | Open, Resolved, Closed               |
| Pinned Threads  | Admin/Mod can pin threads to top     |
| Locked Threads  | No new replies allowed               |
| Polls           | Embed polls in threads               |
| Upvote/Downvote | Community voting on replies          |
| Mark Solution   | Thread author marks best answer      |
| Nested Replies  | Up to 2 levels of reply nesting      |
| Quoting         | Quote parent reply in new reply      |
| @Mentions       | Tag users in replies                 |
| Notifications   | Notify on reply to your thread/reply |
| Moderation      | Move threads, merge, warn users      |

---

### 7.7 About Us Page

**Route:** `/about` (public)

#### Sections

1. **Hero Banner:** "About Chandra Jyoti Sanstha" + panoramic village image, parallax effect
2. **Our Story:** Rich narrative (2-3 paragraphs) of founding, purpose, and journey
3. **Mission and Vision:** Two side-by-side glassmorphism cards with icons
   - Mission: "To unite and empower..."
   - Vision: "A digitally connected village..."
4. **Our Values (6 cards in grid):**
   - Community, Transparency, Heritage, Unity, Progress, Respect
   - Each: Icon, title, short description
5. **Leadership Team:** Grid of committee member cards
   - Photo, Name, Role/Title (President, Secretary, Treasurer, etc.), short bio
   - 4 cards per row on desktop
6. **Timeline/Milestones:** Vertical animated timeline
   - Key dates: founding, first event, digital launch
   - Each milestone: year, title, description, optional image
   - Animation: timeline draws as user scrolls
7. **Village Heritage:** Cultural significance, traditions, festivals of Tumin Dhanbari
   - Image gallery grid
   - Descriptions of key festivals and traditions
8. **Statistics:** Animated counters (members, families, events conducted, funds managed)
9. **Join Us CTA:** Banner with "Become a Member" button

---

### 7.8 Contact Us Page

**Route:** `/contact` (public)

#### Sections

1. **Hero:** "Get in Touch" with subtle background
2. **Two-column layout (desktop):**
   - **Left Column - Contact Form:**
     - Name (text input, required)
     - Email (email input, required)
     - Subject (dropdown: General Inquiry, Membership, Technical Support, Feedback, Other)
     - Message (textarea, required, min 20 chars)
     - File attachment (optional, max 5MB)
     - Submit button with loading state
     - Success toast: "Message sent! We'll respond within 48 hours."
     - Validation: Zod schema on client + server
   - **Right Column - Contact Info:**
     - Address card: Tumin Dhanbari Village, Gangtok District, Sikkim 737134
     - Email card: contact@chandrajyoti.org
     - Phone card: +91 XXXXXXXXXX
     - Office hours: Mon-Sat, 10:00 AM - 5:00 PM IST

3. **Embedded Google Map:** Interactive map showing Tumin Dhanbari location
4. **Social Media Links:** Facebook, Instagram, YouTube, WhatsApp
5. **FAQ Accordion (6-8 items):**
   - "How do I become a member?"
   - "Is my data safe?"
   - "How can I add my family to the tree?"
   - "How do I make a donation?"
   - etc.
   - shadcn Accordion component

---

### 7.9 News Page

**Route:** `/news` (protected)

#### 7.9.1 News Categories (Tab Navigation)

| Tab                | Source        | Description                         |
| ------------------ | ------------- | ----------------------------------- |
| Local News         | Admin-created | Village news, events, announcements |
| State News         | RSS/API feed  | Sikkim state news                   |
| National News      | RSS/API feed  | India national news                 |
| International News | RSS/API feed  | World news                          |

#### 7.9.2 Page Layout

- **Header:** "News" with category tabs
- **Active Tab Content:** News cards in list or grid
- **Each News Card:**
  - Cover image (or placeholder)
  - Headline (max 2 lines)
  - Excerpt (max 3 lines)
  - Source badge (Local/State/National/International)
  - Published date + time ago
  - Bookmark button
- **Sort:** Latest (default), Trending
- **Search:** Search across news headlines
- **Pagination:** Load more or numbered pages

#### 7.9.3 Local News (Admin-Managed)

- Admin creates articles via `/admin/news/create`
- Rich text editor with cover image
- Sub-categories: Events, Announcements, Development, Culture
- Featured/priority flag
- Notification push to members for important news

#### 7.9.4 External News (API/RSS)

- Source: NewsAPI or RSS feeds
- Auto-refresh every 15 minutes via Vercel cron
- Cached in DB (NewsArticle table with source=EXTERNAL)
- Display: headline, excerpt, source name, "Read Full Article" external link
- Source attribution required

#### 7.9.5 News Detail (`/news/[slug]`)

- Local news: Full article rendered
- External news: Summary + "Read Full Article" link to source
- Share buttons (copy link, social)
- Related news suggestions
- Bookmark toggle

---

### 7.10 Payment and Donation System

**Route:** `/payments/*` (protected)

#### 7.10.1 Payment Types

| Type               | Initiated By | Description                                      |
| ------------------ | ------------ | ------------------------------------------------ |
| Voluntary Donation | Member       | Any member can donate any amount anytime         |
| Emergency Fund     | Admin        | Campaign for emergencies (medical, disaster)     |
| Fine/Penalty       | Admin        | Assigned to specific members for rule violations |

#### 7.10.2 Donation Page (`/payments/donate`)

- **Donation Form:**
  - Amount selector: Preset buttons (100, 500, 1000, 5000 INR) + custom input
  - Optional message/dedication (textarea)
  - Anonymous toggle checkbox
  - Recurring donation toggle (monthly/yearly)
  - Payment methods: UPI, Cards, Net Banking (via Razorpay)
- **Payment Flow:**
  1. User fills form -> clicks "Donate"
  2. Server creates Donation record (status=PENDING)
  3. Razorpay checkout opens
  4. User completes payment
  5. Razorpay webhook -> update Donation status to COMPLETED
  6. Generate receipt (PDF, stored in S3)
  7. Send confirmation email with receipt
  8. Show success page with receipt download

#### 7.10.3 Emergency Campaigns (`/payments/campaigns`)

- **Campaign Card:**
  - Cover image, title, description
  - Progress bar: raised amount / target amount (percentage)
  - Donor count
  - Days remaining
  - "Donate to Campaign" button
  - Status badge: Active, Completed, Expired

- **Campaign Detail (`/payments/campaigns/[campaignId]`):**
  - Full description with images
  - Large progress bar with amounts
  - Donor list (with anonymous option)
  - Donate form (linked to this campaign)
  - Share buttons
  - Updates from admin (timeline of updates)

- **Create Campaign (ADMIN, `/admin/payments/campaigns/create`):**
  - Title, description (rich text)
  - Cover image upload
  - Target amount (INR)
  - Deadline (date picker)
  - Status: Active/Closed

#### 7.10.4 Fines/Penalties (`/payments/fines`)

- **Member View:**
  - List of fines assigned to them
  - Each fine: Amount, Reason, Due Date, Status badge (Pending/Overdue/Paid/Disputed/Waived)
  - "Pay Fine" button (opens Razorpay)
  - "Dispute" button (opens dispute form: textarea for explanation)

- **Admin View (`/admin/payments/fines`):**
  - All fines across all members
  - Filter: by status, by member, by date
  - Assign Fine form: Select member, amount, reason, due date
  - Manage disputes: View dispute notes, Waive or Uphold

- **Fine Lifecycle:**
  ```
  Admin assigns fine -> Status: PENDING -> Notification sent to member
      -> Member pays -> Status: PAID -> Receipt generated
      -> Member disputes -> Status: DISPUTED -> Admin reviews
          -> Admin waives -> Status: WAIVED
          -> Admin upholds -> Status: PENDING (member must pay)
      -> Due date passes -> Status: OVERDUE -> Reminder notification
  ```

#### 7.10.5 Payment Dashboard (`/payments`)

- **Member View:**
  - Summary cards: Total Donated, Pending Fines, Campaigns Contributed
  - Recent transactions table
  - Quick donate button
  - Pending fines alert

- **Admin View (`/admin/payments`):**
  - Revenue summary: Total Donations, Campaign Revenue, Fine Collections
  - Revenue chart (line chart over time)
  - Recent transactions table (all users)
  - Export buttons (CSV, PDF)

#### 7.10.6 Payment History (`/payments/history`)

- Full transaction history table
- Columns: Date, Type (Donation/Campaign/Fine), Amount, Status, Receipt
- Filter by type, status, date range
- Download receipt (PDF) for each completed payment
- Export all (CSV)

#### 7.10.7 Razorpay Integration

```typescript
// lib/actions/payment.actions.ts
export async function createPaymentOrder(data: {
  amount: number;
  type: "DONATION" | "CAMPAIGN" | "FINE";
  referenceId?: string;
}) {
  // 1. Create Razorpay order
  // 2. Create Donation/Fine payment record in DB (PENDING)
  // 3. Return order ID to client
  // Client opens Razorpay checkout
  // On success: Razorpay webhook verifies and updates status
}
```

---

### 7.11 Analytics Dashboard

#### 7.11.1 User Analytics (`/analytics`)

Every logged-in member gets a personal analytics dashboard:

**Activity Overview Cards:**

- Blog posts written (total)
- Forum threads + replies (total)
- Donations made (total amount)
- Account age + activity streak (consecutive days)

**Content Performance:**

- Table: Your posts with views, likes, comments (sortable)
- Most popular post highlight card

**Engagement Charts (Recharts):**

- Activity Over Time: Line chart (posts/comments per week, last 3 months)
- Content Breakdown: Pie chart (blog vs forum vs donations)
- Monthly Activity: Bar chart comparison (this month vs last month)

**Browse History:**

- Pages/posts viewed with timestamps
- Total reading time
- Most visited sections

#### 7.11.2 Admin Analytics (`/analytics/admin`)

Access: ADMIN and SUPER_ADMIN only

**Platform Overview:**

- Total registered users + growth chart (line, last 12 months)
- DAU / WAU / MAU metrics + trend arrows
- New registrations today / this week / this month

**Content Analytics (`/analytics/admin/content`):**

- Total blog posts (published/draft/archived counts)
- Most popular posts table (by views, likes, comments)
- Forum activity: threads + replies per day (bar chart)
- Content growth trend (line chart)

**User Behavior (`/analytics/admin/users`):**

- Most active users leaderboard (top 20)
- Average session duration
- Page view distribution (bar chart by section)
- Device breakdown (pie chart: mobile/desktop/tablet)
- Browser breakdown (pie chart)
- Geographic distribution (if available from IP)

**Financial Analytics (`/analytics/admin/financial`):**

- Total revenue: Donations + Fines (with separate breakdowns)
- Revenue over time (area chart, monthly)
- Campaign performance: Table with target, raised, conversion rate
- Outstanding fines: Total amount + count
- Top donors leaderboard

**Family Tree Analytics:**

- Total members in tree
- Largest family branches (top 5)
- Completion rate: % with photos, % with bios
- Recent additions timeline

**System Health (`/analytics/admin/system`, SUPER_ADMIN only):**

- API response times (p50, p95, p99)
- Error rate percentage
- Database query count + avg time
- S3 storage usage
- Vercel bandwidth usage

#### 7.11.3 Analytics Event Tracking

```typescript
// lib/analytics.ts

export type AnalyticsEventType =
  | "PAGE_VIEW"
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "ACCOUNT_CREATED"
  | "BLOG_POST_CREATED"
  | "BLOG_POST_VIEWED"
  | "BLOG_POST_LIKED"
  | "BLOG_POST_BOOKMARKED"
  | "COMMENT_ADDED"
  | "FORUM_THREAD_CREATED"
  | "FORUM_THREAD_VIEWED"
  | "FORUM_REPLY_ADDED"
  | "FORUM_REPLY_UPVOTED"
  | "DONATION_MADE"
  | "FINE_PAID"
  | "FINE_DISPUTED"
  | "FAMILY_MEMBER_ADDED"
  | "FAMILY_TREE_VIEWED"
  | "NEWS_VIEWED"
  | "PROFILE_UPDATED"
  | "SEARCH_PERFORMED";

export async function trackEvent(
  userId: string | null,
  eventType: AnalyticsEventType,
  metadata?: Record<string, any>,
) {
  // Non-blocking: fire and forget
  await db.analyticsEvent.create({
    data: {
      userId,
      eventType,
      metadata: metadata || {},
      pageUrl: metadata?.pageUrl,
      sessionId: metadata?.sessionId,
      deviceType: metadata?.deviceType,
      browser: metadata?.browser,
    },
  });
}
```

Every page component and server action calls `trackEvent()` for comprehensive tracking.

---

### 7.12 User Profile

**Route:** `/profile` (protected)

#### Profile View Page

- **Profile Header:** Large avatar, full name, username, role badge, join date, bio
- **Stats Row:** Posts written, Forum contributions, Donations made, Family members added
- **Tabs:**
  - Activity: Recent activity timeline
  - Blog Posts: User's published posts
  - Forum Activity: User's threads and replies
  - Donations: Donation history (visible only to self)
- **Edit Profile** button

#### Edit Profile Page (`/profile/edit`)

- Avatar upload (S3)
- First Name, Last Name
- Username
- Bio (textarea)
- Phone number
- Clerk manages email and password changes
- Save button with loading state

---

### 7.13 Notification System

#### Notification Types

| Trigger                       | Notification                                  | Recipients     |
| ----------------------------- | --------------------------------------------- | -------------- |
| New comment on your blog post | "{user} commented on your post '{title}'"     | Post author    |
| Reply to your comment         | "{user} replied to your comment"              | Comment author |
| Reply to your forum thread    | "{user} replied to '{thread}'"                | Thread author  |
| @mention in forum             | "{user} mentioned you in '{thread}'"          | Mentioned user |
| Fine assigned                 | "A fine of {amount} has been assigned to you" | Fined member   |
| Fine overdue                  | "Your fine of {amount} is overdue"            | Fined member   |
| Campaign created              | "New campaign: {title}"                       | All members    |
| Family member approved        | "Your family tree addition was approved"      | Submitter      |
| Blog post featured            | "Your post '{title}' was featured!"           | Post author    |
| Role changed                  | "Your role has been updated to {role}"        | User           |

#### Implementation

- **In-app:** Bell icon in navbar with unread count badge
- **Dropdown:** Latest 10 notifications with mark-as-read
- **Full Page (`/notifications`):** All notifications with filter and pagination
- **Email:** Configurable via user preferences (default: important only)
- **Storage:** Notification model in database

---

### 7.14 Admin Panel

**Route:** `/admin/*` (ADMIN and SUPER_ADMIN only)

#### Admin Dashboard (`/admin`)

- Quick stats: Pending approvals, Reports, Active campaigns, System health
- Recent admin actions log
- Quick action buttons

#### User Management (`/admin/users`)

- Data table of all users with search, sort, filter
- Columns: Avatar, Name, Email, Role, Status, Join Date, Last Active
- Actions: View profile, Change role (dropdown), Deactivate/Activate
- User detail page (`/admin/users/[userId]`): Full profile, activity log, role history

#### Content Moderation (`/admin/blog`, `/admin/forum`)

- Reported content queue
- Post/thread approval queue (if moderation enabled)
- Bulk actions: Approve, Reject, Delete

#### Forum Category Management (`/admin/forum/categories`)

- Create/Edit/Delete forum categories
- Set category order (drag-and-drop)
- Lock/Unlock categories
- Set posting permissions per category

#### Local News Management (`/admin/news`)

- Create, edit, delete local news articles
- Feature/unfeature articles
- Schedule articles

#### Family Tree Approvals (`/admin/family-tree`)

- Queue of pending family member additions
- Approve or reject with reason
- Merge duplicate entries

#### Testimonial Management (`/admin/testimonials`)

- Approve/reject submitted testimonials
- Feature/unfeature for landing page

#### Contact Submissions (`/admin/contact-submissions`)

- View all contact form submissions
- Status tracking: New, In Progress, Resolved
- Reply via email

#### Site Settings (`/admin/settings`, SUPER_ADMIN only)

- Site title, description
- Logo upload
- Social media links
- Contact information
- Moderation settings (require approval for posts: yes/no)
- Maintenance mode toggle

## 8. Database Schema (Prisma)

### 8.1 Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =============================================
// USER & AUTHENTICATION
// =============================================

model User {
  id              String    @id @default(cuid())
  clerkId         String    @unique
  email           String    @unique
  firstName       String
  lastName        String
  username        String?   @unique
  avatar          String?
  bio             String?   @db.Text
  phone           String?
  role            Role      @default(MEMBER)
  isActive        Boolean   @default(true)
  lastLoginAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  blogPosts       BlogPost[]
  comments        Comment[]
  forumThreads    ForumThread[]
  forumReplies    ForumReply[]
  donations       Donation[]
  fines           Fine[]
  familyMembers   FamilyMember[]   @relation("AddedByUser")
  analyticsEvents AnalyticsEvent[]
  testimonials    Testimonial[]
  bookmarks       Bookmark[]
  newsBookmarks   NewsBookmark[]
  notifications   Notification[]
  likes           Like[]
  forumVotes      ForumVote[]
  pollVotes       PollVote[]

  @@index([clerkId])
  @@index([email])
  @@index([role])
}

enum Role {
  GUEST
  MEMBER
  MODERATOR
  ADMIN
  SUPER_ADMIN
}

// =============================================
// FAMILY TREE
// =============================================

model FamilyMember {
  id            String    @id @default(cuid())
  firstName     String
  lastName      String
  dateOfBirth   DateTime?
  dateOfDeath   DateTime?
  gender        Gender
  photo         String?
  bio           String?   @db.Text
  familyClan    String?
  generation    Int?
  isAlive       Boolean   @default(true)
  isApproved    Boolean   @default(false)
  approvedAt    DateTime?
  approvedBy    String?

  // Self-referential relations
  fatherId      String?
  father        FamilyMember?  @relation("FatherChildren", fields: [fatherId], references: [id])
  fatherChildren FamilyMember[] @relation("FatherChildren")

  motherId      String?
  mother        FamilyMember?  @relation("MotherChildren", fields: [motherId], references: [id])
  motherChildren FamilyMember[] @relation("MotherChildren")

  spouseId      String?
  spouse        FamilyMember?  @relation("SpouseRelation", fields: [spouseId], references: [id])
  spouseOf      FamilyMember[] @relation("SpouseRelation")

  // Who added this member
  addedByUserId String
  addedByUser   User      @relation("AddedByUser", fields: [addedByUserId], references: [id])

  // Life events
  lifeEvents    LifeEvent[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([familyClan])
  @@index([isApproved])
  @@index([addedByUserId])
}

model LifeEvent {
  id              String       @id @default(cuid())
  type            LifeEventType
  date            DateTime
  description     String?
  location        String?
  familyMemberId  String
  familyMember    FamilyMember @relation(fields: [familyMemberId], references: [id], onDelete: Cascade)
  createdAt       DateTime     @default(now())
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum LifeEventType {
  BIRTH
  MARRIAGE
  GRADUATION
  ACHIEVEMENT
  DEATH
  OTHER
}

// =============================================
// BLOG SYSTEM
// =============================================

model BlogPost {
  id            String      @id @default(cuid())
  title         String
  slug          String      @unique
  excerpt       String?     @db.VarChar(500)
  content       String      @db.Text
  coverImage    String?
  status        PostStatus  @default(DRAFT)
  isFeatured    Boolean     @default(false)
  readingTime   Int?
  views         Int         @default(0)
  publishedAt   DateTime?
  scheduledAt   DateTime?

  authorId      String
  author        User        @relation(fields: [authorId], references: [id])

  categoryId    String?
  category      BlogCategory? @relation(fields: [categoryId], references: [id])

  tags          BlogPostTag[]
  comments      Comment[]
  likes         Like[]
  bookmarks     Bookmark[]

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([authorId])
  @@index([status, publishedAt])
  @@index([categoryId])
  @@index([isFeatured])
  @@index([slug])
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  SCHEDULED
}

model BlogCategory {
  id          String     @id @default(cuid())
  name        String     @unique
  slug        String     @unique
  description String?
  color       String?    @default("#6366f1")
  icon        String?
  sortOrder   Int        @default(0)
  posts       BlogPost[]
  createdAt   DateTime   @default(now())
}

model BlogTag {
  id    String        @id @default(cuid())
  name  String        @unique
  slug  String        @unique
  posts BlogPostTag[]
}

model BlogPostTag {
  postId String
  tagId  String
  post   BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    BlogTag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
}

model Comment {
  id        String    @id @default(cuid())
  content   String    @db.Text
  isPinned  Boolean   @default(false)
  isEdited  Boolean   @default(false)

  authorId  String
  author    User      @relation(fields: [authorId], references: [id])

  postId    String
  post      BlogPost  @relation(fields: [postId], references: [id], onDelete: Cascade)

  parentId  String?
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies   Comment[] @relation("CommentReplies")

  likes     Like[]
  reports   Report[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([postId, createdAt])
  @@index([parentId])
}

model Like {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  postId    String?
  commentId String?
  post      BlogPost? @relation(fields: [postId], references: [id], onDelete: Cascade)
  comment   Comment?  @relation(fields: [commentId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())

  @@unique([userId, postId])
  @@unique([userId, commentId])
  @@index([postId])
  @@index([commentId])
}

model Bookmark {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  postId    String
  post      BlogPost  @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())

  @@unique([userId, postId])
}

// =============================================
// FORUM SYSTEM
// =============================================

model ForumCategory {
  id            String        @id @default(cuid())
  name          String        @unique
  slug          String        @unique
  description   String?
  icon          String?
  color         String?       @default("#6366f1")
  sortOrder     Int           @default(0)
  isLocked      Boolean       @default(false)
  minRoleToPost Role          @default(MEMBER)
  threads       ForumThread[]
  createdAt     DateTime      @default(now())
}

model ForumThread {
  id          String        @id @default(cuid())
  title       String
  slug        String        @unique
  content     String        @db.Text
  isPinned    Boolean       @default(false)
  isLocked    Boolean       @default(false)
  status      ThreadStatus  @default(OPEN)
  views       Int           @default(0)

  authorId    String
  author      User          @relation(fields: [authorId], references: [id])

  categoryId  String
  category    ForumCategory @relation(fields: [categoryId], references: [id])

  tags        ForumThreadTag[]
  replies     ForumReply[]
  polls       ForumPoll[]
  reports     Report[]

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([categoryId, isPinned, createdAt])
  @@index([authorId])
  @@index([status])
}

enum ThreadStatus {
  OPEN
  RESOLVED
  CLOSED
}

model ForumReply {
  id           String      @id @default(cuid())
  content      String      @db.Text
  isSolution   Boolean     @default(false)
  isEdited     Boolean     @default(false)

  authorId     String
  author       User        @relation(fields: [authorId], references: [id])

  threadId     String
  thread       ForumThread @relation(fields: [threadId], references: [id], onDelete: Cascade)

  parentId     String?
  parent       ForumReply? @relation("ReplyNesting", fields: [parentId], references: [id], onDelete: Cascade)
  children     ForumReply[] @relation("ReplyNesting")

  votes        ForumVote[]
  reports      Report[]

  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@index([threadId, createdAt])
  @@index([parentId])
}

model ForumVote {
  id        String   @id @default(cuid())
  value     Int      // +1 or -1
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  replyId   String
  reply     ForumReply @relation(fields: [replyId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, replyId])
}

model ForumTag {
  id      String           @id @default(cuid())
  name    String           @unique
  slug    String           @unique
  threads ForumThreadTag[]
}

model ForumThreadTag {
  threadId String
  tagId    String
  thread   ForumThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  tag      ForumTag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([threadId, tagId])
}

model ForumPoll {
  id        String          @id @default(cuid())
  question  String
  isMultiChoice Boolean     @default(false)
  threadId  String
  thread    ForumThread     @relation(fields: [threadId], references: [id], onDelete: Cascade)
  options   ForumPollOption[]
  createdAt DateTime        @default(now())
}

model ForumPollOption {
  id     String     @id @default(cuid())
  text   String
  pollId String
  poll   ForumPoll  @relation(fields: [pollId], references: [id], onDelete: Cascade)
  votes  PollVote[]
}

model PollVote {
  id       String          @id @default(cuid())
  userId   String
  user     User            @relation(fields: [userId], references: [id])
  optionId String
  option   ForumPollOption @relation(fields: [optionId], references: [id], onDelete: Cascade)

  @@unique([userId, optionId])
}

// =============================================
// NEWS SYSTEM
// =============================================

model NewsArticle {
  id          String       @id @default(cuid())
  title       String
  slug        String       @unique
  content     String?      @db.Text
  excerpt     String?      @db.VarChar(500)
  coverImage  String?
  source      NewsSource
  sourceUrl   String?
  sourceName  String?
  category    NewsCategory
  isFeatured  Boolean      @default(false)
  views       Int          @default(0)

  bookmarks   NewsBookmark[]

  publishedAt DateTime     @default(now())
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([category, publishedAt])
  @@index([source])
}

model NewsBookmark {
  id        String      @id @default(cuid())
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  articleId String
  article   NewsArticle @relation(fields: [articleId], references: [id], onDelete: Cascade)
  createdAt DateTime    @default(now())

  @@unique([userId, articleId])
}

enum NewsSource {
  LOCAL
  EXTERNAL
}

enum NewsCategory {
  LOCAL
  STATE
  NATIONAL
  INTERNATIONAL
}

// =============================================
// PAYMENT & DONATION SYSTEM
// =============================================

model Donation {
  id            String          @id @default(cuid())
  amount        Decimal         @db.Decimal(10, 2)
  currency      String          @default("INR")
  message       String?         @db.Text
  isAnonymous   Boolean         @default(false)
  isRecurring   Boolean         @default(false)
  recurringFreq String?         // "monthly" | "yearly"
  paymentMethod String?
  transactionId String?         @unique
  razorpayOrderId String?       @unique
  status        PaymentStatus   @default(PENDING)
  receiptUrl    String?

  donorId       String
  donor         User            @relation(fields: [donorId], references: [id])

  campaignId    String?
  campaign      DonationCampaign? @relation(fields: [campaignId], references: [id])

  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@index([donorId, createdAt])
  @@index([campaignId])
  @@index([status])
}

model DonationCampaign {
  id            String          @id @default(cuid())
  title         String
  slug          String          @unique
  description   String          @db.Text
  coverImage    String?
  targetAmount  Decimal         @db.Decimal(10, 2)
  raisedAmount  Decimal         @db.Decimal(10, 2) @default(0)
  donorCount    Int             @default(0)
  status        CampaignStatus  @default(ACTIVE)
  deadline      DateTime?
  updates       CampaignUpdate[]
  donations     Donation[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@index([status])
}

model CampaignUpdate {
  id          String           @id @default(cuid())
  title       String
  content     String           @db.Text
  campaignId  String
  campaign    DonationCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  createdAt   DateTime         @default(now())
}

enum CampaignStatus {
  ACTIVE
  COMPLETED
  EXPIRED
  CANCELLED
}

model Fine {
  id            String        @id @default(cuid())
  amount        Decimal       @db.Decimal(10, 2)
  reason        String        @db.Text
  dueDate       DateTime
  status        FineStatus    @default(PENDING)
  paidAt        DateTime?
  transactionId String?
  razorpayOrderId String?
  isDisputed    Boolean       @default(false)
  disputeNote   String?       @db.Text
  disputeResolvedAt DateTime?
  disputeResolution String?

  userId        String
  user          User          @relation(fields: [userId], references: [id])

  assignedBy    String        // clerkId of admin who assigned
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([userId, status])
  @@index([status, dueDate])
}

enum FineStatus {
  PENDING
  PAID
  OVERDUE
  DISPUTED
  WAIVED
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

// =============================================
// ANALYTICS
// =============================================

model AnalyticsEvent {
  id         String   @id @default(cuid())
  eventType  String
  pageUrl    String?
  metadata   Json?
  sessionId  String?
  deviceType String?
  browser    String?
  ipAddress  String?
  duration   Int?     // time on page in seconds

  userId     String?
  user       User?    @relation(fields: [userId], references: [id])

  createdAt  DateTime @default(now())

  @@index([userId, createdAt])
  @@index([eventType, createdAt])
  @@index([pageUrl, createdAt])
  @@index([createdAt])
}

// =============================================
// CONTENT MODERATION
// =============================================

model Report {
  id          String      @id @default(cuid())
  reason      String
  description String?     @db.Text
  status      ReportStatus @default(PENDING)
  resolvedAt  DateTime?
  resolvedBy  String?

  reporterId  String
  // Polymorphic: one of these will be set
  commentId   String?
  comment     Comment?    @relation(fields: [commentId], references: [id], onDelete: Cascade)
  threadId    String?
  thread      ForumThread? @relation(fields: [threadId], references: [id], onDelete: Cascade)
  replyId     String?
  reply       ForumReply?  @relation(fields: [replyId], references: [id], onDelete: Cascade)

  createdAt   DateTime    @default(now())

  @@index([status])
}

enum ReportStatus {
  PENDING
  REVIEWED
  RESOLVED
  DISMISSED
}

// =============================================
// MISCELLANEOUS
// =============================================

model Testimonial {
  id         String   @id @default(cuid())
  content    String   @db.Text
  rating     Int      @default(5) // 1-5
  isApproved Boolean  @default(false)
  isFeatured Boolean  @default(false)

  authorId   String
  author     User     @relation(fields: [authorId], references: [id])

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([isApproved, isFeatured])
}

model Notification {
  id        String   @id @default(cuid())
  title     String
  message   String
  type      String   // COMMENT, REPLY, FINE, CAMPAIGN, APPROVAL, ROLE_CHANGE
  isRead    Boolean  @default(false)
  link      String?

  userId    String
  user      User     @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())

  @@index([userId, isRead, createdAt])
}

model ContactSubmission {
  id         String   @id @default(cuid())
  name       String
  email      String
  subject    String
  message    String   @db.Text
  attachment String?  // S3 URL
  status     ContactStatus @default(NEW)
  resolvedAt DateTime?
  resolvedBy String?
  createdAt  DateTime @default(now())

  @@index([status, createdAt])
}

enum ContactStatus {
  NEW
  IN_PROGRESS
  RESOLVED
}

model SiteSettings {
  id    String @id @default(cuid())
  key   String @unique
  value String @db.Text
  updatedAt DateTime @updatedAt
}
```

### 8.2 Database Indexes Summary

| Model          | Index                                                    | Purpose                         |
| -------------- | -------------------------------------------------------- | ------------------------------- |
| User           | clerkId, email, role                                     | Auth lookup, role filtering     |
| FamilyMember   | familyClan, isApproved, addedByUserId                    | Tree filtering, approval queue  |
| BlogPost       | authorId, status+publishedAt, categoryId, slug           | Listing, filtering, URL lookup  |
| Comment        | postId+createdAt, parentId                               | Post comments, threading        |
| ForumThread    | categoryId+isPinned+createdAt, authorId                  | Category listing, user threads  |
| ForumReply     | threadId+createdAt, parentId                             | Thread replies, nesting         |
| NewsArticle    | category+publishedAt, source                             | Tab filtering                   |
| Donation       | donorId+createdAt, campaignId, status                    | History, campaign totals        |
| Fine           | userId+status, status+dueDate                            | Member fines, overdue detection |
| AnalyticsEvent | userId+createdAt, eventType+createdAt, pageUrl+createdAt | All analytics queries           |
| Notification   | userId+isRead+createdAt                                  | Unread notifications            |

### 8.3 Database Seed Data

```typescript
// prisma/seed.ts — Creates initial data for development

// Seeds:
// 1. Blog categories: Culture, Events, Stories, Development, Education, General
// 2. Blog tags: festival, sikkim, tradition, youth, nature, community, heritage, development
// 3. Forum categories: General Discussion, Announcements (ADMIN-only), Events, Help & Support, Off-Topic, Sanstha Business (ADMIN-only)
// 4. Default site settings: site_title, site_description, contact_email, contact_phone, address, social_facebook, social_instagram, moderation_enabled
// 5. Sample testimonials (3-5 approved, featured)
```

---

## 9. API Design

### 9.1 Server Actions

All data mutations use Next.js Server Actions with this pattern:

```typescript
"use server";
// 1. Authenticate (requireRole)
// 2. Validate input (Zod)
// 3. Authorize (check ownership/role)
// 4. Execute (Prisma query)
// 5. Track analytics (async)
// 6. Send notifications (async)
// 7. Revalidate cache (revalidatePath)
// 8. Return result or redirect
```

### 9.2 Server Actions by Module

| Module            | Action                | Role                   | Description                  |
| ----------------- | --------------------- | ---------------------- | ---------------------------- |
| **User**          | syncUser              | SYSTEM                 | Clerk webhook sync           |
|                   | updateProfile         | MEMBER                 | Update own profile           |
|                   | updateUserRole        | SUPER_ADMIN            | Change user role             |
|                   | deactivateUser        | ADMIN                  | Soft-delete user             |
| **Blog**          | createPost            | MEMBER                 | Create blog post             |
|                   | updatePost            | MEMBER (own) / MOD     | Edit post                    |
|                   | deletePost            | MEMBER (own) / MOD     | Delete post                  |
|                   | publishPost           | MEMBER                 | Change status to PUBLISHED   |
|                   | likePost              | MEMBER                 | Toggle like                  |
|                   | bookmarkPost          | MEMBER                 | Toggle bookmark              |
|                   | addComment            | MEMBER                 | Add comment (nested)         |
|                   | deleteComment         | MEMBER (own) / MOD     | Delete comment               |
|                   | pinComment            | MEMBER (author)        | Pin comment on own post      |
|                   | reportComment         | MEMBER                 | Report inappropriate comment |
| **Forum**         | createThread          | MEMBER                 | Create forum thread          |
|                   | updateThread          | MEMBER (own) / MOD     | Edit thread                  |
|                   | deleteThread          | MOD                    | Delete thread                |
|                   | lockThread            | MOD                    | Lock/unlock thread           |
|                   | pinThread             | MOD                    | Pin/unpin thread             |
|                   | addReply              | MEMBER                 | Reply to thread              |
|                   | voteReply             | MEMBER                 | Upvote/downvote reply        |
|                   | markSolution          | MEMBER (thread author) | Mark reply as solution       |
|                   | createPoll            | MEMBER                 | Create poll in thread        |
|                   | votePoll              | MEMBER                 | Vote in poll                 |
|                   | reportThread          | MEMBER                 | Report thread                |
|                   | reportReply           | MEMBER                 | Report reply                 |
| **Family Tree**   | addFamilyMember       | MEMBER                 | Add member (needs approval)  |
|                   | updateFamilyMember    | MEMBER (own family)    | Edit member details          |
|                   | approveFamilyMember   | ADMIN                  | Approve pending member       |
|                   | rejectFamilyMember    | ADMIN                  | Reject with reason           |
|                   | deleteFamilyMember    | ADMIN                  | Remove from tree             |
|                   | addLifeEvent          | MEMBER                 | Add life event to member     |
| **News**          | createNewsArticle     | ADMIN                  | Create local news            |
|                   | updateNewsArticle     | ADMIN                  | Edit local news              |
|                   | deleteNewsArticle     | ADMIN                  | Delete local news            |
|                   | bookmarkNews          | MEMBER                 | Toggle news bookmark         |
| **Payments**      | createDonation        | MEMBER                 | Initiate donation            |
|                   | createCampaign        | ADMIN                  | Create emergency campaign    |
|                   | updateCampaign        | ADMIN                  | Edit/close campaign          |
|                   | addCampaignUpdate     | ADMIN                  | Post campaign update         |
|                   | assignFine            | ADMIN                  | Assign fine to member        |
|                   | payFine               | MEMBER                 | Initiate fine payment        |
|                   | disputeFine           | MEMBER                 | Dispute assigned fine        |
|                   | resolveFineDispute    | ADMIN                  | Waive or uphold fine         |
| **Analytics**     | trackEvent            | SYSTEM                 | Log analytics event          |
|                   | getMyAnalytics        | MEMBER                 | Get personal analytics       |
|                   | getAdminDashboard     | ADMIN                  | Get admin overview           |
|                   | getContentAnalytics   | ADMIN                  | Get content metrics          |
|                   | getFinancialAnalytics | ADMIN                  | Get financial metrics        |
|                   | getUserAnalytics      | ADMIN                  | Get user behavior data       |
| **Notifications** | markAsRead            | MEMBER                 | Mark notification read       |
|                   | markAllAsRead         | MEMBER                 | Mark all as read             |
|                   | getUnreadCount        | MEMBER                 | Get unread count             |
| **Contact**       | submitContactForm     | ANY                    | Submit contact form          |
|                   | updateContactStatus   | ADMIN                  | Update submission status     |
| **Testimonials**  | submitTestimonial     | MEMBER                 | Submit testimonial           |
|                   | approveTestimonial    | ADMIN                  | Approve/reject               |
|                   | featureTestimonial    | ADMIN                  | Feature on landing page      |
| **Admin**         | getSiteSettings       | ADMIN                  | Get all settings             |
|                   | updateSiteSettings    | SUPER_ADMIN            | Update settings              |
|                   | getSystemHealth       | SUPER_ADMIN            | Get system metrics           |

### 9.3 API Routes

| Route                       | Method | Purpose                                          |
| --------------------------- | ------ | ------------------------------------------------ |
| `/api/webhooks/clerk`       | POST   | Clerk user sync webhook                          |
| `/api/webhooks/razorpay`    | POST   | Payment verification webhook                     |
| `/api/upload`               | POST   | S3 file upload (presigned URL generation)        |
| `/api/news/external`        | GET    | Fetch external news from NewsAPI                 |
| `/api/export/analytics`     | GET    | Export analytics as CSV                          |
| `/api/export/family-tree`   | GET    | Export family tree as JSON/CSV                   |
| `/api/export/financial`     | GET    | Export financial data as CSV/PDF                 |
| `/api/cron/news-refresh`    | GET    | Cron: refresh external news (every 15 min)       |
| `/api/cron/overdue-fines`   | GET    | Cron: check and mark overdue fines (daily)       |
| `/api/cron/scheduled-posts` | GET    | Cron: publish scheduled blog posts (every 5 min) |

### 9.4 Webhook Verification

```typescript
// All webhooks verify signatures before processing:
// - Clerk: svix signature verification
// - Razorpay: HMAC-SHA256 signature verification
// Both return 400 on invalid signatures
```

---

## 10. UI/UX Design System

### 10.1 Color Palette

| Token          | Light Mode              | Dark Mode               | Usage                           |
| -------------- | ----------------------- | ----------------------- | ------------------------------- |
| Primary        | `#4F46E5` (Indigo 600)  | `#818CF8` (Indigo 400)  | CTAs, links, active states      |
| Secondary      | `#10B981` (Emerald 500) | `#34D399` (Emerald 400) | Success, nature, growth         |
| Accent         | `#F59E0B` (Amber 500)   | `#FBBF24` (Amber 400)   | Highlights, warnings, attention |
| Destructive    | `#EF4444` (Red 500)     | `#F87171` (Red 400)     | Delete, errors, danger          |
| Background     | `#FAFAFA`               | `#0F172A` (Slate 900)   | Page background                 |
| Card           | `#FFFFFF`               | `#1E293B` (Slate 800)   | Card backgrounds                |
| Muted          | `#F1F5F9` (Slate 100)   | `#334155` (Slate 700)   | Muted backgrounds               |
| Border         | `#E2E8F0` (Slate 200)   | `#334155` (Slate 700)   | Borders                         |
| Text Primary   | `#0F172A` (Slate 900)   | `#F8FAFC` (Slate 50)    | Main text                       |
| Text Secondary | `#64748B` (Slate 500)   | `#94A3B8` (Slate 400)   | Secondary text                  |

### 10.2 Typography

| Element        | Font          | Weight     | Size            | Line Height |
| -------------- | ------------- | ---------- | --------------- | ----------- |
| Display (Hero) | Outfit        | 700 (Bold) | 4.5rem (72px)   | 1.1         |
| H1             | Outfit        | 700        | 2.25rem (36px)  | 1.2         |
| H2             | Outfit        | 600        | 1.875rem (30px) | 1.3         |
| H3             | Outfit        | 600        | 1.5rem (24px)   | 1.3         |
| H4             | Inter         | 600        | 1.25rem (20px)  | 1.4         |
| Body Large     | Inter         | 400        | 1.125rem (18px) | 1.6         |
| Body           | Inter         | 400        | 1rem (16px)     | 1.6         |
| Body Small     | Inter         | 400        | 0.875rem (14px) | 1.5         |
| Caption        | Inter         | 500        | 0.75rem (12px)  | 1.5         |
| Blog Body      | Georgia/serif | 400        | 1.125rem (18px) | 1.8         |

### 10.3 Spacing Scale

Based on 4px grid: 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), 8 (32px), 10 (40px), 12 (48px), 16 (64px), 20 (80px), 24 (96px)

### 10.4 Border Radius

| Element        | Radius                |
| -------------- | --------------------- |
| Buttons        | 8px (`rounded-lg`)    |
| Cards          | 12px (`rounded-xl`)   |
| Modals/Dialogs | 16px (`rounded-2xl`)  |
| Avatars        | Full (`rounded-full`) |
| Inputs         | 8px (`rounded-lg`)    |
| Badges         | 6px (`rounded-md`)    |
| Tooltips       | 8px (`rounded-lg`)    |

### 10.5 Shadow System

```css
/* Layered shadows for depth */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl:
  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-glow: 0 0 20px rgb(79 70 229 / 0.3); /* Primary glow */
```

### 10.6 Glassmorphism Classes

```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.glass-card-hover:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
}

.glass-navbar {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* Dark mode variants */
.dark .glass-navbar {
  background: rgba(15, 23, 42, 0.7);
  border-bottom-color: rgba(255, 255, 255, 0.05);
}
```

### 10.7 Animation Guidelines

| Animation          | Duration | Easing      | Library                     |
| ------------------ | -------- | ----------- | --------------------------- |
| Page transitions   | 300ms    | ease-in-out | Framer Motion               |
| Button hover       | 150ms    | ease        | CSS transition              |
| Card hover         | 200ms    | ease        | CSS transition              |
| Modal open/close   | 200ms    | spring      | Framer Motion               |
| Dropdown open      | 150ms    | ease-out    | CSS/Framer                  |
| Scroll reveal      | 500ms    | ease-out    | Framer Motion `whileInView` |
| Counter animation  | 1500ms   | ease-out    | Custom hook                 |
| Skeleton pulse     | 1500ms   | ease-in-out | CSS `@keyframes`            |
| Toast notification | 300ms    | spring      | Framer Motion               |
| Loading spinner    | 750ms    | linear      | CSS `@keyframes`            |

### 10.8 Responsive Breakpoints

| Breakpoint | Width  | Target        |
| ---------- | ------ | ------------- |
| `sm`       | 640px  | Large phones  |
| `md`       | 768px  | Tablets       |
| `lg`       | 1024px | Small laptops |
| `xl`       | 1280px | Desktops      |
| `2xl`      | 1536px | Large screens |

### 10.9 Dark Mode

- **Toggle:** Via `next-themes` + shadcn ThemeProvider
- **Default:** Respects system preference (`prefers-color-scheme`)
- **Toggle button** in navbar (sun/moon icon)
- All components use CSS variables via shadcn theming
- Dark mode uses Slate color scale for backgrounds

### 10.10 Accessibility (WCAG 2.1 AA)

- Color contrast ratio: minimum 4.5:1 for text, 3:1 for large text
- All interactive elements have focus-visible outlines
- Keyboard navigation for all features
- Screen reader support (proper ARIA labels)
- Skip navigation link
- Alt text for all images
- Form labels and error messages linked to inputs
- Loading states announced to screen readers

---

## 11. Component Library (shadcn/ui)

### 11.1 Required shadcn Components

Install these shadcn/ui components:

```bash
npx shadcn@latest add button card dialog dropdown-menu input label select textarea toast tabs table badge avatar skeleton separator sheet command popover calendar pagination progress accordion alert breadcrumb chart tooltip switch radio-group checkbox form scroll-area alert-dialog aspect-ratio collapsible context-menu hover-card menubar navigation-menu resizable slider sonner toggle toggle-group
```

### 11.2 Custom Components to Build

| Component       | Location                                     | Description                                  |
| --------------- | -------------------------------------------- | -------------------------------------------- |
| PublicNavbar    | `components/shared/public-navbar.tsx`        | Glassmorphism navbar for public pages        |
| ProtectedNavbar | `components/shared/protected-navbar.tsx`     | Navbar with search, notifications, user menu |
| Sidebar         | `components/shared/sidebar.tsx`              | Left sidebar with nav links, collapsible     |
| MobileSidebar   | `components/shared/mobile-sidebar.tsx`       | Sheet-based mobile nav                       |
| Footer          | `components/shared/footer.tsx`               | 3-column footer                              |
| PageHeader      | `components/shared/page-header.tsx`          | Reusable h1 + description + breadcrumb       |
| StatsCard       | `components/shared/stats-card.tsx`           | Animated counter card                        |
| EmptyState      | `components/shared/empty-state.tsx`          | Illustration + message for empty lists       |
| ImageUpload     | `components/shared/image-upload.tsx`         | S3 drag-and-drop upload                      |
| RichTextEditor  | `components/shared/rich-text-editor.tsx`     | Tiptap editor wrapper                        |
| RichTextViewer  | `components/shared/rich-text-viewer.tsx`     | Tiptap HTML renderer                         |
| DataTable       | `components/shared/data-table.tsx`           | Sortable, filterable table                   |
| ConfirmDialog   | `components/shared/confirm-dialog.tsx`       | "Are you sure?" dialog                       |
| ShareButtons    | `components/shared/share-buttons.tsx`        | Copy link, social share                      |
| DateRangePicker | `components/analytics/date-range-picker.tsx` | Date range for analytics                     |

---

## 12. Deployment & Infrastructure

### 12.1 Vercel Configuration

| Setting               | Value                           |
| --------------------- | ------------------------------- |
| Framework             | Next.js (auto-detected)         |
| Build Command         | `prisma generate && next build` |
| Output Directory      | `.next`                         |
| Node.js Version       | 20.x                            |
| Region                | Mumbai (`ap-south-1`)           |
| Environment Variables | See section 12.3                |

### 12.2 Vercel Cron Jobs (`vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/cron/news-refresh",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/overdue-fines",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/scheduled-posts",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### 12.3 Environment Variables

```env
# ─── Clerk Authentication ───
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home

# ─── Database (Neon Postgres) ───
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# ─── AWS S3 ───
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_S3_BUCKET_NAME=chandra-jyoti-uploads
AWS_REGION=ap-south-1

# ─── Razorpay ───
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx

# ─── Resend (Email) ───
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@chandrajyoti.org

# ─── News API ───
NEWS_API_KEY=xxx

# ─── App ───
NEXT_PUBLIC_APP_URL=https://chandrajyoti.org
CRON_SECRET=xxx
```

### 12.4 CI/CD Pipeline

1. **Push to `main`** -> Vercel auto-deploys to production
2. **Push to `develop`** -> Vercel deploys to preview
3. **PR created** -> Vercel creates preview deployment + comment with URL
4. **Pre-build:** `prisma generate` (included in build command)
5. **Post-deploy (manual):** `npx prisma migrate deploy` for schema changes

### 12.5 Neon Postgres Setup

- **Branching:** Use Neon branches for preview deployments
- **Connection Pooling:** Enable pgBouncer for serverless compatibility
- **Autoscaling:** Configure compute scaling for production
- **Backups:** Neon provides automatic daily backups

---

## 13. Security Requirements

| Area                     | Implementation                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------- |
| **Authentication**       | Clerk (JWT, session tokens, MFA support)                                               |
| **Authorization**        | Role-based middleware + per-action checks (`requireRole()`)                            |
| **SQL Injection**        | Prisma parameterized queries (built-in protection)                                     |
| **XSS**                  | React auto-escaping + DOMPurify for rich text rendering                                |
| **CSRF**                 | Next.js Server Actions include CSRF tokens automatically                               |
| **File Upload**          | Validate type (whitelist: jpg, png, webp, gif, pdf), max size (10MB), S3 bucket policy |
| **Rate Limiting**        | Upstash Ratelimit on API routes (10 requests/10 seconds per IP)                        |
| **Payment Security**     | Razorpay PCI-DSS compliant; no card data touches our server                            |
| **Webhook Verification** | HMAC signature verification for Clerk + Razorpay webhooks                              |
| **Input Validation**     | Zod schemas on both client and server for all forms                                    |
| **Data Privacy**         | Soft-delete users, anonymize data on request                                           |
| **Secrets**              | Environment variables, never in code/git                                               |
| **Headers**              | Security headers via Next.js config (CSP, X-Frame-Options, etc.)                       |
| **Dependency Audit**     | Regular `npm audit` checks                                                             |

---

## 14. Performance Requirements

| Metric                         | Target                                                    |
| ------------------------------ | --------------------------------------------------------- |
| Lighthouse Performance Score   | 90+                                                       |
| First Contentful Paint (FCP)   | < 1.5 seconds                                             |
| Largest Contentful Paint (LCP) | < 2.5 seconds                                             |
| Time to Interactive (TTI)      | < 3 seconds                                               |
| Cumulative Layout Shift (CLS)  | < 0.1                                                     |
| First Input Delay (FID)        | < 100ms                                                   |
| API Response Time (p95)        | < 200ms                                                   |
| Initial JS Bundle              | < 200KB gzipped                                           |
| Image Loading                  | Next.js Image (WebP/AVIF, lazy loading, blur placeholder) |
| Database Queries               | Indexed, avoid N+1, use Prisma `include` selectively      |
| Caching                        | ISR for blog/news (60s), SWR for dynamic client data      |
| Edge Functions                 | Middleware runs at edge for fast auth checks              |

---

## 15. Testing Strategy

### 15.1 Testing Pyramid

| Level             | Tool                     | Coverage Target | What to Test                                      |
| ----------------- | ------------------------ | --------------- | ------------------------------------------------- |
| Unit Tests        | Vitest                   | 80%+            | Utility functions, Zod schemas, data transformers |
| Component Tests   | Vitest + Testing Library | 60%+            | UI components render correctly                    |
| Integration Tests | Vitest                   | 50%+            | Server actions with mocked DB                     |
| E2E Tests         | Playwright               | Critical paths  | Auth flow, blog CRUD, donation flow, family tree  |

### 15.2 Critical E2E Test Scenarios

1. **Auth:** Register -> Login -> View dashboard -> Logout
2. **Blog:** Create post -> Publish -> View -> Like -> Comment -> Delete
3. **Forum:** Create thread -> Reply -> Upvote -> Mark solution
4. **Family Tree:** Add member -> Admin approves -> View in tree
5. **Donation:** Make donation -> Razorpay checkout -> Verify receipt
6. **Fine:** Admin assigns -> Member views -> Member pays
7. **News:** View local tab -> Switch to national -> View article
8. **Admin:** Login as admin -> Manage users -> View analytics

---

## 16. Incremental Implementation Plan

### Phase 1: Foundation (Week 1-2)

**Step 1.1: Project Setup**

- [x] Initialize Next.js 16.1.6 project (done)
- [ ] Configure Tailwind CSS v4
- [ ] Install and configure shadcn/ui
- [ ] Install and configure Clerk
- [ ] Set up Prisma with Neon Postgres
- [ ] Configure AWS S3 client
- [ ] Set up environment variables
- [ ] Configure ESLint + Prettier
- [ ] Create `.env.example`

**Step 1.2: Database Schema**

- [ ] Write complete Prisma schema (from Section 8)
- [ ] Run initial migration (`prisma migrate dev`)
- [ ] Create seed script with initial data
- [ ] Run seed (`prisma db seed`)
- [ ] Verify database with Prisma Studio

**Step 1.3: Authentication**

- [ ] Configure Clerk middleware (`proxy.ts`)
- [ ] Create sign-in page with custom styling
- [ ] Create sign-up page with custom styling
- [ ] Create Clerk webhook handler (`/api/webhooks/clerk`)
- [ ] Test: register, login, logout, user sync to DB

**Step 1.4: Core Layout**

- [ ] Create root layout (`app/layout.tsx`) with providers
- [ ] Create ThemeProvider (dark/light mode)
- [ ] Create public layout with PublicNavbar + Footer
- [ ] Create auth layout (centered)
- [ ] Create protected layout with Sidebar + ProtectedNavbar
- [ ] Install Google Fonts (Outfit, Inter)

**Step 1.5: Shared Components**

- [ ] Build PublicNavbar (glassmorphism, sticky)
- [ ] Build ProtectedNavbar (search, notifications, user menu)
- [ ] Build Sidebar (navigation links, collapsible)
- [ ] Build MobileSidebar (Sheet-based)
- [ ] Build Footer (3-column)
- [ ] Build PageHeader, StatsCard, EmptyState
- [ ] Build ImageUpload (S3), FileUpload
- [ ] Build RichTextEditor (Tiptap wrapper)
- [ ] Build RichTextViewer
- [ ] Build ConfirmDialog, DataTable

### Phase 2: Public Pages (Week 2-3)

**Step 2.1: Landing Page**

- [ ] Build HeroSection with floating particles animation
- [ ] Build VillageSection with image grid + stats
- [ ] Build FeaturesSection with glassmorphism cards
- [ ] Build SansthaSection (mission, vision)
- [ ] Build TestimonialsSection with auto-scroll carousel
- [ ] Build StatsCounter with animated counters
- [ ] Build CTABanner with gradient animation
- [ ] Assemble landing page
- [ ] Test responsive design (mobile, tablet, desktop)

**Step 2.2: About Us Page**

- [ ] Build hero banner with parallax
- [ ] Build Our Story section
- [ ] Build Mission/Vision cards
- [ ] Build Values grid (6 cards)
- [ ] Build Leadership Team grid
- [ ] Build Timeline with scroll animation
- [ ] Build Village Heritage gallery
- [ ] Build Statistics counters
- [ ] Build Join Us CTA

**Step 2.3: Contact Us Page**

- [ ] Build contact form with Zod validation
- [ ] Create contact form server action
- [ ] Build contact info cards
- [ ] Embed Google Maps
- [ ] Build social links section
- [ ] Build FAQ accordion
- [ ] Test form submission + email sending

### Phase 3: Homepage Dashboard (Week 3-4)

**Step 3.1: Dashboard**

- [ ] Build welcome banner component
- [ ] Build quick stats cards (fetch real data)
- [ ] Build recent blog posts section
- [ ] Build active forum threads section
- [ ] Build news highlights section
- [ ] Build community activity feed
- [ ] Build quick action buttons
- [ ] Create dashboard data fetching queries

### Phase 4: Family Tree (Week 4-5)

**Step 4.1: D3.js Tree**

- [ ] Install D3.js
- [ ] Build TreeVisualization component (D3 canvas)
- [ ] Implement vertical tree layout
- [ ] Implement horizontal tree layout
- [ ] Implement radial tree layout
- [ ] Build MemberNode (custom D3 node)
- [ ] Build MemberDetailCard (click overlay)
- [ ] Build TreeControls (zoom, pan, reset, fullscreen)
- [ ] Build TreeSearch (instant search with highlight)
- [ ] Build TreeFilters (clan, generation, living/deceased)
- [ ] Build TreeLegend
- [ ] Build TreeMinimap
- [ ] Build TreeExport (PNG, SVG, PDF)

**Step 4.2: Family Management**

- [ ] Build MemberForm (add family member)
- [ ] Create addFamilyMember server action
- [ ] Create updateFamilyMember server action
- [ ] Build family tree data queries
- [ ] Build admin approval page (`/admin/family-tree`)
- [ ] Create approveFamilyMember / rejectFamilyMember actions

### Phase 5: Blog System (Week 5-7)

**Step 5.1: Blog CRUD**

- [ ] Build BlogEditor with Tiptap
- [ ] Create createPost, updatePost, deletePost server actions
- [ ] Build blog listing page with filters + pagination
- [ ] Build BlogCard component
- [ ] Build featured post card
- [ ] Build blog sidebar (categories, tags, authors)
- [ ] Build blog categories/tags pages

**Step 5.2: Blog Detail**

- [ ] Build blog detail page
- [ ] Build table of contents (auto from headings)
- [ ] Build author bio section
- [ ] Build related posts
- [ ] Build like, bookmark, share buttons
- [ ] Create like, bookmark server actions
- [ ] Implement view counting

**Step 5.3: Comments**

- [ ] Build comment form (Tiptap mini)
- [ ] Build threaded comment list (3 levels)
- [ ] Create addComment, deleteComment, pinComment actions
- [ ] Build comment like button
- [ ] Build report comment

**Step 5.4: My Posts + Bookmarks**

- [ ] Build my posts page with all statuses
- [ ] Build bookmarks page
- [ ] Build scheduled posts handling

### Phase 6: Forum System (Week 7-8)

**Step 6.1: Forum Structure**

- [ ] Build forum categories page
- [ ] Build CategoryCard component
- [ ] Build category threads page
- [ ] Build ThreadCard component
- [ ] Build forum sidebar

**Step 6.2: Thread CRUD**

- [ ] Build thread creation page + form
- [ ] Create createThread, updateThread actions
- [ ] Build thread detail page
- [ ] Build reply form and reply list (nested)
- [ ] Create addReply action
- [ ] Build upvote/downvote buttons + voteReply action
- [ ] Build mark-as-solution

**Step 6.3: Forum Features**

- [ ] Build poll creation form
- [ ] Build poll voting widget
- [ ] Create poll actions
- [ ] Build pin/lock thread (mod actions)
- [ ] Build search forum
- [ ] Build my-threads page

### Phase 7: News System (Week 8-9)

**Step 7.1: News Page**

- [ ] Build news page with category tabs
- [ ] Build NewsCard component
- [ ] Build news detail page
- [ ] Build news bookmark toggle
- [ ] Create news bookmark actions

**Step 7.2: Local News (Admin)**

- [ ] Build admin news editor
- [ ] Create CRUD actions for local news
- [ ] Build admin news management page

**Step 7.3: External News**

- [ ] Integrate NewsAPI
- [ ] Build external news fetcher
- [ ] Create cron route for auto-refresh
- [ ] Configure Vercel cron job

### Phase 8: Payment System (Week 9-11)

**Step 8.1: Razorpay Setup**

- [ ] Install Razorpay SDK
- [ ] Build RazorpayButton component
- [ ] Create payment order creation action
- [ ] Build Razorpay webhook handler
- [ ] Test payment flow end-to-end

**Step 8.2: Donations**

- [ ] Build donation form (amount selector, message, anonymous toggle)
- [ ] Create donation server action
- [ ] Build payment success page
- [ ] Build receipt generation (PDF)

**Step 8.3: Emergency Campaigns**

- [ ] Build campaign listing page
- [ ] Build CampaignCard with progress bar
- [ ] Build campaign detail page
- [ ] Build campaign donation form
- [ ] Build admin campaign creation form
- [ ] Create campaign CRUD actions

**Step 8.4: Fines/Penalties**

- [ ] Build member fines page
- [ ] Build FineCard component
- [ ] Build fine payment flow
- [ ] Build fine dispute form
- [ ] Build admin assign-fine form
- [ ] Build admin fine management page
- [ ] Create fine actions (assign, pay, dispute, resolve)
- [ ] Build overdue fine notification cron

**Step 8.5: Payment Dashboard**

- [ ] Build member payment dashboard
- [ ] Build payment history table
- [ ] Build admin payment dashboard
- [ ] Build financial export (CSV, PDF)

### Phase 9: Analytics (Week 11-12)

**Step 9.1: Tracking**

- [ ] Build analytics tracking utility (`lib/analytics.ts`)
- [ ] Add trackEvent calls to all server actions
- [ ] Add page view tracking in middleware
- [ ] Build analytics data aggregation queries

**Step 9.2: User Analytics**

- [ ] Build personal analytics dashboard
- [ ] Build activity overview cards
- [ ] Build content performance table
- [ ] Build engagement charts (Recharts)
- [ ] Build browse history list

**Step 9.3: Admin Analytics**

- [ ] Build admin analytics overview
- [ ] Build user analytics page (DAU/WAU/MAU, leaderboard)
- [ ] Build content analytics page (popular posts, growth)
- [ ] Build financial analytics page (revenue charts)
- [ ] Build system health page (SUPER_ADMIN)
- [ ] Build date range picker for filtering
- [ ] Build export functionality

### Phase 10: Notifications + Profile + Admin (Week 12-13)

**Step 10.1: Notifications**

- [ ] Build notification bell with unread count
- [ ] Build notification dropdown (latest 10)
- [ ] Build notifications page (full list)
- [ ] Create notification creation in relevant actions
- [ ] Create markAsRead, markAllAsRead actions

**Step 10.2: User Profile**

- [ ] Build profile view page
- [ ] Build profile edit page
- [ ] Create updateProfile action

**Step 10.3: Admin Panel**

- [ ] Build admin dashboard
- [ ] Build user management page (DataTable)
- [ ] Build role assignment
- [ ] Build content moderation queue
- [ ] Build forum category management
- [ ] Build testimonial management
- [ ] Build contact submissions page
- [ ] Build site settings page (SUPER_ADMIN)

### Phase 11: Polish & Deploy (Week 13-14)

**Step 11.1: Polish**

- [ ] Review all responsive layouts
- [ ] Add loading states (Skeleton) to all pages
- [ ] Add error boundaries to all pages
- [ ] Build custom 404 page
- [ ] Build custom error page
- [ ] Add SEO metadata to all pages
- [ ] Add Open Graph images
- [ ] Performance optimization (bundle analysis, lazy loading)

**Step 11.2: Testing**

- [ ] Write unit tests for utility functions
- [ ] Write E2E tests for critical paths (Playwright)
- [ ] Manual testing on mobile devices
- [ ] Test dark mode across all pages

**Step 11.3: Deployment**

- [ ] Set up Neon Postgres production database
- [ ] Run production migration
- [ ] Set up Vercel project
- [ ] Configure environment variables in Vercel
- [ ] Configure custom domain
- [ ] Deploy to production
- [ ] Configure Vercel cron jobs
- [ ] Set up Clerk production instance
- [ ] Set up Razorpay production keys
- [ ] Verify all webhooks in production
- [ ] Load test with sample data

---

## 17. Future Roadmap

### v2.0 (Phase 2)

- Multi-language support (Nepali, Sikkimese, Hindi)
- Mobile app (React Native / Expo)
- Event calendar with RSVP
- Photo/video gallery for village events
- Direct messaging between members
- SMS notifications for critical alerts
- WhatsApp Business API integration

### v3.0 (Phase 3)

- AI-powered content recommendations
- Voice posts / audio blog support
- PWA with offline support
- Integration with government services
- Village marketplace / classifieds
- Document management (meeting minutes, community records)
- Election/voting system for Sanstha positions
- Automated annual report generation

---

## 18. Appendix

### A. Glossary

| Term           | Definition                                                          |
| -------------- | ------------------------------------------------------------------- |
| Sanstha        | Sanskrit for organization/institution; the community governing body |
| Tumin Dhanbari | Village in Gangtok District, East Sikkim                            |
| Family Clan    | Extended family surname grouping                                    |
| Emergency Fund | Crowdfunding campaign for urgent community needs                    |
| Fine/Penalty   | Financial penalty assigned by Sanstha admin for rule violations     |
| ISR            | Incremental Static Regeneration (Next.js caching strategy)          |
| RSC            | React Server Components                                             |
| SWR            | Stale-While-Revalidate (client-side data fetching pattern)          |

### B. References

| Resource              | URL                                                     |
| --------------------- | ------------------------------------------------------- |
| Next.js Documentation | https://nextjs.org/docs                                 |
| React 19 Docs         | https://react.dev                                       |
| Tailwind CSS v4       | https://tailwindcss.com                                 |
| shadcn/ui             | https://ui.shadcn.com                                   |
| Clerk Documentation   | https://clerk.com/docs                                  |
| Prisma Documentation  | https://prisma.io/docs                                  |
| Neon Postgres         | https://neon.tech/docs                                  |
| D3.js Documentation   | https://d3js.org                                        |
| Tiptap Editor         | https://tiptap.dev                                      |
| Recharts              | https://recharts.org                                    |
| Framer Motion         | https://motion.dev                                      |
| Razorpay Docs         | https://razorpay.com/docs                               |
| Resend Email          | https://resend.com/docs                                 |
| AWS S3 SDK v3         | https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/ |

### C. Revision History

| Version | Date         | Author           | Changes     |
| ------- | ------------ | ---------------- | ----------- |
| 1.0.0   | Feb 14, 2026 | Development Team | Initial PRD |

---

_Document maintained by the Chandra Jyoti Sanstha Development Team_
_Last updated: February 14, 2026_
