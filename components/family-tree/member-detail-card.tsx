"use client";

import { useMemo } from "react";
import {
  X,
  Heart,
  TreePine,
  Calendar,
  UserRound,
  Sparkles,
  ChevronRight,
  Crown,
  Baby,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { TreeNode } from "@/types/family-tree";
import { getNodeColor, getInitials } from "@/lib/family-tree-utils";

interface MemberDetailCardProps {
  member: TreeNode;
  allNodes: TreeNode[];
  onClose: () => void;
  onNavigateToMember: (id: string) => void;
}

export function MemberDetailCard({
  member,
  allNodes,
  onClose,
  onNavigateToMember,
}: MemberDetailCardProps) {
  const colors = getNodeColor(member.gender, member.isAlive);

  /* ── Derive full relations from allNodes ── */
  const relations = useMemo(() => {
    const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

    // Parents: father(s) and mother(s) — gather from direct IDs
    const fathers: TreeNode[] = [];
    const mothers: TreeNode[] = [];
    if (member.fatherId && nodeMap.has(member.fatherId))
      fathers.push(nodeMap.get(member.fatherId)!);
    if (member.motherId && nodeMap.has(member.motherId))
      mothers.push(nodeMap.get(member.motherId)!);

    // Spouses: anyone whose spouseId points to this member, OR this member's spouseId
    const spouseSet = new Set<string>();
    if (member.spouseId) spouseSet.add(member.spouseId);
    allNodes.forEach((n) => {
      if (n.spouseId === member.id) spouseSet.add(n.id);
    });
    const spouses = Array.from(spouseSet)
      .map((id) => nodeMap.get(id))
      .filter(Boolean) as TreeNode[];

    // Children: anyone whose fatherId or motherId is this member
    const children = allNodes.filter(
      (n) => n.fatherId === member.id || n.motherId === member.id
    );
    const sons = children.filter((c) => c.gender === "MALE");
    const daughters = children.filter((c) => c.gender === "FEMALE");
    const otherChildren = children.filter(
      (c) => c.gender !== "MALE" && c.gender !== "FEMALE"
    );

    // Siblings: share the same father or mother
    const siblings = allNodes.filter(
      (n) =>
        n.id !== member.id &&
        ((member.fatherId && n.fatherId === member.fatherId) ||
          (member.motherId && n.motherId === member.motherId))
    );

    return {
      fathers,
      mothers,
      spouses,
      sons,
      daughters,
      otherChildren,
      siblings,
    };
  }, [member, allNodes]);

  const age = (() => {
    if (!member.birthYear) return null;
    if (member.deathYear) return member.deathYear - member.birthYear;
    return new Date().getFullYear() - member.birthYear;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-[420px] max-h-[85vh] rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-300 flex flex-col">
        {/* ─ Hero Banner ─ */}
        <div
          className="relative h-32 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${colors.fill}, ${colors.stroke})`,
          }}
        >
          {/* Decorative shapes */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute top-4 left-12 w-16 h-16 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-white/[0.07]" />

          {/* Status badges */}
          <div className="absolute top-3.5 left-4 flex items-center gap-1.5">
            <Badge className="bg-white/20 text-white border-white/30 text-[10px] font-semibold backdrop-blur-sm px-2 py-0.5">
              {member.gender === "MALE"
                ? "♂ Male"
                : member.gender === "FEMALE"
                  ? "♀ Female"
                  : "⚧ Other"}
            </Badge>
            {!member.isAlive && (
              <Badge className="bg-black/25 text-white border-white/15 text-[10px] backdrop-blur-sm px-2 py-0.5">
                Deceased
              </Badge>
            )}
            {member.generation !== null && (
              <Badge className="bg-white/15 text-white border-white/20 text-[10px] backdrop-blur-sm px-2 py-0.5">
                Gen {member.generation}
              </Badge>
            )}
          </div>

          {/* Close */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full text-white/70 hover:text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Avatar */}
          <div className="absolute -bottom-11 left-1/2 -translate-x-1/2">
            <div
              className="w-[88px] h-[88px] rounded-[22px] flex items-center justify-center text-2xl font-bold text-white shadow-xl border-[5px] border-white dark:border-zinc-900"
              style={{
                background: `linear-gradient(135deg, ${colors.fill}, ${colors.stroke})`,
              }}
            >
              {getInitials(member.firstName, member.lastName)}
            </div>
          </div>
        </div>

        {/* ─ Scrollable body ─ */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <div className="pt-14 pb-6 px-5">
            {/* Name & age */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                {member.name}
              </h3>
              <div className="flex items-center justify-center gap-1.5 mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                {member.birthYear && (
                  <>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {member.isAlive
                        ? `Born ${member.birthYear}`
                        : `${member.birthYear} — ${member.deathYear}`}
                    </span>
                  </>
                )}
                {age !== null && (
                  <span className="text-zinc-400 dark:text-zinc-500">
                    · {member.isAlive ? `${age} yrs` : `Lived ${age} yrs`}
                  </span>
                )}
              </div>
            </div>

            {/* Info pills row */}
            {member.familyClan && (
              <div className="flex justify-center mb-5">
                <InfoPill
                  icon={TreePine}
                  text={`Clan: ${member.familyClan}`}
                  color={colors.fill}
                />
              </div>
            )}

            {/* ═══ Relations Sections ═══ */}
            <div className="space-y-1">
              {/* Parents */}
              {(relations.fathers.length > 0 ||
                relations.mothers.length > 0) && (
                <RelationSection
                  title="Parents"
                  icon={Crown}
                  accentColor="#6366f1"
                >
                  {relations.fathers.map((f) => (
                    <PersonRow
                      key={f.id}
                      node={f}
                      tag="Father"
                      onClick={() => onNavigateToMember(f.id)}
                    />
                  ))}
                  {relations.mothers.map((m) => (
                    <PersonRow
                      key={m.id}
                      node={m}
                      tag="Mother"
                      onClick={() => onNavigateToMember(m.id)}
                    />
                  ))}
                </RelationSection>
              )}

              {/* Spouse(s) */}
              {relations.spouses.length > 0 && (
                <RelationSection
                  title={relations.spouses.length > 1 ? "Spouses" : "Spouse"}
                  icon={Heart}
                  accentColor="#ec4899"
                >
                  {relations.spouses.map((s) => (
                    <PersonRow
                      key={s.id}
                      node={s}
                      tag={s.isAlive ? "" : "Deceased"}
                      onClick={() => onNavigateToMember(s.id)}
                    />
                  ))}
                </RelationSection>
              )}

              {/* Sons */}
              {relations.sons.length > 0 && (
                <RelationSection
                  title={`Sons (${relations.sons.length})`}
                  icon={Baby}
                  accentColor="#3b82f6"
                >
                  {relations.sons.map((c) => (
                    <PersonRow
                      key={c.id}
                      node={c}
                      tag={c.isAlive ? "" : "Deceased"}
                      onClick={() => onNavigateToMember(c.id)}
                    />
                  ))}
                </RelationSection>
              )}

              {/* Daughters */}
              {relations.daughters.length > 0 && (
                <RelationSection
                  title={`Daughters (${relations.daughters.length})`}
                  icon={Baby}
                  accentColor="#ec4899"
                >
                  {relations.daughters.map((c) => (
                    <PersonRow
                      key={c.id}
                      node={c}
                      tag={c.isAlive ? "" : "Deceased"}
                      onClick={() => onNavigateToMember(c.id)}
                    />
                  ))}
                </RelationSection>
              )}

              {/* Other children */}
              {relations.otherChildren.length > 0 && (
                <RelationSection
                  title={`Other Children (${relations.otherChildren.length})`}
                  icon={Baby}
                  accentColor="#8b5cf6"
                >
                  {relations.otherChildren.map((c) => (
                    <PersonRow
                      key={c.id}
                      node={c}
                      tag=""
                      onClick={() => onNavigateToMember(c.id)}
                    />
                  ))}
                </RelationSection>
              )}

              {/* Siblings */}
              {relations.siblings.length > 0 && (
                <RelationSection
                  title={`Siblings (${relations.siblings.length})`}
                  icon={Sparkles}
                  accentColor="#f59e0b"
                >
                  {relations.siblings.map((s) => (
                    <PersonRow
                      key={s.id}
                      node={s}
                      tag={
                        s.gender === "MALE"
                          ? "Brother"
                          : s.gender === "FEMALE"
                            ? "Sister"
                            : ""
                      }
                      onClick={() => onNavigateToMember(s.id)}
                    />
                  ))}
                </RelationSection>
              )}
            </div>

            {/* Bio */}
            {member.bio && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5">
                    About
                  </p>
                  <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function InfoPill({
  icon: Icon,
  text,
  color,
}: {
  icon: React.ElementType;
  text: string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
      style={{
        backgroundColor: `${color}12`,
        color: color,
        border: `1px solid ${color}22`,
      }}
    >
      <Icon className="h-3.5 w-3.5" />
      {text}
    </div>
  );
}

function RelationSection({
  title,
  icon: Icon,
  accentColor,
  children,
}: {
  title: string;
  icon: React.ElementType;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
      {/* Section header */}
      <div
        className="flex items-center gap-2 px-3.5 py-2"
        style={{ backgroundColor: `${accentColor}08` }}
      >
        <div
          className="h-6 w-6 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: accentColor }} />
        </div>
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 tracking-tight">
          {title}
        </span>
      </div>
      {/* Items */}
      <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
        {children}
      </div>
    </div>
  );
}

function PersonRow({
  node,
  tag,
  onClick,
}: {
  node: TreeNode;
  tag: string;
  onClick: () => void;
}) {
  const c = getNodeColor(node.gender, node.isAlive);
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 group"
    >
      {/* Mini avatar */}
      <div
        className="h-8 w-8 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${c.fill}, ${c.stroke})`,
        }}
      >
        {getInitials(node.firstName, node.lastName)}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {node.name}
        </p>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
          {node.birthYear ? `b. ${node.birthYear}` : ""}
          {tag ? ` · ${tag}` : ""}
          {node.familyClan ? ` · ${node.familyClan}` : ""}
        </p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 transition-colors shrink-0" />
    </button>
  );
}
