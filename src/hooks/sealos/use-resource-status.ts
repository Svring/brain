import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export const useResourceStatus = (
  target: CustomResourceTarget | BuiltinResourceTarget
) => {
  const { devbox, cluster, launchpad } = useTRPCClients();

  // Handle custom resources (devbox, cluster)
  if (target.type === "custom") {
    if (target.resourceType === "devbox") {
      const { data: resource, ...rest } = useQuery(
        devbox.getDevbox.queryOptions({ target })
      );
      return {
        ...rest,
        resource,
        status: resource?.status,
      };
    }
    if (target.resourceType === "cluster") {
      const { data: resource, ...rest } = useQuery(
        cluster.getCluster.queryOptions({ target })
      );
      return {
        ...rest,
        resource,
        status: resource?.status,
      };
    }
  }

  // Handle builtin resources (deployment, statefulset)
  if (target.type === "builtin") {
    const { data: resource, ...rest } = useQuery(
      launchpad.getLaunchpad.queryOptions(target)
    );

    return {
      ...rest,
      resource,
      status: resource?.status?.status || "Pending",
    };
  }

  throw new Error(`Unsupported resource type: ${target.type}`);
};
