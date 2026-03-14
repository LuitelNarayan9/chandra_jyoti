import { Metadata } from "next";
import { getAdminPollsForAdmin } from "@/lib/queries/forum.queries";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { ManagePollsDashboard } from "@/components/forum/manage-polls-dashboard";

export const metadata: Metadata = {
  title: "Manage Polls | Admin",
  description: "Manage global admin polls.",
};

export default async function ManagePollsPage() {
  await requireRole("ADMIN"); // Throws and redirects if not auth'd

  const [polls, totalUsers] = await Promise.all([
    getAdminPollsForAdmin(),
    db.user.count(),
  ]);

  return (
    <div className="flex-1 overflow-x-hidden pt-4 pb-20 lg:pt-8 bg-neutral-50/50 dark:bg-[#111113]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <PageHeader
          title="Manage Polls"
          description="Create, monitor, and manage global community polls."
        />
        <ManagePollsDashboard initialPolls={polls} totalUsers={totalUsers} />
      </div>
    </div>
  );
}
