import type { Edge, Node, SplitLayoutOptions } from "./types";
import { applyLayout } from "./normal-layout";

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

export function applySplitLayout(
  nodes: Node[],
  edges: Edge[],
  options: SplitLayoutOptions = {}
): Node[] {
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
      rankSep: 30,
      nodeSep: 20,
    },
    outsideLayoutOptions = {},
  } = options;

  const groupNode = nodes.find((n) => n.id === groupId);
  if (!groupNode) {
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

  const laidOutChildren = applyLayout(
    children.map((n) => ({ ...n, position: { x: 0, y: 0 } })),
    groupEdges,
    {
      ...groupLayoutOptions,
      nodeWidth: childNodeWidth,
      nodeHeight: childNodeHeight,
      getNodeSize: getChildNodeSize,
    }
  );

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

  const childOffsetX = (groupWidth - childBBox.width) / 2 - childBBox.minX;
  const childOffsetY = (groupHeight - childBBox.height) / 2 - childBBox.minY;

  const positionedChildren = laidOutChildren.map((n) => ({
    ...n,
    position: {
      x: n.position.x + childOffsetX,
      y: n.position.y + childOffsetY,
    },
  }));

  const laidOutOutside = applyLayout(
    outsideNodes.map((n) => ({ ...n, position: { x: 0, y: 0 } })),
    outsideEdges,
    { ...outsideLayoutOptions, getNodeSize: getOutsideNodeSize }
  );

  const outsideBBox = computeBoundingBox(
    laidOutOutside,
    outsideLayoutOptions.nodeWidth ?? 250,
    outsideLayoutOptions.nodeHeight ?? 200
  );

  if (getOutsideNodeSize) {
    const customOutsideBBox = computeBoundingBoxForNodes(
      laidOutOutside,
      getOutsideNodeSize
    );
    (outsideBBox as any).minX = customOutsideBBox.minX;
    (outsideBBox as any).minY = customOutsideBBox.minY;
    (outsideBBox as any).maxX = customOutsideBBox.maxX;
    (outsideBBox as any).maxY = customOutsideBBox.maxY;
    (outsideBBox as any).width = customOutsideBBox.width;
    (outsideBBox as any).height = customOutsideBBox.height;
  }

  const outsideOffsetX =
    groupLeft + groupWidth + gapBetweenGroupAndRest - outsideBBox.minX;
  const outsideOffsetY = 0 - outsideBBox.minY;

  const positionedOutside = laidOutOutside.map((n) => ({
    ...n,
    position: {
      x: n.position.x + outsideOffsetX,
      y: n.position.y + outsideOffsetY,
    },
  }));

  return [positionedGroupNode, ...positionedChildren, ...positionedOutside];
}
