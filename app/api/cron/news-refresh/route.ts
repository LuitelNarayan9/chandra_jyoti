import { NextResponse } from "next/server";
import { refreshExternalNews } from "@/lib/services/news-aggregator";
import { revalidatePath } from "next/cache";

/**
 * Cron job to refresh external news articles.
 *
 * Schedule: Every 3 hours for RSS, GNews runs only on every 3rd invocation (~8-9 hours)
 * vercel.json: { "path": "/api/cron/news-refresh", "schedule": "0 *\/3 * * *" }
 *
 * GNews budget: ~3 req/day (every 8h × STATE only) — well within 100 req/day limit
 */
export async function GET(req: Request) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Determine whether to include GNews in this run
    // GNews runs every ~8 hours (every 3rd cron invocation at 3h intervals)
    const currentHour = new Date().getUTCHours();
    const includeGNews = currentHour % 8 === 0; // Runs at 0:00, 8:00, 16:00 UTC

    console.log(
      `[News Cron] Starting refresh — includeGNews: ${includeGNews}, hour: ${currentHour}`
    );

    const result = await refreshExternalNews(includeGNews);

    // Revalidate news pages
    revalidatePath("/news");
    revalidatePath("/home");

    console.log(
      `[News Cron] Complete — ${result.articlesProcessed} articles processed from ${result.sources.join(", ")}`
    );

    return NextResponse.json({
      success: result.success,
      articlesProcessed: result.articlesProcessed,
      sources: result.sources,
      errors: result.errors,
      includeGNews,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[News Cron] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
