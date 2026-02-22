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
  fatherId: string | null;
  motherId: string | null;
  spouseId: string | null;
  fatherChildren: { id: string; firstName: string; lastName: string }[];
  motherChildren: { id: string; firstName: string; lastName: string }[];
  father: { id: string; firstName: string; lastName: string } | null;
  mother: { id: string; firstName: string; lastName: string } | null;
  spouse: { id: string; firstName: string; lastName: string } | null;
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
  isAlive: boolean;
  familyClan: string | null;
  generation: number | null;
  bio: string | null;
  fatherId: string | null;
  motherId: string | null;
  spouseId: string | null;
  spouseName: string | null;
  fatherName: string | null;
  motherName: string | null;
  childrenIds: string[];
  children?: TreeNode[];
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
