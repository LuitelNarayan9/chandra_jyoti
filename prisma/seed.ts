import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

// ─── Helpers ──────────────────────────────────────────────────

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Seed Data ────────────────────────────────────────────────

const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`;

const BLOG_TITLES = [
  "Celebrating Dashain: Our Community Traditions",
  "How We Preserved Our Ancient Water Mill",
  "Youth Scholarship Fund: 2025 Results",
  "Annual Community Gathering Highlights",
  "The History of Dhanbari: A Deep Dive",
  "Traditional Recipes From Our Grandmothers",
  "Building the New Community Center",
  "Sikkim's Flora and Fauna: A Photo Essay",
  "Education Initiatives for 2025",
  "Stories From the Elders: Oral History Project",
  "Community Garden Project Update",
  "Festival of Lights: Tihar Celebration",
  "Road Development Project Completed",
  "Youth Sports Tournament Results",
  "Cultural Dance Workshop Announcement",
  "New Library Books Donation Drive",
  "Medical Camp: Health Check-Up Results",
  "Traditional Music Preservation Effort",
  "Community Clean-Up Drive Success",
  "Annual Budget Meeting Summary",
  "Teaching Nepali Script to Children",
  "Inter-Village Football Championship",
  "Heritage Walk Through Old Dhanbari",
  "Monsoon Preparedness Guidelines",
  "Senior Citizens' Appreciation Day",
  "Women's Empowerment Workshop",
  "Agricultural Training Program Launch",
  "Bridge Construction Milestone",
  "Environmental Conservation Week Activities",
  "Community Radio Station Proposal",
  "Traditional Weaving Revival Project",
  "Mid-Year Financial Report Summary",
  "Blood Donation Camp Organized",
  "New Trail to Mountain Temple",
  "Community Wi-Fi Installation Update",
  "Children's Art Competition Results",
  "Organic Farming Workshop Review",
  "Cultural Exchange with Neighboring Village",
  "Emergency Fund Utilization Report",
  "Community Constitution Amendment Proposal",
  "Tree Planting Drive: 500 Saplings!",
  "Annual Election Process Announcement",
  "Earthquake Preparedness Training",
  "Traditional Medicine Knowledge Sharing",
  "Tourism Promotion Initiative Feedback",
  "Monthly Newsletter: January Edition",
  "Monthly Newsletter: February Edition",
  "Monthly Newsletter: March Edition",
  "Monthly Newsletter: April Edition",
  "Volunteers of the Month Recognition",
];

const FORUM_TITLES = [
  "Best places to visit in Sikkim during monsoon?",
  "Need help with family tree documentation",
  "Proposing a community skill-sharing program",
  "Traditional remedies for common cold",
  "When is the next community meeting?",
  "Looking for old photographs of Dhanbari",
  "How to register for the scholarship program?",
  "Feedback on the new community website",
  "Organizing a cleanup drive this weekend",
  "Share your favorite childhood memories",
  "Water supply issue in ward 3",
  "Request for road repair near school",
  "Ideas for the annual festival",
  "Vegetable seeds exchange program",
  "Book recommendations for children",
  "How to join the youth committee?",
  "Traditional cooking class this Saturday",
  "Missing pet near the bazaar area",
  "Electricity outage schedule query",
  "Best internet provider in the area?",
  "Planning a community picnic",
  "Help needed: Home renovation advice",
  "Agricultural loan information request",
  "Traditional dress making workshop interest",
  "Community garden plot availability",
  "Bus schedule to Gangtok updated?",
  "Safety tips for the landslide season",
  "Photography contest announcement",
  "Community sports day planning",
  "New teacher recruitment at local school",
  "Temple restoration fund update",
  "Local market day schedule change",
  "Emergency contact numbers list",
  "Community library operating hours",
  "Traditional dance practice sessions",
  "Rainwater harvesting workshop",
  "Discussing community bylaws update",
  "Best practices for waste management",
  "Proposal: Monthly cultural evening",
  "Health insurance scheme information",
  "Carpooling to Gangtok - anyone interested?",
  "Community bakery idea discussion",
  "Solar panel installation subsidy info",
  "Local handicraft exhibition planning",
  "Youth mentorship program sign-up",
  "Old bridge safety concerns",
  "Community FM radio listener survey",
  "Traditional games tournament for kids",
  "Micro-finance group formation",
  "Community newsletter feedback",
];

const NEWS_LOCAL = [
  { title: "New Primary Health Center Inaugurated in Dhanbari", category: "LOCAL" as const },
  { title: "Community Road Widening Project Kicks Off", category: "LOCAL" as const },
  { title: "Annual Chandra Jyoti Award Recipients Announced", category: "LOCAL" as const },
  { title: "Local School Achieves 100% Pass Rate", category: "LOCAL" as const },
  { title: "New Water Supply Pipeline Completed", category: "LOCAL" as const },
  { title: "Community Cultural Program Draws Record Attendance", category: "LOCAL" as const },
  { title: "Solar Street Lights Installed in Main Bazaar", category: "LOCAL" as const },
  { title: "Youth Workshop on Digital Literacy Held", category: "LOCAL" as const },
  { title: "Local Farmer Wins State Agriculture Award", category: "LOCAL" as const },
  { title: "Community Library Gets 200 New Books", category: "LOCAL" as const },
  { title: "Monsoon Relief Fund Distributed to Families", category: "LOCAL" as const },
  { title: "New Playground Equipment Installed at School", category: "LOCAL" as const },
  { title: "Organic Market Launches Every Sunday", category: "LOCAL" as const },
  { title: "Traditional Music Festival Planned for March", category: "LOCAL" as const },
  { title: "Community Blood Bank Initiative Started", category: "LOCAL" as const },
  { title: "Local Women's Self-Help Group Receives Funding", category: "LOCAL" as const },
  { title: "Bridge Over River Teesta Gets Safety Railings", category: "LOCAL" as const },
  { title: "Community Garden Produces First Harvest", category: "LOCAL" as const },
  { title: "New Computer Lab Setup at Community Center", category: "LOCAL" as const },
  { title: "Dhanbari Cleanup Day: 200 Volunteers Participate", category: "LOCAL" as const },
  { title: "Sports Complex Construction Begins", category: "LOCAL" as const },
  { title: "Heritage Trail Marking Project Completed", category: "LOCAL" as const },
  { title: "Free Eye Camp: 150 Patients Treated", category: "LOCAL" as const },
  { title: "Youth Volley Ball Tournament This Weekend", category: "LOCAL" as const },
  { title: "Community Center Hall Renovation Finished", category: "LOCAL" as const },
];

const NEWS_EXTERNAL = [
  { title: "Sikkim Introduces New Tourism Policy for 2025", category: "STATE" as const },
  { title: "State Government Announces Rural Development Fund", category: "STATE" as const },
  { title: "Gangtok Smart City Project Phase 2 Begins", category: "STATE" as const },
  { title: "Sikkim Organic Mission Expands to New Districts", category: "STATE" as const },
  { title: "New Highway Connecting East and West Sikkim Approved", category: "STATE" as const },
  { title: "India Digital Village Program Extended to Northeast", category: "NATIONAL" as const },
  { title: "PM-KISAN Benefits Increased for Small Farmers", category: "NATIONAL" as const },
  { title: "National Education Policy: New Changes Announced", category: "NATIONAL" as const },
  { title: "Digital India: Free Wi-Fi in All Gram Panchayats", category: "NATIONAL" as const },
  { title: "Ayushman Bharat: Coverage Extended to More States", category: "NATIONAL" as const },
  { title: "Union Budget 2025: Rural Infrastructure Boost", category: "NATIONAL" as const },
  { title: "Nepal-India Border Trade Agreement Updated", category: "INTERNATIONAL" as const },
  { title: "UNESCO Recognizes Himalayan Cultural Heritage Sites", category: "INTERNATIONAL" as const },
  { title: "SAARC Youth Exchange Program Announced", category: "INTERNATIONAL" as const },
  { title: "Global Climate Summit: Impact on Mountain Communities", category: "INTERNATIONAL" as const },
  { title: "World Bank Funds Rural Education in South Asia", category: "INTERNATIONAL" as const },
  { title: "Sikkim Tourism Sets Record with 2M Visitors", category: "STATE" as const },
  { title: "New Eco-tourism Regulations in Protected Areas", category: "STATE" as const },
  { title: "State Awards for Community Development Leaders", category: "STATE" as const },
  { title: "Northeast Festival Showcases Cultural Diversity", category: "NATIONAL" as const },
  { title: "India Ranks in Top 5 for Biodiversity Conservation", category: "NATIONAL" as const },
  { title: "Cross-Border Cultural Exchange with Bhutan", category: "INTERNATIONAL" as const },
  { title: "UN Sustainable Development Goals: Progress Report", category: "INTERNATIONAL" as const },
  { title: "Asian Development Bank: Mountain Community Grants", category: "INTERNATIONAL" as const },
  { title: "Digital Payments Adoption Rises in Rural India", category: "NATIONAL" as const },
];

// ──────────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ──────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database with comprehensive data...\n");

  // ================================================================
  // 1. USERS (10 seed users)
  // ================================================================
  // NOTE: These use fake clerkIds. Your real logged-in user from Clerk
  // webhook will exist separately. These provide content authorship.

  const SEED_USERS = [
    { clerkId: "seed_clerk_001", email: "rajesh.sharma@example.com", firstName: "Rajesh", lastName: "Sharma", role: "SUPER_ADMIN" as const, bio: "Platform administrator and community leader" },
    { clerkId: "seed_clerk_002", email: "anita.rai@example.com", firstName: "Anita", lastName: "Rai", role: "ADMIN" as const, bio: "Community moderator and event organizer" },
    { clerkId: "seed_clerk_003", email: "kumar.tamang@example.com", firstName: "Kumar", lastName: "Tamang", role: "MODERATOR" as const, bio: "Youth leader and forum moderator" },
    { clerkId: "seed_clerk_004", email: "priya.gurung@example.com", firstName: "Priya", lastName: "Gurung", role: "MODERATOR" as const, bio: "Cultural preservation enthusiast" },
    { clerkId: "seed_clerk_005", email: "bikash.sharma@example.com", firstName: "Bikash", lastName: "Sharma", role: "MEMBER" as const, bio: "Teacher at local school" },
    { clerkId: "seed_clerk_006", email: "sita.rai@example.com", firstName: "Sita", lastName: "Rai", role: "MEMBER" as const, bio: "Community garden coordinator" },
    { clerkId: "seed_clerk_007", email: "deepak.tamang@example.com", firstName: "Deepak", lastName: "Tamang", role: "MEMBER" as const, bio: "Local shopkeeper and sports enthusiast" },
    { clerkId: "seed_clerk_008", email: "meena.subba@example.com", firstName: "Meena", lastName: "Subba", role: "MEMBER" as const, bio: "Healthcare worker" },
    { clerkId: "seed_clerk_009", email: "rajan.chhetri@example.com", firstName: "Rajan", lastName: "Chhetri", role: "MEMBER" as const, bio: "Farmer and traditional music lover" },
    { clerkId: "seed_clerk_010", email: "nisha.limboo@example.com", firstName: "Nisha", lastName: "Limboo", role: "MEMBER" as const, bio: "College student and volunteer" },
  ];

  const users = await Promise.all(
    SEED_USERS.map((u) =>
      prisma.user.upsert({
        where: { clerkId: u.clerkId },
        update: { role: u.role },
        create: {
          clerkId: u.clerkId,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          bio: u.bio,
          isActive: true,
          createdAt: randomDate(new Date("2024-06-01"), new Date("2025-12-01")),
        },
      })
    )
  );
  console.log(`✅ ${users.length} users seeded`);

  // ================================================================
  // 2. BLOG CATEGORIES & TAGS (upsert, keep existing)
  // ================================================================

  const blogCategories = await Promise.all(
    [
      { name: "Culture", slug: "culture", description: "Posts about traditions, rituals, and cultural practices", icon: "🏛️", color: "#8b5cf6", sortOrder: 1 },
      { name: "Events", slug: "events", description: "Upcoming and past community events", icon: "📅", color: "#f59e0b", sortOrder: 2 },
      { name: "Stories", slug: "stories", description: "Personal stories and narratives from our community", icon: "📖", color: "#ec4899", sortOrder: 3 },
      { name: "Development", slug: "development", description: "Infrastructure and community development updates", icon: "🏗️", color: "#10b981", sortOrder: 4 },
      { name: "Education", slug: "education", description: "Educational initiatives and scholarship updates", icon: "🎓", color: "#3b82f6", sortOrder: 5 },
      { name: "General", slug: "general", description: "General community posts and announcements", icon: "📝", color: "#6366f1", sortOrder: 6 },
    ].map((c) => prisma.blogCategory.upsert({ where: { slug: c.slug }, update: {}, create: c }))
  );
  console.log(`✅ ${blogCategories.length} blog categories`);

  const blogTags = await Promise.all(
    [
      { name: "Festival", slug: "festival" },
      { name: "Sikkim", slug: "sikkim" },
      { name: "Tradition", slug: "tradition" },
      { name: "Youth", slug: "youth" },
      { name: "Nature", slug: "nature" },
      { name: "Community", slug: "community" },
      { name: "Heritage", slug: "heritage" },
      { name: "Development", slug: "development" },
    ].map((t) => prisma.blogTag.upsert({ where: { slug: t.slug }, update: {}, create: t }))
  );
  console.log(`✅ ${blogTags.length} blog tags`);

  // ================================================================
  // 3. BLOG POSTS (50)
  // ================================================================

  const blogPosts = [];
  for (let i = 0; i < 50; i++) {
    const title = BLOG_TITLES[i];
    const slug = slugify(title) + `-${i + 1}`;
    const author = randomItem(users);
    const category = randomItem(blogCategories);
    const publishedAt = randomDate(new Date("2024-08-01"), new Date());
    const status = i < 42 ? "PUBLISHED" : i < 46 ? "DRAFT" : "ARCHIVED";

    const post = await prisma.blogPost.upsert({
      where: { slug },
      update: {},
      create: {
        title,
        slug,
        excerpt: `${title} — a brief overview of this community update and its impact on Dhanbari.`,
        content: `<h2>${title}</h2><p>${LOREM}</p><p>${LOREM}</p><p>This is an important update for our community members. We encourage everyone to participate and contribute.</p><p>${LOREM}</p>`,
        coverImage: `https://picsum.photos/seed/${slug}/800/400`,
        status: status as any,
        isFeatured: i < 5,
        readingTime: randomInt(2, 12),
        views: randomInt(10, 500),
        publishedAt: status === "PUBLISHED" ? publishedAt : null,
        authorId: author.id,
        categoryId: category.id,
      },
    });
    blogPosts.push(post);

    // Attach 1-3 random tags
    const tagCount = randomInt(1, 3);
    const shuffledTags = [...blogTags].sort(() => Math.random() - 0.5).slice(0, tagCount);
    for (const tag of shuffledTags) {
      await prisma.blogPostTag.upsert({
        where: { postId_tagId: { postId: post.id, tagId: tag.id } },
        update: {},
        create: { postId: post.id, tagId: tag.id },
      });
    }
  }
  console.log(`✅ ${blogPosts.length} blog posts seeded`);

  // Add some comments and likes
  for (let i = 0; i < 80; i++) {
    const post = randomItem(blogPosts);
    const user = randomItem(users);
    try {
      await prisma.comment.create({
        data: {
          content: randomItem([
            "Great article! Very informative.",
            "Thanks for sharing this update.",
            "I completely agree with these points.",
            "This is really helpful for our community.",
            "Well written! Looking forward to more.",
            "Important information for everyone.",
            "Wonderful initiative by the community.",
            "Keep up the great work!",
          ]),
          authorId: user.id,
          postId: post.id,
          createdAt: randomDate(new Date("2024-09-01"), new Date()),
        },
      });
    } catch { /* skip duplicate */ }
  }
  console.log(`✅ Comments seeded`);

  for (let i = 0; i < 100; i++) {
    const post = randomItem(blogPosts);
    const user = randomItem(users);
    try {
      await prisma.like.create({
        data: { userId: user.id, postId: post.id },
      });
    } catch { /* skip duplicate */ }
  }
  console.log(`✅ Likes seeded`);

  // ================================================================
  // 4. FORUM CATEGORIES & TAGS
  // ================================================================

  const forumCategories = await Promise.all(
    [
      { name: "General Discussion", slug: "general-discussion", description: "Open discussion on any topic", icon: "💬", color: "#6366f1", sortOrder: 1 },
      { name: "Announcements", slug: "announcements", description: "Official announcements from the administration", icon: "📢", color: "#ef4444", sortOrder: 2, minRoleToPost: "ADMIN" as const },
      { name: "Events", slug: "events", description: "Discuss upcoming and past events", icon: "🎉", color: "#f59e0b", sortOrder: 3 },
      { name: "Help & Support", slug: "help-support", description: "Ask questions and get help from the community", icon: "🤝", color: "#10b981", sortOrder: 4 },
      { name: "Off-Topic", slug: "off-topic", description: "Casual conversations and fun topics", icon: "☕", color: "#64748b", sortOrder: 5 },
      { name: "Sanstha Business", slug: "sanstha-business", description: "Internal matters and administrative discussions", icon: "🏢", color: "#0ea5e9", sortOrder: 6, minRoleToPost: "ADMIN" as const },
    ].map((c) => prisma.forumCategory.upsert({ where: { slug: c.slug }, update: {}, create: c }))
  );
  console.log(`✅ ${forumCategories.length} forum categories`);

  const forumTags = await Promise.all(
    [
      { name: "Question", slug: "question" },
      { name: "Discussion", slug: "discussion" },
      { name: "Suggestion", slug: "suggestion" },
      { name: "Bug Report", slug: "bug-report" },
      { name: "Request", slug: "request" },
    ].map((t) => prisma.forumTag.upsert({ where: { slug: t.slug }, update: {}, create: t }))
  );

  // ================================================================
  // 5. FORUM THREADS (50) + REPLIES (200+)
  // ================================================================

  const forumThreads = [];
  for (let i = 0; i < 50; i++) {
    const title = FORUM_TITLES[i];
    const slug = slugify(title) + `-${i + 1}`;
    const author = randomItem(users);
    const category = randomItem(forumCategories);
    const createdAt = randomDate(new Date("2024-08-01"), new Date());

    const thread = await prisma.forumThread.upsert({
      where: { slug },
      update: {},
      create: {
        title,
        slug,
        content: `<p>${title}</p><p>${LOREM}</p><p>Looking forward to hearing everyone's thoughts on this.</p>`,
        isPinned: i < 3,
        status: i < 40 ? "OPEN" : i < 45 ? "RESOLVED" : "CLOSED",
        views: randomInt(5, 300),
        authorId: author.id,
        categoryId: category.id,
        createdAt,
        updatedAt: randomDate(createdAt, new Date()),
      },
    });
    forumThreads.push(thread);
  }
  console.log(`✅ ${forumThreads.length} forum threads seeded`);

  // Add replies (200+)
  for (let i = 0; i < 220; i++) {
    const thread = randomItem(forumThreads);
    const author = randomItem(users);
    await prisma.forumReply.create({
      data: {
        content: randomItem([
          "I agree with this point. Let's discuss further at the next meeting.",
          "Has anyone else experienced this? I'd like to know more.",
          "Great suggestion! I'll support this initiative.",
          "We should definitely organize this. Count me in!",
          "Thanks for bringing this up. Very important topic.",
          "I have some concerns about this. Let me explain…",
          "This is exactly what our community needs right now.",
          "Let's form a small committee to work on this.",
          "I can volunteer for this project. Who else is interested?",
          "Very well articulated. I support this proposal.",
        ]),
        authorId: author.id,
        threadId: thread.id,
        isSolution: i % 25 === 0,
        createdAt: randomDate(new Date("2024-09-01"), new Date()),
      },
    });
  }
  console.log(`✅ 220+ forum replies seeded`);

  // ================================================================
  // 6. NEWS ARTICLES (50: 25 local + 25 external)
  // ================================================================

  const newsArticles = [];
  for (let i = 0; i < 25; i++) {
    const n = NEWS_LOCAL[i];
    const slug = slugify(n.title) + `-${i + 1}`;
    const article = await prisma.newsArticle.upsert({
      where: { slug },
      update: {},
      create: {
        title: n.title,
        slug,
        content: `<p>${n.title}</p><p>${LOREM}</p><p>This local news update is important for all community members.</p>`,
        excerpt: `${n.title} — stay updated on this local development.`,
        coverImage: `https://picsum.photos/seed/news-${slug}/800/400`,
        source: "LOCAL",
        sourceName: "Chandra Jyoti News",
        category: n.category,
        isFeatured: i < 3,
        views: randomInt(20, 400),
        publishedAt: randomDate(new Date("2024-09-01"), new Date()),
      },
    });
    newsArticles.push(article);
  }

  for (let i = 0; i < 25; i++) {
    const n = NEWS_EXTERNAL[i];
    const slug = slugify(n.title) + `-ext-${i + 1}`;
    const article = await prisma.newsArticle.upsert({
      where: { slug },
      update: {},
      create: {
        title: n.title,
        slug,
        excerpt: `${n.title} — external news coverage.`,
        source: "EXTERNAL",
        sourceUrl: `https://example.com/news/${slug}`,
        sourceName: randomItem(["The Sikkim Express", "Northeast Today", "The Hindu", "NDTV", "India Today"]),
        category: n.category,
        views: randomInt(10, 200),
        publishedAt: randomDate(new Date("2024-09-01"), new Date()),
      },
    });
    newsArticles.push(article);
  }
  console.log(`✅ ${newsArticles.length} news articles seeded`);

  // ================================================================
  // 7. FAMILY MEMBERS (50) — 3 CLANS with relationships
  // ================================================================
  // Clan structure:
  //   Sharma Clan (20 members) — 4 generations
  //   Rai Clan (15 members) — 3 generations
  //   Tamang Clan (15 members) — 3 generations

  const addedBy = users[0]; // Super admin adds all family members

  // --- SHARMA CLAN (Generation 1-4) ---
  // Gen 1: Grandparents
  const s_g1_m = await prisma.familyMember.create({
    data: { firstName: "Hari Prasad", lastName: "Sharma", familyClan: "Sharma", gender: "MALE", generation: 1, dateOfBirth: new Date("1940-03-15"), dateOfDeath: new Date("2010-08-20"), isAlive: false, isApproved: true, approvedAt: new Date(), addedByUserId: addedBy.id },
  });
  const s_g1_f = await prisma.familyMember.create({
    data: { firstName: "Sita Devi", lastName: "Sharma", familyClan: "Sharma", gender: "FEMALE", generation: 1, dateOfBirth: new Date("1945-07-22"), isAlive: true, isApproved: true, approvedAt: new Date(), spouseId: s_g1_m.id, addedByUserId: addedBy.id },
  });

  // Gen 2: 3 children of Hari & Sita
  const s_g2_c1 = await prisma.familyMember.create({
    data: { firstName: "Ram Bahadur", lastName: "Sharma", familyClan: "Sharma", gender: "MALE", generation: 2, dateOfBirth: new Date("1965-01-10"), isAlive: true, isApproved: true, approvedAt: new Date(), fatherId: s_g1_m.id, motherId: s_g1_f.id, addedByUserId: addedBy.id },
  });
  const s_g2_c1_spouse = await prisma.familyMember.create({
    data: { firstName: "Gita", lastName: "Sharma", familyClan: "Sharma", gender: "FEMALE", generation: 2, dateOfBirth: new Date("1968-04-05"), isAlive: true, isApproved: true, approvedAt: new Date(), spouseId: s_g2_c1.id, addedByUserId: addedBy.id },
  });
  const s_g2_c2 = await prisma.familyMember.create({
    data: { firstName: "Shyam", lastName: "Sharma", familyClan: "Sharma", gender: "MALE", generation: 2, dateOfBirth: new Date("1968-11-23"), isAlive: true, isApproved: true, approvedAt: new Date(), fatherId: s_g1_m.id, motherId: s_g1_f.id, addedByUserId: addedBy.id },
  });
  const s_g2_c2_spouse = await prisma.familyMember.create({
    data: { firstName: "Laxmi", lastName: "Sharma", familyClan: "Sharma", gender: "FEMALE", generation: 2, dateOfBirth: new Date("1970-06-12"), isAlive: true, isApproved: true, approvedAt: new Date(), spouseId: s_g2_c2.id, addedByUserId: addedBy.id },
  });
  const s_g2_c3 = await prisma.familyMember.create({
    data: { firstName: "Durga", lastName: "Sharma", familyClan: "Sharma", gender: "FEMALE", generation: 2, dateOfBirth: new Date("1972-02-28"), isAlive: true, isApproved: true, approvedAt: new Date(), fatherId: s_g1_m.id, motherId: s_g1_f.id, addedByUserId: addedBy.id },
  });

  // Gen 3: Children of Gen 2
  const s_g3_c1a = await prisma.familyMember.create({
    data: { firstName: "Rajesh", lastName: "Sharma", familyClan: "Sharma", gender: "MALE", generation: 3, dateOfBirth: new Date("1990-05-14"), isAlive: true, isApproved: true, approvedAt: new Date(), fatherId: s_g2_c1.id, motherId: s_g2_c1_spouse.id, addedByUserId: addedBy.id },
  });
  const s_g3_c1a_spouse = await prisma.familyMember.create({
    data: { firstName: "Sunita", lastName: "Sharma", familyClan: "Sharma", gender: "FEMALE", generation: 3, dateOfBirth: new Date("1993-08-10"), isAlive: true, isApproved: true, approvedAt: new Date(), spouseId: s_g3_c1a.id, addedByUserId: addedBy.id },
  });
  const s_g3_c1b = await prisma.familyMember.create({
    data: { firstName: "Bikash", lastName: "Sharma", familyClan: "Sharma", gender: "MALE", generation: 3, dateOfBirth: new Date("1993-12-01"), isAlive: true, isApproved: true, approvedAt: new Date(), fatherId: s_g2_c1.id, motherId: s_g2_c1_spouse.id, addedByUserId: addedBy.id },
  });
  const s_g3_c2a = await prisma.familyMember.create({
    data: { firstName: "Anita", lastName: "Sharma", familyClan: "Sharma", gender: "FEMALE", generation: 3, dateOfBirth: new Date("1992-09-17"), isAlive: true, isApproved: true, approvedAt: new Date(), fatherId: s_g2_c2.id, motherId: s_g2_c2_spouse.id, addedByUserId: addedBy.id },
  });
  const s_g3_c2b = await prisma.familyMember.create({
    data: { firstName: "Arun", lastName: "Sharma", familyClan: "Sharma", gender: "MALE", generation: 3, dateOfBirth: new Date("1995-03-25"), isAlive: true, isApproved: true, approvedAt: new Date(), fatherId: s_g2_c2.id, motherId: s_g2_c2_spouse.id, addedByUserId: addedBy.id },
  });

  // Gen 4: Children of Rajesh & Sunita
  const s_g4_c1 = await prisma.familyMember.create({
    data: { firstName: "Aayush", lastName: "Sharma", familyClan: "Sharma", gender: "MALE", generation: 4, dateOfBirth: new Date("2015-07-10"), isAlive: true, isApproved: true, approvedAt: new Date(), fatherId: s_g3_c1a.id, motherId: s_g3_c1a_spouse.id, addedByUserId: addedBy.id },
  });
  const s_g4_c2 = await prisma.familyMember.create({
    data: { firstName: "Aarushi", lastName: "Sharma", familyClan: "Sharma", gender: "FEMALE", generation: 4, dateOfBirth: new Date("2018-11-22"), isAlive: true, isApproved: true, approvedAt: new Date(), fatherId: s_g3_c1a.id, motherId: s_g3_c1a_spouse.id, addedByUserId: addedBy.id },
  });
  // More Sharma Gen 3-4
  for (let i = 0; i < 4; i++) {
    await prisma.familyMember.create({
      data: {
        firstName: ["Pratik", "Sneha", "Manish", "Pooja"][i],
        lastName: "Sharma",
        familyClan: "Sharma",
        gender: i % 2 === 0 ? "MALE" : "FEMALE",
        generation: i < 2 ? 3 : 4,
        dateOfBirth: new Date(`${i < 2 ? 1996 + i : 2016 + i}-${String(randomInt(1, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`),
        isAlive: true,
        isApproved: true,
        approvedAt: new Date(),
        ...(i < 2 ? { fatherId: s_g2_c2.id, motherId: s_g2_c2_spouse.id } : { fatherId: s_g3_c2b?.id }),
        addedByUserId: addedBy.id,
      },
    });
  }
  console.log(`✅ Sharma clan (20 members) seeded`);

  // --- RAI CLAN (15 members, 3 generations) ---
  const r_g1_m = await prisma.familyMember.create({
    data: { firstName: "Dhan Bahadur", lastName: "Rai", familyClan: "Rai", gender: "MALE", generation: 1, dateOfBirth: new Date("1948-05-20"), isAlive: true, isApproved: true, approvedAt: new Date(), addedByUserId: addedBy.id },
  });
  const r_g1_f = await prisma.familyMember.create({
    data: { firstName: "Maya",  lastName: "Rai", familyClan: "Rai", gender: "FEMALE", generation: 1, dateOfBirth: new Date("1952-09-10"), isAlive: true, isApproved: true, approvedAt: new Date(), spouseId: r_g1_m.id, addedByUserId: addedBy.id },
  });
  const raiGen2Names = [
    { first: "Suraj", g: "MALE" as const }, { first: "Binod", g: "MALE" as const },
    { first: "Kamala", g: "FEMALE" as const },
  ];
  const raiGen2: { id: string }[] = [];
  for (const n of raiGen2Names) {
    const m = await prisma.familyMember.create({
      data: { firstName: n.first, lastName: "Rai", familyClan: "Rai", gender: n.g, generation: 2, dateOfBirth: new Date(`${1972 + raiGen2.length * 3}-03-10`), isAlive: true, isApproved: true, approvedAt: new Date(), fatherId: r_g1_m.id, motherId: r_g1_f.id, addedByUserId: addedBy.id },
    });
    raiGen2.push(m);
  }
  // Spouses
  const raiSpouses: { id: string }[] = [];
  for (let i = 0; i < 2; i++) {
    const sp = await prisma.familyMember.create({
      data: { firstName: ["Sita", "Anita"][i], lastName: "Rai", familyClan: "Rai", gender: "FEMALE", generation: 2, dateOfBirth: new Date(`${1975 + i * 3}-07-15`), isAlive: true, isApproved: true, approvedAt: new Date(), spouseId: raiGen2[i].id, addedByUserId: addedBy.id },
    });
    raiSpouses.push(sp);
  }
  // Gen 3
  const raiGen3Names = ["Nisha", "Akash", "Deepa", "Roshan", "Puja", "Arjun"];
  for (let i = 0; i < 6; i++) {
    const parentIdx = i < 3 ? 0 : 1;
    await prisma.familyMember.create({
      data: { firstName: raiGen3Names[i], lastName: "Rai", familyClan: "Rai", gender: i % 2 === 0 ? "FEMALE" : "MALE", generation: 3, dateOfBirth: new Date(`${1997 + i}-${String(randomInt(1, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`), isAlive: true, isApproved: true, approvedAt: new Date(), fatherId: raiGen2[parentIdx].id, motherId: raiSpouses[parentIdx].id, addedByUserId: addedBy.id },
    });
  }
  console.log(`✅ Rai clan (15 members) seeded`);

  // --- TAMANG CLAN (15 members, 3 generations) ---
  const t_g1_m = await prisma.familyMember.create({
    data: { firstName: "Bir Bahadur", lastName: "Tamang", familyClan: "Tamang", gender: "MALE", generation: 1, dateOfBirth: new Date("1950-01-05"), isAlive: true, isApproved: true, approvedAt: new Date(), addedByUserId: addedBy.id },
  });
  const t_g1_f = await prisma.familyMember.create({
    data: { firstName: "Phul Maya", lastName: "Tamang", familyClan: "Tamang", gender: "FEMALE", generation: 1, dateOfBirth: new Date("1953-04-18"), isAlive: true, isApproved: true, approvedAt: new Date(), spouseId: t_g1_m.id, addedByUserId: addedBy.id },
  });
  const tamangGen2Names = [
    { first: "Kumar", g: "MALE" as const }, { first: "Deepak", g: "MALE" as const },
    { first: "Sarita", g: "FEMALE" as const },
  ];
  const tamangGen2: { id: string }[] = [];
  for (const n of tamangGen2Names) {
    const m = await prisma.familyMember.create({
      data: { firstName: n.first, lastName: "Tamang", familyClan: "Tamang", gender: n.g, generation: 2, dateOfBirth: new Date(`${1974 + tamangGen2.length * 3}-06-20`), isAlive: true, isApproved: true, approvedAt: new Date(), fatherId: t_g1_m.id, motherId: t_g1_f.id, addedByUserId: addedBy.id },
    });
    tamangGen2.push(m);
  }
  const tamangSpouses: { id: string }[] = [];
  for (let i = 0; i < 2; i++) {
    const sp = await prisma.familyMember.create({
      data: { firstName: ["Mina", "Rina"][i], lastName: "Tamang", familyClan: "Tamang", gender: "FEMALE", generation: 2, dateOfBirth: new Date(`${1977 + i * 3}-11-10`), isAlive: true, isApproved: true, approvedAt: new Date(), spouseId: tamangGen2[i].id, addedByUserId: addedBy.id },
    });
    tamangSpouses.push(sp);
  }
  const tamangGen3Names = ["Sangita", "Bishal", "Rupa", "Sunil", "Diya", "Anil"];
  for (let i = 0; i < 6; i++) {
    const parentIdx = i < 3 ? 0 : 1;
    await prisma.familyMember.create({
      data: { firstName: tamangGen3Names[i], lastName: "Tamang", familyClan: "Tamang", gender: i % 2 === 0 ? "FEMALE" : "MALE", generation: 3, dateOfBirth: new Date(`${1999 + i}-${String(randomInt(1, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`), isAlive: true, isApproved: true, approvedAt: new Date(), fatherId: tamangGen2[parentIdx].id, motherId: tamangSpouses[parentIdx].id, addedByUserId: addedBy.id },
    });
  }
  console.log(`✅ Tamang clan (15 members) seeded`);

  // ================================================================
  // 8. DONATIONS (20) + CAMPAIGNS (2)
  // ================================================================

  const campaign1 = await prisma.donationCampaign.upsert({
    where: { slug: "community-center-renovation" },
    update: {},
    create: {
      title: "Community Center Renovation",
      slug: "community-center-renovation",
      description: "Help us renovate the community center to serve our members better. The renovation will include a new hall, kitchen, and library section.",
      targetAmount: 500000,
      raisedAmount: 325000,
      donorCount: 12,
      status: "ACTIVE",
      deadline: new Date("2025-06-30"),
    },
  });
  const campaign2 = await prisma.donationCampaign.upsert({
    where: { slug: "scholarship-fund-2024" },
    update: {},
    create: {
      title: "Student Scholarship Fund 2024",
      slug: "scholarship-fund-2024",
      description: "Support our bright students with scholarships. Every contribution helps a child continue their education.",
      targetAmount: 200000,
      raisedAmount: 200000,
      donorCount: 8,
      status: "COMPLETED",
    },
  });
  console.log(`✅ 2 donation campaigns seeded`);

  for (let i = 0; i < 20; i++) {
    const donor = randomItem(users);
    await prisma.donation.create({
      data: {
        amount: randomItem([500, 1000, 2000, 5000, 10000, 15000, 25000]),
        currency: "INR",
        message: i % 3 === 0 ? "For the betterment of our community" : null,
        isAnonymous: i % 7 === 0,
        paymentMethod: randomItem(["UPI", "Bank Transfer", "Cash"]),
        transactionId: `TXN_SEED_${String(i + 1).padStart(3, "0")}`,
        status: i < 16 ? "COMPLETED" : i < 18 ? "PENDING" : "FAILED",
        donorId: donor.id,
        campaignId: i < 8 ? campaign1.id : i < 14 ? campaign2.id : null,
        createdAt: randomDate(new Date("2024-06-01"), new Date()),
      },
    });
  }
  console.log(`✅ 20 donations seeded`);

  // ================================================================
  // 9. FINES (5)
  // ================================================================

  for (let i = 0; i < 5; i++) {
    const user = users[5 + (i % 5)]; // assign to member users
    await prisma.fine.create({
      data: {
        amount: randomItem([200, 500, 1000]),
        reason: randomItem([
          "Late payment of annual membership fee",
          "Absence from mandatory community meeting",
          "Non-compliance with community garden rules",
          "Late submission of required documents",
          "Violation of community noise regulations",
        ]),
        dueDate: randomDate(new Date(), new Date("2025-04-30")),
        status: ["PENDING", "PAID", "OVERDUE", "PENDING", "DISPUTED"][i] as any,
        userId: user.id,
        assignedBy: users[0].clerkId, // super admin
        ...(i === 1 ? { paidAt: new Date() } : {}),
        createdAt: randomDate(new Date("2024-10-01"), new Date()),
      },
    });
  }
  console.log(`✅ 5 fines seeded`);

  // ================================================================
  // 10. TESTIMONIALS (10)
  // ================================================================

  const testimonialContents = [
    "This platform has brought our community closer than ever before. I can now stay connected with family members across the country.",
    "The family tree feature is amazing! I discovered relatives I never knew about.",
    "Thanks to the donation system, we funded our community center renovation in record time.",
    "The forum is a great place to discuss community matters. Very well organized.",
    "I love the news section — it keeps me updated on local happenings even when I'm away.",
    "The dashboard gives me a quick overview of everything happening in our community.",
    "Being able to create blog posts has helped preserve our cultural stories.",
    "The scholarship fund campaign helped my daughter continue her education. Thank you!",
    "This website represents a big step forward for our community's digital presence.",
    "The volunteer tracking through the forum has made organizing events so much easier.",
  ];

  for (let i = 0; i < 10; i++) {
    const author = randomItem(users);
    await prisma.testimonial.create({
      data: {
        content: testimonialContents[i],
        rating: randomInt(4, 5),
        isApproved: i < 7,
        isFeatured: i < 3,
        authorId: author.id,
        createdAt: randomDate(new Date("2024-09-01"), new Date()),
      },
    });
  }
  console.log(`✅ 10 testimonials seeded`);

  // ================================================================
  // 11. NOTIFICATIONS (20)
  // ================================================================

  const notifTypes = [
    { type: "COMMENT", title: "New comment", msg: "Someone commented on your blog post", link: "/blog" },
    { type: "REPLY", title: "New reply", msg: "Someone replied to your forum thread", link: "/forum" },
    { type: "FINE", title: "Fine assigned", msg: "A new fine has been assigned to you", link: "/payments/fines" },
    { type: "CAMPAIGN", title: "New campaign", msg: "A new donation campaign has been created", link: "/payments/campaigns" },
    { type: "APPROVAL", title: "Member approved", msg: "Your family member entry has been approved", link: "/family-tree" },
    { type: "ROLE_CHANGE", title: "Role updated", msg: "Your account role has been updated", link: "/profile" },
  ];

  for (let i = 0; i < 20; i++) {
    const user = randomItem(users);
    const notif = randomItem(notifTypes);
    await prisma.notification.create({
      data: {
        title: notif.title,
        message: notif.msg,
        type: notif.type,
        isRead: i < 12,
        link: notif.link,
        userId: user.id,
        createdAt: randomDate(new Date("2024-11-01"), new Date()),
      },
    });
  }
  console.log(`✅ 20 notifications seeded`);

  // ================================================================
  // 12. CONTACT SUBMISSIONS (5)
  // ================================================================

  for (let i = 0; i < 5; i++) {
    await prisma.contactSubmission.create({
      data: {
        name: `Visitor ${i + 1}`,
        email: `visitor${i + 1}@example.com`,
        subject: randomItem([
          "Inquiry about membership",
          "Question about upcoming events",
          "Request for community support",
          "Feedback on the website",
          "Partnership proposal",
        ]),
        message: `Hello, I would like to know more about ${randomItem(["joining the community", "upcoming events", "the scholarship program", "volunteering", "the family tree feature"])}. Please reply at your earliest convenience.`,
        status: i < 2 ? "RESOLVED" : i < 4 ? "IN_PROGRESS" : "NEW",
        createdAt: randomDate(new Date("2024-12-01"), new Date()),
      },
    });
  }
  console.log(`✅ 5 contact submissions seeded`);

  // ================================================================
  // 13. ANALYTICS EVENTS (50)
  // ================================================================

  const eventTypes = ["PAGE_VIEW", "BLOG_READ", "FORUM_VIEW", "DONATION", "LOGIN", "FAMILY_TREE_VIEW"];
  const pages = ["/home", "/blog", "/forum", "/news", "/family-tree", "/payments", "/profile"];
  const devices = ["desktop", "mobile", "tablet"];
  const browsers = ["Chrome", "Firefox", "Safari", "Edge"];

  for (let i = 0; i < 50; i++) {
    const user = randomItem(users);
    await prisma.analyticsEvent.create({
      data: {
        eventType: randomItem(eventTypes),
        pageUrl: randomItem(pages),
        sessionId: `session_seed_${randomInt(1, 20)}`,
        deviceType: randomItem(devices),
        browser: randomItem(browsers),
        duration: randomInt(5, 600),
        userId: user.id,
        createdAt: randomDate(new Date("2024-10-01"), new Date()),
      },
    });
  }
  console.log(`✅ 50 analytics events seeded`);

  // ================================================================
  // 14. REPORTS (6)
  // ================================================================

  // Need at least some threads/replies to report
  const someThreads = forumThreads.slice(0, 3);
  for (let i = 0; i < 6; i++) {
    await prisma.report.create({
      data: {
        reason: randomItem(["Inappropriate content", "Spam", "Off-topic", "Harassment", "Misinformation"]),
        description: "This content violates community guidelines and should be reviewed.",
        status: i < 3 ? "PENDING" : i < 5 ? "REVIEWED" : "RESOLVED",
        reporterId: randomItem(users).id,
        threadId: someThreads[i % 3].id,
        createdAt: randomDate(new Date("2024-12-01"), new Date()),
      },
    });
  }
  console.log(`✅ 6 reports seeded`);

  // ================================================================
  // 15. SITE SETTINGS (upsert, keep existing)
  // ================================================================

  await Promise.all(
    [
      { key: "site_title", value: "Chandra Jyoti Sanstha" },
      { key: "site_description", value: "A community platform for the Chandra Jyoti Sanstha, Dhanbari, Sikkim — connecting families, preserving heritage, and building community." },
      { key: "contact_email", value: "info@chandrajyoti.org" },
      { key: "contact_phone", value: "+91-XXXXXXXXXX" },
      { key: "address", value: "Dhanbari, Sikkim, India" },
      { key: "social_facebook", value: "https://facebook.com/chandrajyoti" },
      { key: "social_instagram", value: "https://instagram.com/chandrajyoti" },
      { key: "moderation_enabled", value: "true" },
    ].map((s) => prisma.siteSettings.upsert({ where: { key: s.key }, update: {}, create: s }))
  );
  console.log(`✅ Site settings seeded`);

  // ================================================================
  // SUMMARY
  // ================================================================

  console.log("\n" + "═".repeat(50));
  console.log("🎉 COMPREHENSIVE SEEDING COMPLETE!");
  console.log("═".repeat(50));
  console.log(`
📊 Summary:
  • Users:           10 (1 SUPER_ADMIN, 1 ADMIN, 2 MODERATOR, 6 MEMBER)
  • Blog Posts:       50 (42 published, 4 draft, 4 archived)
  • Blog Comments:    ~80
  • Blog Likes:       ~100
  • Forum Threads:    50 (40 open, 5 resolved, 5 closed)
  • Forum Replies:    220+
  • News Articles:    50 (25 local, 25 external)
  • Family Members:   50 (3 clans with relationships)
  • Donations:        20 (2 campaigns)
  • Fines:            5
  • Testimonials:     10
  • Notifications:    20
  • Contact Msgs:     5
  • Analytics Events: 50
  • Reports:          6

📌 Seed Users (for testing role-based dashboard):
  ┌────────────────────┬─────────────────────────────┬─────────────┐
  │ Name               │ Email                       │ Role        │
  ├────────────────────┼─────────────────────────────┼─────────────┤
  │ Rajesh Sharma      │ rajesh.sharma@example.com   │ SUPER_ADMIN │
  │ Anita Rai          │ anita.rai@example.com       │ ADMIN       │
  │ Kumar Tamang       │ kumar.tamang@example.com    │ MODERATOR   │
  │ Priya Gurung       │ priya.gurung@example.com    │ MODERATOR   │
  │ Bikash Sharma      │ bikash.sharma@example.com   │ MEMBER      │
  │ Sita Rai           │ sita.rai@example.com        │ MEMBER      │
  │ Deepak Tamang      │ deepak.tamang@example.com   │ MEMBER      │
  │ Meena Subba        │ meena.subba@example.com     │ MEMBER      │
  │ Rajan Chhetri      │ rajan.chhetri@example.com   │ MEMBER      │
  │ Nisha Limboo       │ nisha.limboo@example.com    │ MEMBER      │
  └────────────────────┴─────────────────────────────┴─────────────┘

  ⚠️  These are DB-only seed users with fake clerkIds.
      Your actual Clerk account remains untouched.
      To test role-based dashboards, change your DB user's role manually.
`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
