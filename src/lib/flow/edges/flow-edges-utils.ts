import _ from "lodash";
import type { ConnectionsByKind } from "@/lib/algorithm/reliance/env-reliance";
import { type Edge } from "@xyflow/react";

/**
 * Convert the ConnectionsByKind structure returned by `processProjectConnections`
 * into an array of edges consumable by React Flow (or similar libraries).
 *
 * The `source` is the concatenation of the kind and resource name found in
 * the `connectFrom` map, and the `target` is the concatenation of the current
 * workload kind and its name.
 *
 * Example:
 *   connections.deployment["my-app"].connectFrom.cluster = ["pg", "redis"]
 *   => generates edges:
 *      { id: "cluster-pg-deployment-my-app", source: "cluster-pg", target: "deployment-my-app" }
 *      { id: "cluster-redis-deployment-my-app", source: "cluster-redis", target: "deployment-my-app" }
 */
export const convertConnectionsToEdges = (
  connections: ConnectionsByKind
): Edge[] => {
  const edges = _.flatMap(connections, (workloads, targetKind) =>
    _.flatMap(workloads, ({ connectFrom }, workloadName) => {
      const target = `${targetKind}-${workloadName}`;

      // For each kind of source, generate edges
      return _.flatMap(connectFrom, (names, sourceKind) =>
        names.map((name) => {
          const source = `${sourceKind}-${name}`;
          const id = `${source}-${target}`; // deterministic unique id
          return {
            id,
            source,
            target,
            type: "step",
            animated: true,
          } as Edge;
        })
      );
    })
  );

  // Ensure uniqueness in case duplicates slipped through
  return _.uniqBy(edges, (e) => `${e.source}-${e.target}`);
};

export const updateEdgesForNode = (edges: Edge[], nodeId: string, updates: Partial<Edge>): Edge[] => {
    let changed = false;
    const newEdges = edges.map(edge => {
        if (edge.source === nodeId || edge.target === nodeId) {
            const newEdge = { ...edge, ...updates };
            if (!_.isEqual(edge, newEdge)) {
                changed = true;
            }
            return newEdge;
        }
        return edge;
    });
    return changed ? newEdges : edges;
};