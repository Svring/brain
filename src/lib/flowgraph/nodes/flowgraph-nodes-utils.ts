import type { Node } from "@xyflow/react";

interface ResourceObject {
  name: string;
  kind: string;
  [key: string]: any;
}

/**
 * Convert resource objects into React Flow nodes.
 *
 * @param resourceObjects Array of resource objects with name and kind fields.
 * @returns Array of nodes compatible with React Flow.
 */
export const convertResourceObjectsToNodes = (
  resourceObjects: ResourceObject[]
): Node<any>[] => {
  const nodes: Node<any>[] = [];

  for (const resourceObject of resourceObjects) {
    const { name, kind } = resourceObject;
    if (!name || !kind) {
      continue;
    }

    const id = `${kind.toLowerCase()}-${name}`;
    const type = kind.toLowerCase();

    nodes.push({
      id,
      type,
      position: { x: 0, y: 0 },
      data: resourceObject,
    });
  }

  return nodes;
};
