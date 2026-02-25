/* ── Family Tree Types ── */

export type TreeLayout = "vertical" | "horizontal" | "radial";

export interface FamilyTreeMember {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  dateOfDeath: string | null;
  gender: "MALE" | "FEMALE" | "OTHER";
  photo: string | null;
  bio: string | null;
  familyClan: string | null;
  generation: number | null;
  isAlive: boolean;
  maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  profession: string | null;
  bloodGroup: string | null;
  isPlaceholder?: boolean;
}

export interface FamilyEdgeData {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: "PARENT_CHILD" | "SPOUSE" | "ADOPTION" | "DIVORCED_SPOUSE";
  isApproved: boolean;
  order: number | null;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
}

export interface TreeNode {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  photo: string | null;
  birthYear: number | null;
  deathYear: number | null;
  dateOfBirth: string | null;
  dateOfDeath: string | null;
  isAlive: boolean;
  familyClan: string | null;
  generation: number | null;
  bio: string | null;
  maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  profession: string | null;
  bloodGroup: string | null;
  isPlaceholder?: boolean;
}

export interface TreeLink {
  source: string;
  target: string;
  type: "parent-child" | "spouse";
}

export interface TreeFilter {
  clan: string | null;
  generation: number | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  showLiving: boolean;
  showDeceased: boolean;
  searchQuery: string;
}

export const defaultTreeFilter: TreeFilter = {
  clan: null,
  generation: null,
  gender: null,
  showLiving: true,
  showDeceased: true,
  searchQuery: "",
};
