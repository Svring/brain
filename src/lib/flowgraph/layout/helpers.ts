import type { Edge, Node } from "./types";
import _ from "lodash";

export const DEFAULT_OPTIONS = {
  direction: "TB" as const,
  nodeWidth: 250,
  nodeHeight: 200,
  rankSep: 150,
  nodeSep: 150,
  edgeAware: false,
  barycentricIterations: 2,
};

export function groupByRank(nodes: Node[], ranks: Map<string, number>) {
  return _.groupBy(
    nodes.map((n) => ({ node: n, rank: ranks.get(n.id) || 0 })),
    "rank"
  );
}

export function averageIndex(
  ids: string[],
  indexMap: Map<string, number>
): number {
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

export function computeIncoming(nodes: Node[], edges: Edge[]) {
  const incoming = new Map<string, string[]>();
  for (const n of nodes) incoming.set(n.id, []);
  for (const e of edges) {
    const arr = incoming.get(e.target) || [];
    incoming.set(e.target, [...arr, e.source]);
  }
  return incoming;
}

export function computeOutgoing(nodes: Node[], edges: Edge[]) {
  const outgoing = new Map<string, string[]>();
  for (const n of nodes) outgoing.set(n.id, []);
  for (const e of edges) {
    const arr = outgoing.get(e.source) || [];
    outgoing.set(e.source, [...arr, e.target]);
  }
  return outgoing;
}

export function calculateNodeRanks(
  nodes: Node[],
  incomingEdges: Map<string, string[]>
): Map<string, number> {
  const ranks = new Map<string, number>();
  const processed = new Set<string>();

  // Prioritize network and ingress nodes (including preview variants) - they should be at the top in BT direction
  const priorityNodes = nodes.filter(
    (node) =>
      node.type === "network" ||
      node.type === "ingress" ||
      node.type === "network-preview"
  );
  const nonPriorityNodes = nodes.filter(
    (node) =>
      node.type !== "network" &&
      node.type !== "ingress" &&
      node.type !== "network-preview"
  );

  // Find roots among non-priority nodes (nodes with no incoming edges)
  const roots = nonPriorityNodes.filter(
    (node) => (incomingEdges.get(node.id) || []).length === 0
  );

  // If no roots found among non-priority nodes, distribute them evenly starting from rank 0
  if (roots.length === 0 && nonPriorityNodes.length > 0) {
    for (let i = 0; i < nonPriorityNodes.length; i++) {
      ranks.set(nonPriorityNodes[i].id, i % 3);
    }
    // Assign priority nodes to the highest rank + 1
    const maxRank = Math.max(...Array.from(ranks.values()));
    for (const priorityNode of priorityNodes) {
      ranks.set(priorityNode.id, maxRank + 1);
      processed.add(priorityNode.id);
    }
    return ranks;
  }

  // Process root nodes starting from rank 0
  const queue: Array<{ id: string; rank: number }> = roots.map((node) => ({
    id: node.id,
    rank: 0,
  }));

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || processed.has(current.id)) continue;
    processed.add(current.id);
    ranks.set(current.id, current.rank);
    const children = nonPriorityNodes.filter((node) =>
      (incomingEdges.get(node.id) || []).includes(current.id)
    );
    for (const child of children) {
      if (!processed.has(child.id))
        queue.push({ id: child.id, rank: current.rank + 1 });
    }
  }

  // Handle any remaining unprocessed non-priority nodes
  for (const node of nonPriorityNodes) {
    if (!processed.has(node.id)) ranks.set(node.id, 0);
  }

  // Find the maximum rank among non-priority nodes and assign priority nodes to max rank + 1
  const maxRank = ranks.size > 0 ? Math.max(...Array.from(ranks.values())) : -1;
  for (const priorityNode of priorityNodes) {
    ranks.set(priorityNode.id, maxRank + 1);
    processed.add(priorityNode.id);
  }

  // Split ranks that have more than 4 nodes
  const adjustedRanks = splitOvercrowdedRanks(ranks, nodes);

  return adjustedRanks;
}

export function splitOvercrowdedRanks(
  ranks: Map<string, number>,
  nodes: Node[]
): Map<string, number> {
  const maxNodesPerRank = 3;
  const adjustedRanks = new Map<string, number>();

  // Create a map to look up node types by ID
  const nodeTypeById = new Map<string, string>();
  for (const node of nodes) {
    nodeTypeById.set(node.id, node.type || "");
  }

  // Group nodes by their current rank
  const nodesByRank = new Map<number, string[]>();
  for (const [nodeId, rank] of ranks.entries()) {
    if (!nodesByRank.has(rank)) {
      nodesByRank.set(rank, []);
    }
    nodesByRank.get(rank)!.push(nodeId);
  }

  // Separate priority nodes (network/ingress) from regular nodes
  const priorityNodeTypes = new Set(["network", "ingress", "network-preview"]);
  const priorityRanks = new Set<number>();
  const regularRanks = new Set<number>();

  for (const [rank, nodeIds] of nodesByRank.entries()) {
    const hasPriorityNodes = nodeIds.some((nodeId) =>
      priorityNodeTypes.has(nodeTypeById.get(nodeId) || "")
    );
    if (hasPriorityNodes) {
      priorityRanks.add(rank);
    } else {
      regularRanks.add(rank);
    }
  }

  // Process regular ranks first (from lowest to highest) - overflow goes DOWN (lower ranks)
  const sortedRegularRanks = Array.from(regularRanks).sort((a, b) => a - b);
  let regularRankOffset = 0;

  for (const originalRank of sortedRegularRanks) {
    const nodesInRank = nodesByRank.get(originalRank) || [];
    const adjustedRank = originalRank - regularRankOffset; // Subtract to go down

    if (nodesInRank.length <= maxNodesPerRank) {
      // Rank fits within limit, assign all nodes to this rank
      for (const nodeId of nodesInRank) {
        adjustedRanks.set(nodeId, adjustedRank);
      }
    } else {
      // Split the rank into multiple sub-ranks going DOWN
      const numSubRanks = Math.ceil(nodesInRank.length / maxNodesPerRank);

      for (let subRank = 0; subRank < numSubRanks; subRank++) {
        const startIdx = subRank * maxNodesPerRank;
        const endIdx = Math.min(startIdx + maxNodesPerRank, nodesInRank.length);
        const subRankNodes = nodesInRank.slice(startIdx, endIdx);

        for (const nodeId of subRankNodes) {
          adjustedRanks.set(nodeId, adjustedRank - subRank); // Subtract to go down
        }
      }

      // Update rank offset for subsequent regular ranks
      regularRankOffset += numSubRanks - 1;
    }
  }

  // Process priority ranks (network/ingress) - these stay at their high ranks
  const sortedPriorityRanks = Array.from(priorityRanks).sort((a, b) => b - a);

  for (const originalRank of sortedPriorityRanks) {
    const nodesInRank = nodesByRank.get(originalRank) || [];

    if (nodesInRank.length <= maxNodesPerRank) {
      // Rank fits within limit, assign all nodes to this rank
      for (const nodeId of nodesInRank) {
        adjustedRanks.set(nodeId, originalRank);
      }
    } else {
      // Split priority nodes across multiple ranks at the top
      const numSubRanks = Math.ceil(nodesInRank.length / maxNodesPerRank);

      for (let subRank = 0; subRank < numSubRanks; subRank++) {
        const startIdx = subRank * maxNodesPerRank;
        const endIdx = Math.min(startIdx + maxNodesPerRank, nodesInRank.length);
        const subRankNodes = nodesInRank.slice(startIdx, endIdx);

        for (const nodeId of subRankNodes) {
          adjustedRanks.set(nodeId, originalRank + subRank); // Add to go up
        }
      }
    }
  }

  return adjustedRanks;
}
