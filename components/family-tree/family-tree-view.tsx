"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import type {
  FamilyTreeMember,
  TreeLayout,
  TreeFilter,
} from "@/types/family-tree";
import { defaultTreeFilter } from "@/types/family-tree";
import {
  membersToTreeNodes,
  getMatchingNodeIds,
  searchNodeIds,
} from "@/lib/family-tree-utils";
import { TreeCanvas } from "./tree-canvas";
import { TreeControls } from "./tree-controls";
import { TreeSearch } from "./tree-search";
import { TreeFilters } from "./tree-filters";
import { TreeLegend } from "./tree-legend";
import { MemberProfileView } from "./member-profile-view";
import { JoinTreeForm } from "./join-tree-form";
import { AddRelativeForm } from "./add-relative-form";
import { EditMemberForm } from "./edit-member-form";
import type { TreeNode } from "@/types/family-tree";
import { TreePine, Users } from "lucide-react";
import type { FamilyEdgeData } from "@/types/family-tree";

interface UserState {
  isResident: boolean;
  isInTree: boolean;
  isAdmin: boolean;
  internalUserId: string | null;
}

interface FamilyTreeViewProps {
  nodes: FamilyTreeMember[];
  edges: FamilyEdgeData[];
  clans: string[];
  generationRange: { min: number; max: number };
  currentUserNode?: any;
  userState?: UserState;
}

export function FamilyTreeView({
  nodes,
  edges,
  clans,
  generationRange,
  currentUserNode,
  userState,
}: FamilyTreeViewProps) {
  const [layout, setLayout] = useState<TreeLayout>("vertical");
  const [filter, setFilter] = useState<TreeFilter>({
    ...defaultTreeFilter,
    clan: currentUserNode?.familyClan || "",
  });
  const [selectedMember, setSelectedMember] = useState<TreeNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Form dialog states
  const [addRelativeTarget, setAddRelativeTarget] = useState<TreeNode | null>(
    null
  );
  const [editMemberTarget, setEditMemberTarget] = useState<TreeNode | null>(
    null
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    zoomToNode: (id: string, customScale?: number) => void;
    fitToScreen: () => void;
    exportToPng: () => Promise<void>;
    exportToSvg: () => Promise<void>;
    exportToPdf: () => Promise<void>;
  } | null>(null);

  // Map raw DB members to TreeNodes combining names and birth years
  const allNodes = useMemo(() => membersToTreeNodes(nodes), [nodes]);

  const matchingIds = useMemo(
    () => getMatchingNodeIds(allNodes, filter),
    [allNodes, filter]
  );

  // Only render nodes that structurally belong to the active Clan (hides other clans entirely)
  // We DO NOT filter this structurally by Generation or Gender, because doing so deletes
  // relationship edges between parents & children, completely breaking the tree topology.
  const filteredNodes = useMemo(() => {
    // Start with nodes that match the structural clan filter
    const clanMatchIds = new Set(
      allNodes
        .filter((n) => !filter.clan || n.familyClan === filter.clan)
        .map((n) => n.id)
    );

    // Expand to include connected cross-clan members (one-hop through edges)
    // This ensures e.g. Uma Devi's father from Siwakoti clan shows up in Luitel tree
    if (filter.clan) {
      const connectedIds = new Set<string>();
      for (const edge of edges) {
        if (
          clanMatchIds.has(edge.fromNodeId) &&
          !clanMatchIds.has(edge.toNodeId)
        ) {
          connectedIds.add(edge.toNodeId);
        }
        if (
          clanMatchIds.has(edge.toNodeId) &&
          !clanMatchIds.has(edge.fromNodeId)
        ) {
          connectedIds.add(edge.fromNodeId);
        }
      }
      // Add connected cross-clan nodes to the set
      connectedIds.forEach((id) => clanMatchIds.add(id));
    }

    return allNodes.filter((n) => clanMatchIds.has(n.id));
  }, [allNodes, edges, filter.clan]);

  // Only keep edges where both endpoints are in the filtered set
  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    return edges.filter(
      (e) => nodeIds.has(e.fromNodeId) && nodeIds.has(e.toNodeId)
    );
  }, [filteredNodes, edges]);

  const searchMatchIds = useMemo(
    () => searchNodeIds(filteredNodes, filter.searchQuery),
    [filteredNodes, filter.searchQuery]
  );
  const searchMatchCount = useMemo(
    () => (filter.searchQuery ? searchMatchIds.size : filteredNodes.length),
    [filter.searchQuery, searchMatchIds, filteredNodes]
  );

  const generations = useMemo(() => {
    const arr: number[] = [];
    for (let i = generationRange.min; i <= generationRange.max; i++)
      arr.push(i);
    return arr;
  }, [generationRange]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  const navigateToMember = useCallback(
    (id: string) => {
      const target = filteredNodes.find((n) => n.id === id);
      if (target) {
        setSelectedMember(target);
        if (zoomRef.current && (zoomRef.current as any).zoomToNode) {
          (zoomRef.current as any).zoomToNode(id);
        }
      }
    },
    [filteredNodes]
  );

  // Determine if the "Join Tree" button should show
  const showJoinButton =
    userState &&
    userState.internalUserId &&
    (userState.isResident || userState.isAdmin) &&
    !userState.isInTree;

  // Can add/edit
  const canModify = userState && (userState.isInTree || userState.isAdmin);

  // Empty state
  if (allNodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-800/30 dark:to-teal-800/30 p-8 mb-5">
          <TreePine className="h-14 w-14 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">No Family Members Yet</h3>
        <p className="text-sm text-zinc-500 max-w-sm mb-4">
          Family members will appear here once they are added and approved.
        </p>
        {showJoinButton && <JoinTreeForm clans={clans} />}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-stone-50 dark:bg-zinc-800"
    >
      {/* ─ Header ─ */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-stone-200 dark:border-zinc-700 bg-stone-50/90 dark:bg-zinc-800/90 backdrop-blur-sm flex-wrap shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-500/20">
            <img src="/logo.svg" alt="Logo" className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Family Tree
            </h1>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
              Tumin Dhanbari Village
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Users className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              {filteredNodes.length} members
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {showJoinButton && <JoinTreeForm clans={clans} />}
          <TreeSearch
            value={filter.searchQuery}
            onChange={(q) => {
              setFilter({ ...filter, searchQuery: q });
            }}
            matchCount={searchMatchCount}
          />
        </div>
      </div>

      {/* ─ Filter bar ─ */}
      <div className="px-5 py-2 border-b border-stone-200 dark:border-zinc-700/50 bg-stone-100/50 dark:bg-zinc-700/50 shrink-0">
        <TreeFilters
          filter={filter}
          onFilterChange={setFilter}
          clans={clans}
          generations={generations}
          totalCount={allNodes.length}
          matchCount={matchingIds.size}
        />
      </div>

      {/* ─ Canvas (always visible) ─ */}
      <div className="relative flex-1 overflow-hidden bg-linear-to-b from-stone-100/80 to-stone-50 dark:from-zinc-700/50 dark:to-zinc-800">
        <TreeCanvas
          allNodes={filteredNodes}
          edges={filteredEdges}
          layout={layout}
          matchingIds={matchingIds}
          searchMatchIds={searchMatchIds}
          hasHighlightFilter={
            filter.generation !== null ||
            filter.gender !== null ||
            !filter.showLiving ||
            !filter.showDeceased
          }
          onNodeClick={setSelectedMember}
          zoomRef={zoomRef}
          currentUserNode={currentUserNode}
        />
        <TreeLegend />
        <TreeControls
          layout={layout}
          onLayoutChange={setLayout}
          onZoomIn={() => zoomRef.current?.zoomIn()}
          onZoomOut={() => zoomRef.current?.zoomOut()}
          onResetZoom={() => zoomRef.current?.resetZoom()}
          onFitToScreen={() => zoomRef.current?.fitToScreen()}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onExportPng={() => zoomRef.current?.exportToPng()}
          onExportSvg={() => zoomRef.current?.exportToSvg()}
          onExportPdf={() => zoomRef.current?.exportToPdf()}
        />
      </div>

      {/* ─ Floating modal overlay ─ */}
      {selectedMember && (
        <MemberProfileView
          member={selectedMember}
          allNodes={allNodes}
          edges={edges}
          onClose={() => setSelectedMember(null)}
          onNavigateToMember={navigateToMember}
          canModify={!!canModify}
          isAdmin={!!userState?.isAdmin}
          currentUserClan={currentUserNode?.familyClan ?? null}
          onAddRelative={(node: TreeNode) => {
            setSelectedMember(null);
            setAddRelativeTarget(node);
          }}
          onEditMember={(node: TreeNode) => {
            setSelectedMember(null);
            setEditMemberTarget(node);
          }}
        />
      )}

      {/* ─ Add Relative Dialog ─ */}
      {addRelativeTarget && (
        <AddRelativeForm
          open={!!addRelativeTarget}
          onOpenChange={(open) => !open && setAddRelativeTarget(null)}
          targetNode={addRelativeTarget}
          clans={clans}
        />
      )}

      {/* ─ Edit Member Dialog ─ */}
      {editMemberTarget && (
        <EditMemberForm
          open={!!editMemberTarget}
          onOpenChange={(open) => !open && setEditMemberTarget(null)}
          member={editMemberTarget}
        />
      )}
    </div>
  );
}
