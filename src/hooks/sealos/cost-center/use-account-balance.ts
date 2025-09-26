import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import type { AccountBalance } from "@/lib/sealos/resources/cost-center/cost-center-schemas/cost-center-api-schemas";

export function useAccountBalance() {
  const { costCenter } = useTRPCClients();

  return useQuery({
    ...costCenter.accountBalance.queryOptions(undefined),
  });
}
