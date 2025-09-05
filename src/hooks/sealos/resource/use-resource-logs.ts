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

  // Handle cluster logs
  const clusterLogsQuery = useQuery({
    ...cluster.getClusterLog.queryOptions({
      target: target as CustomResourceTarget,
    }),
    enabled: target.type === "custom" && target.resourceType === "cluster",
  });

  // Handle launchpad logs
  const launchpadLogsQuery = useQuery({
    ...launchpad.getLaunchpadLogs.queryOptions({
      target: target as BuiltinResourceTarget,
    }),
    enabled: target.type === "builtin",
  });

  // Return the appropriate query result based on target type
  if (target.type === "custom" && target.resourceType === "cluster") {
    return clusterLogsQuery;
  } else if (target.type === "builtin") {
    return launchpadLogsQuery;
  }

  // Return null for unsupported resource types
  return {
    data: null,
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: false,
    isPending: false,
    isFetching: false,
    isRefetching: false,
    isStale: false,
    isPlaceholderData: false,
    isInitialLoading: false,
    refetch: () => Promise.resolve({} as any),
    fetchStatus: "idle" as const,
    status: "success" as const,
  };
};
