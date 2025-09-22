"use client";

import { useMemo, useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceObjects } from "@/hooks/sealos/resource/use-resource-objects";
import {
  convertObjectsToNodes,
  inferObjectsReliances,
  convertReliancesToEdges,
  deriveNetworkNodesAndEdges,
  createDevGroup,
  applyLayout,
} from "./flowgraph-utils";
import { useProjectActions } from "@/contexts/project/project-context";
import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";

/**
 * Hook to convert resource targets into flowgraph nodes
 * @param targets - Array of resource targets to convert to nodes
 * @returns Object containing nodes, loading state, and error state
 */
export const useFlowgraphNodes = (targets: ResourceTarget[]) => {
  // Fetch resource objects for the given targets
  const resourceObjectsQuery = useResourceObjects(targets);
  const { setSelectedProjectResources } = useProjectActions();
  const { setNodes, setEdges } = useFlowgraphActions();

  // Memoize the computation of nodes and edges
  const { nodes, edges } = useMemo(() => {
    // Return empty arrays if still loading or no data
    if (resourceObjectsQuery.isLoading || !resourceObjectsQuery.data) {
      return {
        nodes: [],
        edges: [],
      };
    }

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

    // Combine all edges for layout calculation
    const allEdges = [...(baseEdges || []), ...(networkEdges || [])];

    // Apply layout to the grouped nodes
    const layoutedNodes = applyLayout(groupedNodes, allEdges);

    setSelectedProjectResources(
      objects.map((object) => ({
        kind: object.kind.toLowerCase(),
        name: object.name,
      }))
    );

    return {
      nodes: layoutedNodes,
      edges: allEdges,
    };
  }, [resourceObjectsQuery.data]);

  // Set nodes and edges in flowgraph context after computation
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      setNodes(nodes);
      setEdges(edges);
    }
  }, [nodes, edges]);

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
