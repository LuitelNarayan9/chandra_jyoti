"use client";

import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { select, Selection } from "d3-selection";
import { color } from "d3-color";
import "d3-transition";
import { line, curveMonotoneY } from "d3-shape";
import { zoom, zoomIdentity, ZoomBehavior, ZoomTransform } from "d3-zoom";
import { easeElasticOut, easeCubicOut, easeCubicInOut } from "d3-ease";
import { interpolate } from "d3-interpolate";
import {
  graphStratify,
  sugiyama,
  layeringSimplex,
  decrossTwoLayer,
  coordQuad,
} from "d3-dag";
import type { TreeNode, TreeLayout, FamilyEdgeData } from "@/types/family-tree";
import { getNodeColor, getInitials } from "@/lib/family-tree-utils";
import { calculateKinship } from "@/lib/kinship-calculator";
import {
  exportTreeToPng,
  exportTreeToSvg,
  exportTreeToPdf,
} from "@/lib/tree-export-utils";

// Constants for node geometry (Classic Block Style)
const NODE_W = 160;
const NODE_H = 220;
const H_GAP = 60;
const V_SPACING = 80;
const TRANSITION_MS = 600;

// Helper to determine relative relationship title visually
function getRelationTitle(node: TreeNode, edges: FamilyEdgeData[]) {
  const hasChildren = edges.some(
    (e) =>
      e.fromNodeId === node.id &&
      (e.type === "PARENT_CHILD" || e.type === "ADOPTION")
  );
  const hasParents = edges.some(
    (e) =>
      e.toNodeId === node.id &&
      (e.type === "PARENT_CHILD" || e.type === "ADOPTION")
  );
  const hasSpouse = edges.some(
    (e) =>
      (e.fromNodeId === node.id || e.toNodeId === node.id) &&
      (e.type === "SPOUSE" || e.type === "DIVORCED_SPOUSE")
  );

  if (hasChildren && !hasParents)
    return node.gender === "MALE" ? "Grandfather" : "Grandmother";
  if (hasChildren && hasParents)
    return node.gender === "MALE" ? "Father" : "Mother";
  if (!hasChildren && hasParents)
    return node.gender === "MALE" ? "Son" : "Daughter";
  if (hasSpouse) return node.gender === "MALE" ? "Husband" : "Wife";
  return node.gender === "MALE" ? "Member" : "Member";
}

// Helper to intelligently split long text into up to 2 lines
function splitTextOptimal(text: string, maxLen: number): string[] {
  if (!text) return [""];
  if (text.length <= maxLen) return [text];

  // Try finding a clean word boundary near the middle
  const words = text.split(" ");
  if (words.length === 1) {
    return [
      text.slice(0, maxLen),
      text.slice(maxLen, maxLen * 2 - 2) +
        (text.length > maxLen * 2 ? "…" : ""),
    ];
  }

  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if (currentLine.length + word.length + 1 <= maxLen) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);

  if (lines.length > 2) {
    return [lines[0], lines[1].slice(0, maxLen - 2) + "…"];
  }

  if (lines[1] && lines[1].length > maxLen) {
    lines[1] = lines[1].slice(0, maxLen - 2) + "…";
  }
  return lines;
}

interface TreeCanvasProps {
  allNodes: TreeNode[];
  edges: FamilyEdgeData[];
  layout: TreeLayout;
  matchingIds: Set<string>;
  searchMatchIds: Set<string>;
  onNodeClick: (node: TreeNode) => void;
  zoomRef: React.MutableRefObject<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    zoomToNode: (id: string, customScale?: number) => void;
    fitToScreen: () => void;
    exportToPng: () => Promise<void>;
    exportToSvg: () => Promise<void>;
    exportToPdf: () => Promise<void>;
  } | null>;
  hasHighlightFilter?: boolean;
  currentUserNode?: any;
}

/* ═══════════════════════════════════════
 *  COMPONENT
 * ═══════════════════════════════════════ */

export function TreeCanvas({
  allNodes,
  edges,
  layout,
  matchingIds,
  searchMatchIds,
  hasHighlightFilter = false,
  onNodeClick,
  zoomRef,
  currentUserNode,
}: TreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(
    null
  );
  const [dimensions, setDimensions] = useState({ width: 1200, height: 700 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setDimensions({ width, height });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const applyZoom = useCallback((transform: ZoomTransform) => {
    const svg = svgRef.current;
    if (!svg || !zoomBehaviorRef.current) return;
    select(svg)
      .transition()
      .duration(500)
      .ease(easeCubicInOut)
      .call(zoomBehaviorRef.current.transform, transform);
  }, []);

  useEffect(() => {
    zoomRef.current = {
      zoomIn: () => {
        const svg = svgRef.current;
        if (!svg || !zoomBehaviorRef.current) return;
        select(svg)
          .transition()
          .duration(300)
          .call(zoomBehaviorRef.current.scaleBy, 1.4);
      },
      zoomOut: () => {
        const svg = svgRef.current;
        if (!svg || !zoomBehaviorRef.current) return;
        select(svg)
          .transition()
          .duration(300)
          .call(zoomBehaviorRef.current.scaleBy, 0.7);
      },
      resetZoom: () => applyZoom(zoomIdentity),
      zoomToNode: (id: string, customScale?: number) => {
        const nodeG = svgRef.current?.querySelector(
          `[data-node-id="${id}"]`
        ) as SVGGElement;
        if (nodeG) {
          const transform = nodeG.getAttribute("transform");
          if (transform) {
            const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
            if (match) {
              const x = parseFloat(match[1]);
              const y = parseFloat(match[2]);
              const svg = svgRef.current;
              if (!svg || !zoomBehaviorRef.current) return;
              const scale = customScale ?? 1.2;
              const tx = dimensions.width / 2 - x * scale;
              const ty = dimensions.height / 2 - y * scale;
              applyZoom(zoomIdentity.translate(tx, ty).scale(scale));
            }
          }
        }
      },
      fitToScreen: () => {
        const g = gRef.current;
        const svg = svgRef.current;
        if (!g || !svg || !zoomBehaviorRef.current) return;
        const bounds = g.getBBox();
        const { width, height } = dimensions;
        const pad = 40;
        const scale = Math.max(
          0.15,
          Math.min(
            (width - pad * 2) / bounds.width,
            (height - pad * 2) / bounds.height,
            1.0
          )
        );
        const tx = width / 2 - (bounds.x + bounds.width / 2) * scale;
        const ty = height / 2 - (bounds.y + bounds.height / 2) * scale;
        applyZoom(zoomIdentity.translate(tx, ty).scale(scale));
      },
      exportToPng: async () => {
        if (!svgRef.current || !gRef.current || !zoomBehaviorRef.current)
          return;
        await exportTreeToPng({
          svg: svgRef.current,
          g: gRef.current,
          zoomBehavior: zoomBehaviorRef.current,
          isDark: document.documentElement.classList.contains("dark"),
        });
      },
      exportToSvg: async () => {
        if (!svgRef.current || !gRef.current || !zoomBehaviorRef.current)
          return;
        await exportTreeToSvg({
          svg: svgRef.current,
          g: gRef.current,
          zoomBehavior: zoomBehaviorRef.current,
          isDark: document.documentElement.classList.contains("dark"),
        });
      },
      exportToPdf: async () => {
        if (!svgRef.current || !gRef.current || !zoomBehaviorRef.current)
          return;
        await exportTreeToPdf({
          svg: svgRef.current,
          g: gRef.current,
          zoomBehavior: zoomBehaviorRef.current,
          isDark: document.documentElement.classList.contains("dark"),
        });
      },
    };
  }, [applyZoom, dimensions, zoomRef]);

  /* ═══════════════════════════════════
   *  MAIN D3 RENDER
   * ═══════════════════════════════════ */
  const nodesMap = useMemo(() => {
    const map = new Map<string, TreeNode>();
    allNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [allNodes]);

  useEffect(() => {
    const svg = select(svgRef.current!);
    const { width, height } = dimensions;
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    svg.selectAll("g.tree-root").remove();
    svg.selectAll("defs").remove();

    const defs = svg.append("defs");
    const shadow = defs
      .append("filter")
      .attr("id", "card-shadow")
      .attr("x", "-25%")
      .attr("y", "-25%")
      .attr("width", "150%")
      .attr("height", "150%");
    shadow
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 3)
      .attr("stdDeviation", 6)
      .attr("flood-color", "rgba(0,0,0,0.12)");

    const glow = defs
      .append("filter")
      .attr("id", "search-glow")
      .attr("x", "-30%")
      .attr("y", "-30%")
      .attr("width", "160%")
      .attr("height", "160%");
    glow
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("stdDeviation", 10)
      .attr("flood-color", "#f59e0b")
      .attr("flood-opacity", 0.8);

    /* ── Build DAG using Family Units (Spouses locked together) ── */
    interface FamilyUnit {
      id: string;
      nodes: any[];
      parentIds: string[];
      width: number;
    }

    // 1. Group nodes into Family Units (Connected Components of SPOUSE edges)
    const spouseAdj = new Map<string, string[]>();
    allNodes.forEach((n) => spouseAdj.set(n.id, []));

    edges.forEach((e) => {
      if (e.type === "SPOUSE" || e.type === "DIVORCED_SPOUSE") {
        spouseAdj.get(e.fromNodeId)?.push(e.toNodeId);
        spouseAdj.get(e.toNodeId)?.push(e.fromNodeId);
      }
    });

    const unitVisited = new Set<string>();
    const units: FamilyUnit[] = [];
    const nodeToUnit = new Map<string, FamilyUnit>();

    allNodes.forEach((n) => {
      if (!unitVisited.has(n.id)) {
        const component: any[] = [];
        const queue = [n.id];
        unitVisited.add(n.id);

        while (queue.length > 0) {
          const curr = queue.shift()!;
          const found = allNodes.find((an) => an.id === curr);
          if (found) component.push(found);

          (spouseAdj.get(curr) || []).forEach((neighbor) => {
            if (!unitVisited.has(neighbor)) {
              unitVisited.add(neighbor);
              queue.push(neighbor);
            }
          });
        }

        // Sort component to keep males roughly on the left, females on right
        component.sort((a, b) => {
          if (a.gender !== b.gender) return a.gender === "MALE" ? -1 : 1;
          return 0;
        });

        const uId =
          "UNIT_" +
          component
            .map((c) => c.id)
            .sort()
            .join("_");
        const newUnit: FamilyUnit = {
          id: uId,
          nodes: component,
          parentIds: [],
          width: component.length * NODE_W + (component.length - 1) * H_GAP,
        };
        units.push(newUnit);
        component.forEach((c) => nodeToUnit.set(c.id, newUnit));
      }
    });

    // 2. Map Parent/Child relationships between Units
    // Cross-clan edges are excluded from the DAG so different clans render separately
    interface CrossClanEdge {
      fromNodeId: string;
      toNodeId: string;
      type: string;
    }
    const crossClanEdges: CrossClanEdge[] = [];

    edges.forEach((e) => {
      if (e.type === "PARENT_CHILD" || e.type === "ADOPTION") {
        const parentNode = allNodes.find((n) => n.id === e.fromNodeId);
        const childNode = allNodes.find((n) => n.id === e.toNodeId);

        // If parent and child are from different clans, store as cross-clan edge
        if (
          parentNode &&
          childNode &&
          parentNode.familyClan &&
          childNode.familyClan &&
          parentNode.familyClan !== childNode.familyClan
        ) {
          crossClanEdges.push({
            fromNodeId: e.fromNodeId,
            toNodeId: e.toNodeId,
            type: e.type,
          });
          return; // Skip adding to DAG
        }

        const pUnit = nodeToUnit.get(e.fromNodeId);
        const cUnit = nodeToUnit.get(e.toNodeId);
        if (pUnit && cUnit && pUnit.id !== cUnit.id) {
          if (!cUnit.parentIds.includes(pUnit.id)) {
            cUnit.parentIds.push(pUnit.id);
          }
        }
      }
    });

    // 3. Separate into isolated Clans (Connected Components of UNITS)
    const unitAdj = new Map<string, string[]>();
    units.forEach((u) => unitAdj.set(u.id, []));
    units.forEach((u) => {
      u.parentIds.forEach((pid) => {
        unitAdj.get(u.id)!.push(pid);
        unitAdj.get(pid)!.push(u.id);
      });
    });

    const clanVisited = new Set<string>();
    const clans: FamilyUnit[][] = [];

    units.forEach((u) => {
      if (!clanVisited.has(u.id)) {
        const clan: FamilyUnit[] = [];
        const q = [u.id];
        clanVisited.add(u.id);
        while (q.length > 0) {
          const curr = q.shift()!;
          const currUnit = units.find((un) => un.id === curr)!;
          clan.push(currUnit);
          unitAdj.get(curr)!.forEach((neighbor) => {
            if (!clanVisited.has(neighbor)) {
              clanVisited.add(neighbor);
              q.push(neighbor);
            }
          });
        }
        clans.push(clan);
      }
    });

    const isolatedNodes: any[] = [];
    const connectedClans: FamilyUnit[][] = [];

    clans.forEach((clan) => {
      if (
        clan.length === 1 &&
        clan[0].nodes.length === 1 &&
        clan[0].parentIds.length === 0
      ) {
        // Just one person, absolutely no edges
        isolatedNodes.push(clan[0].nodes[0]);
      } else {
        connectedClans.push(clan);
      }
    });

    const layoutAlg = sugiyama()
      .layering(layeringSimplex())
      .nodeSize((node: any) => [node.data.width + H_GAP, NODE_H + V_SPACING])
      .decross(decrossTwoLayer())
      .coord(coordQuad());

    const allDagNodes: any[] = [];
    const allDagLinks: any[] = [];
    let currentOffsetX = 0;
    const CLAN_GAP = 200;

    connectedClans.forEach((clanData) => {
      if (clanData.length === 0) return;
      try {
        const clanDag: any = graphStratify()(clanData);
        layoutAlg(clanDag);

        let minX = Infinity;
        let maxX = -Infinity;
        Array.from(clanDag.nodes()).forEach((node: any) => {
          if (node.x !== undefined) {
            const w = node.data.width;
            minX = Math.min(minX, node.x - w / 2);
            maxX = Math.max(maxX, node.x + w / 2);
          }
        });

        if (minX !== Infinity && maxX !== -Infinity) {
          const shiftX = currentOffsetX - minX;
          let shiftY = 0;

          // Attempt to align this clan with an already placed connecting clan
          if (allDagNodes.length > 0) {
            for (const edge of crossClanEdges) {
              const fromInClan = Array.from(clanDag.nodes()).find((n: any) =>
                n.data.nodes.some((nd: any) => nd.id === edge.fromNodeId)
              ) as any;
              const toInClan = Array.from(clanDag.nodes()).find((n: any) =>
                n.data.nodes.some((nd: any) => nd.id === edge.toNodeId)
              ) as any;

              if (fromInClan && !toInClan) {
                // current clan has 'from', find 'to' in placed nodes
                const placedTo = allDagNodes.find((dn: any) =>
                  dn.data.nodes.some((n: any) => n.id === edge.toNodeId)
                );
                if (
                  placedTo &&
                  placedTo.y !== undefined &&
                  fromInClan.y !== undefined
                ) {
                  if (
                    edge.type === "SPOUSE" ||
                    edge.type === "DIVORCED_SPOUSE"
                  ) {
                    shiftY = placedTo.y - fromInClan.y;
                  } else {
                    // from is parent, to is child
                    shiftY = placedTo.y - (NODE_H + V_SPACING) - fromInClan.y;
                  }
                  break;
                }
              } else if (!fromInClan && toInClan) {
                // current clan has 'to', find 'from' in placed nodes
                const placedFrom = allDagNodes.find((dn: any) =>
                  dn.data.nodes.some((n: any) => n.id === edge.fromNodeId)
                );
                if (
                  placedFrom &&
                  placedFrom.y !== undefined &&
                  toInClan.y !== undefined
                ) {
                  if (
                    edge.type === "SPOUSE" ||
                    edge.type === "DIVORCED_SPOUSE"
                  ) {
                    shiftY = placedFrom.y - toInClan.y;
                  } else {
                    // from is parent, to is child
                    shiftY = placedFrom.y + (NODE_H + V_SPACING) - toInClan.y;
                  }
                  break;
                }
              }
            }
          }

          Array.from(clanDag.nodes()).forEach((node: any) => {
            node.x += shiftX;
            if (node.y !== undefined) {
              node.y += shiftY;
            }
            allDagNodes.push(node);
          });

          Array.from(clanDag.links()).forEach((link: any) => {
            if (link.points) {
              link.points.forEach((p: any) => {
                p.x += shiftX;
                if (p.y !== undefined) {
                  p.y += shiftY;
                }
              });
            }
            allDagLinks.push(link);
          });

          currentOffsetX += maxX - minX + CLAN_GAP;
        }
      } catch (err) {
        console.warn("Clan DAG failed:", err);
      }
    });

    // Grid layout for isolated nodes below the main DAG
    // But first: separate cross-clan connected nodes — they go to the LEFT side
    const crossClanConnectedNodeIds = new Set<string>();
    crossClanEdges.forEach((e) => {
      crossClanConnectedNodeIds.add(e.fromNodeId);
      crossClanConnectedNodeIds.add(e.toNodeId);
    });

    const crossClanIsolated: any[] = [];
    const trulyIsolated: any[] = [];
    isolatedNodes.forEach((node) => {
      if (crossClanConnectedNodeIds.has(node.id)) {
        crossClanIsolated.push(node);
      } else {
        trulyIsolated.push(node);
      }
    });

    // Position cross-clan isolated nodes to the RIGHT of the main tree
    // Aligned vertically with the node they connect to
    if (crossClanIsolated.length > 0) {
      const CROSS_CLAN_GAP = 150; // gap between main tree and cross-clan nodes
      let crossClanOffsetX = currentOffsetX + CROSS_CLAN_GAP;

      const unplaced = [...crossClanIsolated];
      // Reset coordinates to be safe
      unplaced.forEach((n) => {
        n.x = undefined;
        n.y = undefined;
      });

      while (unplaced.length > 0) {
        let placedAny = false;

        for (let i = unplaced.length - 1; i >= 0; i--) {
          const node = unplaced[i];
          const ccEdge = crossClanEdges.find(
            (e) => e.fromNodeId === node.id || e.toNodeId === node.id
          );

          if (ccEdge) {
            const connectedId =
              ccEdge.fromNodeId === node.id
                ? ccEdge.toNodeId
                : ccEdge.fromNodeId;
            const connectedDagNode = allDagNodes.find((dn: any) =>
              dn.data.nodes.some((n: any) => n.id === connectedId)
            );

            if (connectedDagNode) {
              const isParent = ccEdge.fromNodeId === node.id;
              node.x = crossClanOffsetX;
              node.y = isParent
                ? connectedDagNode.y - (NODE_H + V_SPACING)
                : connectedDagNode.y + (NODE_H + V_SPACING);
              unplaced.splice(i, 1);
              crossClanOffsetX += NODE_W + H_GAP;
              placedAny = true;
              continue;
            }

            // Check if connected node is another isolated node that was ALREADY placed
            const connectedIso = crossClanIsolated.find(
              (n) => n.id === connectedId && n.y !== undefined
            );
            if (connectedIso) {
              const isParent = ccEdge.fromNodeId === node.id;
              // Inherit the exact same X to ensure a perfectly straight vertical line
              node.x = connectedIso.x;
              node.y = isParent
                ? connectedIso.y - (NODE_H + V_SPACING)
                : connectedIso.y + (NODE_H + V_SPACING);
              unplaced.splice(i, 1);
              placedAny = true;
              // Do not increment offset here, they are stacked vertically
              continue;
            }
          } else {
            // Node has no cross clan edge? Just place it at 0.
            node.x = crossClanOffsetX;
            node.y = 0;
            unplaced.splice(i, 1);
            crossClanOffsetX += NODE_W + H_GAP;
            placedAny = true;
            continue;
          }
        }

        // If we looped through all unplaced nodes and couldn't place ANY of them relative to existing ones,
        // it means we have a completely disconnected cross-clan isolated cluster (like a single Parent-Child pair
        // where neither is part of the main Structural tree).
        // We forcibly root the first one at y=0, and the next iteration will seamlessly attach the rest to it.
        if (!placedAny && unplaced.length > 0) {
          const firstUnplaced = unplaced[0];
          firstUnplaced.x = crossClanOffsetX;
          firstUnplaced.y = 0;
          unplaced.splice(0, 1);
          crossClanOffsetX += NODE_W + H_GAP;
        }
      }
    }

    // Grid layout for truly isolated nodes below the main DAG
    let isolatedStartY = 0;
    if (allDagNodes.length > 0) {
      let maxY = 0;
      allDagNodes.forEach((node: any) => {
        if (node.y !== undefined) maxY = Math.max(maxY, node.y);
      });
      isolatedStartY = Math.max(0, maxY + NODE_H + 150);
    }

    const columns = 10;
    trulyIsolated.forEach((node, idx) => {
      const row = Math.floor(idx / columns);
      const col = idx % columns;
      node.x = col * (NODE_W + H_GAP);
      node.y = isolatedStartY + row * (NODE_H + V_SPACING);
    });

    const g = svg.append("g").attr("class", "tree-root");
    gRef.current = g.node();

    // Add placeholder SVGs to defs
    const svgDefs = svg.select("defs");

    svgDefs
      .append("clipPath")
      .attr("id", "avatar-clip")
      .append("circle")
      .attr("cx", 0)
      .attr("cy", -25)
      .attr("r", 40);

    const maleFallback = svgDefs.append("g").attr("id", "fallback-male");
    maleFallback
      .append("circle")
      .attr("cx", 0)
      .attr("cy", -25)
      .attr("r", 40)
      .attr("fill", "#e2e8f0");
    maleFallback
      .append("circle")
      .attr("cx", 0)
      .attr("cy", -35)
      .attr("r", 14)
      .attr("fill", "#94a3b8");
    maleFallback // Broad shoulders
      .append("path")
      .attr(
        "d",
        "M -22 15 L -22 -2 Q -22 -12 -12 -12 L 12 -12 Q 22 -12 22 -2 L 22 15 Z"
      )
      .attr("fill", "#94a3b8");

    const femaleFallback = svgDefs.append("g").attr("id", "fallback-female");
    femaleFallback
      .append("circle")
      .attr("cx", 0)
      .attr("cy", -25)
      .attr("r", 40)
      .attr("fill", "#e2e8f0");
    femaleFallback
      .append("circle")
      .attr("cx", 0)
      .attr("cy", -36)
      .attr("r", 12)
      .attr("fill", "#94a3b8");
    femaleFallback // A-line dress for distinct female silhouette
      .append("path")
      .attr("d", "M -10 -18 Q 0 -22 10 -18 L 26 15 L -26 15 Z")
      .attr("fill", "#94a3b8");

    // ───────────────────────────────────────────────────────────── */
    /* ───── Draw a portrait card ───── */
    function drawCard(
      parentG: Selection<SVGGElement, unknown, null, undefined>,
      nodeData: any,
      x: number,
      y: number,
      index: number
    ) {
      if (nodeData.isUnion) return;

      const node = allNodes.find((n) => n.id === nodeData.id);
      if (!node) return;

      // Only show relationship labels from the logged-in tree member's perspective
      let relationTitle = "";
      if (currentUserNode?.id) {
        relationTitle = calculateKinship(
          currentUserNode.id,
          node.id,
          nodesMap,
          edges
        );
      }

      const isSearchMatch = searchMatchIds.has(node.id);
      const isFilterMatch = matchingIds.has(node.id);
      const isSearchHL =
        searchMatchIds.size > 0 &&
        searchMatchIds.size < allNodes.length &&
        isSearchMatch;

      let nodeOpacity = 1;
      const hasSearch =
        searchMatchIds.size > 0 && searchMatchIds.size < allNodes.length;

      // Search matching logic: dull out nodes that don't match the current search
      if (hasSearch && !isSearchMatch) {
        nodeOpacity = 0.2;
      } else if (hasHighlightFilter && !isFilterMatch) {
        // Feature filters (generation, gender, etc) dim nodes that don't match
        nodeOpacity = 0.2;
      }

      const cardG = parentG
        .append("g")
        .attr("class", "tree-node")
        .attr("data-node-id", node.id)
        .attr("transform", `translate(${x}, ${y - 10})`)
        .style("cursor", "pointer")
        .attr("opacity", 0);

      cardG
        .transition()
        .duration(TRANSITION_MS)
        .delay(100 + index * 10)
        .ease(easeElasticOut)
        .attr("transform", `translate(${x}, ${y})`)
        .attr("opacity", nodeOpacity);

      let cardFill = "#fafaf9"; // stone-50
      let cardStroke = "#e7e5e4"; // stone-200

      if (node.isAlive === false) {
        cardFill = "#e7e5e4"; // stone-200 for deceased
      }

      if (node.gender === "MALE") {
        cardStroke = "#3b82f6"; // blue-500
      } else if (node.gender === "FEMALE") {
        cardStroke = "#f472b6"; // pink-400
      } else {
        cardStroke = "#8b5cf6"; // violet-500
      }

      if (isSearchHL) {
        cardFill = "#f5f5f4"; // stone-100
      }

      // Main Card Background
      cardG
        .append("rect")
        .attr("x", -NODE_W / 2)
        .attr("y", -NODE_H / 2)
        .attr("width", NODE_W)
        .attr("height", NODE_H)
        .attr("rx", 16)
        .attr("fill", cardFill)
        .attr("stroke", cardStroke)
        .attr("stroke-width", 2)
        .attr("filter", isSearchHL ? "url(#search-glow)" : "url(#card-shadow)");

      // Avatar
      const hasPhoto = !!node.photo;
      if (hasPhoto) {
        cardG
          .append("image")
          .attr("x", -40)
          .attr("y", -65)
          .attr("width", 80)
          .attr("height", 80)
          .attr("href", node.photo)
          .attr("clip-path", "url(#avatar-clip)")
          .attr("preserveAspectRatio", "xMidYMid slice");
      } else {
        cardG
          .append("use")
          .attr(
            "href",
            node.gender === "FEMALE" ? "#fallback-female" : "#fallback-male"
          );
      }

      // Name Text
      const nameLines = splitTextOptimal(node.name || "", 20);
      const nameText = cardG
        .append("text")
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .attr("fill", "#0f172a")
        .attr("font-size", 13)
        .attr("font-weight", 700)
        .attr("font-family", "Inter, system-ui, sans-serif");

      const BaseNameY = nameLines.length > 1 ? 28 : 35;
      nameLines.forEach((line, i) => {
        nameText
          .append("tspan")
          .attr("x", 0)
          .attr("y", BaseNameY + i * 14)
          .attr("dominant-baseline", "central")
          .text(line);
      });

      // Relationship Text (e.g., Mother, Father, etc.)
      const relLines = splitTextOptimal(relationTitle, 24);
      const BaseRelY = nameLines.length > 1 ? 55 : 55; // Pushed nicely down regardless

      const relText = cardG
        .append("text")
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .attr("fill", "#475569") // slate-600
        .attr("font-size", 11)
        .attr("font-weight", 500)
        .attr("font-family", "Inter, system-ui, sans-serif");

      relLines.forEach((line, i) => {
        relText
          .append("tspan")
          .attr("x", 0)
          .attr("y", BaseRelY + i * 13)
          .attr("dominant-baseline", "central")
          .text(line);
      });

      // Lifespan Dates
      const bYear = node.birthYear ? node.birthYear : "?";
      const dYear = node.isAlive
        ? "Present"
        : node.deathYear
          ? node.deathYear
          : "?";

      const lifeSpanY = BaseRelY + (relLines.length > 1 ? 24 : 18);

      cardG
        .append("text")
        .attr("x", 0)
        .attr("y", lifeSpanY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "#64748b") // slate-500
        .attr("font-size", 10)
        .attr("font-weight", 400)
        .attr("dy", "0.5em")
        .attr("font-family", "Inter, system-ui, sans-serif")
        .text(`${bYear} - ${dYear}`);

      cardG
        .on("mouseenter", function () {
          select(this).raise();
          select(this)
            .transition()
            .duration(200)
            .attr("transform", `translate(${x}, ${y}) scale(1.05)`);
          select(this)
            .select("rect")
            .transition()
            .duration(200)
            .attr("stroke-width", 3)
            .attr("filter", "url(#search-glow)");
        })
        .on("mouseleave", function () {
          select(this)
            .transition()
            .duration(200)
            .attr("transform", `translate(${x}, ${y})`);
          select(this)
            .select("rect")
            .transition()
            .duration(200)
            .attr("stroke-width", 2)
            .attr(
              "filter",
              isSearchHL ? "url(#search-glow)" : "url(#card-shadow)"
            );
        })
        .on("click", () => onNodeClick(node));
    }

    /* ───── Draw ───── */
    const linksG = g.append("g").attr("class", "links-layer");
    const nodesG = g.append("g").attr("class", "nodes-layer");
    const crossClanLinksG = g
      .append("g")
      .attr("class", "cross-clan-links-layer");

    // Track node positions for cross-clan edge drawing
    const nodePositions = new Map<string, { x: number; y: number }>();

    for (const link of allDagLinks) {
      const parentUnitNodes = link.source.data.nodes;
      const childUnitNodes = link.target.data.nodes;

      let sourceX = link.source.x;
      let targetX = link.target.x;

      let specificChildIndex = -1;
      let linkType = "PARENT_CHILD";

      for (let i = 0; i < childUnitNodes.length; i++) {
        const cNode = childUnitNodes[i];
        for (let j = 0; j < parentUnitNodes.length; j++) {
          const pNode = parentUnitNodes[j];
          const childEdge = edges.find(
            (e) =>
              (e.type === "PARENT_CHILD" || e.type === "ADOPTION") &&
              e.toNodeId === cNode.id &&
              e.fromNodeId === pNode.id
          );
          if (childEdge) {
            specificChildIndex = i;
            linkType = childEdge.type;
            break;
          }
        }
        if (specificChildIndex !== -1) break;
      }

      // 1. Line ALWAYS drops from the geometric center of the Parents' Marriage Unit
      sourceX = link.source.x;

      // 2. Line ALWAYS targets the specific blood child in the Child's Unit
      if (specificChildIndex !== -1) {
        const cUnitW = link.target.data.width;
        targetX =
          link.target.x -
          cUnitW / 2 +
          NODE_W / 2 +
          specificChildIndex * (NODE_W + H_GAP);
      }

      // The horizontal spouse line is drawn precisely at cy = link.source.y
      const sourceY = link.source.y;

      const targetY = link.target.y - NODE_H / 2;
      const midY = (link.source.y + NODE_H / 2 + targetY) / 2;

      const pathD = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;

      let strokeColor = "#94a3b8"; // dark slate for parent_child
      let strokeWidth = 3.5;

      if (linkType === "ADOPTION") {
        strokeColor = "#7dd3fc";
        strokeWidth = 2.5;
      }

      const path = linksG
        .append("path")
        .attr("d", pathD)
        .attr("fill", "none")
        .attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth);

      const totalLength = (path.node() as SVGPathElement).getTotalLength();
      path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(TRANSITION_MS * 1.5)
        .ease(easeCubicOut)
        .attr("stroke-dashoffset", 0);
    }

    let cardIdx = 0;
    for (const unitDagNode of allDagNodes) {
      const unit = unitDagNode.data;
      const cx = unitDagNode.x;
      const cy = unitDagNode.y;
      const totalW = unit.width;
      let startX = cx - totalW / 2 + NODE_W / 2;

      for (let i = 0; i < unit.nodes.length; i++) {
        const person = unit.nodes[i];
        drawCard(nodesG, person, startX, cy, cardIdx++);
        // Record position for cross-clan edges
        nodePositions.set(person.id, { x: startX, y: cy });

        // Draw horizontal spouse line between sequential members of a unit
        if (i < unit.nodes.length - 1) {
          const nextPerson = unit.nodes[i + 1];
          let spouseType = "SPOUSE";
          const spouseEdge = edges.find(
            (e) =>
              (e.type === "SPOUSE" || e.type === "DIVORCED_SPOUSE") &&
              ((e.fromNodeId === person.id && e.toNodeId === nextPerson.id) ||
                (e.fromNodeId === nextPerson.id && e.toNodeId === person.id))
          );
          if (spouseEdge) spouseType = spouseEdge.type;

          const strokeColor =
            spouseType === "DIVORCED_SPOUSE" ? "#d6d3d1" : "#f472b6";
          const nextX = startX + NODE_W + H_GAP;
          const pathD = `M ${startX + NODE_W / 2} ${cy} L ${nextX - NODE_W / 2} ${cy}`;

          linksG
            .append("path")
            .attr("d", pathD)
            .attr("fill", "none")
            .attr("stroke", strokeColor)
            .attr("stroke-width", 2.0)
            .attr("stroke-dasharray", "5,3");
        }

        startX += NODE_W + H_GAP;
      }
    }

    // Draw cross-clan connected nodes (positioned to the left)
    let isoIdx = cardIdx;
    crossClanIsolated.forEach((node: any) => {
      drawCard(nodesG, node, node.x, node.y, isoIdx++);
      nodePositions.set(node.id, { x: node.x, y: node.y });
    });

    // Draw truly isolated grid nodes
    trulyIsolated.forEach((node: any) => {
      drawCard(nodesG, node, node.x, node.y, isoIdx++);
      nodePositions.set(node.id, { x: node.x, y: node.y });
    });

    // ───── Draw Cross-Clan Edges ─────
    // Parent-child edges between different clans, same style as regular edges
    // The line drops from the CENTER of the parent's spouse unit (like regular edges)
    for (const ccEdge of crossClanEdges) {
      const fromPos = nodePositions.get(ccEdge.fromNodeId);
      const toPos = nodePositions.get(ccEdge.toNodeId);
      if (!fromPos || !toPos) continue;

      // Find the center of the parent's spouse unit
      const parentUnit = nodeToUnit.get(ccEdge.fromNodeId);
      let sourceX = fromPos.x;
      if (parentUnit && parentUnit.nodes.length > 1) {
        // Calculate geometric center X of all nodes in the unit
        let sumX = 0;
        let count = 0;
        for (const unitNode of parentUnit.nodes) {
          const pos = nodePositions.get(unitNode.id);
          if (pos) {
            sumX += pos.x;
            count++;
          }
        }
        if (count > 0) sourceX = sumX / count;
      }

      const sourceY = fromPos.y; // center of card = where spouse line is drawn
      const targetY = toPos.y - NODE_H / 2;

      // Standard edges route through the exact middle.
      // To avoid overlapping with standard horizontal sibling lines (which use the exact middle),
      // we'll shift the cross-clan horizontal routing line slightly lower.
      const standardMidY = (fromPos.y + NODE_H / 2 + targetY) / 2;
      const midY = standardMidY + V_SPACING * 0.25; // Push the horizontal line down by 25% of spacing

      const pathD = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${toPos.x} ${midY} L ${toPos.x} ${targetY}`;

      const path = crossClanLinksG
        .append("path")
        .attr("d", pathD)
        .attr("fill", "none")
        .attr("stroke", "#94a3b8")
        .attr("stroke-width", 3.5);

      const totalLength = (path.node() as SVGPathElement).getTotalLength();
      path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(TRANSITION_MS * 1.5)
        .ease(easeCubicOut)
        .attr("stroke-dashoffset", 0);
    }

    /* ───── Zoom ───── */
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });
    svg.call(zoomBehavior);
    zoomBehaviorRef.current = zoomBehavior;

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (currentUserNode?.id) {
          zoomRef.current?.zoomToNode(currentUserNode.id, 0.8);
        } else {
          zoomRef.current?.fitToScreen();
        }
      }, TRANSITION_MS + 200);
    });

    return () => {
      svg.selectAll("g.tree-root").remove();
      svg.selectAll("defs").remove();
    };
  }, [
    allNodes,
    edges,
    layout,
    matchingIds,
    searchMatchIds,
    dimensions,
    onNodeClick,
    applyZoom,
    zoomRef,
    nodesMap,
    currentUserNode,
  ]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[600px]">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <svg ref={svgRef} className="w-full h-full" style={{ minHeight: 600 }} />
    </div>
  );
}
