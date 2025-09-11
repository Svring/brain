import type { Edge, Node } from "./types";
import * as _ from "lodash";

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
  incomingEdges: Map<string, string[]>,
  edges: Edge[]
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
  const adjustedRanks = splitOvercrowdedRanks(ranks, nodes, edges);

  return adjustedRanks;
}

export function splitOvercrowdedRanks(
  ranks: Map<string, number>,
  nodes: Node[],
  edges: Edge[]
): Map<string, number> {
  const maxNodesPerRank = 4;
  const adjustedRanks = new Map<string, number>();

  // Create a map to look up node types by ID
  const nodeTypeById = new Map<string, string>();
  for (const node of nodes) {
    nodeTypeById.set(node.id, node.type || "");
  }

  // Build parent-child relationships from edges
  const childrenMap = new Map<string, string[]>();
  const parentsMap = new Map<string, string[]>();

  for (const node of nodes) {
    childrenMap.set(node.id, []);
    parentsMap.set(node.id, []);
  }

  for (const edge of edges) {
    const children = childrenMap.get(edge.source) || [];
    children.push(edge.target);
    childrenMap.set(edge.source, children);

    const parents = parentsMap.get(edge.target) || [];
    parents.push(edge.source);
    parentsMap.set(edge.target, parents);
  }

  // Group nodes by their current rank
  const nodesByRank = new Map<number, string[]>();
  for (const nodeId of Array.from(ranks.keys())) {
    const rank = ranks.get(nodeId)!;
    if (!nodesByRank.has(rank)) {
      nodesByRank.set(rank, []);
    }
    nodesByRank.get(rank)!.push(nodeId);
  }

  // Separate priority nodes (network/ingress) from regular nodes
  const priorityNodeTypes = new Set(["network", "ingress", "network-preview"]);

  // Process ranks from top to bottom to maintain hierarchy
  const sortedRanks = Array.from(nodesByRank.keys()).sort((a, b) => b - a);

  for (const originalRank of sortedRanks) {
    const nodesInRank = nodesByRank.get(originalRank) || [];

    // Separate priority and regular nodes in this rank
    const priorityNodes = nodesInRank.filter((nodeId) =>
      priorityNodeTypes.has(nodeTypeById.get(nodeId) || "")
    );
    const regularNodes = nodesInRank.filter(
      (nodeId) => !priorityNodeTypes.has(nodeTypeById.get(nodeId) || "")
    );

    // Handle priority nodes - they can be split horizontally but stay at high ranks
    if (priorityNodes.length > 0) {
      if (priorityNodes.length <= maxNodesPerRank) {
        for (const nodeId of priorityNodes) {
          adjustedRanks.set(nodeId, originalRank);
        }
      } else {
        // Split priority nodes across multiple high ranks
        const numSubRanks = Math.ceil(priorityNodes.length / maxNodesPerRank);
        for (let subRank = 0; subRank < numSubRanks; subRank++) {
          const startIdx = subRank * maxNodesPerRank;
          const endIdx = Math.min(
            startIdx + maxNodesPerRank,
            priorityNodes.length
          );
          const subRankNodes = priorityNodes.slice(startIdx, endIdx);

          for (const nodeId of subRankNodes) {
            adjustedRanks.set(nodeId, originalRank + subRank);
          }
        }
      }
    }

    // Handle regular nodes - respect hierarchy when splitting
    if (regularNodes.length > 0) {
      if (regularNodes.length <= maxNodesPerRank) {
        for (const nodeId of regularNodes) {
          adjustedRanks.set(nodeId, originalRank);
        }
      } else {
        // For overcrowded ranks, we need to be smart about which nodes to push down
        // Prioritize keeping nodes with fewer children in the current rank
        // and push nodes with more children to lower ranks

        const nodesByChildCount = regularNodes.map((nodeId) => ({
          nodeId,
          childCount: (childrenMap.get(nodeId) || []).length,
          hasUnprocessedChildren: (childrenMap.get(nodeId) || []).some(
            (childId) => !adjustedRanks.has(childId)
          ),
        }));

        // Sort by: 1) nodes with unprocessed children last, 2) then by child count (fewer children first)
        nodesByChildCount.sort((a, b) => {
          if (a.hasUnprocessedChildren !== b.hasUnprocessedChildren) {
            return a.hasUnprocessedChildren ? 1 : -1;
          }
          return a.childCount - b.childCount;
        });

        // Keep first maxNodesPerRank nodes in current rank
        const nodesToKeep = nodesByChildCount.slice(0, maxNodesPerRank);
        const nodesToPush = nodesByChildCount.slice(maxNodesPerRank);

        // Assign nodes to keep in current rank
        for (const { nodeId } of nodesToKeep) {
          adjustedRanks.set(nodeId, originalRank);
        }

        // Push remaining nodes to lower ranks, trying to maintain some hierarchy
        let currentPushRank = originalRank - 1;
        let nodesInCurrentPushRank = 0;

        for (const { nodeId } of nodesToPush) {
          if (nodesInCurrentPushRank >= maxNodesPerRank) {
            currentPushRank--;
            nodesInCurrentPushRank = 0;
          }

          adjustedRanks.set(nodeId, currentPushRank);
          nodesInCurrentPushRank++;
        }
      }
    }
  }

  return adjustedRanks;
}
