import type { Edge, Node } from "@xyflow/react";
import _ from "lodash";

export interface LayoutOptions {
  direction?: "TB" | "BT" | "LR" | "RL"; // Top-Bottom, Bottom-Top, Left-Right, Right-Left
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number; // Separation between ranks/levels
  nodeSep?: number; // Separation between nodes in same rank
}

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
  direction: "TB",
  nodeWidth: 200,
  nodeHeight: 100,
  rankSep: 100,
  nodeSep: 100,
};

/**
 * Assigns positions to nodes based on their edge relationships using a hierarchical layout.
 */
export const applyLayout = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (nodes.length === 0) {
    return nodes;
  }

  // Build incoming edge map
  const incomingEdges = new Map<string, string[]>();

  for (const node of nodes) {
    incomingEdges.set(node.id, []);
  }

  for (const edge of edges) {
    const existing = incomingEdges.get(edge.target) || [];
    incomingEdges.set(edge.target, [...existing, edge.source]);
  }

  // Calculate ranks using simple topological approach
  const ranks = calculateNodeRanks(nodes, incomingEdges);

  // Group by rank and assign positions
  const rankedNodes = _.groupBy(
    nodes.map((node) => ({ node, rank: ranks.get(node.id) || 0 })),
    "rank"
  );

  const maxRank = Math.max(...Object.keys(rankedNodes).map(Number));

  return nodes.map((node) => {
    const rank = ranks.get(node.id) || 0;
    const sameRankNodes = rankedNodes[rank] || [];
    const indexInRank = sameRankNodes.findIndex(
      ({ node: n }) => n.id === node.id
    );
    const totalInRank = sameRankNodes.length;

    const position = getNodePosition(
      rank,
      indexInRank,
      totalInRank,
      maxRank,
      opts
    );

    return {
      ...node,
      position,
    };
  });
};

function calculateNodeRanks(
  nodes: Node[],
  incomingEdges: Map<string, string[]>
): Map<string, number> {
  const ranks = new Map<string, number>();
  const processed = new Set<string>();

  // Find root nodes (no incoming edges)
  const roots = nodes.filter(
    (node) => (incomingEdges.get(node.id) || []).length === 0
  );

  if (roots.length === 0) {
    // Handle cycles by assigning sequential ranks
    for (let i = 0; i < nodes.length; i++) {
      ranks.set(nodes[i].id, i % 3);
    }
    return ranks;
  }

  // BFS to assign ranks
  const queue: Array<{ id: string; rank: number }> = roots.map((node) => ({
    id: node.id,
    rank: 0,
  }));

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || processed.has(current.id)) {
      continue;
    }

    processed.add(current.id);
    ranks.set(current.id, current.rank);

    // Find children and add to queue
    const children = nodes.filter((node) =>
      (incomingEdges.get(node.id) || []).includes(current.id)
    );

    for (const child of children) {
      if (!processed.has(child.id)) {
        queue.push({ id: child.id, rank: current.rank + 1 });
      }
    }
  }

  // Handle unprocessed nodes
  for (const node of nodes) {
    if (!processed.has(node.id)) {
      ranks.set(node.id, 0);
    }
  }

  return ranks;
}

function getNodePosition(
  rank: number,
  indexInRank: number,
  totalInRank: number,
  maxRank: number,
  options: Required<LayoutOptions>
): { x: number; y: number } {
  const { direction, nodeWidth, nodeHeight, rankSep, nodeSep } = options;

  const centerOffset =
    (indexInRank - (totalInRank - 1) / 2) * (nodeWidth + nodeSep);
  const rankOffset = rank * (nodeHeight + rankSep);

  switch (direction) {
    case "TB":
      return { x: centerOffset, y: rankOffset };
    case "BT":
      return { x: centerOffset, y: (maxRank - rank) * (nodeHeight + rankSep) };
    case "LR":
      return { x: rankOffset, y: centerOffset };
    case "RL":
      return { x: (maxRank - rank) * (nodeWidth + rankSep), y: centerOffset };
    default:
      return { x: centerOffset, y: rankOffset };
  }
}
