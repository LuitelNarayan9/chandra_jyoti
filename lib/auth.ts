import "server-only";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Role } from "@/lib/generated/prisma/client";
import { ROLE_HIERARCHY, hasPermission } from "@/lib/roles";

// Re-export for convenience from server components
export { hasPermission, ROLE_HIERARCHY };

/**
 * Get current user from database (returns null if not authenticated)
 */
export async function getCurrentDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return db.user.findUnique({ where: { clerkId: userId } });
}

/**
 * Require minimum role — throws if user doesn't have sufficient permissions
 */
export async function requireRole(minimumRole: Role) {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("Unauthorized");
  if (ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[minimumRole]) {
    throw new Error("Insufficient permissions");
  }
  return user;
}
