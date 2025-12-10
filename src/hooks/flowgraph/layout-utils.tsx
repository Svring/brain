import type { Edge, Node } from "@xyflow/react";

/**
 * Layout options for configuring the graph layout algorithm
 */
export interface LayoutOptions {
  direction?: "TB" | "BT" | "LR" | "RL";
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number;
  nodeSep?: number;
  getNodeSize?: (node: Node) => { width: number; height: number };
  edgeAware?: boolean;
  barycentricIterations?: number;
}

const DEFAULT_OPTIONS: Required<
  Omit<LayoutOptions, "getNodeSize" | "edgeAware" | "barycentricIterations">
> & {
  edgeAware: boolean;
  barycentricIterations: number;
} = {
  direction: "TB",
  nodeWidth: 250,
  nodeHeight: 200,
  rankSep: 150,
  nodeSep: 150,
  edgeAware: false,
  barycentricIterations: 2,
};

/**
 * Graph structure containing incoming and outgoing edge mappings
 */
export interface GraphStructure {
  incoming: Map<string, string[]>;
  outgoing: Map<string, string[]>;
}

/**
 * Rank information for nodes
 */
export interface RankInfo {
  ranks: Map<string, number>;
  ranked: Record<number, Array<{ node: Node; rank: number }>>;
  rankKeys: number[];
}

/**
 * Node ordering within ranks
 */
export interface RankOrdering {
  rankOrders: Map<number, string[]>;
}

/**
 * Rank dimensions (max width/height per rank)
 */
export interface RankDimensions {
  rankMaxHeights: Map<number, number>;
  rankMaxWidths: Map<number, number>;
}

/**
 * Rank offsets for positioning
 */
export interface RankOffsets {
  rankOffsetY: Map<number, number>;
  rankOffsetX: Map<number, number>;
}

/**
 * Computes incoming and outgoing edge mappings for all nodes
 */
export function computeGraphStructure(
  nodes: Node[],
  edges: Edge[]
): GraphStructure {
  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();

  // Initialize maps for all nodes
  for (const node of nodes) {
    incoming.set(node.id, []);
    outgoing.set(node.id, []);
  }

  // Build edge mappings
  for (const edge of edges) {
    const incomingArr = incoming.get(edge.target);
    if (incomingArr) incomingArr.push(edge.source);

    const outgoingArr = outgoing.get(edge.source);
    if (outgoingArr) outgoingArr.push(edge.target);
  }

  return { incoming, outgoing };
}

/**
 * Calculates the average index of nodes in a given index map
 */
function averageIndex(ids: string[], indexMap: Map<string, number>): number {
  if (!ids.length) return Number.POSITIVE_INFINITY;
  let sum = 0;
  let count = 0;
  for (const id of ids) {
    const idx = indexMap.get(id);
    if (idx !== undefined) {
      sum += idx;
      count++;
    }
  }
  if (count === 0) return Number.POSITIVE_INFINITY;
  return sum / count;
}

/**
 * Calculates node ranks based on graph structure
 * Uses a simple longest path algorithm from sources
 */
function calculateNodeRanks(
  nodes: Node[],
  incoming: Map<string, string[]>,
  edges: Edge[]
): Map<string, number> {
  const ranks = new Map<string, number>();
  const visited = new Set<string>();

  // Find source nodes (nodes with no incoming edges)
  const sources = nodes.filter(
    (node) => (incoming.get(node.id) || []).length === 0
  );

  // BFS to assign ranks
  const queue: Array<{ id: string; rank: number }> = sources.map((node) => ({
    id: node.id,
    rank: 0,
  }));

  for (const { id, rank } of queue) {
    if (visited.has(id)) continue;
    visited.add(id);
    ranks.set(id, rank);

    // Find children and assign them rank + 1
    for (const edge of edges) {
      if (edge.source === id && !visited.has(edge.target)) {
        queue.push({ id: edge.target, rank: rank + 1 });
      }
    }
  }

  // Assign rank 0 to any unvisited nodes
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      ranks.set(node.id, 0);
    }
  }

  return ranks;
}

/**
 * Groups nodes by their calculated ranks
 */
function groupByRank(
  nodes: Node[],
  ranks: Map<string, number>
): Record<number, Array<{ node: Node; rank: number }>> {
  const grouped: Record<number, Array<{ node: Node; rank: number }>> = {};

  for (const node of nodes) {
    const rank = ranks.get(node.id) || 0;
    if (!grouped[rank]) {
      grouped[rank] = [];
    }
    grouped[rank].push({ node, rank });
  }

  return grouped;
}

/**
 * Calculates node ranks and groups them
 */
export function calculateRanks(
  nodes: Node[],
  structure: GraphStructure,
  edges: Edge[]
): RankInfo {
  const ranks = calculateNodeRanks(nodes, structure.incoming, edges);
  const ranked = groupByRank(nodes, ranks);
  const rankKeys = Object.keys(ranked)
    .map((k) => Number(k))
    .sort((a, b) => a - b);

  return { ranks, ranked, rankKeys };
}

/**
 * Orders nodes within ranks using edge-aware barycentric ordering
 */
export function orderNodesInRanks(
  _nodes: Node[],
  rankInfo: RankInfo,
  structure: GraphStructure,
  options: LayoutOptions = {}
): RankOrdering {
  const { ranked, rankKeys } = rankInfo;
  const { incoming, outgoing } = structure;
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Initialize rank orders with default ordering
  const rankOrders = new Map<number, string[]>();
  for (const rank of rankKeys) {
    rankOrders.set(
      rank,
      (ranked[rank] || []).map((it) => it.node.id)
    );
  }

  // Apply edge-aware ordering if enabled
  if (opts.edgeAware) {
    const iterations = Math.max(1, options.barycentricIterations ?? 2);

    for (let k = 0; k < iterations; k++) {
      // Forward pass: order nodes based on parent positions
      for (let i = 1; i < rankKeys.length; i++) {
        const prev = rankKeys[i - 1];
        const curr = rankKeys[i];
        const prevOrder = rankOrders.get(prev) || [];
        const idxPrev = new Map<string, number>();
        for (let idx = 0; idx < prevOrder.length; idx++) {
          idxPrev.set(prevOrder[idx], idx);
        }

        const currentOrder = rankOrders.get(curr) || [];
        const originalIdx = new Map<string, number>();
        for (let idx = 0; idx < currentOrder.length; idx++) {
          originalIdx.set(currentOrder[idx], idx);
        }

        const ids = [...currentOrder];
        ids.sort((a, b) => {
          const aParents = incoming.get(a) || [];
          const bParents = incoming.get(b) || [];
          const aAvg = averageIndex(aParents, idxPrev);
          const bAvg = averageIndex(bParents, idxPrev);
          if (aAvg === bAvg)
            return (originalIdx.get(a) ?? 0) - (originalIdx.get(b) ?? 0);
          return aAvg - bAvg;
        });
        rankOrders.set(curr, ids);
      }

      // Backward pass: order nodes based on child positions
      for (let i = rankKeys.length - 2; i >= 0; i--) {
        const curr = rankKeys[i];
        const next = rankKeys[i + 1];
        const nextOrder = rankOrders.get(next) || [];
        const idxNext = new Map<string, number>();
        for (let idx = 0; idx < nextOrder.length; idx++) {
          idxNext.set(nextOrder[idx], idx);
        }

        const currentOrder = rankOrders.get(curr) || [];
        const originalIdx = new Map<string, number>();
        for (let idx = 0; idx < currentOrder.length; idx++) {
          originalIdx.set(currentOrder[idx], idx);
        }

        const ids = [...currentOrder];
        ids.sort((a, b) => {
          const aChildren = outgoing.get(a) || [];
          const bChildren = outgoing.get(b) || [];
          const aAvg = averageIndex(aChildren, idxNext);
          const bAvg = averageIndex(bChildren, idxNext);
          if (aAvg === bAvg)
            return (originalIdx.get(a) ?? 0) - (originalIdx.get(b) ?? 0);
          return aAvg - bAvg;
        });
        rankOrders.set(curr, ids);
      }
    }
  }

  return { rankOrders };
}

/**
 * Calculates the maximum width and height for each rank
 */
export function calculateRankDimensions(
  nodes: Node[],
  rankInfo: RankInfo,
  ordering: RankOrdering,
  options: LayoutOptions = {}
): RankDimensions {
  const { ranked, rankKeys } = rankInfo;
  const { rankOrders } = ordering;
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const resolveSize =
    options.getNodeSize ??
    (() => ({ width: opts.nodeWidth, height: opts.nodeHeight }));
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  const rankMaxHeights = new Map<number, number>();
  const rankMaxWidths = new Map<number, number>();

  for (const rank of rankKeys) {
    const items = (
      rankOrders.get(rank) || (ranked[rank] || []).map((it) => it.node.id)
    )
      .map((id) => nodeById.get(id))
      .filter((n): n is Node => Boolean(n))
      .map((n) => ({ node: n }));

    let maxH = 0;
    let maxW = 0;
    for (const { node } of items) {
      const { width, height } = resolveSize(node);
      if (height > maxH) maxH = height;
      if (width > maxW) maxW = width;
    }
    rankMaxHeights.set(rank, maxH || opts.nodeHeight);
    rankMaxWidths.set(rank, maxW || opts.nodeWidth);
  }

  return { rankMaxHeights, rankMaxWidths };
}

/**
 * Calculates rank offsets based on direction and dimensions
 */
export function calculateRankOffsets(
  rankInfo: RankInfo,
  dimensions: RankDimensions,
  options: LayoutOptions = {}
): RankOffsets {
  const { rankKeys } = rankInfo;
  const { rankMaxHeights, rankMaxWidths } = dimensions;
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const rankOffsetY = new Map<number, number>();
  const rankOffsetX = new Map<number, number>();

  if (opts.direction === "TB" || opts.direction === "BT") {
    let accY = 0;
    for (const rank of rankKeys) {
      rankOffsetY.set(rank, accY);
      accY += (rankMaxHeights.get(rank) || opts.nodeHeight) + opts.rankSep;
    }
    const totalHeight = accY - opts.rankSep;
    if (opts.direction === "BT") {
      for (const rank of rankKeys) {
        const h = rankMaxHeights.get(rank) || opts.nodeHeight;
        const topFromTopFlow = rankOffsetY.get(rank) || 0;
        const mirroredTop = totalHeight - topFromTopFlow - h;
        rankOffsetY.set(rank, mirroredTop);
      }
    }
  } else if (opts.direction === "LR" || opts.direction === "RL") {
    let accX = 0;
    for (const rank of rankKeys) {
      rankOffsetX.set(rank, accX);
      accX += (rankMaxWidths.get(rank) || opts.nodeWidth) + opts.rankSep;
    }
    const totalWidth = accX - opts.rankSep;
    if (opts.direction === "RL") {
      for (const rank of rankKeys) {
        const w = rankMaxWidths.get(rank) || opts.nodeWidth;
        const leftFromLeftFlow = rankOffsetX.get(rank) || 0;
        const mirroredLeft = totalWidth - leftFromLeftFlow - w;
        rankOffsetX.set(rank, mirroredLeft);
      }
    }
  }

  return { rankOffsetY, rankOffsetX };
}

/**
 * Positions nodes based on ranks, dimensions, and offsets
 */
export function positionNodes(
  nodes: Node[],
  rankInfo: RankInfo,
  ordering: RankOrdering,
  _dimensions: RankDimensions,
  offsets: RankOffsets,
  options: LayoutOptions = {}
): Node[] {
  const { rankKeys } = rankInfo;
  const { rankOrders } = ordering;
  const { rankOffsetY, rankOffsetX } = offsets;
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const resolveSize =
    options.getNodeSize ??
    (() => ({ width: opts.nodeWidth, height: opts.nodeHeight }));
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  const positionedById = new Map<string, { x: number; y: number }>();

  for (const rank of rankKeys) {
    const orderedIds =
      rankOrders.get(rank) ||
      (rankInfo.ranked[rank] || []).map((it) => it.node.id);
    const nodesInRank = orderedIds
      .map((id) => nodeById.get(id))
      .filter((n): n is Node => Boolean(n));

    if (opts.direction === "TB" || opts.direction === "BT") {
      const widths = nodesInRank.map((n) => resolveSize(n).width);
      const totalWidthInRank =
        widths.reduce((s, w) => s + w, 0) + opts.nodeSep * (widths.length - 1);
      let cursorX = -totalWidthInRank / 2;
      const baseY = rankOffsetY.get(rank) || 0;
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
      const baseX = rankOffsetX.get(rank) || 0;
      for (let i = 0; i < nodesInRank.length; i++) {
        const node = nodesInRank[i];
        const size = resolveSize(node);
        positionedById.set(node.id, { x: baseX, y: cursorY });
        cursorY += size.height + opts.nodeSep;
      }
    }
  }

  return nodes.map((node) => ({
    ...node,
    position: positionedById.get(node.id) || node.position || { x: 0, y: 0 },
  }));
}

/**
 * Main layout function that chains all layout steps together
 * This is a simplified version without dev group logic
 */
export function applyLayout(
  nodes: Node[],
  edges: Edge[] = [],
  options: LayoutOptions = {}
): Node[] {
  if (nodes.length === 0) return nodes;

  const structure = computeGraphStructure(nodes, edges);
  const rankInfo = calculateRanks(nodes, structure, edges);
  const ordering = orderNodesInRanks(nodes, rankInfo, structure, options);
  const dimensions = calculateRankDimensions(
    nodes,
    rankInfo,
    ordering,
    options
  );
  const offsets = calculateRankOffsets(rankInfo, dimensions, options);
  const positionedNodes = positionNodes(
    nodes,
    rankInfo,
    ordering,
    dimensions,
    offsets,
    options
  );

  return positionedNodes;
}
