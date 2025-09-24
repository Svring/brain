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

  // Hierarchical ranking for split layout:
  // Rank 0 (bottom): cluster and objectstoragebucket nodes
  // Rank 1 (middle): deployment, statefulset, and devbox nodes
  // Rank 2 (top): network nodes (including preview variants)

  const bottomNodes = nodes.filter(
    (node) => node.type === "cluster" || node.type === "objectstoragebucket"
  );
  const middleNodes = nodes.filter(
    (node) =>
      node.type === "deployment" ||
      node.type === "statefulset" ||
      node.type === "devbox"
  );
  const networkNodes = nodes.filter(
    (node) =>
      node.type === "network" ||
      node.type === "ingress" ||
      node.type === "network-preview"
  );
  const otherNodes = nodes.filter(
    (node) =>
      node.type !== "cluster" &&
      node.type !== "objectstoragebucket" &&
      node.type !== "deployment" &&
      node.type !== "statefulset" &&
      node.type !== "devbox" &&
      node.type !== "network" &&
      node.type !== "ingress" &&
      node.type !== "network-preview"
  );

  // Assign ranks based on hierarchy
  for (const node of bottomNodes) {
    ranks.set(node.id, 0); // Bottom row
  }

  for (const node of middleNodes) {
    ranks.set(node.id, 1); // Middle row
  }

  for (const node of networkNodes) {
    ranks.set(node.id, 2); // Top row
  }

  // Other nodes go to middle row by default
  for (const node of otherNodes) {
    ranks.set(node.id, 1);
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
  const maxNodesPerRank = 6;
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

export function alignNetworkNodesWithParents(
  nodes: Node[],
  edges: Edge[]
): Node[] {
  // Separate nodes into dev group children and outside nodes
  const devGroupChildren = nodes.filter(
    (n) => (n as any).parentId === "devbox-group"
  );
  const outsideNodes = nodes.filter(
    (n) => (n as any).parentId !== "devbox-group"
  );
  const devGroupNode = nodes.find((n) => n.id === "devbox-group");

  // Apply alignment separately for each group to maintain isolation
  const alignedDevGroupChildren =
    devGroupChildren.length > 0
      ? alignNodesInGroup(devGroupChildren, edges, "devbox-group")
      : [];

  const alignedOutsideNodes =
    outsideNodes.length > 0 ? alignNodesInGroup(outsideNodes, edges, null) : [];

  // Combine results, preserving the dev group node if it exists
  const result = [...alignedOutsideNodes];
  if (devGroupNode) {
    result.push(devGroupNode);
  }
  result.push(...alignedDevGroupChildren);

  return result;
}

function alignNodesInGroup(
  nodes: Node[],
  edges: Edge[],
  groupId: string | null
): Node[] {
  // Create a map to find network nodes and their parent relationships within this group
  const networkToParentMap = new Map<string, string>();
  const parentToNetworkMap = new Map<string, string>();

  // Build parent-child relationships from edges (only within this group)
  for (const edge of edges) {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    // If target is a network node and source is deployment/statefulset/devbox, establish relationship
    if (
      targetNode?.type === "network" &&
      (sourceNode?.type === "deployment" ||
        sourceNode?.type === "statefulset" ||
        sourceNode?.type === "devbox")
    ) {
      networkToParentMap.set(targetNode.id, sourceNode.id);
      parentToNetworkMap.set(sourceNode.id, targetNode.id);
    }
  }

  // Group nodes by their ranks (assuming BT direction where higher rank = higher position)
  const nodesByRank = new Map<number, Node[]>();
  const nodeRanks = new Map<string, number>();

  // Determine ranks based on node types (matching our new hierarchy)
  for (const node of nodes) {
    let rank = 1; // default middle rank
    if (node.type === "cluster" || node.type === "objectstoragebucket")
      rank = 0; // bottom
    else if (
      node.type === "deployment" ||
      node.type === "statefulset" ||
      node.type === "devbox"
    )
      rank = 1; // middle
    else if (
      node.type === "network" ||
      node.type === "ingress" ||
      node.type === "network-preview"
    )
      rank = 2; // top

    nodeRanks.set(node.id, rank);
    if (!nodesByRank.has(rank)) {
      nodesByRank.set(rank, []);
    }
    nodesByRank.get(rank)!.push(node);
  }

  // Sort middle rank nodes (deployment/statefulset/devbox) by x position
  const middleRankNodes = nodesByRank.get(1) || [];
  const sortedMiddleNodes = middleRankNodes
    .filter(
      (n) =>
        n.type === "deployment" ||
        n.type === "statefulset" ||
        n.type === "devbox"
    )
    .sort((a, b) => a.position.x - b.position.x);

  // Sort network nodes to align with their parents
  const networkNodes = nodesByRank.get(2) || [];

  // Track occupied X ranges to prevent overlapping (considering node width)
  const occupiedRanges: Array<{ start: number; end: number }> = [];
  const alignedNetworkNodes: Node[] = [];
  const usedNetworkIds = new Set<string>();
  const nodeWidth = 280; // Standard node width from flowgraph utils
  const minSpacing = 20; // Minimum spacing between nodes

  // Helper function to check if a position conflicts with existing nodes
  const isPositionAvailable = (x: number): boolean => {
    const nodeStart = x;
    const nodeEnd = x + nodeWidth;

    return !occupiedRanges.some(
      (range) => nodeStart < range.end && nodeEnd > range.start // Overlap check
    );
  };

  // Helper function to find the nearest available position
  const findAvailablePosition = (preferredX: number): number => {
    if (isPositionAvailable(preferredX)) {
      return preferredX;
    }

    // Try positions to the right and left alternately
    let offset = nodeWidth + minSpacing;

    for (let attempt = 1; attempt <= 20; attempt++) {
      // Try right side
      const rightX = preferredX + offset * attempt;
      if (isPositionAvailable(rightX)) {
        return rightX;
      }

      // Try left side
      const leftX = preferredX - offset * attempt;
      if (isPositionAvailable(leftX)) {
        return leftX;
      }
    }

    // Fallback: find the rightmost position and place after it
    const rightmostEnd = Math.max(0, ...occupiedRanges.map((r) => r.end));
    return rightmostEnd + minSpacing;
  };

  // First pass: align network nodes with their parents
  for (let i = 0; i < sortedMiddleNodes.length; i++) {
    const parentNode = sortedMiddleNodes[i];
    const networkNodeId = parentToNetworkMap.get(parentNode.id);

    if (networkNodeId && !usedNetworkIds.has(networkNodeId)) {
      const networkNode = networkNodes.find((n) => n.id === networkNodeId);
      if (networkNode) {
        const targetX = findAvailablePosition(parentNode.position.x);

        // Mark this position as occupied
        occupiedRanges.push({
          start: targetX,
          end: targetX + nodeWidth,
        });

        alignedNetworkNodes.push({
          ...networkNode,
          position: {
            ...networkNode.position,
            x: targetX,
          },
        });
        usedNetworkIds.add(networkNodeId);
      }
    }
  }

  // Second pass: position remaining network nodes that don't have parent relationships
  for (const networkNode of networkNodes) {
    if (!usedNetworkIds.has(networkNode.id)) {
      const targetX = findAvailablePosition(networkNode.position.x);

      // Mark this position as occupied
      occupiedRanges.push({
        start: targetX,
        end: targetX + nodeWidth,
      });

      alignedNetworkNodes.push({
        ...networkNode,
        position: {
          ...networkNode.position,
          x: targetX,
        },
      });
    }
  }

  // Rebuild the nodes array with aligned network nodes
  return nodes.map((node) => {
    if (
      node.type === "network" ||
      node.type === "ingress" ||
      node.type === "network-preview"
    ) {
      const alignedNode = alignedNetworkNodes.find((n) => n.id === node.id);
      return alignedNode || node;
    }
    return node;
  });
}
