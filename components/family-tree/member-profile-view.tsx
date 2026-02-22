"use client";

import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";
import type { TreeNode } from "@/types/family-tree";
import { getNodeColor, getInitials } from "@/lib/family-tree-utils";

interface MemberProfileViewProps {
  member: TreeNode;
  allNodes: TreeNode[];
  onClose: () => void;
  onNavigateToMember: (id: string) => void;
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
  allNodes: TreeNode[]
): { upper: Couple[]; middle: Couple[]; lower: Couple[] } {
  const map = new Map(allNodes.map((n) => [n.id, n]));

  // ── Helpers ──
  function findSpouse(person: TreeNode): TreeNode | null {
    if (person.spouseId && map.has(person.spouseId))
      return map.get(person.spouseId)!;
    for (const n of allNodes) {
      if (n.spouseId === person.id) return n;
    }
    return null;
  }

  function getSiblings(person: TreeNode): TreeNode[] {
    return allNodes.filter(
      (n) =>
        n.id !== person.id &&
        ((person.fatherId && n.fatherId === person.fatherId) ||
          (person.motherId && n.motherId === person.motherId))
    );
  }

  // ── Data extraction ──
  const father = member.fatherId ? map.get(member.fatherId) : undefined;
  const mother = member.motherId ? map.get(member.motherId) : undefined;

  // ── UPPER LEVEL ──
  const upper: Couple[] = [];

  // Paternal uncles & aunts (father's siblings) with spouses
  if (father) {
    const fatherSiblings = getSiblings(father);

    // Paternal uncles (father's brothers)
    fatherSiblings
      .filter((s) => s.gender === "MALE")
      .forEach((uncle) => {
        const sp = findSpouse(uncle);
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
        const sp = findSpouse(aunt);
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
    const motherSiblings = getSiblings(mother);

    motherSiblings
      .filter((s) => s.gender === "MALE")
      .forEach((uncle) => {
        const sp = findSpouse(uncle);
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
        const sp = findSpouse(aunt);
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

  // Siblings (same father or mother)
  const siblings = allNodes.filter(
    (n) =>
      n.id !== member.id &&
      ((member.fatherId && n.fatherId === member.fatherId) ||
        (member.motherId && n.motherId === member.motherId))
  );
  const sisters = siblings.filter((s) => s.gender === "FEMALE");
  const brothers = siblings.filter((s) => s.gender === "MALE");

  // Sisters first (with spouses)
  sisters.forEach((sis) => {
    const sp = findSpouse(sis);
    middle.push({
      primary: sis,
      primaryLabel: "Sister",
      spouse: sp,
      spouseLabel: sp ? "Sister's Husband" : "",
    });
  });

  // Me + Spouse
  const mySpouse = findSpouse(member);
  const spouseLabel =
    mySpouse?.gender === "MALE"
      ? "Husband"
      : mySpouse?.gender === "FEMALE"
        ? "Wife"
        : "Spouse";
  middle.push({
    primary: member,
    primaryLabel: "Me",
    spouse: mySpouse,
    spouseLabel: mySpouse ? spouseLabel : "",
  });

  // Brothers after (with spouses)
  brothers.forEach((bro) => {
    const sp = findSpouse(bro);
    middle.push({
      primary: bro,
      primaryLabel: "Brother",
      spouse: sp,
      spouseLabel: sp ? "Brother's Wife" : "",
    });
  });

  // ── LOWER LEVEL: Children + their spouses ──
  const lower: Couple[] = [];
  const children = allNodes.filter(
    (n) =>
      n.fatherId === member.id ||
      n.motherId === member.id ||
      (mySpouse && (n.fatherId === mySpouse.id || n.motherId === mySpouse.id))
  );

  // Sons first, then daughters, sorted by birth year
  const sorted = [...children].sort((a, b) => {
    if (a.gender === "MALE" && b.gender !== "MALE") return -1;
    if (a.gender !== "MALE" && b.gender === "MALE") return 1;
    return (a.birthYear ?? 9999) - (b.birthYear ?? 9999);
  });

  sorted.forEach((child) => {
    const childSpouse = findSpouse(child);
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
  onClose,
  onNavigateToMember,
}: MemberProfileViewProps) {
  const { upper, middle, lower } = useMemo(
    () => derive3LevelTree(member, allNodes),
    [member, allNodes]
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl max-h-[92vh] rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-300 flex flex-col border border-zinc-200 dark:border-zinc-700">
        {/* ─── Hero Banner ─── */}
        <div className="relative shrink-0 overflow-hidden">
          <div
            className="h-60 sm:h-64 w-full"
            style={{
              background: `linear-gradient(135deg, ${getNodeColor(member.gender, member.isAlive).fill} 0%, ${getNodeColor(member.gender, member.isAlive).stroke} 60%, #1e3a5f 100%)`,
            }}
          />
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-10 w-24 h-24 rounded-full bg-white/5 translate-y-6" />

          {/* Badges + Close */}
          <div className="absolute top-3 left-4 right-4 flex items-start justify-between">
            <div className="flex gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white">
                {member.gender === "MALE"
                  ? "♂ Male"
                  : member.gender === "FEMALE"
                    ? "♀ Female"
                    : "Other"}
              </span>
              {member.generation !== undefined &&
                member.generation !== null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white">
                    Gen {member.generation}
                  </span>
                )}
              {!member.isAlive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/30 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white/80">
                  Deceased
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="relative z-10 h-10 w-10 rounded-full flex items-center justify-center bg-white/25 backdrop-blur-md text-white hover:bg-white/40 hover:scale-110 transition-all shadow-lg"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Avatar + Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 pt-12">
            <div
              className="h-[72px] w-[72px] shrink-0 rounded-full flex items-center justify-center text-white text-2xl font-extrabold shadow-lg ring-4 ring-white/30"
              style={{
                background: `linear-gradient(145deg, ${getNodeColor(member.gender, member.isAlive).fill}, ${getNodeColor(member.gender, member.isAlive).stroke})`,
              }}
            >
              {getInitials(member.firstName, member.lastName)}
            </div>
            <h2 className="mt-2.5 text-lg font-bold text-white tracking-tight">
              {member.name}
            </h2>
            {member.birthYear && (
              <p className="text-[13px] text-white/70 mt-0.5 flex items-center gap-1.5">
                <span>📅</span>
                <span>
                  Born {member.birthYear}
                  {member.deathYear
                    ? ` · Died ${member.deathYear}`
                    : ` · ${new Date().getFullYear() - member.birthYear} yrs`}
                </span>
              </p>
            )}
            {member.familyClan && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-[12px] font-semibold text-white">
                🏔️ Clan: {member.familyClan}
              </span>
            )}
          </div>
        </div>

        {/* ─── 3-Level Mini Tree (Zoomable + Pannable) ─── */}
        <MiniTreeBody
          upper={upper}
          middle={middle}
          lower={lower}
          memberId={member.id}
          onNavigateToMember={onNavigateToMember}
        />
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
