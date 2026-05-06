import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        role: true,
        isResidentOfTuminDhanbari: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isAdmin =
      currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";

    const member = await db.familyMember.findFirst({
      where: {
        id,
        ...(isAdmin
          ? {}
          : {
              OR: [
                { isApproved: true },
                { linkedUserId: currentUser.id },
              ],
            }),
      },
      include: {
        edgesAsFrom: {
          where: { isApproved: true },
          include: {
            toNode: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                gender: true,
                isAlive: true,
                dateOfBirth: true,
                dateOfDeath: true,
                photo: true,
                linkedUserId: true,
              },
            },
          },
        },
        edgesAsTo: {
          where: { isApproved: true },
          include: {
            fromNode: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                gender: true,
                isAlive: true,
                dateOfBirth: true,
                dateOfDeath: true,
                photo: true,
                linkedUserId: true,
              },
            },
          },
        },
        lifeEvents: { orderBy: { date: "asc" } },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const canViewSensitive =
      isAdmin ||
      currentUser.isResidentOfTuminDhanbari ||
      member.linkedUserId === currentUser.id;

    // Derive relations
    const parents = member.edgesAsTo
      .filter((e) => e.type === "PARENT_CHILD" || e.type === "ADOPTION")
      .map((e) => e.fromNode);

    // Children (direct)
    const directChildren = member.edgesAsFrom
      .filter((e) => e.type === "PARENT_CHILD" || e.type === "ADOPTION")
      .map((e) => e.toNode);

    type RelativeNode = (typeof parents)[number];

    const spouseMap = new Map<
      string,
      (typeof member.edgesAsFrom)[0]["toNode"]
    >();
    member.edgesAsFrom
      .filter((e) => e.type === "SPOUSE" || e.type === "DIVORCED_SPOUSE")
      .forEach((e) => spouseMap.set(e.toNode.id, e.toNode));
    member.edgesAsTo
      .filter((e) => e.type === "SPOUSE" || e.type === "DIVORCED_SPOUSE")
      .forEach((e) => spouseMap.set(e.fromNode.id, e.fromNode));
    const spouses = Array.from(spouseMap.values());

    // Get children of spouses (since edges often only connect from one parent)
    const spouseIds = spouses.map((s) => s.id);
    let spouseChildrenEdges: Array<{
      fromNodeId: string;
      toNode: RelativeNode;
    }> = [];
    if (spouseIds.length > 0) {
      spouseChildrenEdges = await db.familyEdge.findMany({
        where: {
          fromNodeId: { in: spouseIds },
          type: { in: ["PARENT_CHILD", "ADOPTION"] },
          isApproved: true,
        },
        include: {
          toNode: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gender: true,
              isAlive: true,
              dateOfBirth: true,
              dateOfDeath: true,
              photo: true,
              linkedUserId: true,
            },
          },
        },
      });
    }

    // Combine all unique children
    const childrenMap = new Map<string, RelativeNode>();
    directChildren.forEach((c) => childrenMap.set(c.id, c));
    spouseChildrenEdges.forEach((e) => childrenMap.set(e.toNode.id, e.toNode));
    const children = Array.from(childrenMap.values());

    // Siblings — also include children of parents' spouses
    const siblings: typeof parents = [];
    if (parents.length > 0) {
      const parentIds = parents.map((p) => p.id);

      // Expand to include spouses of parents
      const parentSpouseEdges = await db.familyEdge.findMany({
        where: {
          OR: [
            {
              fromNodeId: { in: parentIds },
              type: { in: ["SPOUSE", "DIVORCED_SPOUSE"] },
            },
            {
              toNodeId: { in: parentIds },
              type: { in: ["SPOUSE", "DIVORCED_SPOUSE"] },
            },
          ],
          isApproved: true,
        },
        select: { fromNodeId: true, toNodeId: true },
      });
      const allParentIds = new Set(parentIds);
      parentSpouseEdges.forEach((e) => {
        allParentIds.add(e.fromNodeId);
        allParentIds.add(e.toNodeId);
      });

      const siblingEdges = await db.familyEdge.findMany({
        where: {
          fromNodeId: { in: [...allParentIds] },
          type: { in: ["PARENT_CHILD", "ADOPTION"] },
          isApproved: true,
          toNodeId: { not: member.id },
        },
        include: {
          toNode: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gender: true,
              isAlive: true,
              dateOfBirth: true,
              dateOfDeath: true,
              photo: true,
              linkedUserId: true,
            },
          },
        },
      });
      const seen = new Set<string>();
      for (const e of siblingEdges) {
        if (!seen.has(e.toNode.id)) {
          seen.add(e.toNode.id);
          siblings.push(e.toNode);
        }
      }
    }

    // Group children by spouse
    const spouseChildGroups: Array<{
      spouse: RelativeNode | null;
      children: RelativeNode[];
    }> = spouses.map((spouse) => {
      // Find children that belong to this spouse
      const childrenOfThisSpouse = spouseChildrenEdges
        .filter((e) => e.fromNodeId === spouse.id)
        .map((e) => e.toNode);

      // If there are direct children that don't belong to any spouse, we will add them to the first spouse
      // or "No spouse" group. But usually they belong to the primary spouse.
      // For simplicity, let's include all direct children with the primary (first) spouse if they were not explicitly found as children of *another* spouse.

      return {
        spouse,
        children: childrenOfThisSpouse,
      };
    });

    // Add direct children to the first spouse if they aren't already included
    if (spouses.length > 0 && directChildren.length > 0) {
      const firstGroup = spouseChildGroups[0];
      const existingChildIds = new Set(firstGroup.children.map((c) => c.id));
      directChildren.forEach((dc) => {
        // Only add if not already present in the group and not present in ANY other spouse group's children
        const isInAnyGroup = spouseChildGroups.some((g) =>
          g.children.some((c) => c.id === dc.id)
        );
        if (!isInAnyGroup && !existingChildIds.has(dc.id)) {
          firstGroup.children.push(dc);
        }
      });
    }

    // If no spouses but has children, group them under "No spouse"
    if (spouses.length === 0 && children.length > 0) {
      spouseChildGroups.push({
        spouse: null,
        children,
      });
    }

    // Determine marital status dynamically if it's Single but has spouses
    let derivedMaritalStatus = member.maritalStatus;
    if (
      spouses.length > 0 &&
      (derivedMaritalStatus === "SINGLE" || !derivedMaritalStatus)
    ) {
      derivedMaritalStatus = "MARRIED";
    }

    // ── Resolve linked user avatars as fallback for photo ──
    const allRelatives = [...parents, ...children, ...spouses, ...siblings];
    const linkedIds = [
      ...(member.linkedUserId && !member.photo ? [member.linkedUserId] : []),
      ...allRelatives
        .filter(
          (r): r is RelativeNode & { linkedUserId: string } =>
            !r.photo && Boolean(r.linkedUserId)
        )
        .map((r) => r.linkedUserId),
    ];

    const avatarMap = new Map<string, string>();
    if (linkedIds.length > 0) {
      const users = await db.user.findMany({
        where: { id: { in: [...new Set(linkedIds)] } },
        select: { id: true, avatar: true },
      });
      for (const u of users) {
        if (u.avatar) avatarMap.set(u.id, u.avatar);
      }
    }

    const resolveRelative = (node: RelativeNode) => ({
      id: node.id,
      firstName: node.firstName,
      lastName: node.lastName,
      gender: node.gender,
      isAlive: node.isAlive,
      dateOfBirth: canViewSensitive ? node.dateOfBirth : null,
      dateOfDeath: canViewSensitive ? node.dateOfDeath : null,
      photo:
        node.photo ||
        (node.linkedUserId ? (avatarMap.get(node.linkedUserId) ?? null) : null),
    });

    const memberPhoto =
      member.photo ||
      (member.linkedUserId
        ? (avatarMap.get(member.linkedUserId) ?? null)
        : null);

    return NextResponse.json({
      member: {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        dateOfBirth: canViewSensitive ? member.dateOfBirth : null,
        dateOfDeath: canViewSensitive ? member.dateOfDeath : null,
        gender: member.gender,
        photo: memberPhoto,
        bio: canViewSensitive ? member.bio : null,
        familyClan: member.familyClan,
        generation: member.generation,
        isAlive: member.isAlive,
        maritalStatus: canViewSensitive ? derivedMaritalStatus : null,
        bloodGroup: canViewSensitive ? member.bloodGroup : null,
        profession: canViewSensitive ? member.profession : null,
      },
      parents: parents.map(resolveRelative),
      children: children.map(resolveRelative),
      spouses: spouses.map(resolveRelative),
      siblings: siblings.map(resolveRelative),
      spouseChildGroups: spouseChildGroups.map((g) => ({
        spouse: g.spouse ? resolveRelative(g.spouse) : null,
        children: g.children.map(resolveRelative),
      })),
      lifeEvents: canViewSensitive ? member.lifeEvents : [],
      permissions: {
        canViewSensitive,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
