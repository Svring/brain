import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export const useDevboxObject = (devboxName: string) => {
  const { devbox } = useTRPCClients();

  // Create target for the devbox
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("devbox", devboxName)
  );

  return useQuery(devbox.get.queryOptions(target));
};
