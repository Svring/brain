import { useQuery } from "@tanstack/react-query";
import { launchpadClient } from "@/components/provider/trpc-provider";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export const useLaunchpadObject = (
  resourceName: string,
  resourceKind: string
) => {
  const launchpadTrpcClient = launchpadClient.useTRPC();

  // Create target for the launchpad resource
  const target = BuiltinResourceTargetSchema.parse(
    convertResourceTypeToTarget(resourceKind.toLowerCase(), resourceName)
  );

  return useQuery(launchpadTrpcClient.getLaunchpad.queryOptions(target));
};
