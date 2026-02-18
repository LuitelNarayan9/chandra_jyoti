import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Blog Categories ──
  const blogCategories = await Promise.all(
    [
      {
        name: "Culture",
        slug: "culture",
        description: "Posts about traditions, rituals, and cultural practices",
        icon: "🏛️",
        color: "#8b5cf6",
        sortOrder: 1,
      },
      {
        name: "Events",
        slug: "events",
        description: "Upcoming and past community events",
        icon: "📅",
        color: "#f59e0b",
        sortOrder: 2,
      },
      {
        name: "Stories",
        slug: "stories",
        description: "Personal stories and narratives from our community",
        icon: "📖",
        color: "#ec4899",
        sortOrder: 3,
      },
      {
        name: "Development",
        slug: "development",
        description: "Infrastructure and community development updates",
        icon: "🏗️",
        color: "#10b981",
        sortOrder: 4,
      },
      {
        name: "Education",
        slug: "education",
        description: "Educational initiatives and scholarship updates",
        icon: "🎓",
        color: "#3b82f6",
        sortOrder: 5,
      },
      {
        name: "General",
        slug: "general",
        description: "General community posts and announcements",
        icon: "📝",
        color: "#6366f1",
        sortOrder: 6,
      },
    ].map((cat) =>
      prisma.blogCategory.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  );
  console.log(`✅ ${blogCategories.length} blog categories created`);

  // ── Blog Tags ──
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
    ].map((tag) =>
      prisma.blogTag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: tag,
      })
    )
  );
  console.log(`✅ ${blogTags.length} blog tags created`);

  // ── Forum Categories ──
  const forumCategories = await Promise.all(
    [
      {
        name: "General Discussion",
        slug: "general-discussion",
        description: "Open discussion on any topic",
        icon: "💬",
        color: "#6366f1",
        sortOrder: 1,
      },
      {
        name: "Announcements",
        slug: "announcements",
        description: "Official announcements from the administration",
        icon: "📢",
        color: "#ef4444",
        sortOrder: 2,
        minRoleToPost: "ADMIN" as const,
      },
      {
        name: "Events",
        slug: "events",
        description: "Discuss upcoming and past events",
        icon: "🎉",
        color: "#f59e0b",
        sortOrder: 3,
      },
      {
        name: "Help & Support",
        slug: "help-support",
        description: "Ask questions and get help from the community",
        icon: "🤝",
        color: "#10b981",
        sortOrder: 4,
      },
      {
        name: "Off-Topic",
        slug: "off-topic",
        description: "Casual conversations and fun topics",
        icon: "☕",
        color: "#64748b",
        sortOrder: 5,
      },
      {
        name: "Sanstha Business",
        slug: "sanstha-business",
        description: "Internal matters and administrative discussions",
        icon: "🏢",
        color: "#0ea5e9",
        sortOrder: 6,
        minRoleToPost: "ADMIN" as const,
      },
    ].map((cat) =>
      prisma.forumCategory.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  );
  console.log(`✅ ${forumCategories.length} forum categories created`);

  // ── Site Settings ──
  const siteSettings = await Promise.all(
    [
      { key: "site_title", value: "Chandra Jyoti Sanstha" },
      {
        key: "site_description",
        value:
          "A community platform for the Chandra Jyoti Sanstha, Dhanbari, Sikkim — connecting families, preserving heritage, and building community.",
      },
      { key: "contact_email", value: "info@chandrajyoti.org" },
      { key: "contact_phone", value: "+91-XXXXXXXXXX" },
      { key: "address", value: "Dhanbari, Sikkim, India" },
      { key: "social_facebook", value: "https://facebook.com/chandrajyoti" },
      { key: "social_instagram", value: "https://instagram.com/chandrajyoti" },
      { key: "moderation_enabled", value: "true" },
    ].map((setting) =>
      prisma.siteSettings.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      })
    )
  );
  console.log(`✅ ${siteSettings.length} site settings created`);

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
