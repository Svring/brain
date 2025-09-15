import { useQueryClient } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";

/**
 * Simple hook that provides a refresh function to invalidate project resources
 */
export function useProjectRefresh(projectName: string) {
  const queryClient = useQueryClient();
  const { project } = useTRPCClients();
  const { refresh: refreshFlowgraph } = useFlowgraphActions();

  const refreshProject = async () => {
    // Invalidate project resources query
    await queryClient.invalidateQueries({
      queryKey: project.getResources.queryKey(projectName),
    });

    // Trigger flowgraph refresh to recompute nodes/edges
    refreshFlowgraph();
  };

  return { refreshProject };
}
