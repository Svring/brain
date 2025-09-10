import { useMemo } from "react";
import {
  convertResourceToNodes,
  addDevboxToDevGroup,
} from "@/lib/flowgraph/nodes/flowgraph-nodes-utils";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

/**
 * Simplified hook that only creates basic nodes from K8sResource objects.
 * Network nodes and edges are now handled individually by each node component.
 */
export default function useFlowgraphInitialNodes(resources: K8sResource[]) {
  const nodes = useMemo(() => {
    if (resources.length === 0) {
      return [];
    }

    // Convert K8sResource objects to basic nodes
    const convertedNodes = convertResourceToNodes(resources);
    
    // Group devbox nodes if any exist
    const groupedNodes = addDevboxToDevGroup(convertedNodes);
    
    return groupedNodes;
  }, [resources]);

  return { initialNodes: nodes };
}
