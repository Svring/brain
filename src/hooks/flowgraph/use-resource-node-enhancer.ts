import { useEffect, useState } from "react";
import { useNetworkNodeUpdater } from "./use-network-node-updater";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useProjectActions } from "@/contexts/project/project-context";

/**
 * Hook for resource nodes to progressively enhance themselves with complete object data
 * and trigger network node creation when ports become available.
 */
export function useResourceNodeEnhancer(resourceData: {
  kind: string;
  name: string;
}) {
  const [hasCreatedNetworkNodes, setHasCreatedNetworkNodes] = useState(false);
  const [hasReportedResource, setHasReportedResource] = useState(false);
  const { addNetworkNodesForResource } = useNetworkNodeUpdater();
  const { updateResource } = useProjectActions();

  const target = convertResourceObjectToTarget({
    kind: resourceData.kind,
    name: resourceData.name,
  });

  // Reset flags when resource data changes
  useEffect(() => {
    setHasCreatedNetworkNodes(false);
    setHasReportedResource(false);
  }, [resourceData.kind, resourceData.name]);

  // Get complete resource object with ports
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

      // Also create network nodes if ports are available
      if (
        "ports" in completeResource &&
        completeResource.ports &&
        Array.isArray(completeResource.ports) &&
        completeResource.ports.length > 0 &&
        !hasCreatedNetworkNodes
      ) {
        addNetworkNodesForResource(completeResource);
        setHasCreatedNetworkNodes(true);
      }
    }
  }, [
    completeResource,
    isLoading,
    hasCreatedNetworkNodes,
    hasReportedResource,
    addNetworkNodesForResource,
    updateResource,
  ]);

  return {
    completeResource,
    isLoadingComplete: isLoading,
    hasNetworkNodes: hasCreatedNetworkNodes,
    status: (completeResource as any)?.status,
  };
}
