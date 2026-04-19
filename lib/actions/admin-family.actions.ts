"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    throw new Error("Admin privileges required");
  }
  
  return user.id;
}

export async function approveFamilyMember(memberId: string) {
  try {
    const adminId = await requireAdmin();

    await db.familyMember.update({
      where: { id: memberId },
      data: {
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: adminId,
      },
    });

    revalidatePath("/family-tree");
    revalidatePath("/admin/family-tree"); // Assuming an admin board exists or will
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectFamilyMember(memberId: string) {
  try {
    await requireAdmin();

    // Rejecting typically implies deleting the unapproved node, OR marking it as rejected.
    // Since we don't have a 'REJECTED' status, we will delete the pending node to clean up.
    await db.familyMember.delete({
      where: { id: memberId, isApproved: false },
    });

    revalidatePath("/admin/family-tree");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approveFamilyEdge(edgeId: string) {
  try {
    await requireAdmin();

    await db.familyEdge.update({
      where: { id: edgeId },
      data: { isApproved: true },
    });

    revalidatePath("/family-tree");
    revalidatePath("/admin/family-tree");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectFamilyEdge(edgeId: string) {
  try {
    await requireAdmin();

    await db.familyEdge.delete({
      where: { id: edgeId, isApproved: false },
    });

    revalidatePath("/admin/family-tree");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPendingFamilyApprovals() {
  try {
    await requireAdmin();

    const pendingNodes = await db.familyMember.findMany({
      where: { isApproved: false },
      include: { addedByUser: { select: { firstName: true, lastName: true } } },
    });

    const pendingEdges = await db.familyEdge.findMany({
      where: { isApproved: false },
      include: {
        fromNode: { select: { firstName: true, lastName: true } },
        toNode: { select: { firstName: true, lastName: true } },
        addedByUser: { select: { firstName: true, lastName: true } },
      },
    });

    return { success: true, pendingNodes, pendingEdges };
  } catch (error: any) {
    return { success: false, error: error.message, pendingNodes: [], pendingEdges: [] };
  }
}
