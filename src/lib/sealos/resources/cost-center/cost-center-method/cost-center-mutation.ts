"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CostCenterApiContext } from "../cost-center-schemas/cost-center-api-context-schema";
import type {
  PlanTransactionRequest,
} from "../cost-center-schemas/cost-center-api-schemas";
import { getPlanTransaction } from "../cost-center-api/cost-center-api-service";



export function useCreatePlanTransactionMutation(context: CostCenterApiContext) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: PlanTransactionRequest) =>
      getPlanTransaction({
        ...context,
        workspace: request.workspace,
        regionDomain: request.regionDomain,
        internalToken: request.internalToken,
      }),
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["plan-transaction"] });
      queryClient.invalidateQueries({ queryKey: ["account-balance"] });
    },
  });
}
