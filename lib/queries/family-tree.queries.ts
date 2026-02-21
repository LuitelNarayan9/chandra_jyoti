"use server";

import { db } from "@/lib/db";

export async function getAllApprovedMembers() {
  const members = await db.familyMember.findMany({
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
      fatherId: true,
      motherId: true,
      spouseId: true,
      father: { select: { id: true, firstName: true, lastName: true } },
      mother: { select: { id: true, firstName: true, lastName: true } },
      spouse: { select: { id: true, firstName: true, lastName: true } },
      fatherChildren: { select: { id: true, firstName: true, lastName: true } },
      motherChildren: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: [{ generation: "asc" }, { firstName: "asc" }],
  });

  return members.map((m) => ({
    ...m,
    dateOfBirth: m.dateOfBirth?.toISOString() ?? null,
    dateOfDeath: m.dateOfDeath?.toISOString() ?? null,
  }));
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
