"use client";

import { useMemo } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceObjects } from "@/hooks/sealos/resource/use-resource-objects";
import {
  convertResourceObjectsToNodes,
  addDevboxToDevGroup,
} from "@/lib/flowgraph/nodes/flowgraph-nodes-utils";
import {
  convertObjectsToNodes,
  inferObjectsReliances,
  convertReliancesToEdges,
  deriveNetworkNodesAndEdges,
  createDevGroup,
  applyLayout,
} from "./flowgraph-utils";

/**
 * Hook to convert resource targets into flowgraph nodes
 * @param targets - Array of resource targets to convert to nodes
 * @returns Object containing nodes, loading state, and error state
 */
export const useFlowgraphNodes = (targets: ResourceTarget[]) => {
  // Fetch resource objects for the given targets
  const resourceObjectsQuery = useResourceObjects(targets);

  // Extract resource objects from the query results
  const objects = resourceObjectsQuery.data;

  // Pass objects to the utility functions
  const baseNodes = convertObjectsToNodes(objects);
  const reliances = inferObjectsReliances(objects);

  // Convert reliances to edges
  const baseEdges = convertReliancesToEdges(reliances);

  // Derive network nodes and edges from the base nodes
  const { nodes: networkNodes, edges: networkEdges } =
    deriveNetworkNodesAndEdges(objects);

  // Merge base nodes and network nodes
  const mergedNodes = [...baseNodes, ...networkNodes];

  // Apply devbox grouping to merged nodes
  const groupedNodes = createDevGroup(mergedNodes);

  // Apply layout to the grouped nodes
  const nodes = applyLayout(groupedNodes);

  return {
    nodes,
    baseNodes,
    reliances,
    baseEdges,
    networkNodes,
    networkEdges,
    isLoading: resourceObjectsQuery.isLoading,
    isPending: resourceObjectsQuery.pending,
    error: resourceObjectsQuery.error,
    // Expose the raw resource objects query for additional data if needed
    resourceObjectsQuery,
  };
};
