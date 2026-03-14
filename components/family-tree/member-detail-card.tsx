"use client";

import { useMemo } from "react";
import {
  HeartPulse,
  HeartOff,
  ExternalLink,
  CircleUser,
  Layers,
  Shield,
} from "lucide-react";
import type { TreeNode, FamilyEdgeData } from "@/types/family-tree";
import { getNodeColor, getInitials } from "@/lib/family-tree-utils";

interface MemberDetailCardProps {
  member: TreeNode;
  allNodes: TreeNode[];
  edges: FamilyEdgeData[];
  onClose: () => void;
  onNavigateToMember: (id: string) => void;
}

export function MemberDetailCard({
  member,
  allNodes,
  edges,
  onClose,
  onNavigateToMember,
}: MemberDetailCardProps) {
  const colors = getNodeColor(member.gender, member.isAlive);

  /* ── Derive full relations from allNodes ── */
  const relations = useMemo(() => {
    const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

    const getParents = (id: string) =>
      edges
        .filter(
          (e) =>
            e.toNodeId === id &&
            (e.type === "PARENT_CHILD" || e.type === "ADOPTION")
        )
        .map((e) => nodeMap.get(e.fromNodeId))
        .filter((n): n is TreeNode => Boolean(n));

    // Parents
    const myParents = getParents(member.id);
    const fathers = myParents.filter((p) => p.gender === "MALE");
    const mothers = myParents.filter((p) => p.gender === "FEMALE");

    // Spouses
    const spouseSet = new Set<string>();
    edges.forEach((e) => {
      if (e.type === "SPOUSE" || e.type === "DIVORCED_SPOUSE") {
        if (e.fromNodeId === member.id) spouseSet.add(e.toNodeId);
        if (e.toNodeId === member.id) spouseSet.add(e.fromNodeId);
      }
    });
    const spouses = Array.from(spouseSet)
      .map((id) => nodeMap.get(id))
      .filter((n): n is TreeNode => Boolean(n));

    // Children — include both direct children AND spouse's children
    const childSet = new Set<string>();
    edges.forEach((e) => {
      if (
        (e.type === "PARENT_CHILD" || e.type === "ADOPTION") &&
        e.fromNodeId === member.id
      ) {
        childSet.add(e.toNodeId);
      }
    });
    // Also count children through spouses
    spouses.forEach((sp) => {
      edges.forEach((e) => {
        if (
          (e.type === "PARENT_CHILD" || e.type === "ADOPTION") &&
          e.fromNodeId === sp.id
        ) {
          childSet.add(e.toNodeId);
        }
      });
    });
    const children = Array.from(childSet)
      .map((id) => nodeMap.get(id))
      .filter((n): n is TreeNode => Boolean(n));

    const sons = children.filter((c) => c.gender === "MALE");
    const daughters = children.filter((c) => c.gender === "FEMALE");
    const otherChildren = children.filter(
      (c) => c.gender !== "MALE" && c.gender !== "FEMALE"
    );

    // Siblings — also include children of parents' spouses
    const siblingSet = new Set<string>();

    // First, expand parents to include their spouses
    const parentAndSpouseIds = new Set<string>(myParents.map((p) => p.id));
    myParents.forEach((parent) => {
      edges.forEach((e) => {
        if (e.type === "SPOUSE" || e.type === "DIVORCED_SPOUSE") {
          if (e.fromNodeId === parent.id) parentAndSpouseIds.add(e.toNodeId);
          if (e.toNodeId === parent.id) parentAndSpouseIds.add(e.fromNodeId);
        }
      });
    });

    // Find all children of parent + parent's spouses
    parentAndSpouseIds.forEach((parentId) => {
      edges
        .filter(
          (e) =>
            e.fromNodeId === parentId &&
            (e.type === "PARENT_CHILD" || e.type === "ADOPTION")
        )
        .forEach((e) => {
          if (e.toNodeId !== member.id) siblingSet.add(e.toNodeId);
        });
    });
    const siblings = Array.from(siblingSet)
      .map((id) => nodeMap.get(id))
      .filter((n): n is TreeNode => Boolean(n));

    return {
      fathers,
      mothers,
      spouses,
      sons,
      daughters,
      otherChildren,
      children,
      siblings,
    };
  }, [member, allNodes, edges]);

  const age = (() => {
    if (!member.birthYear) return null;
    if (member.deathYear) return member.deathYear - member.birthYear;
    return new Date().getFullYear() - member.birthYear;
  })();

  /* ── Build subtitle line ── */
  const subtitle = (() => {
    const parts: string[] = [];
    if (member.profession) parts.push(member.profession);
    if (member.familyClan) parts.push(`${member.familyClan} Clan`);
    if (parts.length > 0) return parts.join(" · ");
    // fallback
    if (member.bio) return member.bio;
    if (member.birthYear) {
      if (member.isAlive)
        return `Born ${member.birthYear}${age ? ` · ${age} yrs` : ""}`;
      return `${member.birthYear} — ${member.deathYear ?? "?"}${age ? ` · Lived ${age} yrs` : ""}`;
    }
    return member.gender === "MALE"
      ? "Male"
      : member.gender === "FEMALE"
        ? "Female"
        : "Member";
  })();

  /* ── Stat counts ── */
  const childCount = relations.children.length;
  const siblingCount = relations.siblings.length;
  const spouseCount = relations.spouses.length;

  /* ── Gender-specific gradient colors ── */
  const headerGradient = `linear-gradient(135deg, ${colors.fill}, ${colors.stroke})`;

  /* ── Accent glow color for the avatar ring ── */
  const glowColor = colors.fill;

  return (
    <>
      {/* ─── Header with mesh-style gradient ─── */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ height: 140 }}
      >
        {/* Primary gradient */}
        <div
          className="absolute inset-0"
          style={{ background: headerGradient }}
        />

        {/* Decorative mesh / aurora blobs */}
        <div
          className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-30 blur-2xl"
          style={{ background: colors.stroke }}
        />
        <div
          className="absolute -top-6 right-0 w-48 h-48 rounded-full opacity-20 blur-3xl"
          style={{ background: `${colors.fill}cc` }}
        />
        <div
          className="absolute bottom-2 left-1/3 w-32 h-32 rounded-full opacity-15 blur-2xl"
          style={{ background: "#fff" }}
        />

        {/* Subtle dot grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Smooth curve bottom edge */}
        <svg
          className="absolute -bottom-[1px] left-0 w-full"
          viewBox="0 0 400 50"
          preserveAspectRatio="none"
          style={{ height: 50 }}
        >
          <path
            d="M0,30 C100,50 200,10 300,35 C350,47 380,25 400,30 L400,50 L0,50 Z"
            className="fill-white dark:fill-zinc-900"
          />
        </svg>

        {/* Profile link button (top-right) — glass morphism */}
        <button
          onClick={() => {
            window.location.href = `/profile/${member.id}`;
          }}
          className="absolute top-3.5 right-3.5 h-9 w-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 shadow-lg shadow-black/10 hover:scale-105 border border-white/20"
          title="View full profile"
        >
          <ExternalLink className="h-4 w-4" />
        </button>

        {/* Top-left Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-2 max-w-[calc(100%-3rem)] z-10">
          {/* Clan & Generation Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-emerald-400/30 shadow-sm">
            <span>{member.familyClan || "Unknown"}</span>
            {member.generation !== null && (
              <>
                <span className="opacity-50 font-black">
                  &ensp; &gt; &ensp;
                </span>
                <span>Gen {member.generation}</span>
              </>
            )}
          </div>

          {/* Status badge */}
          {!member.isAlive && (
            <div className="px-3 py-1.5 rounded-lg bg-black/20 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/10 shadow-sm">
              Deceased
            </div>
          )}
        </div>
      </div>

      {/* ─── Circular Avatar with glow ring ─── */}
      <div className="relative flex justify-center" style={{ marginTop: -48 }}>
        {/* Glow ring behind avatar */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[104px] h-[104px] rounded-full blur-lg opacity-40"
          style={{ background: glowColor }}
        />
        <div
          className="relative h-[96px] w-[96px] rounded-full flex items-center justify-center text-2xl font-bold text-white border-[4px] border-white dark:border-zinc-900 overflow-hidden"
          style={{
            background: headerGradient,
            boxShadow: `0 8px 32px ${glowColor}40, 0 2px 8px rgba(0,0,0,0.1)`,
          }}
        >
          {member.photo ? (
            <img
              src={member.photo}
              alt={member.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="drop-shadow-sm">
              {getInitials(member.firstName, member.lastName)}
            </span>
          )}
        </div>
      </div>

      {/* ─── Name & Subtitle ─── */}
      <div className="text-center px-6 mt-4">
        <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
          {member.name}
        </h3>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed font-medium">
          {subtitle}
        </p>
        {age !== null && (
          <div
            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[12px] font-semibold"
            style={{ background: `${colors.bg}`, color: colors.text }}
          >
            <span>Age</span>
            <span
              className="w-1 h-1 rounded-full"
              style={{ background: colors.fill }}
            />
            <span>{age}</span>
          </div>
        )}
      </div>

      {/* ─── Stats Row — glassmorphism cards ─── */}
      <div className="flex items-center justify-center gap-3 mt-5 px-6">
        <StatCard
          value={childCount}
          label="Children"
          color={colors.fill}
          bg={colors.bg}
        />
        <StatCard
          value={siblingCount}
          label="Siblings"
          color={colors.fill}
          bg={colors.bg}
        />
        <StatCard
          value={spouseCount}
          label={spouseCount === 1 ? "Spouse" : "Spouses"}
          color={colors.fill}
          bg={colors.bg}
        />
      </div>

      {/* ─── Bio ─── */}
      {member.bio && (
        <div className="px-6 mt-5 mb-1">
          <div className="relative px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            {/* Decorative quote mark */}
            <span
              className="absolute -top-2 left-3 text-3xl font-serif leading-none opacity-20"
              style={{ color: colors.fill }}
            >
              &ldquo;
            </span>
            <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed text-center italic pl-2">
              {member.bio}
            </p>
          </div>
        </div>
      )}

      {/* ─── Bottom Info Row — pill badges ─── */}
      <div className="flex items-center justify-evenly py-4 mt-2 border-t border-zinc-100 dark:border-zinc-800 shrink-0 w-full">
        <BottomPill
          label={
            member.gender === "MALE"
              ? "Male"
              : member.gender === "FEMALE"
                ? "Female"
                : "Other"
          }
          color={colors.fill}
          bg={colors.bg}
        >
          <CircleUser className="h-4 w-4" />
        </BottomPill>

        <BottomPill
          label={member.isAlive ? "Living" : "Deceased"}
          color={member.isAlive ? "#22c55e" : "#6b7280"}
          bg={member.isAlive ? "#dcfce7" : "#f3f4f6"}
        >
          {member.isAlive ? (
            <HeartPulse className="h-4 w-4" />
          ) : (
            <HeartOff className="h-4 w-4" />
          )}
        </BottomPill>

        {member.generation !== null && member.generation !== undefined && (
          <BottomPill
            label={`Gen ${member.generation}`}
            color="#f59e0b"
            bg="#fef3c7"
          >
            <Layers className="h-4 w-4" />
          </BottomPill>
        )}

        {member.familyClan && (
          <BottomPill label={member.familyClan} color="#8b5cf6" bg="#ede9fe">
            <Shield className="h-4 w-4" />
          </BottomPill>
        )}
      </div>
    </>
  );
}

/* ── Sub-components ── */

function StatCard({
  value,
  label,
  color,
  bg,
}: {
  value: number;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      className="flex-1 flex flex-col items-center py-3 px-2 rounded-xl border border-zinc-100 dark:border-zinc-800 transition-all duration-300 hover:scale-[1.04] hover:shadow-md cursor-default"
      style={{
        background: `linear-gradient(135deg, ${bg}60, ${bg}30)`,
      }}
    >
      <span
        className="text-2xl font-black tabular-nums leading-none"
        style={{ color }}
      >
        {value}
      </span>
      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-1.5 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function BottomPill({
  children,
  label,
  color,
  bg,
}: {
  children: React.ReactNode;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 group">
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
        style={{
          background: `${bg}`,
          color: color,
          boxShadow: `0 2px 8px ${color}15`,
        }}
      >
        {children}
      </div>
      <span
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}
