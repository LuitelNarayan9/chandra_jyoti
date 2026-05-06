import { getPendingFamilyApprovals } from "@/lib/actions/admin-family.actions";
import { AdminFamilyApprovals } from "@/components/admin/family-approvals";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = {
  title: "Family Tree Approvals — Admin",
  description: "Review and manage pending family tree submissions.",
};

export default async function AdminFamilyTreePage() {
  await requireAdmin();

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
