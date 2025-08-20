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
  nodeWidth: 250,
  nodeHeight: 200,
  rankSep: 150,
  nodeSep: 150,
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

export interface SplitLayoutOptions {
  groupId?: string;
  groupPadding?: number;
  gapBetweenGroupAndRest?: number;
  groupPosition?: { x: number; y: number };
  childNodeWidth?: number;
  childNodeHeight?: number;
  // Optional per-child size resolver; falls back to childNodeWidth/childNodeHeight
  getChildNodeSize?: (node: Node) => { width: number; height: number };
  // Optional per-outside size resolver; falls back to outsideLayoutOptions width/height
  getOutsideNodeSize?: (node: Node) => { width: number; height: number };
  // Extra breathing room inside the group for edges/handles
  edgeClearance?: number;
  // If true, recompute group size every layout ignoring existing style sizes
  autoResizeGroup?: boolean;
  groupLayoutOptions?: LayoutOptions;
  outsideLayoutOptions?: LayoutOptions;
}

function computeBoundingBox(
  nodes: Node[],
  nodeWidth: number,
  nodeHeight: number
): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const n of nodes) {
    const left = n.position.x;
    const top = n.position.y;
    const right = left + nodeWidth;
    const bottom = top + nodeHeight;

    if (left < minX) minX = left;
    if (top < minY) minY = top;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  }

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function computeBoundingBoxForNodes(
  nodes: Node[],
  getSize: (n: Node) => { width: number; height: number }
): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const n of nodes) {
    const { width, height } = getSize(n);
    const left = n.position.x;
    const top = n.position.y;
    const right = left + width;
    const bottom = top + height;

    if (left < minX) minX = left;
    if (top < minY) minY = top;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  }

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/**
 * Layout nodes by splitting them into a left-side group (e.g., devbox group)
 * and right-side remaining nodes. The children of the group are laid out within
 * the group's bounding box, and the rest are laid out normally and offset to
 * the right of the group.
 */
export const applySplitLayout = (
  nodes: Node[],
  edges: Edge[],
  options: SplitLayoutOptions = {}
): Node[] => {
  const {
    groupId = "devbox-group",
    groupPadding = 20,
    gapBetweenGroupAndRest = 200,
    groupPosition = { x: -700, y: 0 },
    childNodeWidth = 280,
    childNodeHeight = 200,
    getChildNodeSize,
    getOutsideNodeSize,
    edgeClearance = 80,
    autoResizeGroup = true,
    groupLayoutOptions = {
      direction: "TB",
      nodeWidth: childNodeWidth,
      nodeHeight: childNodeHeight,
      rankSep: 40,
      nodeSep: 20,
    },
    outsideLayoutOptions = {},
  } = options;

  const groupNode = nodes.find((n) => n.id === groupId);
  if (!groupNode) {
    // No group present; fallback to normal layout
    return applyLayout(nodes, edges, outsideLayoutOptions);
  }

  const children = nodes.filter((n) => (n as any).parentId === groupId);
  const childIds = new Set(children.map((n) => n.id));
  const groupEdges = edges.filter(
    (e) => childIds.has(e.source) && childIds.has(e.target)
  );

  const outsideNodes = nodes.filter(
    (n) => n.id !== groupId && (n as any).parentId !== groupId
  );
  const outsideEdges = edges.filter(
    (e) => !childIds.has(e.source) || !childIds.has(e.target)
  );

  // 1) Layout children relative to origin
  const laidOutChildren = applyLayout(
    children.map((n) => ({ ...n, position: { x: 0, y: 0 } })),
    groupEdges,
    {
      ...groupLayoutOptions,
      nodeWidth: childNodeWidth,
      nodeHeight: childNodeHeight,
    }
  );

  // 2) Determine group size - prefer existing style if present, otherwise fit to children + padding
  const sizeForChild =
    getChildNodeSize ??
    (() => ({ width: childNodeWidth, height: childNodeHeight }));
  const childBBox = computeBoundingBoxForNodes(laidOutChildren, sizeForChild);
  const proposedWidth = childBBox.width + groupPadding * 2 + edgeClearance;
  const proposedHeight = childBBox.height + groupPadding * 2 + edgeClearance;

  const existingWidth = Number((groupNode as any).style?.width) || undefined;
  const existingHeight = Number((groupNode as any).style?.height) || undefined;
  const groupWidth = autoResizeGroup
    ? proposedWidth
    : existingWidth ?? proposedWidth;
  const groupHeight = autoResizeGroup
    ? proposedHeight
    : existingHeight ?? proposedHeight;

  const groupLeft = groupPosition.x;
  const groupTop = groupPosition.y;

  const positionedGroupNode: Node = {
    ...groupNode,
    position: { x: groupLeft, y: groupTop },
    style: {
      ...(groupNode as any).style,
      width: groupWidth,
      height: groupHeight,
    },
  } as Node;

  // 3) Translate children inside the group with padding
  const childOffsetX = groupLeft + groupPadding - childBBox.minX;
  const childOffsetY = groupTop + groupPadding - childBBox.minY;

  const positionedChildren = laidOutChildren.map((n) => ({
    ...n,
    position: {
      x: n.position.x + childOffsetX,
      y: n.position.y + childOffsetY,
    },
  }));

  // 4) Layout outside nodes and offset to the right of the group
  const laidOutOutside = applyLayout(
    outsideNodes.map((n) => ({ ...n, position: { x: 0, y: 0 } })),
    outsideEdges,
    outsideLayoutOptions
  );

  const outsideBBox = computeBoundingBox(
    laidOutOutside,
    outsideLayoutOptions.nodeWidth ?? DEFAULT_OPTIONS.nodeWidth,
    outsideLayoutOptions.nodeHeight ?? DEFAULT_OPTIONS.nodeHeight
  );

  // Allow per-node outside sizes for more accurate bbox if provided
  if (getOutsideNodeSize) {
    const customOutsideBBox = computeBoundingBoxForNodes(
      laidOutOutside,
      getOutsideNodeSize
    );
    // Overwrite with custom bbox if any custom sizes are used
    (outsideBBox as any).minX = customOutsideBBox.minX;
    (outsideBBox as any).minY = customOutsideBBox.minY;
    (outsideBBox as any).maxX = customOutsideBBox.maxX;
    (outsideBBox as any).maxY = customOutsideBBox.maxY;
    (outsideBBox as any).width = customOutsideBBox.width;
    (outsideBBox as any).height = customOutsideBBox.height;
  }

  const outsideOffsetX =
    groupLeft + groupWidth + gapBetweenGroupAndRest - outsideBBox.minX;
  const outsideOffsetY = 0 - outsideBBox.minY; // align tops

  const positionedOutside = laidOutOutside.map((n) => ({
    ...n,
    position: {
      x: n.position.x + outsideOffsetX,
      y: n.position.y + outsideOffsetY,
    },
  }));

  // 5) Combine results
  return [positionedGroupNode, ...positionedChildren, ...positionedOutside];
};
