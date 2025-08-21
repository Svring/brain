import { useEffect, useState } from "react";
import { useNetworkNodeUpdater } from "./use-network-node-updater";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";

/**
 * Hook for resource nodes to progressively enhance themselves with complete object data
 * and trigger network node creation when ports become available.
 */
export function useResourceNodeEnhancer(resourceData: {
  kind: string;
  name: string;
}) {
  const [hasCreatedNetworkNodes, setHasCreatedNetworkNodes] = useState(false);
  const { addNetworkNodesForResource } = useNetworkNodeUpdater();

  const target = convertResourceObjectToTarget({
    kind: resourceData.kind,
    name: resourceData.name,
  });

  // Get complete resource object with ports
  const { resource: completeResource, isLoading } = useResourceStatus(target);

  useEffect(() => {
    // When complete resource becomes available and has ports, create network nodes
    if (
      !isLoading &&
      completeResource &&
      "ports" in completeResource &&
      completeResource.ports &&
      Array.isArray(completeResource.ports) &&
      completeResource.ports.length > 0 &&
      !hasCreatedNetworkNodes
    ) {
      addNetworkNodesForResource(completeResource);
      setHasCreatedNetworkNodes(true);
    }
  }, [
    completeResource,
    isLoading,
    hasCreatedNetworkNodes,
    addNetworkNodesForResource,
  ]);

  return {
    completeResource,
    isLoadingComplete: isLoading,
    hasNetworkNodes: hasCreatedNetworkNodes,
  };
}
