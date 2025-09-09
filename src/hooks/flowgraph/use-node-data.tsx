import { useEffect, useState } from "react";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useProjectActions } from "@/contexts/project/project-context";
import {
  useFlowgraphActions,
  useFlowgraphState,
} from "@/contexts/flowgraph/flowgraph-context";
import { convertResourceToNetworkNodes } from "@/lib/flowgraph/nodes/flowgraph-nodes-utils";

/**
 * Simplified hook for individual nodes to handle their own data fetching and enhancement.
 * This replaces the complex useResourceNodeEnhancer pattern.
 *
 * Each node:
 * 1. Fetches its complete resource data
 * 2. Updates the global project context with complete data
 * 3. Creates network nodes/edges if the resource has ports
 * 4. Returns status and complete resource data for rendering
 */
export function useNodeData(resourceData: { kind: string; name: string }) {
  const [hasReportedResource, setHasReportedResource] = useState(false);
  const [hasCreatedNetworkNodes, setHasCreatedNetworkNodes] = useState(false);

  const { updateResource } = useProjectActions();
  const { addNode, addEdge } = useFlowgraphActions();

  const target = convertResourceObjectToTarget({
    kind: resourceData.kind,
    name: resourceData.name,
  });

  // Create stable resource key for tracking
  const resourceKey = `${resourceData.kind}-${resourceData.name}`;

  // Reset flags when resource data changes
  useEffect(() => {
    setHasReportedResource(false);
    setHasCreatedNetworkNodes(false);
  }, [resourceKey]);

  // Get complete resource object
  const { resource: completeResource, isLoading } = useResourceStatus(target);

  useEffect(() => {
    // When complete resource becomes available, update the central store
    if (
      !isLoading &&
      completeResource &&
      typeof completeResource === "object" &&
      "name" in completeResource &&
      "kind" in completeResource &&
      !hasReportedResource
    ) {
      updateResource(completeResource as any);
      setHasReportedResource(true);

      // Create network nodes if ports are available
      if (
        "ports" in completeResource &&
        completeResource.ports &&
        Array.isArray(completeResource.ports) &&
        completeResource.ports.length > 0 &&
        !hasCreatedNetworkNodes
      ) {
        const { newNodes, newEdges } = convertResourceToNetworkNodes(
          completeResource,
          resourceData.name,
          resourceData.kind,
          [], // Pass empty arrays to avoid duplicate checking in utils
          []
        );

        // If this is a devbox resource, ensure affiliated nodes are added to the dev group
        const processedNodes = resourceData.kind.toLowerCase() === "devbox" 
          ? newNodes.map((node) => {
              // Only group network and ingress nodes (matching the original grouping logic)
              if (node.type === "network" || node.type === "ingress") {
                return {
                  ...node,
                  parentId: "devbox-group",
                  extent: "parent" as const,
                };
              }
              return node;
            })
          : newNodes;

        // Add new nodes and edges to the flowgraph (only if they don't already exist)
        processedNodes.forEach((node) => {
          addNode(node);
        });
        newEdges.forEach((edge) => {
          addEdge(edge);
        });

        setHasCreatedNetworkNodes(true);
      }
    }
  }, [
    completeResource,
    isLoading,
    hasCreatedNetworkNodes,
    hasReportedResource,
    updateResource,
    addNode,
    addEdge,
    resourceKey,
  ]);

  return {
    completeResource,
    isLoadingComplete: isLoading,
    hasNetworkNodes: hasCreatedNetworkNodes,
    status: (completeResource as any)?.status,
  };
}
