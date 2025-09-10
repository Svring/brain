import { useEffect, useRef } from "react";
import useProjectResources from "@/hooks/brain/use-project-resources";
import useFlowgraphInitialNodes from "./use-flowgraph-initial-nodes";
import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";

/**
 * Simplified flowgraph hook that only:
 * 1. Fetches basic K8s resource list
 * 2. Creates initial basic nodes for immediate display
 * 3. Individual nodes handle their own data fetching and enhancement
 */
export default function useFlowgraph(projectName: string) {
  const { resources, isLoading } = useProjectResources(projectName);
  const { initialNodes } = useFlowgraphInitialNodes(resources ?? []);
  const { setNodes, fitView } = useFlowgraphActions();
  const initializedRef = useRef(false);

  // Set initial basic nodes and clear edges (only on first render)
  useEffect(() => {
    if (initialNodes.length > 0 && !initializedRef.current) {
      setNodes(initialNodes);
      fitView();
      initializedRef.current = true;
    }
  }, [initialNodes]);

  // Reset when project changes
  useEffect(() => {
    initializedRef.current = false;
  }, [projectName]);

  return {
    isLoading,
    nodes: initialNodes,
  };
}
