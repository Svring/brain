import { useEffect, useMemo } from "react";
import useFlowgraphEdges from "./use-flowgraph-edges";
import useFlowgraphNodes from "./use-flowgraph-nodes";
import useProjectResources from "@/hooks/brain/use-project-resources";
import useResourceReliances from "@/hooks/sealos/resource/use-resource-reliances";
import { useProjectState } from "@/contexts/project/project-context";
import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";

export default function useFlowgraph(projectName: string) {
  const { resources, k8sResources, isLoading } =
    useProjectResources(projectName);

  // Get project resources from project state
  const { selectedProjectResources } = useProjectState();

  // Phase 1: Generate basic nodes from K8sResource objects immediately
  const { nodes: basicNodes } = useFlowgraphNodes(k8sResources ?? [], true);

  // Phase 2: Generate enhanced nodes with network nodes from complete objects
  const { nodes: enhancedNodes, edges: networkEdges } = useFlowgraphNodes(
    selectedProjectResources ?? []
  );

  const { reliances } = useResourceReliances(selectedProjectResources ?? []);
  const { edges: computedEdges } = useFlowgraphEdges(reliances);

  const { setNodes, setEdges } = useFlowgraphActions();

  // Merge basic nodes with enhanced nodes (enhanced nodes replace basic nodes when available)
  const currentNodes = useMemo(() => {
    if (selectedProjectResources?.length === 0) {
      return basicNodes;
    }

    // Create a map of enhanced nodes by their IDs
    const enhancedNodeMap = new Map(
      enhancedNodes.map((node) => [node.id, node])
    );

    // Start with basic nodes and replace with enhanced versions when available
    const mergedNodes = basicNodes.map((basicNode) => {
      const enhancedNode = enhancedNodeMap.get(basicNode.id);
      return enhancedNode || basicNode;
    });

    // Add any enhanced nodes that don't have basic counterparts (e.g., network nodes)
    const basicNodeIds = new Set(basicNodes.map((node) => node.id));
    const additionalEnhancedNodes = enhancedNodes.filter(
      (node) => !basicNodeIds.has(node.id)
    );

    const result = [...mergedNodes, ...additionalEnhancedNodes];
    // console.log("currentNodes result:", result);
    return result;
  }, [basicNodes, enhancedNodes, selectedProjectResources?.length]);

  // Combine network edges (from ports) with computed edges (from reliances)
  const finalEdges = useMemo(() => {
    return [...networkEdges, ...computedEdges];
  }, [networkEdges, computedEdges]);

  useEffect(() => {
    // Set nodes and edges (network nodes are now included when objects are ready)
    setNodes(currentNodes);
    setEdges(finalEdges);
  }, [currentNodes, finalEdges]);

  return {
    resources,
    k8sResources,
    isLoading,
    selectedProjectResources,
    currentNodes,
    finalEdges,
  };
}
