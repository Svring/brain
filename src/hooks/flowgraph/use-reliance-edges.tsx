import { useEffect, useMemo } from "react";
import { useProjectState } from "@/contexts/project/project-context";
import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";
import { convertReliancesToEdges } from "@/lib/flowgraph/edges/flowgraph-edges-utils";
import useResourceReliances from "@/hooks/sealos/resource/use-resource-reliances";

/**
 * Hook to compute and manage reliance-based edges (environment variables and image dependencies).
 * This runs separately from network edges and adds dependency edges to the flowgraph.
 */
export function useRelianceEdges() {
  const { selectedProjectResources } = useProjectState();
  const { addEdge } = useFlowgraphActions();

  // console.log("selectedProjectResources", selectedProjectResources);

  // Compute reliances from environment variables and image dependencies
  const { reliances } = useResourceReliances(selectedProjectResources ?? []);

  // Convert reliances to edges
  const relianceEdges = useMemo(() => {
    if (!reliances || Object.keys(reliances).length === 0) {
      return [];
    }
    return convertReliancesToEdges(reliances);
  }, [reliances]);

  // Add reliance edges to the flowgraph when they change
  useEffect(() => {
    if (relianceEdges.length > 0) {
      relianceEdges.forEach((edge) => {
        addEdge(edge);
      });
    }
  }, [relianceEdges]);

  return {
    reliances,
    relianceEdges,
  };
}
