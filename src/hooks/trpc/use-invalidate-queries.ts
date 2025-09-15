import { useQueryClient } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";
import { useProjectState } from "@/contexts/project/project-context";

export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  const { project } = useTRPCClients();
  const { refresh } = useFlowgraphActions();
  const { selectedProject } = useProjectState();

  const invalidateQueries = (
    queryKeys: any[],
    invalidateProjectResources = false
  ) => {
    console.log("Invalidating queries:", queryKeys);

    const performInvalidation = async () => {
      // If we need to invalidate project resources, do it first
      if (invalidateProjectResources && selectedProject) {
        console.log("Invalidating project resources for:", selectedProject);

        // Invalidate the project resources query
        const projectResourcesKey =
          project.getResources.queryKey(selectedProject);
        await queryClient.invalidateQueries({ queryKey: projectResourcesKey });

        // Also invalidate project list in case project structure changed
        await queryClient.invalidateQueries({
          queryKey: project.list.queryKey(),
        });

        // Trigger flowgraph refresh after project resources are invalidated
        refresh();
      }

      // Then invalidate the specific query keys
      const invalidationPromises = queryKeys.map(async (queryKey) => {
        const key = typeof queryKey === "function" ? queryKey() : queryKey;
        return queryClient.invalidateQueries({ queryKey: key });
      });

      await Promise.all(invalidationPromises);
    };

    // Perform invalidation immediately, then with a small delay for any race conditions
    performInvalidation();
    setTimeout(performInvalidation, 2000);
    // setTimeout(performInvalidation, 5000);
    // setTimeout(performInvalidation, 10000);
  };

  return { invalidateQueries };
};
