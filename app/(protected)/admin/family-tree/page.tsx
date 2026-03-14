import { getPendingFamilyApprovals } from "@/lib/actions/admin-family.actions";
import { AdminFamilyApprovals } from "@/components/admin/family-approvals";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const metadata = {
  title: "Family Tree Approvals — Admin",
  description: "Review and manage pending family tree submissions.",
};

export default async function AdminFamilyTreePage() {
  const { userId } = await auth();
  if (!userId) notFound();

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    notFound();
  }

  const result = await getPendingFamilyApprovals();

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Family Tree Approvals
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review pending member registrations and relationship requests.
        </p>
      </div>

      {!result.success ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm">
          {result.error || "Failed to load pending approvals."}
        </div>
      ) : (
        <AdminFamilyApprovals
          pendingNodes={result.pendingNodes}
          pendingEdges={result.pendingEdges}
        />
      )}
    </div>
  );
}
