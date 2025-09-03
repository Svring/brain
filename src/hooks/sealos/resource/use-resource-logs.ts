import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";

export const useResourceLogs = (
  target: CustomResourceTarget | BuiltinResourceTarget
) => {
  const { cluster, launchpad } = useTRPCClients();

  // Determine query options based on target type
  let queryOptions:
    | ReturnType<typeof cluster.getClusterLog.queryOptions>
    | ReturnType<typeof launchpad.getLaunchpadLogs.queryOptions>
    | null = null;

  if (target.type === "custom" && target.resourceType === "cluster") {
    queryOptions = cluster.getClusterLog.queryOptions({ target });
  } else if (target.type === "builtin") {
    queryOptions = launchpad.getLaunchpadLogs.queryOptions({ target });
  }

  // Always call useQuery, but with null options for unsupported types
  const result = useQuery(queryOptions);

  // Return null for unsupported resource types
  if (!queryOptions) {
    return { data: null, isLoading: false, error: null, ...result };
  }

  return result;
};
