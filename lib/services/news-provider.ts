import "server-only";

import RSSParser from "rss-parser";
import type { NewsCategory } from "@/lib/generated/prisma/client";

// ─── Types ────────────────────────────────────────────────────

export interface ExternalArticle {
  title: string;
  excerpt: string;
  url: string;
  imageUrl: string | null;
  sourceName: string;
  category: NewsCategory;
  publishedAt: Date;
}

// ─── RSS Feed Configuration ──────────────────────────────────

const RSS_FEEDS: Record<string, { url: string; sourceName: string; category: NewsCategory }[]> = {
  STATE: [
    {
      url: "https://news.google.com/rss/search?q=Sikkim&hl=en-IN&gl=IN&ceid=IN:en",
      sourceName: "Google News Sikkim",
      category: "STATE",
    },
  ],
  NATIONAL: [
    {
      url: "https://feeds.feedburner.com/ndtvnews-top-stories",
      sourceName: "NDTV",
      category: "NATIONAL",
    },
  ],
  INTERNATIONAL: [
    {
      url: "http://feeds.bbci.co.uk/news/world/rss.xml",
      sourceName: "BBC World",
      category: "INTERNATIONAL",
    },
    {
      url: "https://www.aljazeera.com/xml/rss/all.xml",
      sourceName: "Al Jazeera",
      category: "INTERNATIONAL",
    },
  ],
};

// ─── RSS Provider ─────────────────────────────────────────────

const rssParser = new RSSParser({
  timeout: 10_000,
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
    ],
  },
});

export async function fetchRSSArticles(
  category: NewsCategory,
  limit = 10
): Promise<ExternalArticle[]> {
  const feeds = RSS_FEEDS[category];
  if (!feeds || feeds.length === 0) return [];

  const results: ExternalArticle[] = [];

  for (const feed of feeds) {
    try {
      const parsed = await rssParser.parseURL(feed.url);
      const itemsToProcess = parsed.items.slice(0, limit);

      const processedItems = await Promise.all(
        itemsToProcess.map(async (item) => {
          if (!item.title || !item.link) return null;

          // Extract image from various RSS fields
          let imageUrl = extractImage(item as unknown as Record<string, unknown>);

          // Fallback to fetching OpenGraph image from the article URL
          if (!imageUrl) {
            imageUrl = await fetchOgImage(item.link);
          }

          return {
            title: item.title.trim(),
            excerpt: cleanExcerpt(item.contentSnippet || item.content || ""),
            url: item.link,
            imageUrl,
            sourceName: feed.sourceName,
            category: feed.category,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          };
        })
      );

      for (const item of processedItems) {
        if (item) results.push(item);
      }
    } catch (error) {
      console.error(`[RSS] Failed to fetch ${feed.sourceName}:`, error);
      // Continue to next feed on failure
    }
  }

  return results;
}

// ─── GNews API Provider ───────────────────────────────────────

interface GNewsArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  source: { name: string };
  publishedAt: string;
}

interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

export async function fetchGNewsArticles(
  query: string,
  category: NewsCategory,
  limit = 10
): Promise<ExternalArticle[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.warn("[GNews] GNEWS_API_KEY not set, skipping GNews fetch.");
    return [];
  }

  try {
    const url = new URL("https://gnews.io/api/v4/search");
    url.searchParams.set("q", query);
    url.searchParams.set("country", "in");
    url.searchParams.set("lang", "en");
    url.searchParams.set("max", String(Math.min(limit, 10)));
    url.searchParams.set("token", apiKey);

    const res = await fetch(url.toString(), {
      next: { revalidate: 0 }, // No caching for cron
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[GNews] API error ${res.status}:`, text);
      return [];
    }

    const data: GNewsResponse = await res.json();

    return data.articles.map((article) => ({
      title: article.title.trim(),
      excerpt: article.description?.trim() || "",
      url: article.url,
      imageUrl: article.image || null,
      sourceName: article.source.name,
      category,
      publishedAt: new Date(article.publishedAt),
    }));
  } catch (error) {
    console.error("[GNews] Fetch error:", error);
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return null;
    
    const html = await res.text();
    const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) 
               || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

function extractImage(item: Record<string, unknown>): string | null {
  // Try media:content
  const mediaContent = item.mediaContent as
    | { $?: { url?: string } }
    | undefined;
  if (mediaContent?.$?.url) return mediaContent.$.url;

  // Try media:thumbnail
  const mediaThumbnail = item.mediaThumbnail as
    | { $?: { url?: string } }
    | undefined;
  if (mediaThumbnail?.$?.url) return mediaThumbnail.$.url;

  // Try enclosure
  const enclosure = item.enclosure as
    | { url?: string; type?: string }
    | undefined;
  if (enclosure?.url && enclosure.type?.startsWith("image/"))
    return enclosure.url;

  // Try to extract from content
  const content = (item.content || item["content:encoded"] || "") as string;
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
  if (imgMatch?.[1]) return imgMatch[1];

  return null;
}

function cleanExcerpt(text: string): string {
  return text
    .replace(/<[^>]*>/g, "") // Strip HTML
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
    .substring(0, 500);
}
