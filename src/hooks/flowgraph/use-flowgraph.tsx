import { useEffect, useMemo, useRef } from "react";
import { useResourceStatuses } from "@/hooks/sealos/resource/use-resource-statuses";
import {
  useFlowgraphActions,
  useFlowgraphState,
} from "@/contexts/flowgraph/flowgraph-context";
import {
  convertResourceObjectsToNodes,
  addDevboxToDevGroup,
  convertResourceToNetworkNodes,
} from "@/lib/flowgraph/nodes/flowgraph-nodes-utils";
import { useProjectActions } from "@/contexts/project/project-context";
import useObjectReliances from "@/hooks/sealos/resource/use-object-reliances";
import { convertReliancesToEdges } from "@/lib/flowgraph/edges/flowgraph-edges-utils";
import type { Node, Edge } from "@xyflow/react";

interface CompleteResource {
  name: string;
  kind: string;
  [key: string]: any;
}

/**
 * Simple flowgraph hook that takes resource targets and generates nodes/edges
 */
export default function useFlowgraph(
  resourceTargets: any[],
  isLoadingResources: boolean
) {
  const { setNodes, setEdges, fitView } = useFlowgraphActions();
  const {
    refreshTrigger,
    nodes: existingNodesState,
    edges: existingEdgesState,
  } = useFlowgraphState();
  const { updateResource } = useProjectActions();

  // Fetch complete resource data for each target
  const resourceQueries = useResourceStatuses(resourceTargets as any);

  // Determine loading
  const allLoaded = useMemo(() => {
    if (isLoadingResources || resourceQueries.length === 0) return false;
    return resourceQueries.every((q: any) => !q.isLoading);
  }, [
    isLoadingResources,
    resourceQueries.map((q: any) => q.isLoading).join(","),
    resourceQueries.length,
  ]);

  const completeResources: CompleteResource[] = useMemo(() => {
    if (!allLoaded) return [];
    const list: CompleteResource[] = [];
    resourceQueries.forEach(({ resource }: any) => {
      if (
        resource &&
        typeof resource === "object" &&
        "name" in resource &&
        "kind" in resource &&
        resource.name &&
        resource.kind &&
        typeof resource.name === "string" &&
        typeof resource.kind === "string"
      ) {
        list.push(resource as CompleteResource);
      }
    });
    return list;
  }, [
    allLoaded,
    resourceQueries.map((q: any) => q.resource?.name || "").join(","),
    resourceQueries
      .map((q: any) => q.resource?.status?.phase || "")
      .join(","),
    resourceQueries.map((q: any) => q.resource?.kind || "").join(","),
    resourceQueries.length,
    refreshTrigger,
  ]);

  // Update project context only when completeResources signature changes
  const prevSignatureRef = useRef<string>("");
  useEffect(() => {
    const signature = (arr: CompleteResource[]) =>
      arr
        .map((r) =>
          [
            r.kind,
            r.name,
            (r as any)?.status?.phase ?? "",
            Array.isArray((r as any)?.ports) ? (r as any).ports.length : 0,
          ].join(":")
        )
        .join("|");
    const nextSig = signature(completeResources);
    if (nextSig !== prevSignatureRef.current) {
      completeResources.forEach((r) =>
        updateResource({ name: r.name, kind: r.kind })
      );
      prevSignatureRef.current = nextSig;
    }
  }, [completeResources]);

  // Compute reliances from complete resources

  const { reliances } = useObjectReliances(completeResources);

  // Generate final nodes and edges when complete resources are ready

  useEffect(() => {
    // Only return early if we're still loading resources

    if (!allLoaded) return;

    // Generate resource nodes from complete data

    const resourceNodes = convertResourceObjectsToNodes(completeResources);

    // Group devbox nodes if any exist

    const groupedResourceNodes = addDevboxToDevGroup(resourceNodes);

    // Generate derived nodes (network, ingress) and edges

    const allNodes: Node[] = [...groupedResourceNodes];

    const allEdges: Edge[] = [];

    completeResources.forEach((resource) => {
      // Skip processing if resource is invalid
      if (!resource || !resource.name || !resource.kind) {
        return;
      }

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
          resource.kind && resource.kind.toLowerCase() === "devbox"
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

    // Guard against redundant updates by comparing id sets
    const currentNodeIds = new Set((existingNodesState || []).map((n) => n.id));
    const nextNodeIds = new Set(allNodes.map((n) => n.id));
    const nodesChanged =
      currentNodeIds.size !== nextNodeIds.size ||
      Array.from(nextNodeIds).some((id) => !currentNodeIds.has(id));

    const currentEdgeIds = new Set((existingEdgesState || []).map((e) => e.id));
    const nextEdgeIds = new Set(allEdges.map((e) => e.id));
    const edgesChanged =
      currentEdgeIds.size !== nextEdgeIds.size ||
      Array.from(nextEdgeIds).some((id) => !currentEdgeIds.has(id));

    if (nodesChanged) {
      setNodes(allNodes);
    }
    if (edgesChanged) {
      setEdges(allEdges);
    }

    // Fit view only when transitioning from 0 -> >0 nodes
    if ((existingNodesState?.length || 0) === 0 && allNodes.length > 0) {
      setTimeout(() => fitView(), 100);
    }
  }, [completeResources, reliances, allLoaded]);

  return {
    isLoading: isLoadingResources || !allLoaded,
    nodes: completeResources,
  };
}
