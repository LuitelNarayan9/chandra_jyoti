/**
 * Role constants and permission utilities.
 * This module is safe to import from Client Components.
 * It does NOT import from Prisma, Clerk, or any server-only package.
 */

export type Role = "GUEST" | "MEMBER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";

export const ROLE_HIERARCHY: Record<Role, number> = {
  GUEST: 0,
  MEMBER: 1,
  MODERATOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

/**
 * Check if a user's role meets the required level.
 * Pure function safe for client components.
 */
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
