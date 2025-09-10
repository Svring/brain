import { useEffect, useRef } from "react";
import useProjectResources from "@/hooks/brain/use-project-resources";
import useFlowgraphInitialNodes from "./use-flowgraph-initial-nodes";
import {
  useFlowgraphActions,
  useFlowgraphState,
} from "@/contexts/flowgraph/flowgraph-context";

/**
 * Simplified flowgraph hook that only:
 * 1. Fetches basic K8s resource list
 * 2. Creates initial basic nodes for immediate display
 * 3. Individual nodes handle their own data fetching and enhancement
 */
export default function useFlowgraph(projectName: string) {
  const { resources, isLoading } = useProjectResources(projectName);
  const { initialNodes } = useFlowgraphInitialNodes(resources ?? []);
  const { nodes: currentNodes } = useFlowgraphState();
  const { addNode, updateNode, removeNode, fitView } = useFlowgraphActions();
  const hasSetNodesRef = useRef(false);

  // Incrementally merge resource nodes to preserve derived nodes (network/ingress)
  useEffect(() => {
    if (initialNodes.length === 0) return;

    // Build quick lookups
    const existingById = new Map(currentNodes.map((n) => [n.id, n]));
    const initialById = new Map(initialNodes.map((n) => [n.id, n]));

    // Add or update resource nodes
    for (const node of initialNodes) {
      const existing = existingById.get(node.id);
      if (!existing) {
        addNode(node);
      } else {
        // Preserve layout fields while refreshing data/type
        updateNode({ ...existing, type: node.type, data: node.data });
      }
    }

    // Remove resource nodes that no longer exist, but keep derived ones
    for (const existing of currentNodes) {
      const type = existing.type as string | undefined;
      const isDerived =
        type === "network" || type === "ingress" || type === "devgroup";
      if (isDerived) continue;
      if (!initialById.has(existing.id)) {
        removeNode(existing.id);
      }
    }

    // Fit view only once after first population
    if (!hasSetNodesRef.current) {
      setTimeout(() => fitView(), 100);
      hasSetNodesRef.current = true;
    }
  }, [initialNodes]);

  // Reset when project changes
  useEffect(() => {
    hasSetNodesRef.current = false;
    // setNodes([]); // Clear nodes immediately when project changes
  }, [projectName]);

  return {
    isLoading,
    nodes: initialNodes,
  };
}
