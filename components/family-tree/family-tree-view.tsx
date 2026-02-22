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
  buildHierarchyRoots,
  getMatchingNodeIds,
  searchNodeIds,
} from "@/lib/family-tree-utils";
import { TreeCanvas } from "./tree-canvas";
import { TreeControls } from "./tree-controls";
import { TreeSearch } from "./tree-search";
import { TreeFilters } from "./tree-filters";
import { TreeLegend } from "./tree-legend";
import { MemberProfileView } from "./member-profile-view";
import type { TreeNode } from "@/types/family-tree";
import { TreePine, Users } from "lucide-react";

interface FamilyTreeViewProps {
  members: FamilyTreeMember[];
  clans: string[];
  generationRange: { min: number; max: number };
}

export function FamilyTreeView({
  members,
  clans,
  generationRange,
}: FamilyTreeViewProps) {
  const [layout, setLayout] = useState<TreeLayout>("vertical");
  const [filter, setFilter] = useState<TreeFilter>(defaultTreeFilter);
  const [selectedMember, setSelectedMember] = useState<TreeNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    fitToScreen: () => void;
    exportToPng: () => Promise<void>;
    exportToSvg: () => Promise<void>;
    exportToPdf: () => Promise<void>;
  } | null>(null);

  const allNodes = useMemo(() => membersToTreeNodes(members), [members]);
  const roots = useMemo(() => buildHierarchyRoots(allNodes), [allNodes]);

  const matchingIds = useMemo(
    () => getMatchingNodeIds(allNodes, filter),
    [allNodes, filter]
  );
  const searchMatchIds = useMemo(
    () => searchNodeIds(allNodes, filter.searchQuery),
    [allNodes, filter.searchQuery]
  );
  const searchMatchCount = useMemo(
    () => (filter.searchQuery ? searchMatchIds.size : allNodes.length),
    [filter.searchQuery, searchMatchIds, allNodes]
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
      const target = allNodes.find((n) => n.id === id);
      if (target) setSelectedMember(target);
    },
    [allNodes]
  );

  // Empty state
  if (allNodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-8 mb-5">
          <TreePine className="h-14 w-14 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">No Family Members Yet</h3>
        <p className="text-sm text-zinc-500 max-w-sm">
          Family members will appear here once they are added and approved.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-white dark:bg-zinc-950"
    >
      {/* ─ Header ─ */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm flex-wrap shrink-0">
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
              {allNodes.length} members
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <TreeSearch
            value={filter.searchQuery}
            onChange={(q) => setFilter({ ...filter, searchQuery: q })}
            matchCount={searchMatchCount}
          />
        </div>
      </div>

      {/* ─ Filter bar ─ */}
      <div className="px-5 py-2 border-b border-zinc-50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
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
      <div className="relative flex-1 overflow-hidden bg-gradient-to-b from-zinc-50/80 to-white dark:from-zinc-900/50 dark:to-zinc-950">
        <TreeCanvas
          roots={roots}
          allNodes={allNodes}
          layout={layout}
          matchingIds={matchingIds}
          searchMatchIds={searchMatchIds}
          onNodeClick={setSelectedMember}
          zoomRef={zoomRef}
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
          onClose={() => setSelectedMember(null)}
          onNavigateToMember={navigateToMember}
        />
      )}
    </div>
  );
}
