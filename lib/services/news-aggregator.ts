import "server-only";

import { db } from "@/lib/db";
import { fetchRSSArticles, fetchGNewsArticles } from "./news-provider";
import type { NewsCategory } from "@/lib/generated/prisma/client";

// ─── Types ────────────────────────────────────────────────────

interface RefreshResult {
  success: boolean;
  articlesProcessed: number;
  sources: string[];
  errors: string[];
}

// ─── Slug generator ───────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

function generateArticleSlug(title: string, sourceName: string): string {
  const base = slugify(title);
  const sourceSlug = slugify(sourceName).substring(0, 20);
  // Include source in slug for uniqueness across providers
  return `${base}-${sourceSlug}`.substring(0, 120);
}

// ─── Main Aggregator ──────────────────────────────────────────

export async function refreshExternalNews(
  includeGNews = true
): Promise<RefreshResult> {
  const result: RefreshResult = {
    success: true,
    articlesProcessed: 0,
    sources: [],
    errors: [],
  };

  const categories: NewsCategory[] = ["STATE", "NATIONAL", "INTERNATIONAL"];

  for (const category of categories) {
    try {
      // Fetch RSS articles for all categories
      const rssArticles = await fetchRSSArticles(category, 10);
      if (rssArticles.length > 0) {
        result.sources.push(
          ...new Set(rssArticles.map((a) => `${a.sourceName} (RSS)`))
        );
      }

      // Fetch GNews for all categories (when allowed)
      let gnewsArticles: Awaited<ReturnType<typeof fetchGNewsArticles>> = [];
      if (includeGNews) {
        let query = "";
        if (category === "STATE") query = "Sikkim";
        else if (category === "NATIONAL") query = "India";
        else if (category === "INTERNATIONAL") query = "World";

        gnewsArticles = await fetchGNewsArticles(query, category, 10);
        if (gnewsArticles.length > 0) {
          result.sources.push(`GNews API (${category})`);
        }
      }

      // Merge and deduplicate
      const allArticles = [...rssArticles, ...gnewsArticles];
      const deduped = deduplicateArticles(allArticles);

      // Upsert into database
      for (const article of deduped) {
        try {
          const slug = generateArticleSlug(article.title, article.sourceName);

          await db.newsArticle.upsert({
            where: { slug },
            create: {
              title: article.title,
              slug,
              content: null,
              excerpt: article.excerpt || null,
              coverImage: article.imageUrl || null,
              source: "EXTERNAL",
              sourceUrl: article.url,
              sourceName: article.sourceName,
              category: article.category,
              publishedAt: article.publishedAt,
            },
            update: {
              // Only update excerpt/image if they were missing
              excerpt: article.excerpt || undefined,
              coverImage: article.imageUrl || undefined,
            },
          });

          result.articlesProcessed++;
        } catch (err) {
          // Skip individual article errors (e.g. constraint violations)
          console.error(`[Aggregator] Failed to upsert "${article.title}":`, err);
        }
      }
    } catch (err) {
      const msg = `Failed to refresh ${category}: ${err instanceof Error ? err.message : "Unknown"}`;
      result.errors.push(msg);
      console.error(`[Aggregator] ${msg}`);
    }
  }

  // Cleanup: remove external articles older than 30 days
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await db.newsArticle.deleteMany({
      where: {
        source: "EXTERNAL",
        publishedAt: { lt: thirtyDaysAgo },
      },
    });
  } catch (err) {
    console.error("[Aggregator] Cleanup error:", err);
  }

  result.success = result.errors.length === 0;

  // Deduplicate source names
  result.sources = [...new Set(result.sources)];

  return result;
}

// ─── Deduplication ────────────────────────────────────────────

function deduplicateArticles<
  T extends { title: string; url: string }
>(articles: T[]): T[] {
  const seen = new Map<string, T>();

  for (const article of articles) {
    // Key by URL (most reliable dedup)
    if (!seen.has(article.url)) {
      // Also check title similarity
      const normalizedTitle = article.title.toLowerCase().trim();
      const isDuplicate = Array.from(seen.values()).some(
        (existing) =>
          similarity(existing.title.toLowerCase().trim(), normalizedTitle) > 0.85
      );

      if (!isDuplicate) {
        seen.set(article.url, article);
      }
    }
  }

  return Array.from(seen.values());
}

// Simple Jaccard-like similarity for dedup
function similarity(a: string, b: string): number {
  const wordsA = new Set(a.split(/\s+/));
  const wordsB = new Set(b.split(/\s+/));

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }

  const union = wordsA.size + wordsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
