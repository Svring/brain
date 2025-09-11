import { useEffect, useState } from "react";
import useProjectResources from "@/hooks/brain/use-project-resources";
import {
  useFlowgraphActions,
  useFlowgraphState,
} from "@/contexts/flowgraph/flowgraph-context";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import {
  convertResourceObjectsToNodes,
  addDevboxToDevGroup,
  convertResourceToNetworkNodes,
} from "@/lib/flowgraph/nodes/flowgraph-nodes-utils";
import { useProjectActions } from "@/contexts/project/project-context";
import useResourceReliances from "@/hooks/sealos/resource/use-resource-reliances";
import { convertReliancesToEdges } from "@/lib/flowgraph/edges/flowgraph-edges-utils";
import type { Node, Edge } from "@xyflow/react";

interface CompleteResource {
  name: string;
  kind: string;
  [key: string]: any;
}

/**
 * Centralized flowgraph hook that:
 * 1. Fetches basic K8s resource list
 * 2. Fetches complete resource data for each resource
 * 3. Generates all nodes and edges (including derived ones)
 * 4. Sets final nodes and edges in one go when all data is ready
 */
export default function useFlowgraph(projectName: string) {
  const { resources, isLoading: isLoadingResources } =
    useProjectResources(projectName);
  const { setNodes, setEdges, fitView } = useFlowgraphActions();
  const { refreshTrigger } = useFlowgraphState();
  const { updateResource } = useProjectActions();
  const [completeResources, setCompleteResources] = useState<
    CompleteResource[]
  >([]);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  // Create resource targets for fetching complete data
  const resourceTargets = (resources ?? [])
    .map((resource: any) => ({
      target: convertResourceObjectToTarget({
        kind: resource.kind || "",
        name: resource.metadata?.name || "",
      }),
      kind: resource.kind || "",
      name: resource.metadata?.name || "",
    }))
    .filter((r: any) => r.kind && r.name);

  // Fetch complete resource data for each resource
  const resourceQueries = resourceTargets.map(({ target, kind, name }: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const query = useResourceStatus(target);
    return {
      ...query,
      kind,
      name,
      target,
    };
  });

  // Process complete resources when all data is loaded
  useEffect(() => {
    if (isLoadingResources || resourceQueries.length === 0) return;

    // Check if all queries have loaded
    const allLoaded = resourceQueries.every((q: any) => !q.isLoading);
    const hasValidData = resourceQueries.some(
      (q: any) => q.resource && !q.error
    );

    if (!allLoaded) {
      setIsLoadingComplete(true);
      return;
    }

    setIsLoadingComplete(false);

    // Extract complete resources
    const newCompleteResources: CompleteResource[] = [];

    resourceQueries.forEach(({ resource, kind, name, target }: any) => {
      if (
        resource &&
        typeof resource === "object" &&
        "name" in resource &&
        "kind" in resource
      ) {
        newCompleteResources.push(resource as CompleteResource);
        // Update project context with complete resource
        updateResource(resource as any);
      }
    });

    setCompleteResources(newCompleteResources);
  }, [
    resourceQueries.map((q: any) => q.isLoading).join(","),
    resourceQueries.map((q: any) => q.resource?.name).join(","),
    refreshTrigger,
  ]);

  // Compute reliances from complete resources
  const { reliances } = useResourceReliances(completeResources);

  // Generate final nodes and edges when complete resources are ready
  useEffect(() => {
    // Only return early if we're still loading resources
    if (isLoadingComplete) return;

    // Generate resource nodes from complete data
    const resourceNodes = convertResourceObjectsToNodes(completeResources);

    // Group devbox nodes if any exist
    const groupedResourceNodes = addDevboxToDevGroup(resourceNodes);

    // Generate derived nodes (network, ingress) and edges
    const allNodes: Node[] = [...groupedResourceNodes];
    const allEdges: Edge[] = [];

    completeResources.forEach((resource) => {
      // Generate network nodes and edges for resources with ports
      if (
        resource.ports &&
        Array.isArray(resource.ports) &&
        resource.ports.length > 0
      ) {
        const { newNodes, newEdges } = convertResourceToNetworkNodes(
          resource,
          resource.name,
          resource.kind,
          allNodes,
          allEdges
        );

        // Process nodes for devbox grouping
        const processedNodes =
          resource.kind.toLowerCase() === "devbox"
            ? newNodes.map((node) => {
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

        allNodes.push(...processedNodes);
        allEdges.push(...newEdges);
      }
    });

    // Generate reliance edges (environment variables and image dependencies)
    if (reliances && Object.keys(reliances).length > 0) {
      const relianceEdges = convertReliancesToEdges(reliances);
      allEdges.push(...relianceEdges);
    }

    // Set all nodes and edges at once
    setNodes(allNodes);
    setEdges(allEdges);

    // Fit view whenever all nodes and edges are set
    if (allNodes.length > 0) {
      setTimeout(() => fitView(), 100);
    }
  }, [completeResources, reliances, isLoadingComplete]);

  // Reset when project changes
  useEffect(() => {
    setCompleteResources([]);
    setIsLoadingComplete(false);
  }, [projectName]);

  return {
    isLoading: isLoadingResources || isLoadingComplete,
    nodes: completeResources,
  };
}
