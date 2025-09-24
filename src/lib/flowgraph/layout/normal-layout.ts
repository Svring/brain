import type { Edge, Node, LayoutOptions } from "./types";
import {
  DEFAULT_OPTIONS,
  averageIndex,
  calculateNodeRanks,
  computeIncoming,
  computeOutgoing,
  groupByRank,
  alignNetworkNodesWithParents,
} from "./helpers";

export function applyLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const resolveSize =
    options.getNodeSize ??
    (() => ({ width: opts.nodeWidth, height: opts.nodeHeight }));

  if (nodes.length === 0) return nodes;

  const incoming = computeIncoming(nodes, edges);
  const outgoing = computeOutgoing(nodes, edges);
  const ranks = calculateNodeRanks(nodes, incoming, edges);
  const ranked = groupByRank(nodes, ranks);
  const rankKeys = Object.keys(ranked)
    .map((k) => Number(k))
    .sort((a, b) => a - b);

  const rankOrders = new Map<number, string[]>();
  for (const r of rankKeys)
    rankOrders.set(
      r,
      (ranked[r] || []).map((it) => it.node.id)
    );

  if (opts.edgeAware) {
    const iters = Math.max(1, options.barycentricIterations ?? 2);
    for (let k = 0; k < iters; k++) {
      for (let i = 1; i < rankKeys.length; i++) {
        const prev = rankKeys[i - 1];
        const curr = rankKeys[i];
        const prevOrder = rankOrders.get(prev) || [];
        const idxPrev = new Map<string, number>();
        prevOrder.forEach((id, idx) => idxPrev.set(id, idx));
        const ids = [...(rankOrders.get(curr) || [])];
        ids.sort((a, b) => {
          const aParents = incoming.get(a) || [];
          const bParents = incoming.get(b) || [];
          const aAvg = averageIndex(aParents, idxPrev);
          const bAvg = averageIndex(bParents, idxPrev);
          if (aAvg === bAvg) return ids.indexOf(a) - ids.indexOf(b);
          return aAvg - bAvg;
        });
        rankOrders.set(curr, ids);
      }
      for (let i = rankKeys.length - 2; i >= 0; i--) {
        const curr = rankKeys[i];
        const next = rankKeys[i + 1];
        const nextOrder = rankOrders.get(next) || [];
        const idxNext = new Map<string, number>();
        nextOrder.forEach((id, idx) => idxNext.set(id, idx));
        const ids = [...(rankOrders.get(curr) || [])];
        ids.sort((a, b) => {
          const aChildren = outgoing.get(a) || [];
          const bChildren = outgoing.get(b) || [];
          const aAvg = averageIndex(aChildren, idxNext);
          const bAvg = averageIndex(bChildren, idxNext);
          if (aAvg === bAvg) return ids.indexOf(a) - ids.indexOf(b);
          return aAvg - bAvg;
        });
        rankOrders.set(curr, ids);
      }
    }
  }

  const rankMaxHeights = new Map<number, number>();
  const rankMaxWidths = new Map<number, number>();
  for (const r of rankKeys) {
    const items = (
      rankOrders.get(r) || (ranked[r] || []).map((it) => it.node.id)
    )
      .map((id) => nodes.find((n) => n.id === id)!)
      .filter(Boolean)
      .map((n) => ({ node: n }));
    let maxH = 0;
    let maxW = 0;
    for (const { node } of items) {
      const { width, height } = resolveSize(node);
      if (height > maxH) maxH = height;
      if (width > maxW) maxW = width;
    }
    rankMaxHeights.set(r, maxH || opts.nodeHeight);
    rankMaxWidths.set(r, maxW || opts.nodeWidth);
  }

  const rankOffsetY = new Map<number, number>();
  const rankOffsetX = new Map<number, number>();

  if (opts.direction === "TB" || opts.direction === "BT") {
    let accY = 0;
    for (const r of rankKeys) {
      rankOffsetY.set(r, accY);
      accY += (rankMaxHeights.get(r) || opts.nodeHeight) + opts.rankSep;
    }
    const totalHeight = accY - opts.rankSep;
    if (opts.direction === "BT") {
      for (const r of rankKeys) {
        const h = rankMaxHeights.get(r) || opts.nodeHeight;
        const topFromTopFlow = rankOffsetY.get(r) || 0;
        const mirroredTop = totalHeight - topFromTopFlow - h;
        rankOffsetY.set(r, mirroredTop);
      }
    }
  } else if (opts.direction === "LR" || opts.direction === "RL") {
    let accX = 0;
    for (const r of rankKeys) {
      rankOffsetX.set(r, accX);
      accX += (rankMaxWidths.get(r) || opts.nodeWidth) + opts.rankSep;
    }
    const totalWidth = accX - opts.rankSep;
    if (opts.direction === "RL") {
      for (const r of rankKeys) {
        const w = rankMaxWidths.get(r) || opts.nodeWidth;
        const leftFromLeftFlow = rankOffsetX.get(r) || 0;
        const mirroredLeft = totalWidth - leftFromLeftFlow - w;
        rankOffsetX.set(r, mirroredLeft);
      }
    }
  }

  const positionedById = new Map<string, { x: number; y: number }>();

  for (const r of rankKeys) {
    const orderedIds =
      rankOrders.get(r) || (ranked[r] || []).map((it) => it.node.id);
    const nodesInRank = orderedIds
      .map((id) => nodes.find((n) => n.id === id)!)
      .filter(Boolean);

    if (opts.direction === "TB" || opts.direction === "BT") {
      const widths = nodesInRank.map((n) => resolveSize(n).width);
      const totalWidthInRank =
        widths.reduce((s, w) => s + w, 0) + opts.nodeSep * (widths.length - 1);
      let cursorX = -totalWidthInRank / 2;
      const baseY = rankOffsetY.get(r) || 0;
      for (let i = 0; i < nodesInRank.length; i++) {
        const node = nodesInRank[i];
        const size = resolveSize(node);
        positionedById.set(node.id, { x: cursorX, y: baseY });
        cursorX += size.width + opts.nodeSep;
      }
    } else {
      const heights = nodesInRank.map((n) => resolveSize(n).height);
      const totalHeightInRank =
        heights.reduce((s, h) => s + h, 0) +
        opts.nodeSep * (heights.length - 1);
      let cursorY = -totalHeightInRank / 2;
      const baseX = rankOffsetX.get(r) || 0;
      for (let i = 0; i < nodesInRank.length; i++) {
        const node = nodesInRank[i];
        const size = resolveSize(node);
        positionedById.set(node.id, { x: baseX, y: cursorY });
        cursorY += size.height + opts.nodeSep;
      }
    }
  }

  const positionedNodes = nodes.map((node) => ({
    ...node,
    position: positionedById.get(node.id) || node.position || { x: 0, y: 0 },
  }));

  // Apply network node alignment for consistent positioning
  return alignNetworkNodesWithParents(positionedNodes, edges);
}
