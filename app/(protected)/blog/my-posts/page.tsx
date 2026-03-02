import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentDbUser } from "@/lib/auth";
import { getMyPosts } from "@/lib/queries/blog.queries";
import { MyPostsClient } from "@/components/blog/my-posts-client";

export const metadata = {
  title: "My Posts",
  description:
    "Manage your blog posts — drafts, published, scheduled and archived.",
};

export default async function MyPostsPage() {
  const user = await getCurrentDbUser();
  if (!user) notFound();

  const posts = await getMyPosts(user.id);

  return (
    <div className="min-h-screen">
      <MyPostsClient posts={posts} />
    </div>
  );
}
