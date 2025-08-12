import { Edge, Position, InternalNode, MarkerType } from "@xyflow/react";

interface ResourceReliance {
  name: string;
  kind: string;
}

interface ResourceReliances {
  [kind: string]: {
    [resourceName: string]: ResourceReliance[];
  };
}

/**
 * Convert the ResourceReliances structure into an array of edges consumable by React Flow.
 *
 * The `source` is the dependency resource (e.g., cluster), and the `target` is the owner resource (e.g., statefulset).
 *
 * Example:
 *   reliances.statefulset["affine-naxuseoz"] = [
 *     { name: "affine-naxuseoz-redis", kind: "Cluster" },
 *     { name: "affine-naxuseoz-pg", kind: "Cluster" }
 *   ]
 *   => generates edges:
 *      { id: "cluster-affine-naxuseoz-redis-statefulset-affine-naxuseoz", source: "cluster-affine-naxuseoz-redis", target: "statefulset-affine-naxuseoz" }
 *      { id: "cluster-affine-naxuseoz-pg-statefulset-affine-naxuseoz", source: "cluster-affine-naxuseoz-pg", target: "statefulset-affine-naxuseoz" }
 */
export const convertReliancesToEdges = (
  reliances: ResourceReliances
): Edge[] => {
  const edges: Edge[] = [];

  // Iterate through each owner kind (e.g., "statefulset")
  for (const [ownerKind, ownerResources] of Object.entries(reliances)) {
    // Iterate through each owner resource (e.g., "affine-naxuseoz")
    for (const [ownerName, dependencies] of Object.entries(ownerResources)) {
      const target = `${ownerKind.toLowerCase()}-${ownerName}`;

      // For each dependency, create an edge
      for (const dependency of dependencies) {
        const source = `${dependency.kind.toLowerCase()}-${dependency.name}`;
        const id = `${source}-${target}`; // deterministic unique id

        edges.push({
          id,
          source,
          target,
          type: "floating",
          markerEnd: { type: MarkerType.Arrow, width: 30, height: 30 },
          animated: true,
        });
      }
    }
  }

  return edges;
};

// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
function getNodeIntersection(intersectionNode: any, targetNode: any) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const { width: intersectionNodeWidth, height: intersectionNodeHeight } =
    intersectionNode.measured;
  const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
  const targetPosition = targetNode.internals.positionAbsolute;

  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + targetNode.measured.width / 2;
  const y1 = targetPosition.y + targetNode.measured.height / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(node: any, intersectionPoint: any) {
  const n = { ...node.internals.positionAbsolute, ...node };
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + n.measured.width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= n.y + n.measured.height - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: InternalNode, target: InternalNode) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}
