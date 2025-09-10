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
    setTimeout(() => {
      queryKeys.forEach((queryKey) => {
        const key = typeof queryKey === "function" ? queryKey() : queryKey;
        queryClient.invalidateQueries({ queryKey: key });
      });

      if (invalidateProjectResources) {
        queryClient.invalidateQueries({
          queryKey: project.getResources.queryKey(),
        });
      }
    }, 1000);
  };

  return { invalidateQueries };
};
