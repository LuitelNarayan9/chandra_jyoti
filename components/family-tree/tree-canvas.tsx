"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import type { TreeNode, TreeLayout } from "@/types/family-tree";
import { getNodeColor, getInitials } from "@/lib/family-tree-utils";
import {
  exportTreeToPng,
  exportTreeToSvg,
  exportTreeToPdf,
} from "@/lib/tree-export-utils";

/* ── Card dimensions (portrait style) ── */
const NODE_W = 130;
const NODE_H = 155;
const AVATAR_SIZE = 72;
const AVATAR_RX = 6;
const SPOUSE_GAP = 30;
const COUPLE_W = NODE_W * 2 + SPOUSE_GAP;
const H_GAP = 60;
const V_SPACING = 250;
const TRANSITION_MS = 600;

interface TreeCanvasProps {
  roots: TreeNode[];
  allNodes: TreeNode[];
  layout: TreeLayout;
  matchingIds: Set<string>;
  searchMatchIds: Set<string>;
  onNodeClick: (node: TreeNode) => void;
  zoomRef: React.MutableRefObject<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    fitToScreen: () => void;
    exportToPng: () => Promise<void>;
    exportToSvg: () => Promise<void>;
    exportToPdf: () => Promise<void>;
  } | null>;
}

/* ═══════════════════════════════════════
 *  COUPLE-BASED TREE DATA
 * ═══════════════════════════════════════ */

interface CoupleNode {
  primary: TreeNode;
  spouse: TreeNode | null;
  childCouples: CoupleNode[];
  x: number;
  y: number;
  subtreeWidth: number;
  depth: number;
}

function buildCoupleForest(allNodes: TreeNode[]): CoupleNode[] {
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
  const placed = new Set<string>();

  function findSpouse(person: TreeNode): TreeNode | null {
    if (
      person.spouseId &&
      nodeMap.has(person.spouseId) &&
      !placed.has(person.spouseId)
    )
      return nodeMap.get(person.spouseId)!;
    for (const n of allNodes) {
      if (n.spouseId === person.id && !placed.has(n.id)) return n;
    }
    return null;
  }

  function buildCouple(person: TreeNode, depth: number): CoupleNode {
    placed.add(person.id);
    const spouse = findSpouse(person);
    if (spouse) placed.add(spouse.id);

    const children: TreeNode[] = [];
    allNodes.forEach((n) => {
      if (placed.has(n.id)) return;
      const isFatherMatch =
        n.fatherId === person.id || (spouse && n.fatherId === spouse.id);
      const isMotherMatch =
        n.motherId === person.id || (spouse && n.motherId === spouse.id);
      if (isFatherMatch || isMotherMatch) children.push(n);
    });

    children.sort((a, b) => {
      if (a.gender === "MALE" && b.gender !== "MALE") return -1;
      if (a.gender !== "MALE" && b.gender === "MALE") return 1;
      return (a.birthYear ?? 9999) - (b.birthYear ?? 9999);
    });

    const childCouples = children
      .filter((c) => !placed.has(c.id))
      .map((c) => buildCouple(c, depth + 1));

    return {
      primary: person,
      spouse,
      childCouples,
      x: 0,
      y: 0,
      subtreeWidth: 0,
      depth,
    };
  }

  const roots = allNodes
    .filter((n) => !n.fatherId || !nodeMap.has(n.fatherId))
    .sort((a, b) => {
      if (a.gender === "MALE" && b.gender !== "MALE") return -1;
      if (a.gender !== "MALE" && b.gender === "MALE") return 1;
      return (a.birthYear ?? 9999) - (b.birthYear ?? 9999);
    });

  const forest: CoupleNode[] = [];
  for (const root of roots) {
    if (placed.has(root.id)) continue;
    forest.push(buildCouple(root, 0));
  }
  return forest;
}

/* ── Layout helpers ── */

function computeSubtreeWidth(couple: CoupleNode): number {
  const ownWidth = couple.spouse ? COUPLE_W : NODE_W;
  if (couple.childCouples.length === 0) {
    couple.subtreeWidth = ownWidth;
    return ownWidth;
  }
  let childrenTotal = 0;
  couple.childCouples.forEach((c, i) => {
    childrenTotal += computeSubtreeWidth(c);
    if (i < couple.childCouples.length - 1) childrenTotal += H_GAP;
  });
  couple.subtreeWidth = Math.max(ownWidth, childrenTotal);
  return couple.subtreeWidth;
}

/** VERTICAL layout: top → bottom */
function positionVertical(couple: CoupleNode, centerX: number, y: number) {
  couple.x = centerX;
  couple.y = y;
  if (couple.childCouples.length === 0) return;
  let totalW = 0;
  couple.childCouples.forEach((c, i) => {
    totalW += c.subtreeWidth;
    if (i < couple.childCouples.length - 1) totalW += H_GAP;
  });
  let startX = centerX - totalW / 2;
  couple.childCouples.forEach((c) => {
    positionVertical(c, startX + c.subtreeWidth / 2, y + V_SPACING);
    startX += c.subtreeWidth + H_GAP;
  });
}

/** HORIZONTAL layout: left → right (swap X and Y axes) */
function positionHorizontal(
  couple: CoupleNode,
  centerY: number,
  xLeft: number
) {
  couple.x = xLeft;
  couple.y = centerY;
  if (couple.childCouples.length === 0) return;
  let totalH = 0;
  couple.childCouples.forEach((c, i) => {
    totalH += c.subtreeWidth; // reuse subtreeWidth as subtreeHeight
    if (i < couple.childCouples.length - 1) totalH += H_GAP;
  });
  let startY = centerY - totalH / 2;
  couple.childCouples.forEach((c) => {
    positionHorizontal(c, startY + c.subtreeWidth / 2, xLeft + V_SPACING);
    startY += c.subtreeWidth + H_GAP;
  });
}

/** RADIAL layout: center outward (polar coordinates) */
function getMaxDepth(couple: CoupleNode): number {
  if (couple.childCouples.length === 0) return couple.depth;
  return Math.max(...couple.childCouples.map(getMaxDepth));
}

function countLeaves(couple: CoupleNode): number {
  if (couple.childCouples.length === 0) return 1;
  return couple.childCouples.reduce((sum, c) => sum + countLeaves(c), 0);
}

function positionRadial(
  couple: CoupleNode,
  angleStart: number,
  angleEnd: number,
  radius: number
) {
  const angleMid = (angleStart + angleEnd) / 2;
  couple.x = Math.cos(angleMid) * radius;
  couple.y = Math.sin(angleMid) * radius;

  if (couple.childCouples.length === 0) return;

  const totalLeaves = couple.childCouples.reduce(
    (s, c) => s + countLeaves(c),
    0
  );
  const angleRange = angleEnd - angleStart;
  let currAngle = angleStart;

  couple.childCouples.forEach((child) => {
    const childLeaves = countLeaves(child);
    const childAngleRange = (childLeaves / totalLeaves) * angleRange;
    positionRadial(
      child,
      currAngle,
      currAngle + childAngleRange,
      radius + V_SPACING
    );
    currAngle += childAngleRange;
  });
}

/* ═══════════════════════════════════════
 *  COMPONENT
 * ═══════════════════════════════════════ */

export function TreeCanvas({
  allNodes,
  layout,
  matchingIds,
  searchMatchIds,
  onNodeClick,
  zoomRef,
}: TreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>(null);
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

  const applyZoom = useCallback((transform: d3.ZoomTransform) => {
    const svg = svgRef.current;
    if (!svg || !zoomBehaviorRef.current) return;
    d3.select(svg)
      .transition()
      .duration(500)
      .ease(d3.easeCubicInOut)
      .call(zoomBehaviorRef.current.transform, transform);
  }, []);

  useEffect(() => {
    zoomRef.current = {
      zoomIn: () => {
        const svg = svgRef.current;
        if (!svg || !zoomBehaviorRef.current) return;
        d3.select(svg)
          .transition()
          .duration(300)
          .call(zoomBehaviorRef.current.scaleBy, 1.4);
      },
      zoomOut: () => {
        const svg = svgRef.current;
        if (!svg || !zoomBehaviorRef.current) return;
        d3.select(svg)
          .transition()
          .duration(300)
          .call(zoomBehaviorRef.current.scaleBy, 0.7);
      },
      resetZoom: () => applyZoom(d3.zoomIdentity),
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
        applyZoom(d3.zoomIdentity.translate(tx, ty).scale(scale));
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
  useEffect(() => {
    const svg = d3.select(svgRef.current!);
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

    /* ── Build couple forest ── */
    const forest = buildCoupleForest(allNodes);
    if (forest.length === 0) return;

    // Compute subtree widths
    forest.forEach((tree) => computeSubtreeWidth(tree));

    // Position based on layout
    if (layout === "horizontal") {
      let totalH = 0;
      forest.forEach((tree, i) => {
        totalH += tree.subtreeWidth;
        if (i < forest.length - 1) totalH += H_GAP * 2;
      });
      let startY = -totalH / 2;
      forest.forEach((tree) => {
        positionHorizontal(tree, startY + tree.subtreeWidth / 2, 0);
        startY += tree.subtreeWidth + H_GAP * 2;
      });
    } else if (layout === "radial") {
      const totalLeaves = forest.reduce((s, t) => s + countLeaves(t), 0);
      let currAngle = -Math.PI / 2;
      const fullAngle = Math.PI * 2;
      forest.forEach((tree) => {
        const treeLeaves = countLeaves(tree);
        const treeAngle = (treeLeaves / totalLeaves) * fullAngle;
        positionRadial(tree, currAngle, currAngle + treeAngle, V_SPACING); // start away from center
        currAngle += treeAngle;
      });
    } else {
      // vertical (default)
      let totalW = 0;
      forest.forEach((tree, i) => {
        totalW += tree.subtreeWidth;
        if (i < forest.length - 1) totalW += H_GAP * 2;
      });
      let startX = -totalW / 2;
      forest.forEach((tree) => {
        positionVertical(tree, startX + tree.subtreeWidth / 2, 0);
        startX += tree.subtreeWidth + H_GAP * 2;
      });
    }

    const g = svg.append("g").attr("class", "tree-root");
    gRef.current = g.node();

    /* ───── Draw a portrait card ───── */
    function drawCard(
      parentG: d3.Selection<SVGGElement, unknown, null, undefined>,
      node: TreeNode,
      x: number,
      y: number,
      index: number
    ) {
      const colors = getNodeColor(node.gender, node.isAlive);
      const isSearchHL =
        searchMatchIds.size < allNodes.length && searchMatchIds.has(node.id);
      const isFilterMatch = matchingIds.has(node.id);
      const isSearchMatch = searchMatchIds.has(node.id);

      let nodeOpacity = 1;
      if (!isFilterMatch) nodeOpacity = 0.1;
      else if (searchMatchIds.size < allNodes.length && !isSearchMatch)
        nodeOpacity = 0.2;

      const cardG = parentG
        .append("g")
        .attr("class", "tree-node")
        .attr("transform", `translate(${x}, ${y})`)
        .style("cursor", "pointer")
        .attr("opacity", 0);

      cardG
        .transition()
        .duration(TRANSITION_MS)
        .delay(100 + index * 15)
        .attr("opacity", nodeOpacity);

      cardG
        .append("rect")
        .attr("x", -NODE_W / 2)
        .attr("y", -NODE_H / 2)
        .attr("width", NODE_W)
        .attr("height", NODE_H)
        .attr("rx", 8)
        .attr("fill", "white")
        .attr("stroke", colors.fill)
        .attr("stroke-width", 2.5)
        .attr("filter", isSearchHL ? "url(#search-glow)" : "url(#card-shadow)");

      const bgTint =
        node.gender === "MALE"
          ? "rgba(219,234,254,0.5)"
          : node.gender === "FEMALE"
            ? "rgba(252,231,243,0.5)"
            : "rgba(237,233,254,0.5)";
      cardG
        .append("rect")
        .attr("x", -NODE_W / 2 + 5)
        .attr("y", -NODE_H / 2 + 5)
        .attr("width", NODE_W - 10)
        .attr("height", AVATAR_SIZE + 6)
        .attr("rx", 5)
        .attr("fill", bgTint);

      cardG
        .append("rect")
        .attr("x", -AVATAR_SIZE / 2)
        .attr("y", -NODE_H / 2 + 9)
        .attr("width", AVATAR_SIZE)
        .attr("height", AVATAR_SIZE)
        .attr("rx", AVATAR_RX)
        .attr("fill", colors.fill)
        .attr("stroke", "white")
        .attr("stroke-width", 3);

      cardG
        .append("text")
        .attr("x", 0)
        .attr("y", -NODE_H / 2 + 9 + AVATAR_SIZE / 2 + 1)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "white")
        .attr("font-size", 24)
        .attr("font-weight", "800")
        .attr("letter-spacing", "1px")
        .attr("font-family", "Inter, system-ui, sans-serif")
        .text(getInitials(node.firstName, node.lastName));

      cardG
        .append("text")
        .attr("x", 0)
        .attr("y", -NODE_H / 2 + AVATAR_SIZE + 24)
        .attr("text-anchor", "middle")
        .attr("fill", "#0f172a")
        .attr("font-size", 13)
        .attr("font-weight", "700")
        .attr("font-family", "Inter, system-ui, sans-serif")
        .text(() => {
          const n = node.name;
          return n.length > 14 ? n.slice(0, 13) + "…" : n;
        });

      cardG
        .append("text")
        .attr("x", 0)
        .attr("y", -NODE_H / 2 + AVATAR_SIZE + 42)
        .attr("text-anchor", "middle")
        .attr("fill", "#64748b")
        .attr("font-size", 12)
        .attr("font-family", "Inter, system-ui, sans-serif")
        .attr("font-style", "italic")
        .text(() => {
          const b = node.birthYear ?? "";
          const d = node.deathYear ? `${node.deathYear}` : "";
          if (b && d) return `${b} - ${d}`;
          if (b) return `${b} -`;
          return "";
        });

      cardG
        .on("mouseenter", function () {
          d3.select(this).raise();
          d3.select(this)
            .transition()
            .duration(200)
            .attr("transform", `translate(${x}, ${y}) scale(1.08)`);
          d3.select(this)
            .select("rect:first-of-type")
            .transition()
            .duration(200)
            .attr("stroke-width", 4)
            .attr("filter", "url(#search-glow)");
        })
        .on("mouseleave", function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("transform", `translate(${x}, ${y})`);
          d3.select(this)
            .select("rect:first-of-type")
            .transition()
            .duration(200)
            .attr("stroke-width", 2.5)
            .attr(
              "filter",
              isSearchHL ? "url(#search-glow)" : "url(#card-shadow)"
            );
        })
        .on("click", () => onNodeClick(node));
    }

    /* ───── Helper: draw a line with animation ───── */
    function drawLine(
      layer: d3.Selection<SVGGElement, unknown, null, undefined>,
      d: string,
      color = "#475569",
      strokeW = 3.5,
      dash?: string
    ) {
      const p = layer
        .append("path")
        .attr("d", d)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", strokeW)
        .attr("stroke-opacity", 0);
      if (dash) p.attr("stroke-dasharray", dash);
      p.transition().duration(TRANSITION_MS).attr("stroke-opacity", 0.9);
    }

    /* ───── Recursive draw ───── */
    const linksG = g.append("g").attr("class", "links-layer");
    const nodesG = g.append("g").attr("class", "nodes-layer");
    let cardIdx = 0;

    function drawCoupleTree(couple: CoupleNode) {
      const { primary, spouse, x, y, childCouples } = couple;

      if (layout === "horizontal") {
        // ─── HORIZONTAL: couples stacked vertically, tree grows left→right ───
        const cardX = x + NODE_W / 2;
        const primaryY = spouse ? y - (NODE_H + SPOUSE_GAP / 2) / 2 : y;
        const spouseY = y + (NODE_H + SPOUSE_GAP / 2) / 2;

        drawCard(nodesG, primary, cardX, primaryY, cardIdx++);

        if (spouse) {
          drawCard(nodesG, spouse, cardX, spouseY, cardIdx++);
          // Vertical dashed pink spouse connector
          const connY1 = primaryY + NODE_H / 2;
          const connY2 = spouseY - NODE_H / 2;
          if (connY2 > connY1) {
            drawLine(
              linksG,
              `M ${cardX},${connY1} V ${connY2}`,
              "#f43f5e",
              3,
              "6,4"
            );
          }
        }

        if (childCouples.length > 0) {
          const parentRight = cardX + NODE_W / 2;
          const bridgeX = parentRight + 25;

          if (spouse) {
            drawLine(linksG, `M ${parentRight},${primaryY} H ${bridgeX}`);
            drawLine(linksG, `M ${parentRight},${spouseY} H ${bridgeX}`);
            drawLine(linksG, `M ${bridgeX},${primaryY} V ${spouseY}`);
          }

          const dropY = y;
          const dropStartX = spouse ? bridgeX : parentRight;
          const childLeftX = childCouples[0].x + NODE_W / 2 - NODE_W / 2;
          const busX = (dropStartX + childLeftX) / 2;

          drawLine(linksG, `M ${dropStartX},${dropY} H ${busX}`);

          if (childCouples.length > 1) {
            const childYs = childCouples.map((c) => c.y);
            const minCY = Math.min(...childYs);
            const maxCY = Math.max(...childYs);
            drawLine(linksG, `M ${busX},${minCY} V ${maxCY}`);
          }

          childCouples.forEach((child) => {
            drawLine(
              linksG,
              `M ${busX},${child.y} H ${child.x + NODE_W / 2 - NODE_W / 2}`
            );
          });
        }
      } else if (layout === "radial") {
        // ─── RADIAL: couples side-by-side, branches radiate from center ───
        const primaryX = spouse ? x - (NODE_W + SPOUSE_GAP) / 2 : x;
        const spouseX = x + (NODE_W + SPOUSE_GAP) / 2;
        const cardY = y;

        drawCard(nodesG, primary, primaryX, cardY, cardIdx++);

        if (spouse) {
          drawCard(nodesG, spouse, spouseX, cardY, cardIdx++);
          const connX1 = primaryX + NODE_W / 2;
          const connX2 = spouseX - NODE_W / 2;
          if (connX2 > connX1) {
            drawLine(
              linksG,
              `M ${connX1},${cardY} L ${connX2},${cardY}`,
              "#f43f5e",
              3,
              "6,4"
            );
          }
        }

        // Radial links: straight lines from parent center to child center
        childCouples.forEach((child) => {
          drawLine(linksG, `M ${x},${y} L ${child.x},${child.y}`);
        });
      } else {
        // ─── VERTICAL (default) ───
        const primaryX = spouse ? x - (NODE_W + SPOUSE_GAP) / 2 : x;
        const spouseX = x + (NODE_W + SPOUSE_GAP) / 2;
        const cardY = y + NODE_H / 2;

        drawCard(nodesG, primary, primaryX, cardY, cardIdx++);

        if (spouse) {
          drawCard(nodesG, spouse, spouseX, cardY, cardIdx++);
          const connX1 = primaryX + NODE_W / 2;
          const connX2 = spouseX - NODE_W / 2;
          if (connX2 > connX1) {
            drawLine(
              linksG,
              `M ${connX1},${cardY} L ${connX2},${cardY}`,
              "#f43f5e",
              3,
              "6,4"
            );
          }
        }

        if (childCouples.length > 0) {
          const parentBottom = cardY + NODE_H / 2;
          const bridgeY = parentBottom + 25;

          if (spouse) {
            drawLine(linksG, `M ${primaryX},${parentBottom} V ${bridgeY}`);
            drawLine(linksG, `M ${spouseX},${parentBottom} V ${bridgeY}`);
            drawLine(linksG, `M ${primaryX},${bridgeY} H ${spouseX}`);
          }

          const dropX = x;
          const dropStartY = spouse ? bridgeY : parentBottom;
          const childTopY = childCouples[0].y + NODE_H / 2 - NODE_H / 2;
          const busY = (dropStartY + childTopY) / 2;

          drawLine(linksG, `M ${dropX},${dropStartY} V ${busY}`);

          if (childCouples.length > 1) {
            const childXs = childCouples.map((c) => c.x);
            drawLine(
              linksG,
              `M ${Math.min(...childXs)},${busY} H ${Math.max(...childXs)}`
            );
          }

          childCouples.forEach((child) => {
            const childCardTop = child.y + NODE_H / 2 - NODE_H / 2;
            drawLine(linksG, `M ${child.x},${busY} V ${childCardTop}`);
          });
        }
      }

      childCouples.forEach((child) => drawCoupleTree(child));
    }

    forest.forEach((tree) => drawCoupleTree(tree));

    /* ───── Zoom ───── */
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });
    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    requestAnimationFrame(() => {
      setTimeout(() => zoomRef.current?.fitToScreen(), TRANSITION_MS + 200);
    });

    return () => {
      svg.selectAll("g.tree-root").remove();
      svg.selectAll("defs").remove();
    };
  }, [
    allNodes,
    layout,
    matchingIds,
    searchMatchIds,
    dimensions,
    onNodeClick,
    applyZoom,
    zoomRef,
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
