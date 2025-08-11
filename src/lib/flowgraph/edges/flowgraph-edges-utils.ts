import type { Edge } from "@xyflow/react";

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
          type: "step",
          animated: true,
        });
      }
    }
  }

  return edges;
};
