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
  const hasSetNodesRef = useRef(false);

  // Set nodes whenever initialNodes change and we have nodes to display
  useEffect(() => {
    console.log("useFlowgraph effect:", { 
      initialNodesLength: initialNodes.length, 
      hasSetNodes: hasSetNodesRef.current,
      projectName,
      resources: resources?.length || 0
    });
    
    if (initialNodes.length > 0) {
      console.log("Setting nodes:", initialNodes);
      setNodes(initialNodes);
      setTimeout(() => fitView(), 100); // Small delay to ensure DOM is ready
      hasSetNodesRef.current = true;
    }
  }, [initialNodes]);

  // Reset when project changes
  useEffect(() => {
    console.log("Project changed, resetting:", projectName);
    hasSetNodesRef.current = false;
    // setNodes([]); // Clear nodes immediately when project changes
  }, [projectName]);

  return {
    isLoading,
    nodes: initialNodes,
  };
}
