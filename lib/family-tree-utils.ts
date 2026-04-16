import type {
  FamilyTreeMember,
  TreeNode,
  TreeFilter,
} from "@/types/family-tree";

/**
 * Convert flat DB members → TreeNode array
 */
export function membersToTreeNodes(members: FamilyTreeMember[]): TreeNode[] {
  return members.map((m) => {
    return {
      id: m.id,
      name: `${m.firstName} ${m.lastName}`,
      firstName: m.firstName,
      lastName: m.lastName,
      gender: m.gender,
      photo: m.photo,
      birthYear: m.dateOfBirth ? new Date(m.dateOfBirth).getFullYear() : null,
      deathYear: m.dateOfDeath ? new Date(m.dateOfDeath).getFullYear() : null,
      dateOfBirth: m.dateOfBirth,
      dateOfDeath: m.dateOfDeath,
      isAlive: m.isAlive,
      familyClan: m.familyClan,
      generation: m.generation,
      bio: m.bio,
      maritalStatus: m.maritalStatus,
      profession: m.profession,
      bloodGroup: m.bloodGroup,
    };
  });
}

/**
 * Build D3-compatible hierarchy roots from flat node list.
/**
 * Filter nodes by active filters; returns IDs that MATCH the filter criteria.
 */
export function getMatchingNodeIds(
  nodes: TreeNode[],
  filter: TreeFilter
): Set<string> {
  return new Set(
    nodes
      .filter((n) => {
        if (filter.clan && n.familyClan !== filter.clan) return false;
        if (filter.generation !== null && n.generation !== filter.generation)
          return false;
        if (filter.gender && n.gender !== filter.gender) return false;
        if (!filter.showLiving && n.isAlive) return false;
        if (!filter.showDeceased && !n.isAlive) return false;
        return true;
      })
      .map((n) => n.id)
  );
}

/**
 * Search nodes by name; returns matching IDs.
 */
export function searchNodeIds(nodes: TreeNode[], query: string): Set<string> {
  if (!query.trim()) return new Set(nodes.map((n) => n.id));
  const q = query.toLowerCase();
  return new Set(
    nodes.filter((n) => n.name.toLowerCase().includes(q)).map((n) => n.id)
  );
}

/**
 * Get initials for avatar fallback.
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Color palette for gender/status.
 */
export const NODE_COLORS = {
  male: { fill: "#3b82f6", stroke: "#2563eb", bg: "#dbeafe", text: "#1e40af" },
  female: {
    fill: "#ec4899",
    stroke: "#db2777",
    bg: "#fce7f3",
    text: "#9d174d",
  },
  other: {
    fill: "#8b5cf6",
    stroke: "#7c3aed",
    bg: "#ede9fe",
    text: "#5b21b6",
  },
  deceased: {
    fill: "#6b7280",
    stroke: "#4b5563",
    bg: "#f3f4f6",
    text: "#374151",
  },
} as const;

export function getNodeColor(gender: string, isAlive: boolean) {
  if (!isAlive) return NODE_COLORS.deceased;
  switch (gender) {
    case "MALE":
      return NODE_COLORS.male;
    case "FEMALE":
      return NODE_COLORS.female;
    default:
      return NODE_COLORS.other;
  }
}
