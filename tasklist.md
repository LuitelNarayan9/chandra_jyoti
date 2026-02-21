## 16. Incremental Implementation Plan

### Phase 1: Foundation (Week 1-2)

**Step 1.1: Project Setup**

- [x] Initialize Next.js 16.1.6 project (done)
- [x] Configure Tailwind CSS v4
- [x] Install and configure shadcn/ui
- [x] Install and configure Clerk
- [x] Set up Prisma with Neon Postgres
- [x] Configure AWS S3 client
- [x] Set up environment variables
- [x] Configure ESLint + Prettier
- [x] Create `.env.example`

**Step 1.2: Database Schema**

- [x] Write complete Prisma schema (from Section 8 of docs/prd.md)
- [x] Run initial migration (`prisma migrate dev`)
- [x] Create seed script with initial data
- [x] Run seed (`prisma db seed`)
- [x] Verify database with Prisma Studio

**Step 1.3: Authentication**

- [x] Configure Clerk middleware (`proxy.ts`)
- [x] Create sign-in page with custom styling
- [x] Create sign-up page with custom styling
- [x] Create Clerk webhook handler (`/api/webhooks/clerk`)
- [x] Test: register, login, logout, user sync to DB

**Step 1.4: Core Layout**

- [x] Create root layout (`app/layout.tsx`) with providers
- [x] Create ThemeProvider (dark/light mode)
- [x] Create public layout with PublicNavbar + Footer
- [x] Create auth layout (centered)
- [x] Create protected layout with Sidebar + ProtectedNavbar
- [x] Install Google Fonts (Outfit, Inter)

**Step 1.5: Shared Components**

- [x] Build PublicNavbar (glassmorphism, sticky)
- [x] Build ProtectedNavbar (search, notifications, user menu)
- [x] Build Sidebar (navigation links, collapsible)
- [x] Build MobileSidebar (Sheet-based)
- [x] Build Footer (3-column)
- [x] Build PageHeader, StatsCard, EmptyState
- [x] Build ImageUpload (S3), FileUpload
- [x] Build RichTextEditor (Tiptap wrapper)
- [x] Build RichTextViewer
- [x] Build ConfirmDialog, DataTable

### Phase 2: Public Pages (Week 2-3)

**Step 2.1: Landing Page**

- [x] Build HeroSection with floating particles animation
- [x] Build VillageSection with image grid + stats
- [x] Build FeaturesSection with glassmorphism cards
- [x] Build SansthaSection (mission, vision)
- [x] Build TestimonialsSection with auto-scroll carousel
- [x] Build StatsCounter with animated counters
- [x] Build CTABanner with gradient animation
- [x] Assemble landing page
- [x] Test responsive design (mobile, tablet, desktop)

**Step 2.2: About Us Page**

- [x] Build hero banner with parallax
- [x] Build Our Story section
- [x] Build Mission/Vision cards
- [x] Build Values grid (6 cards)
- [x] Build Leadership Team grid
- [x] Build Timeline with scroll animation
- [x] Build Village Heritage gallery
- [x] Build Statistics counters
- [x] Build Join Us CTA
- [x] Assemble About Us Page

**Step 2.3: Contact Us Page**

- [x] Build contact form with Zod validation
- [x] Create contact form server action
- [x] Build contact info cards
- [x] Embed Google Maps
- [x] Build social links section
- [x] Build FAQ accordion
- [x] Test form submission + email sending

### Phase 3: Homepage Dashboard (Week 3-4)

**Step 3.1: Dashboard**

- [x] Build welcome banner component
- [x] Build quick stats cards (fetch real data)
- [x] Build recent blog posts section
- [x] Build active forum threads section
- [x] Build news highlights section
- [x] Build community activity feed
- [x] Build quick action buttons
- [x] Create dashboard data fetching queries

### Phase 4: Family Tree (Week 4-5)

**Step 4.1: D3.js Tree**

- [x] Install D3.js
- [x] Build TreeVisualization component (D3 canvas)
- [x] Implement vertical tree layout
- [x] Implement horizontal tree layout
- [x] Implement radial tree layout
- [x] Build MemberNode (custom D3 node)
- [x] Build MemberDetailCard (click overlay)
- [x] Build TreeControls (zoom, pan, reset, fullscreen)
- [x] Build TreeSearch (instant search with highlight)
- [x] Build TreeFilters (clan, generation, living/deceased)
- [x] Build TreeLegend
- [x] Build TreeMinimap - Omitted intentionally as it adds too much clutter for small screens
- [x] Build TreeExport (PNG, SVG, PDF)

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
