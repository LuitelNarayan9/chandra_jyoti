"use server";

import { db } from "@/lib/db";

export async function getApprovedNodes() {
  const nodes = await db.familyMember.findMany({
    where: { isApproved: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      dateOfDeath: true,
      gender: true,
      photo: true,
      bio: true,
      familyClan: true,
      generation: true,
      isAlive: true,
      maritalStatus: true,
      profession: true,
      bloodGroup: true,
    },
    orderBy: [{ generation: "asc" }, { firstName: "asc" }],
  });

  return nodes.map((n) => ({
    ...n,
    dateOfBirth: n.dateOfBirth?.toISOString() ?? null,
    dateOfDeath: n.dateOfDeath?.toISOString() ?? null,
  }));
}

export async function getGlobalFamilyTree() {
  // 1. Fetch all approved nodes
  const nodesDb = await db.familyMember.findMany({
    where: { isApproved: true },
  });

  // 2. Fetch all approved edges
  const edgesDb = await db.familyEdge.findMany({
    where: { isApproved: true },
  });

  // 3. Resolve linked user avatars for members without a photo
  const linkedUserIds = nodesDb
    .filter((n) => !n.photo && n.linkedUserId)
    .map((n) => n.linkedUserId!);

  let avatarMap = new Map<string, string>();
  if (linkedUserIds.length > 0) {
    const users = await db.user.findMany({
      where: { id: { in: linkedUserIds } },
      select: { id: true, avatar: true },
    });
    for (const u of users) {
      if (u.avatar) avatarMap.set(u.id, u.avatar);
    }
  }

  // 4. Serialize Data — use linked user avatar as fallback for photo
  const nodes = nodesDb.map((n) => ({
    ...n,
    photo: n.photo || (n.linkedUserId ? avatarMap.get(n.linkedUserId) ?? null : null),
    dateOfBirth: n.dateOfBirth?.toISOString() ?? null,
    dateOfDeath: n.dateOfDeath?.toISOString() ?? null,
    isPlaceholder: false,
  }));

  const serializableEdges = edgesDb.map((e) => ({
    ...e,
    startDate: e.startDate?.toISOString() ?? null,
    endDate: e.endDate?.toISOString() ?? null,
  }));

  return { nodes, edges: serializableEdges };
}

export async function getUniqueFamilyClans(): Promise<string[]> {
  const result = await db.familyMember.findMany({
    where: { isApproved: true, familyClan: { not: null } },
    select: { familyClan: true },
    distinct: ["familyClan"],
    orderBy: { familyClan: "asc" },
  });
  return result.map((r) => r.familyClan!).filter(Boolean);
}

export async function getGenerationRange(): Promise<{ min: number; max: number }> {
  const result = await db.familyMember.aggregate({
    where: { isApproved: true },
    _min: { generation: true },
    _max: { generation: true },
  });
  return {
    min: result._min.generation ?? 1,
    max: result._max.generation ?? 1,
  };
}
