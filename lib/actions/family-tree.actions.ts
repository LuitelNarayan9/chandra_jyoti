"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import type { EdgeType } from "@/lib/generated/prisma/client";
import {
  joinFamilyTreeSchema,
  addRelativeSchema,
  updateFamilyMemberSchema,
  type JoinFamilyTreeInput,
  type AddRelativeInput,
  type UpdateFamilyMemberInput,
} from "@/lib/validations/family-tree";

// ========================================
import { calculateAndSyncGenerations } from "./calculate-generations";
// Helper: Get authenticated internal user
// ========================================

async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      role: true,
      isResidentOfTuminDhanbari: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!user) throw new Error("User not found in internal database");
  return user;
}

function isAdmin(role: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

// ========================================
// 1. Join Family Tree — Self-Registration
// ========================================

export async function joinFamilyTree(rawData: JoinFamilyTreeInput) {
  try {
    const user = await getAuthenticatedUser();

    // Gate: must be an approved resident
    if (!user.isResidentOfTuminDhanbari && !isAdmin(user.role)) {
      return {
        success: false,
        error: "Only approved residents of Tumin Dhanbari can join the family tree.",
      };
    }

    // Gate: must not already be in the tree
    const existing = await db.familyMember.findFirst({
      where: { linkedUserId: user.id },
    });
    if (existing) {
      return {
        success: false,
        error: "You are already registered in the family tree.",
      };
    }

    // Validate input
    const parsed = joinFamilyTreeSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((e: { message: string }) => e.message).join(", "),
      };
    }
    const data = parsed.data;

    const autoApprove = isAdmin(user.role);

    const member = await db.familyMember.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        familyClan: data.familyClan,
        photo: data.photo || null,
        bio: data.bio,
        maritalStatus: data.maritalStatus || "SINGLE",
        bloodGroup: data.bloodGroup,
        profession: data.profession,
        isAlive: data.isAlive,
        linkedUserId: user.id,
        isApproved: autoApprove,
        approvedAt: autoApprove ? new Date() : null,
        approvedBy: autoApprove ? user.id : null,
        addedByUserId: user.id,
      },
    });

    await calculateAndSyncGenerations();
    revalidatePath("/family-tree");
    return {
      success: true,
      data: {
        id: member.id,
        isApproved: member.isApproved,
        message: autoApprove
          ? "You have been added to the family tree!"
          : "Your profile has been submitted for admin approval.",
      },
    };
  } catch (error: any) {
    console.error("Failed to join family tree:", error);
    return { success: false, error: error.message || "Something went wrong" };
  }
}

// ========================================
// 2. Add Relative — Node + Edge Creation
// ========================================

export async function addRelative(rawData: AddRelativeInput) {
  try {
    const user = await getAuthenticatedUser();

    // Validate input
    const parsed = addRelativeSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((e: { message: string }) => e.message).join(", "),
      };
    }
    const data = parsed.data;

    const autoApprove = isAdmin(user.role);

    // Fetch the target node
    const targetNode = await db.familyMember.findUnique({
      where: { id: data.relatedToNodeId },
    });
    if (!targetNode) {
      return { success: false, error: "Target family member not found." };
    }

    // BROTHER/SISTER — same generation as the target

    // For siblings, we need to find the target's parent to link the new node
    let parentNodeId: string | null = null;
    if (data.relationshipType === "BROTHER" || data.relationshipType === "SISTER") {
      const parentEdge = await db.familyEdge.findFirst({
        where: {
          toNodeId: targetNode.id,
          type: "PARENT_CHILD",
        },
        select: { fromNodeId: true },
      });
      if (!parentEdge) {
        return {
          success: false,
          error: `Cannot add a sibling — ${targetNode.firstName} has no parent in the tree yet. Please add a parent first.`,
        };
      }
      parentNodeId = parentEdge.fromNodeId;
    }

    // Transaction: create Node + Edge atomically
    const result = await db.$transaction(async (tx) => {
      const newNode = await tx.familyMember.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender,
          maritalStatus: data.maritalStatus || "SINGLE",
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          dateOfDeath: data.dateOfDeath ? new Date(data.dateOfDeath) : null,
          isAlive: data.isAlive,
          bloodGroup: data.bloodGroup,
          profession: data.profession,
          bio: data.bio,
          familyClan: data.familyClan || targetNode.familyClan,
          isApproved: autoApprove,
          approvedAt: autoApprove ? new Date() : null,
          approvedBy: autoApprove ? user.id : null,
          addedByUserId: user.id,
        },
      });

      // Determine edge direction
      let fromNodeId = targetNode.id;
      let toNodeId = newNode.id;
      let edgeType: EdgeType = "PARENT_CHILD";

      switch (data.relationshipType) {
        case "FATHER":
        case "MOTHER":
          fromNodeId = newNode.id;
          toNodeId = targetNode.id;
          edgeType = "PARENT_CHILD";
          break;
        case "CHILD":
          fromNodeId = targetNode.id;
          toNodeId = newNode.id;
          edgeType = "PARENT_CHILD";
          break;
        case "BROTHER":
        case "SISTER":
          // Link the new sibling as a child of the target's parent
          fromNodeId = parentNodeId!;
          toNodeId = newNode.id;
          edgeType = "PARENT_CHILD";
          break;
        case "SPOUSE":
          // Standardize direction (alphabetical ID order)
          if (targetNode.id < newNode.id) {
            fromNodeId = targetNode.id;
            toNodeId = newNode.id;
          } else {
            fromNodeId = newNode.id;
            toNodeId = targetNode.id;
          }
          edgeType = "SPOUSE";
          break;
      }

      const newEdge = await tx.familyEdge.create({
        data: {
          fromNodeId,
          toNodeId,
          type: edgeType,
          isApproved: autoApprove,
          order: data.order,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          notes: data.notes,
          addedByUserId: user.id,
        },
      });

      // Auto-create SPOUSE edge when adding Father/Mother and the other parent already exists
      if (data.relationshipType === "FATHER" || data.relationshipType === "MOTHER") {
        // Find if the child (targetNode) already has another parent
        const existingParentEdges = await tx.familyEdge.findMany({
          where: {
            toNodeId: targetNode.id,
            type: "PARENT_CHILD",
            fromNodeId: { not: newNode.id }, // exclude the parent we just added
          },
          select: { fromNodeId: true },
        });

        for (const parentEdge of existingParentEdges) {
          // Check if a SPOUSE edge already exists between these two parents
          const existingSpouse = await tx.familyEdge.findFirst({
            where: {
              OR: [
                { fromNodeId: newNode.id, toNodeId: parentEdge.fromNodeId, type: "SPOUSE" },
                { fromNodeId: parentEdge.fromNodeId, toNodeId: newNode.id, type: "SPOUSE" },
              ],
            },
          });

          if (!existingSpouse) {
            // Create SPOUSE edge (standardize direction by alphabetical ID)
            const spouseFrom = newNode.id < parentEdge.fromNodeId ? newNode.id : parentEdge.fromNodeId;
            const spouseTo = newNode.id < parentEdge.fromNodeId ? parentEdge.fromNodeId : newNode.id;
            await tx.familyEdge.create({
              data: {
                fromNodeId: spouseFrom,
                toNodeId: spouseTo,
                type: "SPOUSE",
                isApproved: autoApprove,
                addedByUserId: user.id,
              },
            });
          }
        }
      }

      return { newNode, newEdge };
    });

    await calculateAndSyncGenerations();
    revalidatePath("/family-tree");
    return {
      success: true,
      data: {
        nodeId: result.newNode.id,
        edgeId: result.newEdge.id,
        isApproved: autoApprove,
        message: autoApprove
          ? "Relative added to the family tree!"
          : "Relative submitted for admin approval.",
      },
    };
  } catch (error: any) {
    console.error("Failed to add relative:", error);
    return { success: false, error: error.message || "Something went wrong" };
  }
}

// ========================================
// 3. Update Family Member
// ========================================

export async function updateFamilyMember(rawData: UpdateFamilyMemberInput) {
  try {
    const user = await getAuthenticatedUser();

    const parsed = updateFamilyMemberSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((e: { message: string }) => e.message).join(", "),
      };
    }
    const { memberId, ...data } = parsed.data;

    // Fetch the member to check ownership
    const member = await db.familyMember.findUnique({
      where: { id: memberId },
    });
    if (!member) {
      return { success: false, error: "Family member not found." };
    }

    // Only allow edits by the person who added them, the linked user, or admins
    const isOwner =
      member.addedByUserId === user.id || member.linkedUserId === user.id;
    if (!isOwner && !isAdmin(user.role)) {
      return {
        success: false,
        error: "You can only edit members you added or your own profile.",
      };
    }

    const autoApprove = isAdmin(user.role);

    await db.familyMember.update({
      where: { id: memberId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.gender && { gender: data.gender }),
        ...(data.dateOfBirth !== undefined && {
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        }),
        ...(data.dateOfDeath !== undefined && {
          dateOfDeath: data.dateOfDeath ? new Date(data.dateOfDeath) : null,
        }),
        ...(data.familyClan !== undefined && { familyClan: data.familyClan }),
        ...(data.photo !== undefined && { photo: data.photo || null }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.maritalStatus && { maritalStatus: data.maritalStatus }),
        ...(data.bloodGroup !== undefined && { bloodGroup: data.bloodGroup }),
        ...(data.profession !== undefined && { profession: data.profession }),
        ...(data.isAlive !== undefined && { isAlive: data.isAlive }),
        // Non-admin edits re-enter approval queue
        ...(!autoApprove && { isApproved: false, approvedAt: null, approvedBy: null }),
      },
    });

    await calculateAndSyncGenerations();
    revalidatePath("/family-tree");
    return {
      success: true,
      message: autoApprove
        ? "Member updated successfully."
        : "Your changes have been submitted for admin approval.",
    };
  } catch (error: any) {
    console.error("Failed to update family member:", error);
    return { success: false, error: error.message || "Something went wrong" };
  }
}

// ========================================
// 4. Delete Family Member
// ========================================

export async function deleteFamilyMember(memberId: string) {
  try {
    const user = await getAuthenticatedUser();

    const member = await db.familyMember.findUnique({
      where: { id: memberId },
    });
    if (!member) {
      return { success: false, error: "Family member not found." };
    }

    // Only the person who added the node or admins can delete
    const isOwner = member.addedByUserId === user.id || member.linkedUserId === user.id;
    if (!isOwner && !isAdmin(user.role)) {
      return {
        success: false,
        error: "You can only delete members you added.",
      };
    }

    // Transaction: delete all edges first, then the node
    await db.$transaction(async (tx) => {
      await tx.familyEdge.deleteMany({
        where: {
          OR: [{ fromNodeId: memberId }, { toNodeId: memberId }],
        },
      });
      await tx.lifeEvent.deleteMany({
        where: { familyMemberId: memberId },
      });
      await tx.familyMember.delete({
        where: { id: memberId },
      });
    });

    await calculateAndSyncGenerations();
    revalidatePath("/family-tree");
    revalidatePath("/admin/family-tree");
    return { success: true, message: "Family member removed from the tree." };
  } catch (error: any) {
    console.error("Failed to delete family member:", error);
    return { success: false, error: error.message || "Something went wrong" };
  }
}
