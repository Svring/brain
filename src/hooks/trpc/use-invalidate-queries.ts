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
    setTimeout(() => {
      queryKeys.forEach((queryKey) => {
        if (invalidateProjectResources) {
          refresh();
        }
        const key = typeof queryKey === "function" ? queryKey() : queryKey;
        queryClient.invalidateQueries({ queryKey: key });
      });
    }, 1000);
  };

  return { invalidateQueries };
};
