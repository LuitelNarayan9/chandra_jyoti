"use client";

import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import { X, UserPlus, Pencil } from "lucide-react";
import type { TreeNode, FamilyEdgeData } from "@/types/family-tree";
import { MemberDetailCard } from "./member-detail-card";
import { getNodeColor, getInitials } from "@/lib/family-tree-utils";

interface MemberProfileViewProps {
  member: TreeNode;
  allNodes: TreeNode[];
  edges: FamilyEdgeData[];
  onClose: () => void;
  onNavigateToMember: (id: string) => void;
  canModify?: boolean;
  isAdmin?: boolean;
  currentUserClan?: string | null;
  onAddRelative?: (node: TreeNode, preselectedRelationship?: "FATHER" | "MOTHER" | "SPOUSE" | "CHILD" | "BROTHER" | "SISTER") => void;
  onEditMember?: (node: TreeNode) => void;
}

/* ── Couple = person + optional spouse ── */
interface Couple {
  primary: TreeNode;
  primaryLabel: string;
  spouse: TreeNode | null;
  spouseLabel: string;
}

/* ══════════════════════════════════════════
 *  Derive the 3-level mini tree data
 * ══════════════════════════════════════════ */
function derive3LevelTree(
  member: TreeNode,
  allNodes: TreeNode[],
  edges: FamilyEdgeData[]
): { upper: Couple[]; middle: Couple[]; lower: Couple[] } {
  const map = new Map(allNodes.map((n) => [n.id, n]));

  // ── Helpers ──
  function findSpouses(personId: string): TreeNode[] {
    const spouseIds = new Set<string>();
    edges.forEach((e) => {
      if (e.type === "SPOUSE" || e.type === "DIVORCED_SPOUSE") {
        if (e.fromNodeId === personId) spouseIds.add(e.toNodeId);
        if (e.toNodeId === personId) spouseIds.add(e.fromNodeId);
      }
    });
    return Array.from(spouseIds)
      .map((id) => map.get(id))
      .filter((n): n is TreeNode => Boolean(n));
  }

  function getParents(personId: string): TreeNode[] {
    return edges
      .filter(
        (e) =>
          e.toNodeId === personId &&
          (e.type === "PARENT_CHILD" || e.type === "ADOPTION")
      )
      .map((e) => map.get(e.fromNodeId))
      .filter((n): n is TreeNode => Boolean(n));
  }

  function getSiblings(personId: string): TreeNode[] {
    const myParents = getParents(personId);
    if (myParents.length === 0) return [];

    const siblingIds = new Set<string>();
    myParents.forEach((parent) => {
      edges
        .filter(
          (e) =>
            e.fromNodeId === parent.id &&
            (e.type === "PARENT_CHILD" || e.type === "ADOPTION")
        )
        .forEach((e) => {
          if (e.toNodeId !== personId) siblingIds.add(e.toNodeId);
        });
    });
    return Array.from(siblingIds)
      .map((id) => map.get(id))
      .filter((n): n is TreeNode => Boolean(n));
  }

  // ── Data extraction ──
  const parents = getParents(member.id);
  const father = parents.find((p) => p.gender === "MALE");
  const mother = parents.find((p) => p.gender === "FEMALE");

  // ── UPPER LEVEL ──
  const upper: Couple[] = [];

  // Paternal uncles & aunts (father's siblings) with spouses
  if (father) {
    const fatherSiblings = getSiblings(father.id);

    // Paternal uncles (father's brothers)
    fatherSiblings
      .filter((s) => s.gender === "MALE")
      .forEach((uncle) => {
        const sp = findSpouses(uncle.id)[0] || null;
        upper.push({
          primary: uncle,
          primaryLabel: "Paternal Uncle",
          spouse: sp,
          spouseLabel: sp ? "Uncle's Wife" : "",
        });
      });

    // Father + Mother couple (center of paternal family)
    upper.push({
      primary: father,
      primaryLabel: "Father",
      spouse: mother ?? null,
      spouseLabel: mother ? "Mother" : "",
    });

    // Paternal aunts (father's sisters)
    fatherSiblings
      .filter((s) => s.gender === "FEMALE")
      .forEach((aunt) => {
        const sp = findSpouses(aunt.id)[0] || null;
        upper.push({
          primary: aunt,
          primaryLabel: "Paternal Aunt",
          spouse: sp,
          spouseLabel: sp ? "Aunt's Husband" : "",
        });
      });
  } else if (mother) {
    // No father, just mother
    upper.push({
      primary: mother,
      primaryLabel: "Mother",
      spouse: null,
      spouseLabel: "",
    });
  }

  // Maternal uncles & aunts (mother's siblings) with spouses
  if (mother) {
    const motherSiblings = getSiblings(mother.id);

    motherSiblings
      .filter((s) => s.gender === "MALE")
      .forEach((uncle) => {
        const sp = findSpouses(uncle.id)[0] || null;
        upper.push({
          primary: uncle,
          primaryLabel: "Maternal Uncle",
          spouse: sp,
          spouseLabel: sp ? "Uncle's Wife" : "",
        });
      });

    motherSiblings
      .filter((s) => s.gender === "FEMALE")
      .forEach((aunt) => {
        const sp = findSpouses(aunt.id)[0] || null;
        upper.push({
          primary: aunt,
          primaryLabel: "Maternal Aunt",
          spouse: sp,
          spouseLabel: sp ? "Aunt's Husband" : "",
        });
      });
  }

  // If no father+mother found, push just parents standalone
  if (!father && !mother) {
    // orphan node — no upper level
  }

  // ── MIDDLE LEVEL: Sisters + Me + Spouse + Brothers ──
  const middle: Couple[] = [];

  // Siblings
  const siblings = getSiblings(member.id);
  const sisters = siblings.filter((s) => s.gender === "FEMALE");
  const brothers = siblings.filter((s) => s.gender === "MALE");

  // Sisters first (with spouses)
  sisters.forEach((sis) => {
    const sp = findSpouses(sis.id)[0] || null;
    middle.push({
      primary: sis,
      primaryLabel: "Sister",
      spouse: sp,
      spouseLabel: sp ? "Sister's Husband" : "",
    });
  });

  // Me + Spouse
  const mySpouses = findSpouses(member.id);
  const primarySpouse = mySpouses[0] || null;
  const spouseLabel =
    primarySpouse?.gender === "MALE"
      ? "Husband"
      : primarySpouse?.gender === "FEMALE"
        ? "Wife"
        : "Spouse";
  middle.push({
    primary: member,
    primaryLabel: "Me",
    spouse: primarySpouse,
    spouseLabel: primarySpouse ? spouseLabel : "",
  });

  // Brothers after (with spouses)
  brothers.forEach((bro) => {
    const sp = findSpouses(bro.id)[0] || null;
    middle.push({
      primary: bro,
      primaryLabel: "Brother",
      spouse: sp,
      spouseLabel: sp ? "Brother's Wife" : "",
    });
  });

  // ── LOWER LEVEL: Children + their spouses ──
  const lower: Couple[] = [];

  const childIds = new Set<string>();
  edges.forEach((e) => {
    if (
      (e.type === "PARENT_CHILD" || e.type === "ADOPTION") &&
      e.fromNodeId === member.id
    ) {
      childIds.add(e.toNodeId);
    }
  });

  // also check if any spouse is their primary edge
  mySpouses.forEach((sp) => {
    edges.forEach((e) => {
      if (
        (e.type === "PARENT_CHILD" || e.type === "ADOPTION") &&
        e.fromNodeId === sp.id
      ) {
        childIds.add(e.toNodeId);
      }
    });
  });

  const children = Array.from(childIds)
    .map((id) => map.get(id))
    .filter((n): n is TreeNode => Boolean(n));

  // Sons first, then daughters, sorted by birth year
  const sorted = [...children].sort((a, b) => {
    if (a.gender === "MALE" && b.gender !== "MALE") return -1;
    if (a.gender !== "MALE" && b.gender === "MALE") return 1;
    return (a.birthYear ?? 9999) - (b.birthYear ?? 9999);
  });

  sorted.forEach((child) => {
    const childSpouse = findSpouses(child.id)[0] || null;
    const childLabel = child.gender === "MALE" ? "Son" : "Daughter";
    const csLabel = childSpouse
      ? child.gender === "MALE"
        ? "Daughter-in-law"
        : "Son-in-law"
      : "";
    lower.push({
      primary: child,
      primaryLabel: childLabel,
      spouse: childSpouse,
      spouseLabel: csLabel,
    });
  });

  return { upper, middle, lower };
}

/* ══════════════════════════════════════════
 *  COMPONENT
 * ══════════════════════════════════════════ */

export function MemberProfileView({
  member,
  allNodes,
  edges,
  onClose,
  onNavigateToMember,
  canModify,
  isAdmin,
  currentUserClan,
  onAddRelative,
  onEditMember,
}: MemberProfileViewProps) {
  const { upper, middle, lower } = useMemo(
    () => derive3LevelTree(member, allNodes, edges),
    [member, allNodes, edges]
  );

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 max-h-[90vh]">
        <MemberDetailCard
          member={member}
          allNodes={allNodes}
          edges={edges}
          onClose={onClose}
          onNavigateToMember={onNavigateToMember}
        />

        {/* Action buttons — only for same-clan users or admins */}
        {canModify &&
          (isAdmin ||
            (currentUserClan &&
              member.familyClan &&
              currentUserClan === member.familyClan)) && (() => {
            // Compute missing parents for this member
            const parentEdges = edges.filter(
              (e) =>
                e.toNodeId === member.id &&
                (e.type === "PARENT_CHILD" || e.type === "ADOPTION")
            );
            const parentNodes = parentEdges
              .map((e) => allNodes.find((n) => n.id === e.fromNodeId))
              .filter(Boolean);
            const hasFather = parentNodes.some((p) => p?.gender === "MALE");
            const hasMother = parentNodes.some((p) => p?.gender === "FEMALE");
            const missingFather = !hasFather;
            const missingMother = !hasMother;

            return (
              <div className="flex flex-col gap-0 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                {/* Missing parent warning + quick-add buttons */}
                {(missingFather || missingMother) && (
                  <div className="px-3 pt-3 pb-1.5">
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50">
                      <svg
                        className="h-4 w-4 text-amber-500 mt-0.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300 mb-1.5">
                          {missingFather && missingMother
                            ? "Both parents are missing"
                            : missingFather
                              ? "Father is missing"
                              : "Mother is missing"}
                        </p>
                        <div className="flex gap-1.5">
                          {missingFather && (
                            <button
                              onClick={() =>
                                onAddRelative?.(member, "FATHER")
                              }
                              className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                            >
                              + Add Father
                            </button>
                          )}
                          {missingMother && (
                            <button
                              onClick={() =>
                                onAddRelative?.(member, "MOTHER")
                              }
                              className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-pink-500/10 text-pink-700 dark:text-pink-400 hover:bg-pink-500/20 transition-colors"
                            >
                              + Add Mother
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Standard action buttons */}
                <div className="flex items-center gap-2 p-3">
                  <button
                    onClick={() => onAddRelative?.(member)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Relative
                  </button>
                  <button
                    onClick={() => onEditMember?.(member)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Details
                  </button>
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
 *  MINI TREE BODY — zoomable + pannable container
 * ══════════════════════════════════════════ */
function MiniTreeBody({
  upper,
  middle,
  lower,
  memberId,
  onNavigateToMember,
}: {
  upper: Couple[];
  middle: Couple[];
  lower: Couple[];
  memberId: string;
  onNavigateToMember: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.75);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef<number | null>(null);
  const lastPinchScale = useRef(0.75);

  // ── Mouse handlers (desktop) ──
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      translateStart.current = { ...translate };
    },
    [translate]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setTranslate({
      x: translateStart.current.x + (e.clientX - dragStart.current.x),
      y: translateStart.current.y + (e.clientY - dragStart.current.y),
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // ── Touch handlers (mobile) ──
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        // Single finger = pan
        isDragging.current = true;
        dragStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        translateStart.current = { ...translate };
      } else if (e.touches.length === 2) {
        // Two fingers = pinch zoom
        isDragging.current = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDist.current = Math.hypot(dx, dy);
        lastPinchScale.current = scale;
      }
    },
    [translate, scale]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // The browser's default scroll/pinch is already prevented via CSS `touchAction: "none"`
    if (e.touches.length === 1 && isDragging.current) {
      setTranslate({
        x:
          translateStart.current.x +
          (e.touches[0].clientX - dragStart.current.x),
        y:
          translateStart.current.y +
          (e.touches[0].clientY - dragStart.current.y),
      });
    } else if (e.touches.length === 2 && lastPinchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / lastPinchDist.current;
      setScale(Math.max(0.3, Math.min(3, lastPinchScale.current * ratio)));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    lastPinchDist.current = null;
  }, []);

  // ── Wheel handler (desktop scroll zoom) — native listener for preventDefault ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale((s) => Math.max(0.3, Math.min(3, s - e.deltaY * 0.001)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const resetView = useCallback(() => {
    setScale(0.75);
    setTranslate({ x: 0, y: 0 });
  }, []);

  return (
    <div className="relative flex-1 overflow-hidden bg-zinc-50/50 dark:bg-zinc-900">
      {/* Zoomable/Pannable area */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex flex-col items-center min-w-fit py-6 px-4 origin-center"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: isDragging.current
              ? "none"
              : "transform 0.15s ease-out",
          }}
        >
          {/* ═══ LEVEL 1: Upper ═══ */}
          {upper.length > 0 && (
            <>
              <CoupleRow
                couples={upper}
                highlightId={memberId}
                onNavigate={onNavigateToMember}
              />
              <div className="flex flex-col items-center">
                <div className="w-[3px] h-6 bg-slate-400 dark:bg-slate-500" />
                <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                <div className="w-[3px] h-4 bg-slate-400 dark:bg-slate-500" />
              </div>
            </>
          )}

          {/* ═══ LEVEL 2: Middle ═══ */}
          <CoupleRow
            couples={middle}
            highlightId={memberId}
            onNavigate={onNavigateToMember}
          />

          {/* ═══ LEVEL 3: Lower ═══ */}
          {lower.length > 0 && (
            <>
              <div className="flex flex-col items-center">
                <div className="w-[3px] h-4 bg-slate-400 dark:bg-slate-500" />
                <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                <div className="w-[3px] h-6 bg-slate-400 dark:bg-slate-500" />
              </div>
              <CoupleRow
                couples={lower}
                highlightId={memberId}
                onNavigate={onNavigateToMember}
              />
            </>
          )}

          {upper.length === 0 && lower.length === 0 && (
            <p className="text-center text-zinc-400 text-xs mt-4">
              No additional family relations found
            </p>
          )}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 px-1.5 py-1">
        <button
          type="button"
          onClick={() => setScale((s) => Math.max(0.3, s - 0.15))}
          className="h-7 w-7 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-sm font-bold"
        >
          −
        </button>
        <button
          type="button"
          onClick={resetView}
          className="h-7 px-2 rounded-full flex items-center justify-center text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          type="button"
          onClick={() => setScale((s) => Math.min(3, s + 0.15))}
          className="h-7 w-7 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-sm font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
 *  COUPLE ROW — renders a horizontal row of couples
 *  with a shared horizontal bus line and stubs
 * ══════════════════════════════════════════ */
function CoupleRow({
  couples,
  highlightId,
  onNavigate,
}: {
  couples: Couple[];
  highlightId: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <div className="flex flex-col items-center">
      {/* Horizontal bus line (if multiple couples) */}
      {couples.length > 1 && (
        <div className="relative flex justify-center w-full mb-0">
          <div
            className="h-[3px] bg-slate-400 dark:bg-slate-500"
            style={{
              width: `${Math.min(couples.length * 200, 900)}px`,
            }}
          />
        </div>
      )}

      {/* Couples */}
      <div className="flex flex-nowrap justify-center gap-x-4 gap-y-4">
        {couples.map((couple, idx) => (
          <div
            key={`${couple.primary.id}-${idx}`}
            className="flex flex-col items-center"
          >
            {/* Stub from bus */}
            {couples.length > 1 && (
              <div className="w-[3px] h-3 bg-slate-400 dark:bg-slate-500" />
            )}

            {/* Couple pair or single */}
            <div className="flex items-start">
              <MiniCard
                node={couple.primary}
                label={couple.primaryLabel}
                isMe={couple.primaryLabel === "Me"}
                highlightId={highlightId}
                onNavigate={onNavigate}
              />

              {couple.spouse && (
                <>
                  {/* Dashed pink connector */}
                  <div className="flex flex-col items-center justify-center mt-6">
                    <div className="h-[3px] w-5 border-t-[3px] border-dashed border-rose-400" />
                  </div>

                  <MiniCard
                    node={couple.spouse}
                    label={couple.spouseLabel}
                    isMe={false}
                    highlightId={highlightId}
                    onNavigate={onNavigate}
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
 *  MINI CARD — compact portrait card for the modal tree
 * ══════════════════════════════════════════ */
function MiniCard({
  node,
  label,
  isMe,
  highlightId,
  onNavigate,
}: {
  node: TreeNode;
  label: string;
  isMe: boolean;
  highlightId: string;
  onNavigate: (id: string) => void;
}) {
  const c = getNodeColor(node.gender, node.isAlive);

  return (
    <button
      onClick={() => {
        if (!isMe) onNavigate(node.id);
      }}
      disabled={isMe}
      className={`group relative w-[130px] rounded-xl overflow-hidden text-left transition-all border-2 ${
        isMe
          ? "border-blue-400 shadow-md shadow-blue-100 dark:shadow-blue-950/30 ring-2 ring-blue-200 dark:ring-blue-800"
          : node.id === highlightId
            ? "border-blue-300 shadow-sm"
            : "border-zinc-200 dark:border-zinc-700 hover:shadow-lg hover:-translate-y-0.5 hover:border-zinc-300 dark:hover:border-zinc-600"
      }`}
      style={{
        backgroundColor: isMe
          ? "rgba(59,130,246,0.06)"
          : node.gender === "MALE"
            ? "rgba(219,234,254,0.3)"
            : node.gender === "FEMALE"
              ? "rgba(252,231,243,0.3)"
              : "rgba(237,233,254,0.3)",
      }}
    >
      {/* Label banner */}
      <div
        className="px-2 py-[4px] text-[9px] font-bold uppercase tracking-wider text-white text-center"
        style={{ backgroundColor: c.fill }}
      >
        {label}
      </div>

      {/* Avatar + Info */}
      <div className="flex flex-col items-center px-2 py-2">
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${c.fill}, ${c.stroke})`,
          }}
        >
          {getInitials(node.firstName, node.lastName)}
        </div>
        <p
          className={`mt-1.5 text-[11px] font-bold truncate w-full text-center ${
            isMe
              ? "text-blue-700 dark:text-blue-400"
              : "text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400"
          } transition-colors`}
        >
          {node.name}
        </p>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
          {node.birthYear
            ? node.deathYear
              ? `${node.birthYear} - ${node.deathYear}`
              : `${node.birthYear} -`
            : ""}
        </p>
      </div>
    </button>
  );
}
