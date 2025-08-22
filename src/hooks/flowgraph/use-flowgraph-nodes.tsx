import { useMemo } from "react";
import {
  convertResourceObjectsToNodes,
  convertResourceToNodes,
  addDevboxToDevGroup,
  convertResourceToNetworkNodes,
} from "@/lib/flowgraph/nodes/flowgraph-nodes-utils";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

// Overloaded function signatures
export default function useFlowgraphNodes(
  resources: K8sResource[],
  basicMode: true
): { nodes: any[]; edges: any[] };
export default function useFlowgraphNodes(
  resourceObjects: any[],
  basicMode?: false
): { nodes: any[]; edges: any[] };
export default function useFlowgraphNodes(
  data: any[],
  basicMode = false
): { nodes: any[]; edges: any[] } {
  const { nodes, edges } = useMemo(() => {
    if (data.length === 0) {
      return { nodes: [], edges: [] };
    }

    let convertedNodes: any[];

    if (basicMode) {
      // Phase 1: Convert K8sResource objects to basic nodes (fast, no network nodes)
      convertedNodes = convertResourceToNodes(data as K8sResource[]);

      // In basic mode, only group devbox nodes without network processing
      // const groupedNodes = addDevboxToDevGroup(convertedNodes);
      return { nodes: convertedNodes, edges: [] };
    } else {
      // Phase 2: Convert complete resource objects to nodes with network nodes (slower)
      convertedNodes = convertResourceObjectsToNodes(data);

      // Generate network nodes from ports of all resource nodes
      let allNodes = [...convertedNodes];
      let allEdges: any[] = [];

      // Process each computed node to extract ports and generate network nodes
      for (const node of convertedNodes) {
        const { data: nodeData } = node;
        if (nodeData && nodeData.ports) {
          const { newNodes, newEdges } = convertResourceToNetworkNodes(
            nodeData,
            nodeData.name,
            nodeData.kind,
            allNodes,
            allEdges
          );
          allNodes = [...allNodes, ...newNodes];
          allEdges = [...allEdges, ...newEdges];
        }
      }

      // Finally, group devbox nodes (including their affiliated network nodes)
      // const groupedNodes = addDevboxToDevGroup(allNodes);

      return { nodes: allNodes, edges: allEdges };
    }
  }, [data, basicMode]);

  return { nodes, edges };
}
