import { getPendingResidencyRequests } from "@/lib/actions/family-tree.actions";
import { ResidencyRequestsTable } from "@/components/admin/residency-requests-table";
import { requireAdmin } from "@/lib/auth/admin";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Residency Requests — Admin",
  description: "Review and manage pending village residency requests.",
};

export default async function AdminResidencyRequestsPage() {
  await requireAdmin();

  const pendingRequests = await getPendingResidencyRequests();

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Residency Requests
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve or reject pending village residency verification
          requests.
        </p>
      </div>

      <ResidencyRequestsTable requests={pendingRequests} />
    </div>
  );
}
