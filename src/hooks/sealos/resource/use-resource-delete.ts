import {
  devboxClient,
  launchpadClient,
  clusterClient,
  objectStorageClient,
} from "@/components/provider/trpc-provider";
import type { LaunchpadDeleteRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-old-api-schemas/req-res-delete-schemas";
import type { DevboxDeleteRequest } from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas";
import type { ClusterDeleteRequest } from "@/lib/sealos/resources/cluster/schemas/req-res-schemas/req-res-delete-schemas";
import type { ObjectStorageDeleteRequest } from "@/lib/sealos/resources/objectstorage/schemas/req-res-schemas/req-res-delete-schemas";
import { useMutation } from "@tanstack/react-query";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

/**
 * Hook for deleting different types of resources (devbox, launchpad, cluster, objectstorage)
 *
 * @example
 * // For a devbox resource
 * const deleteHook = useResourceDelete({ resourceType: "devbox", name: "my-devbox" });
 * deleteHook.delete("my-devbox");
 *
 * // For a launchpad resource
 * const deleteHook = useResourceDelete({ resourceType: "deployment", name: "my-launchpad" });
 * deleteHook.delete({ name: "my-launchpad" });
 *
 * // For a cluster resource
 * const deleteHook = useResourceDelete({ resourceType: "cluster", name: "my-cluster" });
 * deleteHook.delete({ name: "my-cluster" });
 *
 * // For an objectstorage resource
 * const deleteHook = useResourceDelete({ resourceType: "objectstorage", name: "my-storage" });
 * deleteHook.delete({ name: "my-storage" });
 */
interface UseResourceDeleteOptions {
  onSuccess?: () => void;
}

export const useResourceDelete = (
  target: ResourceTarget,
  options?: UseResourceDeleteOptions
) => {
  const devboxTrpcClient = devboxClient.useTRPC();
  const launchpadTrpcClient = launchpadClient.useTRPC();
  const clusterTrpcClient = clusterClient.useTRPC();
  const objectStorageTrpcClient = objectStorageClient.useTRPC();

  // Determine which type of resource we're dealing with
  const isDevbox = target.resourceType === "devbox";
  const isLaunchpad =
    target.resourceType === "deployment" ||
    target.resourceType === "statefulset";
  const isCluster = target.resourceType === "cluster";
  const isObjectStorage = target.resourceType === "objectstorage";

  // Use existing mutation hooks
  const devboxDeleteMutation = useMutation(
    devboxTrpcClient.deleteDevbox.mutationOptions()
  );
  const launchpadDeleteMutation = useMutation(
    launchpadTrpcClient.deleteLaunchpad.mutationOptions()
  );
  const clusterDeleteMutation = useMutation(
    clusterTrpcClient.deleteCluster.mutationOptions()
  );
  const objectStorageDeleteMutation = useMutation(
    objectStorageTrpcClient.deleteObjectStorage.mutationOptions()
  );

  // Return the appropriate mutation based on resource type
  if (isDevbox) {
    return {
      delete: (devboxName: string) => {
        devboxDeleteMutation.mutate(devboxName, {
          onSuccess: options?.onSuccess,
        });
      },
      isPending: devboxDeleteMutation.isPending,
      isError: devboxDeleteMutation.isError,
      error: devboxDeleteMutation.error,
      resourceType: "devbox" as const,
    };
  } else if (isLaunchpad) {
    return {
      delete: (request: LaunchpadDeleteRequest) => {
        launchpadDeleteMutation.mutate(
          { request },
          {
            onSuccess: options?.onSuccess,
          }
        );
      },
      isPending: launchpadDeleteMutation.isPending,
      isError: launchpadDeleteMutation.isError,
      error: launchpadDeleteMutation.error,
      resourceType: "launchpad" as const,
    };
  } else if (isCluster) {
    return {
      delete: (request: ClusterDeleteRequest) => {
        clusterDeleteMutation.mutate(request, {
          onSuccess: options?.onSuccess,
        });
      },
      isPending: clusterDeleteMutation.isPending,
      isError: clusterDeleteMutation.isError,
      error: clusterDeleteMutation.error,
      resourceType: "cluster" as const,
    };
  } else if (isObjectStorage) {
    return {
      delete: (request: ObjectStorageDeleteRequest) => {
        objectStorageDeleteMutation.mutate(request, {
          onSuccess: options?.onSuccess,
        });
      },
      isPending: objectStorageDeleteMutation.isPending,
      isError: objectStorageDeleteMutation.isError,
      error: objectStorageDeleteMutation.error,
      resourceType: "objectstorage" as const,
    };
  }

  // Fallback for unknown resource types
  return {
    delete: () => {
      throw new Error(`Unsupported resource type: ${target.resourceType}`);
    },
    deleteAsync: async () => {
      throw new Error(`Unsupported resource type: ${target.resourceType}`);
    },
    isPending: false,
    isError: false,
    error: null,
    resourceType: "unknown" as const,
  };
};
