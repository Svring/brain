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

  // Memoize the computation of nodes and edges
  const { nodes, edges } = useMemo(() => {
    // Log the loading state and data presence
    console.log("[useFlowgraphNodes] isLoading:", resourceObjectsQuery.isLoading, "data:", resourceObjectsQuery.data);

    // Return empty arrays if still loading or no data
    if (resourceObjectsQuery.isLoading || !resourceObjectsQuery.data) {
      console.log("[useFlowgraphNodes] Returning empty nodes and edges due to loading or missing data");
      return {
        nodes: [],
        edges: [],
      };
    }

    // Extract resource objects from the query results
    const objects = resourceObjectsQuery.data;
    console.log("[useFlowgraphNodes] Resource objects:", objects);

    // Pass objects to the utility functions
    const baseNodes = convertObjectsToNodes(objects);
    console.log("[useFlowgraphNodes] baseNodes:", baseNodes);

    const reliances = inferObjectsReliances(objects);
    console.log("[useFlowgraphNodes] reliances:", reliances);

    // Convert reliances to edges
    const baseEdges = convertReliancesToEdges(reliances);
    console.log("[useFlowgraphNodes] baseEdges:", baseEdges);

    // Derive network nodes and edges from the base nodes
    const { nodes: networkNodes, edges: networkEdges } =
      deriveNetworkNodesAndEdges(objects);
    console.log("[useFlowgraphNodes] networkNodes:", networkNodes, "networkEdges:", networkEdges);

    // Merge base nodes and network nodes
    const mergedNodes = [...baseNodes, ...networkNodes];
    console.log("[useFlowgraphNodes] mergedNodes:", mergedNodes);

    // Apply devbox grouping to merged nodes
    const groupedNodes = createDevGroup(mergedNodes);
    console.log("[useFlowgraphNodes] groupedNodes:", groupedNodes);

    // Combine all edges for layout calculation
    const allEdges = [...(baseEdges || []), ...(networkEdges || [])];
    console.log("[useFlowgraphNodes] allEdges:", allEdges);

    // Apply layout to the grouped nodes
    const layoutedNodes = applyLayout(groupedNodes, allEdges);
    console.log("[useFlowgraphNodes] layoutedNodes:", layoutedNodes);

    return {
      nodes: layoutedNodes,
      edges: allEdges,
    };
  }, [resourceObjectsQuery.data]);

  // Log the final return values
  console.log("[useFlowgraphNodes] Returning:", {
    nodes,
    edges,
    isLoading: resourceObjectsQuery.isLoading,
    isPending: resourceObjectsQuery.pending,
    error: resourceObjectsQuery.error,
    resourceObjectsQuery,
  });

  return {
    nodes,
    edges,
    isLoading: resourceObjectsQuery.isLoading,
    isPending: resourceObjectsQuery.pending,
    error: resourceObjectsQuery.error,
    // Expose the raw resource objects query for additional data if needed
    resourceObjectsQuery,
  };
};
