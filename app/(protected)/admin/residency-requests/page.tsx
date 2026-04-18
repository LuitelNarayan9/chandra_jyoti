import { getPendingResidencyRequests } from "@/lib/actions/family-tree.actions";
import { ResidencyRequestsTable } from "@/components/admin/residency-requests-table";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Residency Requests — Admin",
  description: "Review and manage pending village residency requests.",
};

export default async function AdminResidencyRequestsPage() {
  const { userId } = await auth();
  if (!userId) notFound();

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    notFound();
  }

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
