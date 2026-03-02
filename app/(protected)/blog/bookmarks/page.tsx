import { notFound } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";
import { getUserBookmarks } from "@/lib/queries/blog.queries";
import { BookmarksClient } from "@/components/blog/bookmarks-client";

export const metadata = {
  title: "Bookmarks",
  description: "Your saved blog posts, ready to read anytime.",
};

export default async function BookmarksPage() {
  const user = await getCurrentDbUser();
  if (!user) notFound();

  const bookmarks = await getUserBookmarks(user.id);

  return (
    <div className="min-h-screen">
      <BookmarksClient bookmarks={bookmarks} />
    </div>
  );
}
