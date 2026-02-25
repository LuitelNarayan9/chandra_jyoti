import type { TreeNode, FamilyEdgeData } from "@/types/family-tree";

// We use an internal type for path traversal
type PathEdge = {
  nodeId: string;
  edgeType: "PARENT" | "CHILD" | "SPOUSE" | "SIBLING";
  gender?: string | null; // gender of the node we traversed TO
};

/**
 * Calculates a detailed English relationship title (up to 7 generations) 
 * given a graph of nodes, edges, and the path from a source user to a target.
 */
export function calculateKinship(
  sourceId: string,
  targetId: string,
  nodes: Map<string, TreeNode>,
  edges: FamilyEdgeData[]
): string {
  if (sourceId === targetId) return "You";
  
  const targetNode = nodes.get(targetId);
  if (!targetNode) return "Relative";
  
  // 1. Build adjacency list for BFS
  // - PARENT_CHILD: fromNode (parent) -> toNode (child)
  //   - child -> parent = "PARENT" direction
  //   - parent -> child = "CHILD" direction
  // - SPOUSE: bidirectional "SPOUSE"
  //
  // IMPORTANT: We also derive PARENT edges for spouse-of-parent situations.
  // If A->B is PARENT_CHILD and A<->C is SPOUSE, then C is also a parent of B.
  // Without this, BFS finds B->A(PARENT)->C(SPOUSE) = "Step-Mother" instead of "Mother".

  const adj = new Map<string, { to: string; type: PathEdge["edgeType"]; gender: string | null }[]>();

  for (const node of nodes.values()) {
    adj.set(node.id, []);
  }

  // Collect direct parent-child edges and spouse edges for deriving relationships
  const parentChildEdges: { parentId: string; childId: string }[] = [];
  const spouseEdges: { a: string; b: string }[] = [];

  for (const edge of edges) {
    if (edge.type === "PARENT_CHILD" || edge.type === "ADOPTION") {
      const parent = nodes.get(edge.fromNodeId);
      const child = nodes.get(edge.toNodeId);
      if (parent && child) {
        adj.get(child.id)?.push({ to: parent.id, type: "PARENT", gender: parent.gender });
        adj.get(parent.id)?.push({ to: child.id, type: "CHILD", gender: child.gender });
        parentChildEdges.push({ parentId: parent.id, childId: child.id });
      }
    } else if (edge.type === "SPOUSE" || edge.type === "DIVORCED_SPOUSE") {
      const spouse1 = nodes.get(edge.fromNodeId);
      const spouse2 = nodes.get(edge.toNodeId);
      if (spouse1 && spouse2) {
        adj.get(spouse1.id)?.push({ to: spouse2.id, type: "SPOUSE", gender: spouse2.gender });
        adj.get(spouse2.id)?.push({ to: spouse1.id, type: "SPOUSE", gender: spouse1.gender });
        spouseEdges.push({ a: spouse1.id, b: spouse2.id });
      }
    }
  }

  // Derive PARENT edges: if parentA has child C, and parentA's spouse is parentB,
  // then parentB is also a parent of C (and C is also a child of parentB).
  // Only add if the edge doesn't already exist.
  const existingParentChildSet = new Set(parentChildEdges.map(e => `${e.parentId}->${e.childId}`));

  for (const pcEdge of parentChildEdges) {
    for (const spEdge of spouseEdges) {
      let otherParentId: string | null = null;
      if (spEdge.a === pcEdge.parentId) otherParentId = spEdge.b;
      else if (spEdge.b === pcEdge.parentId) otherParentId = spEdge.a;

      if (otherParentId && !existingParentChildSet.has(`${otherParentId}->${pcEdge.childId}`)) {
        const otherParent = nodes.get(otherParentId);
        const child = nodes.get(pcEdge.childId);
        if (otherParent && child) {
          adj.get(pcEdge.childId)?.push({ to: otherParentId, type: "PARENT", gender: otherParent.gender });
          adj.get(otherParentId)?.push({ to: pcEdge.childId, type: "CHILD", gender: child.gender });
          existingParentChildSet.add(`${otherParentId}->${pcEdge.childId}`);
        }
      }
    }
  }

  // 2. BFS to find the shortest path from source to target
  // We queue the path taken so far.
  const queue: { currentId: string; path: PathEdge[] }[] = [];
  queue.push({ currentId: sourceId, path: [] });
  const visited = new Set<string>();
  visited.add(sourceId);

  let foundPath: PathEdge[] | null = null;

  while (queue.length > 0) {
    const { currentId, path } = queue.shift()!;
    
    if (currentId === targetId) {
      foundPath = path;
      break; 
    }

    const neighbors = adj.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.to)) {
        visited.add(neighbor.to);
        queue.push({
          currentId: neighbor.to,
          path: [...path, { nodeId: neighbor.to, edgeType: neighbor.type, gender: neighbor.gender }],
        });
      }
    }
  }

  if (!foundPath) return "Relative";

  // 3. Translate the path array into an English degree.
  return translatePathToTitle(foundPath, targetNode.gender);
}

function translatePathToTitle(path: PathEdge[], targetGender: string | null | undefined): string {
  // Extract just the sequence of traversal moves
  const moves = path.map(p => p.edgeType);
  const genders = path.map(p => p.gender);
  
  const isTargetMale = targetGender === "MALE";
  const isTargetFemale = targetGender === "FEMALE";
  
  const upCount = moves.filter(m => m === "PARENT").length;
  const downCount = moves.filter(m => m === "CHILD").length;
  const spouseCount = moves.filter(m => m === "SPOUSE").length;

  // Direct sequence checks
  const pathStr = moves.join("-");

  // Immediate Spouses
  if (pathStr === "SPOUSE") return isTargetMale ? "Husband" : isTargetFemale ? "Wife" : "Spouse";
  if (pathStr === "CHILD-SPOUSE") return isTargetMale ? "Son-In-Law" : isTargetFemale ? "Daughter-In-Law" : "Child-In-Law";
  if (pathStr === "PARENT-SPOUSE") return isTargetMale ? "Step-Father" : isTargetFemale ? "Step-Mother" : "Step-Parent";
  if (pathStr === "SPOUSE-PARENT") return isTargetMale ? "Father-In-Law" : isTargetFemale ? "Mother-In-Law" : "Parent-In-Law";

  // Pure Ancestors
  if (downCount === 0 && spouseCount === 0) {
    if (upCount === 0) return "You";
    
    // Determine Paternal / Maternal
    // The first step UP defines the lineage side.
    const firstParentGender = genders[0];
    let lineagePrefix = "";
    if (upCount > 1) {
      if (firstParentGender === "MALE") lineagePrefix = "Paternal ";
      else if (firstParentGender === "FEMALE") lineagePrefix = "Maternal ";
    }

    if (upCount === 1) return isTargetMale ? "Father" : isTargetFemale ? "Mother" : "Parent";
    if (upCount === 2) return lineagePrefix + (isTargetMale ? "Grandfather" : isTargetFemale ? "Grandmother" : "Grandparent");
    if (upCount === 3) return lineagePrefix + (isTargetMale ? "Great-Grandfather" : isTargetFemale ? "Great-Grandmother" : "Great-Grandparent");
    
    // For 4 to 7 generations and beyond:
    let greats = "";
    for (let i = 0; i < upCount - 2; i++) {
        if (i > 0) greats += "-";
        greats += "Great";
    }
    return lineagePrefix + greats + "-" + (isTargetMale ? "Grandfather" : isTargetFemale ? "Grandmother" : "Grandparent");
  }

  // Pure Descendants
  if (upCount === 0 && spouseCount === 0) {
    if (downCount === 1) return isTargetMale ? "Son" : isTargetFemale ? "Daughter" : "Child";
    if (downCount === 2) return isTargetMale ? "Grandson" : isTargetFemale ? "Granddaughter" : "Grandchild";
    if (downCount === 3) return isTargetMale ? "Great-Grandson" : isTargetFemale ? "Great-Granddaughter" : "Great-Grandchild";
    let greats = "";
    for (let i = 0; i < downCount - 2; i++) {
        if (i > 0) greats += "-";
        greats += "Great";
    }
    return greats + "-" + (isTargetMale ? "Grandson" : isTargetFemale ? "Granddaughter" : "Grandchild");
  }

  // Siblings & Nieces/Nephews & Uncles/Aunts (Up then Down)
  // Usually goes UP to a common ancestor, then DOWN
  if (spouseCount === 0) {
    // Determine side (first UP determines lineage)
    const firstParentGender = moves[0] === "PARENT" ? genders[0] : null;
    let lineagePrefix = "";
    if (upCount >= 2 && firstParentGender) {
      if (firstParentGender === "MALE") lineagePrefix = "Paternal ";
      else if (firstParentGender === "FEMALE") lineagePrefix = "Maternal ";
    }

    // Exact Sibling
    if (upCount === 1 && downCount === 1) return isTargetMale ? "Brother" : isTargetFemale ? "Sister" : "Sibling";
    
    // Aunt / Uncle
    if (upCount === 2 && downCount === 1) return lineagePrefix + (isTargetMale ? "Uncle" : isTargetFemale ? "Aunt" : "Uncle/Aunt");
    if (upCount === 3 && downCount === 1) return lineagePrefix + (isTargetMale ? "Great-Uncle" : isTargetFemale ? "Great-Aunt" : "Great-Uncle/Aunt");
    if (upCount > 3 && downCount === 1) {
        let greats = "";
        for (let i = 0; i < upCount - 2; i++) greats += (i > 0 ? "-" : "") + "Great";
        return lineagePrefix + greats + "-" + (isTargetMale ? "Uncle" : isTargetFemale ? "Aunt" : "Uncle/Aunt");
    }

    // Niece / Nephew
    if (upCount === 1 && downCount === 2) return isTargetMale ? "Nephew" : isTargetFemale ? "Niece" : "Nephew/Niece";
    if (upCount === 1 && downCount === 3) return isTargetMale ? "Great-Nephew" : isTargetFemale ? "Great-Niece" : "Great-Nephew/Niece";
    if (upCount === 1 && downCount > 3) {
        let greats = "";
        for (let i = 0; i < downCount - 2; i++) greats += (i > 0 ? "-" : "") + "Great";
        return greats + "-" + (isTargetMale ? "Nephew" : isTargetFemale ? "Niece" : "Nephew/Niece");
    }

    // Cousins
    if (upCount >= 2 && downCount >= 2) {
      // Degree of cousin is min(up, down) - 1
      // Removed is |up - down|
      const cousinDegree = Math.min(upCount, downCount) - 1;
      const removed = Math.abs(upCount - downCount);
      
      let degreeStr = "";
      if (cousinDegree === 1) degreeStr = "First Cousin";
      if (cousinDegree === 2) degreeStr = "Second Cousin";
      if (cousinDegree === 3) degreeStr = "Third Cousin";
      if (cousinDegree === 4) degreeStr = "Fourth Cousin";
      if (cousinDegree === 5) degreeStr = "Fifth Cousin";
      if (cousinDegree > 5) degreeStr = `${cousinDegree}th Cousin`;

      if (removed === 0) return lineagePrefix + degreeStr;
      if (removed === 1) return lineagePrefix + degreeStr + " Once Removed";
      if (removed === 2) return lineagePrefix + degreeStr + " Twice Removed";
      if (removed === 3) return lineagePrefix + degreeStr + " Thrice Removed";
      return lineagePrefix + degreeStr + ` ${removed} Times Removed`;
    }
  }

  // Complex In-Law Paths
  if (spouseCount > 0) {
    if (pathStr === "PARENT-CHILD-SPOUSE" || pathStr === "CHILD-PARENT-SPOUSE") { // Sibling's Spouse
        return isTargetMale ? "Brother-In-Law" : isTargetFemale ? "Sister-In-Law" : "Sibling-In-Law";
    }
    if (pathStr === "SPOUSE-PARENT-CHILD") { // Spouse's Sibling
        return isTargetMale ? "Brother-In-Law" : isTargetFemale ? "Sister-In-Law" : "Sibling-In-Law";
    }
  }

  // If we reach here, it's a very complex blended mapping... Fallback politely  
  return isTargetMale ? "Male Relative" : isTargetFemale ? "Female Relative" : "Relative";
}
