import { useMemo } from "react";
import { convertResourceObjectsToNodes, addDevboxToDevGroup, convertResourceToNetworkNodes } from "@/lib/flowgraph/nodes/flowgraph-nodes-utils";

export default function useFlowgraphNodes(resourceObjects: any[]) {
  const { nodes, edges } = useMemo(() => {
    // First, convert resource objects to basic nodes
    const convertedNodes = convertResourceObjectsToNodes(resourceObjects);
    
    // Then, generate network nodes from ports of all resource nodes
    let allNodes = [...convertedNodes];
    let allEdges: any[] = [];

    // Process each computed node to extract ports and generate network nodes
    for (const node of convertedNodes) {
      const { data } = node;
      if (data && data.ports) {
        const { newNodes, newEdges } = convertResourceToNetworkNodes(
          data,
          data.name,
          data.kind,
          allNodes,
          allEdges
        );
        allNodes = [...allNodes, ...newNodes];
        allEdges = [...allEdges, ...newEdges];
      }
    }

    // Finally, group devbox nodes (including their affiliated network nodes)
    const groupedNodes = addDevboxToDevGroup(allNodes);
    
    return { nodes: groupedNodes, edges: allEdges };
  }, [resourceObjects]);

  return { nodes, edges };
}
