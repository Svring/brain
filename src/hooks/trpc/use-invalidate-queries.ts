import { useQueryClient } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";

export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  const { project } = useTRPCClients();
  const { refresh } = useFlowgraphActions();

  const invalidateQueries = (
    queryKeys: any[],
    invalidateProjectResources = false
  ) => {
    console.log("Invalidating queries:", queryKeys);

    const performInvalidation = () => {
      queryKeys.forEach((queryKey) => {
        if (invalidateProjectResources) {
          refresh();
        }
        const key = typeof queryKey === "function" ? queryKey() : queryKey;
        queryClient.invalidateQueries({ queryKey: key });
      });
    };

    // Initial invalidation after 1s
    setTimeout(performInvalidation, 1000);

    // Additional invalidations at 3s, 5s, and 10s
    setTimeout(performInvalidation, 3000);
    setTimeout(performInvalidation, 5000);
    setTimeout(performInvalidation, 10000);
  };

  return { invalidateQueries };
};
