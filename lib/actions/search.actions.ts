"use server";

import { searchForumThreads } from "@/lib/queries/forum.queries";

export async function searchForumThreadsAction(query: string, page: number = 1) {
  try {
    const { threads, pagination } = await searchForumThreads({ query, page, pageSize: 5 });
    return {
      success: true,
      data: { threads, totalCount: pagination.totalCount }
    };
  } catch (error) {
    console.error("[SEARCH_FORUM_THREADS_ACTION]", error);
    return {
      success: false,
      error: "Failed to search forum threads."
    };
  }
}
