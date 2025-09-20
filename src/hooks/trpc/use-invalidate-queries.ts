import { useQueryClient } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  const { project } = useTRPCClients();

  const invalidateQueries = (
    queryKeys: any[],
    invalidateProjectResources = false
  ) => {
    console.log("Invalidating queries:", queryKeys);

    const performInvalidation = async () => {
      if (invalidateProjectResources) {
        queryClient.invalidateQueries({
          queryKey: project.getResources.queryKey(),
        });
      }
      // Then invalidate the specific query keys
      const invalidationPromises = queryKeys.map(async (queryKey) => {
        return queryClient.invalidateQueries({ queryKey: queryKey });
      });

      await Promise.all(invalidationPromises);
    };

    performInvalidation();
    setTimeout(performInvalidation, 2000);
  };

  return { invalidateQueries };
};
