import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import type { PlanTransactionResponse } from "@/lib/sealos/resources/cost-center/cost-center-schemas/cost-center-api-schemas";

export function usePlanTransaction() {
  const { costCenter } = useTRPCClients();
  
  return useQuery({
    ...costCenter.planTransaction.queryOptions(undefined),
    refetchInterval: 60000,
    staleTime: 30000, 
  });
}

export function useCreatePlanTransaction() {
  const { costCenter } = useTRPCClients();
  
  return useMutation({
    mutationFn: async () => {
      throw new Error("Plan transaction creation not implemented as mutation");
    },
  });
}
