import { useCallback } from "react";
import {
  useFlowgraphActions,
  useFlowgraphState,
} from "@/contexts/flowgraph/flowgraph-context";
import { convertResourceToNetworkNodes } from "@/lib/flowgraph/nodes/flowgraph-nodes-utils";

/**
 * Hook for individual resource nodes to request network node creation
 * when they have complete object data available.
 */
export function useNetworkNodeUpdater() {
  const { nodes, edges } = useFlowgraphState();
  const { setNodes, setEdges } = useFlowgraphActions();

  const addNetworkNodesForResource = useCallback(
    (resourceData: any) => {
      if (
        !resourceData ||
        !resourceData.ports ||
        resourceData.ports.length === 0
      ) {
        return;
      }

      const { newNodes, newEdges } = convertResourceToNetworkNodes(
        resourceData,
        resourceData.name,
        resourceData.kind,
        nodes,
        edges
      );

      if (newNodes.length > 0 || newEdges.length > 0) {
        // Only update if there are actually new nodes/edges to add
        setNodes([...nodes, ...newNodes]);
        setEdges([...edges, ...newEdges]);
      }
    },
    [nodes, edges, setNodes, setEdges]
  );

  return { addNetworkNodesForResource };
}
