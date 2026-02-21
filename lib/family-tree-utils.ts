import type { FamilyTreeMember, TreeNode, TreeFilter } from "@/types/family-tree";

/**
 * Convert flat DB members → TreeNode array
 */
export function membersToTreeNodes(members: FamilyTreeMember[]): TreeNode[] {
  return members.map((m) => {
    // Collect children from both father and mother relations
    const childrenSet = new Set<string>();
    m.fatherChildren?.forEach((c) => childrenSet.add(c.id));
    m.motherChildren?.forEach((c) => childrenSet.add(c.id));

    return {
      id: m.id,
      name: `${m.firstName} ${m.lastName}`,
      firstName: m.firstName,
      lastName: m.lastName,
      gender: m.gender,
      photo: m.photo,
      birthYear: m.dateOfBirth ? new Date(m.dateOfBirth).getFullYear() : null,
      deathYear: m.dateOfDeath ? new Date(m.dateOfDeath).getFullYear() : null,
      isAlive: m.isAlive,
      familyClan: m.familyClan,
      generation: m.generation,
      bio: m.bio,
      fatherId: m.fatherId,
      motherId: m.motherId,
      spouseId: m.spouseId,
      spouseName: m.spouse
        ? `${m.spouse.firstName} ${m.spouse.lastName}`
        : null,
      fatherName: m.father
        ? `${m.father.firstName} ${m.father.lastName}`
        : null,
      motherName: m.mother
        ? `${m.mother.firstName} ${m.mother.lastName}`
        : null,
      childrenIds: Array.from(childrenSet),
    };
  });
}

/**
 * Build D3-compatible hierarchy roots from flat node list.
 * Root nodes = members whose fatherId is null (patrilineal default).
 * Each root becomes a tree with its descendants.
 */
export function buildHierarchyRoots(nodes: TreeNode[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  nodes.forEach((n) => nodeMap.set(n.id, { ...n, children: [] }));

  const roots: TreeNode[] = [];

  nodeMap.forEach((node) => {
    // Use father as primary parent link for tree hierarchy
    if (node.fatherId && nodeMap.has(node.fatherId)) {
      const parent = nodeMap.get(node.fatherId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    } else if (!node.fatherId) {
      // Root node (no father) — could be a patriarch or standalone
      roots.push(node);
    } else {
      // Father not in approved set — treat as root
      roots.push(node);
    }
  });

  return roots;
}

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
        if (
          filter.generation !== null &&
          n.generation !== filter.generation
        )
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
export function searchNodeIds(
  nodes: TreeNode[],
  query: string
): Set<string> {
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
