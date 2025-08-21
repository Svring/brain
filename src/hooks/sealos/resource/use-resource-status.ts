import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export const useResourceStatus = (
  target: CustomResourceTarget | BuiltinResourceTarget
) => {
  const { devbox, cluster, launchpad, objectStorage } = useTRPCClients();

  // Handle custom resources (devbox, cluster, objectstorage)
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
      // console.log("resource cluster", resource);
      return {
        ...rest,
        resource,
        status: resource?.status,
      };
    }
    if (target.resourceType === "objectstoragebucket") {
      const { data: resource, ...rest } = useQuery(
        objectStorage.getObjectStorage.queryOptions({ target })
      );
      return {
        ...rest,
        resource,
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
      status: resource?.status,
    };
  }

  throw new Error(`Unsupported resource type: ${target.resourceType}`);
};
