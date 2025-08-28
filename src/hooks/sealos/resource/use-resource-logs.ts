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

  // Handle cluster resources
  if (target.type === "custom" && target.resourceType === "cluster") {
    return useQuery(cluster.getClusterLog.queryOptions({ target }));
  }

  // Handle launchpad resources (deployment, statefulset)
  if (target.type === "builtin") {
    return useQuery(
      launchpad.getLaunchpadLogs.queryOptions({
        target,
      })
    );
  }

  // Return null for unsupported resource types
  return null;
};
