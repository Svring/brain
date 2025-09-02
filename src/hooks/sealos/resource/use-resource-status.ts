import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export const useResourceStatus = (
  target: CustomResourceTarget | BuiltinResourceTarget
) => {
  const { devbox, cluster, launchpad, objectstorage } = useTRPCClients();

  // Helper function to create consistent return object
  const createReturn = (resource: any, rest: any) => ({
    ...rest,
    resource,
    status: resource?.status,
  });

  // Handle custom resources
  if (target.type === "custom") {
    if (target.resourceType === "devbox") {
      const query = useQuery(devbox.getDevbox.queryOptions(target));
      return createReturn(query.data, query);
    }

    if (target.resourceType === "cluster") {
      const query = useQuery(cluster.getCluster.queryOptions(target));
      return createReturn(query.data, query);
    }

    if (target.resourceType === "objectstoragebucket") {
      const query = useQuery(
        objectstorage.getObjectStorage.queryOptions(target)
      );
      return createReturn(query.data, query);
    }

    throw new Error(`Unsupported custom resource type: ${target.resourceType}`);
  }

  // Handle builtin resources
  if (target.type === "builtin") {
    const query = useQuery(launchpad.getLaunchpad.queryOptions(target));
    return createReturn(query.data, query);
  }
};
