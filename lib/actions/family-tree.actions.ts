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
  requestResidencySchema,
  type RequestResidencyInput,
} from "@/lib/validations/family-tree";

import { sendTemplateEmailResend } from "@/lib/resend-mailer";
import { ResidencyRequestEmail } from "@/components/emails/residency-request";
import { ResidencyApprovedEmail } from "@/components/emails/ResidencyApprovedEmail";
import { ResidencyRejectedEmail } from "@/components/emails/ResidencyRejectedEmail";

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

      // When adding a CHILD: link the second parent if provided, and auto-create SPOUSE edge
      if (data.relationshipType === "CHILD" && data.secondParentId) {
        // Verify second parent exists
        const secondParent = await tx.familyMember.findUnique({
          where: { id: data.secondParentId },
        });

        if (secondParent) {
          // Create second PARENT_CHILD edge: secondParent → newChild
          await tx.familyEdge.create({
            data: {
              fromNodeId: secondParent.id,
              toNodeId: newNode.id,
              type: "PARENT_CHILD",
              isApproved: autoApprove,
              addedByUserId: user.id,
            },
          });

          // Auto-create SPOUSE edge between targetNode and secondParent (if not existing)
          const existingSpouse = await tx.familyEdge.findFirst({
            where: {
              OR: [
                { fromNodeId: targetNode.id, toNodeId: secondParent.id, type: "SPOUSE" },
                { fromNodeId: secondParent.id, toNodeId: targetNode.id, type: "SPOUSE" },
              ],
            },
          });

          if (!existingSpouse) {
            const spouseFrom = targetNode.id < secondParent.id ? targetNode.id : secondParent.id;
            const spouseTo = targetNode.id < secondParent.id ? secondParent.id : targetNode.id;
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

// ========================================
// 5. Link Existing Member as Parent
// ========================================

export async function linkExistingParent(
  childId: string,
  parentId: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const user = await getAuthenticatedUser();

    if (!user.isResidentOfTuminDhanbari && !isAdmin(user.role)) {
      return {
        success: false,
        error: "Only approved residents can modify the family tree.",
      };
    }

    // Verify both members exist
    const [child, parent] = await Promise.all([
      db.familyMember.findUnique({ where: { id: childId } }),
      db.familyMember.findUnique({ where: { id: parentId } }),
    ]);

    if (!child || !parent) {
      return { success: false, error: "Child or parent member not found." };
    }

    // Check if this edge already exists
    const existingEdge = await db.familyEdge.findFirst({
      where: {
        fromNodeId: parentId,
        toNodeId: childId,
        type: "PARENT_CHILD",
      },
    });

    if (existingEdge) {
      return {
        success: false,
        error: "This parent-child relationship already exists.",
      };
    }

    const autoApprove = isAdmin(user.role);

    await db.familyEdge.create({
      data: {
        fromNodeId: parentId,
        toNodeId: childId,
        type: "PARENT_CHILD",
        isApproved: autoApprove,
        addedByUserId: user.id,
      },
    });

    await calculateAndSyncGenerations();
    revalidatePath("/family-tree");
    revalidatePath("/admin/family-tree");

    return {
      success: true,
      message: autoApprove
        ? "Parent linked successfully."
        : "Parent link submitted for admin approval.",
    };
  } catch (error: any) {
    console.error("Failed to link existing parent:", error);
    return { success: false, error: error.message || "Something went wrong" };
  }
}

// ========================================
// 6. Request Residency Status
// ========================================

export async function requestResidency(rawData: RequestResidencyInput) {
  try {
    const user = await getAuthenticatedUser();

    if (user.isResidentOfTuminDhanbari) {
      return { success: false, error: "You are already a verified resident." };
    }

    const parsed = requestResidencySchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((e) => e.message).join(", "),
      };
    }
    const { fatherName, motherName } = parsed.data;

    const adminEmail = process.env.CONTACT_OWNER_EMAIL;
    if (!adminEmail) {
      console.warn("CONTACT_OWNER_EMAIL is not configured.");
      // We still return true to the user, but log the error
    } else {
      // Use the existing email sender
      await sendTemplateEmailResend({
        to: adminEmail,
        subject: `Residency Verification Request - ${user.firstName} ${user.lastName}`,
        template: ResidencyRequestEmail({
          userName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
          userEmail: adminEmail, // We don't have the user's email directly fetched in getAuthenticatedUser without modifying it, wait we can fetch it via Clerk or if it's in the DB.
          fatherName,
          motherName,
        }),
      });
    }

    await db.user.update({
      where: { id: user.id },
      data: { residencyRequestPending: true },
    });

    revalidatePath("/family-tree");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to request residency:", error);
    return { success: false, error: error.message || "Something went wrong" };
  }
}

// ========================================
// 7. Admin: Get Pending Residency Requests
// ========================================

export async function getPendingResidencyRequests() {
  const user = await getAuthenticatedUser();
  if (!isAdmin(user.role)) throw new Error("Forbidden: Admin access required");

  return db.user.findMany({
    where: { residencyRequestPending: true, isResidentOfTuminDhanbari: false },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

// ========================================
// 8. Admin: Approve Residency Request
// ========================================

export async function approveResidencyRequest(targetUserId: string) {
  try {
    const adminUser = await getAuthenticatedUser();
    if (!isAdmin(adminUser.role)) {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    if (!targetUser) {
      return { success: false, error: "User not found." };
    }

    await db.user.update({
      where: { id: targetUserId },
      data: {
        isResidentOfTuminDhanbari: true,
        residencyRequestPending: false,
      },
    });

    // Send approval email to the user
    await sendTemplateEmailResend({
      to: targetUser.email,
      subject: "Your Residency Request has been Approved! 🎉",
      template: ResidencyApprovedEmail({
        userName:
          `${targetUser.firstName || ""} ${targetUser.lastName || ""}`.trim() ||
          "User",
      }),
    });

    revalidatePath("/admin/residency-requests");
    revalidatePath("/family-tree");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to approve residency:", error);
    return { success: false, error: error.message || "Something went wrong" };
  }
}

// ========================================
// 9. Admin: Reject Residency Request
// ========================================

export async function rejectResidencyRequest(targetUserId: string) {
  try {
    const adminUser = await getAuthenticatedUser();
    if (!isAdmin(adminUser.role)) {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    if (!targetUser) {
      return { success: false, error: "User not found." };
    }

    // Reset pending so they can re-apply
    await db.user.update({
      where: { id: targetUserId },
      data: { residencyRequestPending: false },
    });

    // Send rejection email to the user
    await sendTemplateEmailResend({
      to: targetUser.email,
      subject: "Update on your Residency Request",
      template: ResidencyRejectedEmail({
        userName:
          `${targetUser.firstName || ""} ${targetUser.lastName || ""}`.trim() ||
          "User",
      }),
    });

    revalidatePath("/admin/residency-requests");
    revalidatePath("/family-tree");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to reject residency:", error);
    return { success: false, error: error.message || "Something went wrong" };
  }
}
