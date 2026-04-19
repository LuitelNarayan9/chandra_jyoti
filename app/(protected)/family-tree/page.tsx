import { Suspense } from "react";
import { ResidentVerification } from "@/components/family-tree/resident-verification";
import { FamilyTreeView } from "@/components/family-tree/family-tree-view";
import {
  getGlobalFamilyTree,
  getUniqueFamilyClans,
  getGenerationRange,
} from "@/lib/queries/family-tree.queries";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const metadata = {
  title: "Family Tree — Chandra Jyoti Sanstha",
  description:
    "Interactive family tree visualization of Tumin Dhanbari village families. Explore multi-generational lineage with search, filters, and zoom.",
};

async function FamilyTreeContent() {
  const { userId } = await auth();

  // Resolve Clerk ID → internal user, then find their tree node
  let currentUserNode: any = null;
  let userState = {
    isResident: false,
    isInTree: false,
    isAdmin: false,
    internalUserId: null as string | null,
    requestPending: false,
  };

  if (userId) {
    const internalUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        role: true,
        isResidentOfTuminDhanbari: true,
        residencyRequestPending: true,
      },
    });

    if (internalUser) {
      userState.internalUserId = internalUser.id;
      userState.isResident = internalUser.isResidentOfTuminDhanbari;
      userState.requestPending = internalUser.residencyRequestPending;
      userState.isAdmin =
        internalUser.role === "ADMIN" || internalUser.role === "SUPER_ADMIN";

      currentUserNode = await db.familyMember.findFirst({
        where: { linkedUserId: internalUser.id, isApproved: true },
      });

      userState.isInTree = !!currentUserNode;
    }
  }

  // ENFORCEMENT GATE: If not a resident and not an admin, block access and show verification UI
  if (!userState.isResident && !userState.isAdmin) {
    return (
      <ResidentVerification initiallyRequested={userState.requestPending} />
    );
  }

  // ONLY query the heavy tree data if they passed the gate
  const [{ nodes, edges }, clans, generationRange] = await Promise.all([
    getGlobalFamilyTree(),
    getUniqueFamilyClans(),
    getGenerationRange(),
  ]);

  return (
    <FamilyTreeView
      nodes={nodes as any[]}
      edges={edges as any[]}
      clans={clans}
      generationRange={generationRange}
      currentUserNode={currentUserNode}
      userState={userState}
    />
  );
}

function FamilyTreeSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Simulated header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2.5 w-32 mt-1" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-56 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>
      {/* Simulated filter bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border/30">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-lg" />
        ))}
      </div>
      {/* Simulated canvas */}
      <div className="flex-1 flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
    </div>
  );
}

export default async function FamilyTreePage() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <Suspense fallback={<FamilyTreeSkeleton />}>
        <FamilyTreeContent />
      </Suspense>
    </div>
  );
}
