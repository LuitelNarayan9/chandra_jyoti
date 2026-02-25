"use server";

import { db } from "@/lib/db";

/**
 * Calculates and updates generations for all members in the database.
 * Uses a Longest-Path algorithm to resolve roots and handles spouse synching.
 */
export async function calculateAndSyncGenerations(): Promise<boolean> {
  try {
    const members = await db.familyMember.findMany();
    const edges = await db.familyEdge.findMany();

    const parentIdsOf = new Map<string, string[]>();
    const childIdsOf = new Map<string, string[]>();
    const spousesOf = new Map<string, string[]>();

    for (const edge of edges) {
      if (edge.type === 'PARENT_CHILD' || edge.type === 'ADOPTION') {
        const parentId = edge.fromNodeId;
        const childId = edge.toNodeId;
        
        if (!parentIdsOf.has(childId)) parentIdsOf.set(childId, []);
        parentIdsOf.get(childId)!.push(parentId);

        if (!childIdsOf.has(parentId)) childIdsOf.set(parentId, []);
        childIdsOf.get(parentId)!.push(childId);
      } else if (edge.type === 'SPOUSE' || edge.type === 'DIVORCED_SPOUSE') {
        if (!spousesOf.has(edge.fromNodeId)) spousesOf.set(edge.fromNodeId, []);
        spousesOf.get(edge.fromNodeId)!.push(edge.toNodeId);

        if (!spousesOf.has(edge.toNodeId)) spousesOf.set(edge.toNodeId, []);
        spousesOf.get(edge.toNodeId)!.push(edge.fromNodeId);
      }
    }

    const generationMap = new Map<string, number>();
    const clans = [...new Set(members.map(m => m.familyClan).filter(Boolean))] as string[];

    // Step 1: Calculate bloodline generations per clan
    for (const clan of clans) {
      const clanMembers = members.filter(m => m.familyClan === clan);
      const clanMemberIds = new Set(clanMembers.map(m => m.id));

      // Roots = clan members with no parents in the SAME clan
      const roots = clanMembers.filter(m => {
        const parents = parentIdsOf.get(m.id) || [];
        const parentsInClan = parents.filter(pid => clanMemberIds.has(pid));
        return parentsInClan.length === 0;
      });

      // Initialize roots at Generation 1
      const queue: string[] = [];
      for (const r of roots) {
        generationMap.set(r.id, 1);
        queue.push(r.id);
      }
      
      // Longest Path evaluation
      while (queue.length > 0) {
        const id = queue.shift()!;
        const myGen = generationMap.get(id)!;

        const children = childIdsOf.get(id) || [];
        const childrenInClan = children.filter(cid => clanMemberIds.has(cid));
        
        for (const cid of childrenInClan) {
          const currentChildGen = generationMap.get(cid) || 0;
          const newGen = myGen + 1;
          
          // If this path yields a deeper generation, update it and push to queue to propagate
          if (newGen > currentChildGen) {
            generationMap.set(cid, newGen);
            if (!queue.includes(cid)) {
              queue.push(cid);
            }
          }
        }

        // Sync generation to spouses in the same clan (married-in members)
        const spouseIds = spousesOf.get(id) || [];
        const spousesInClan = spouseIds.filter(sid => clanMemberIds.has(sid));
        for (const sid of spousesInClan) {
          const currentSpouseGen = generationMap.get(sid) || 0;
          // The true bloodline ( deeper generation ) overwrites the default Gen 1 root of the married-in spouse
          if (myGen > currentSpouseGen) {
            generationMap.set(sid, myGen);
            if (!queue.includes(sid)) {
              queue.push(sid);
            }
          }
        }
      }
    }

    // Step 2: Tie non-bloodline spouses to the same generation as their partners
    // Perform multiple passes to ensure generations propagate properly
    for(let i=0; i<3; i++) {
      for (const member of members) {
        const spouseIds = spousesOf.get(member.id) || [];
        for (const spouseId of spouseIds) {
          const myGen = generationMap.get(member.id);
          const spouseGen = generationMap.get(spouseId);
          
          if (myGen === 1 && spouseGen && spouseGen > 1) {
            generationMap.set(member.id, spouseGen);
          } else if (!myGen && spouseGen) {
            generationMap.set(member.id, spouseGen);
          }
        }
      }
    }

    // Update DB concurrently within a transaction or chunks
    const updatePromises = [];
    for (const [id, gen] of generationMap.entries()) {
      updatePromises.push(
        db.familyMember.update({
          where: { id },
          data: { generation: gen }
        })
      );
    }

    // Process in chunks to avoid overwhelming the connection
    const chunkSize = 50;
    for (let i = 0; i < updatePromises.length; i += chunkSize) {
      await Promise.all(updatePromises.slice(i, i + chunkSize));
    }
    
    return true;
  } catch (error) {
    console.error("Failed to calculate generations:", error);
    return false;
  }
}
