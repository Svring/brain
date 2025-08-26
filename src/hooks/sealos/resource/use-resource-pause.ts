import {
  devboxClient,
  launchpadClient,
  clusterClient,
} from "@/components/provider/trpc-provider";
import type { LaunchpadPauseRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-old-api-schemas/req-res-pause-schemas";
import type { DevboxLifecycleRequest } from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas";
import { useMutation } from "@tanstack/react-query";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

/**
 * Hook for pausing different types of resources (devbox, launchpad, cluster)
 *
 * @example
 * // For a devbox resource
 * const pauseHook = useResourcePause({ resourceType: "devbox", name: "my-devbox" });
 * pauseHook.pause({ action: "pause", name: "my-devbox" });
 *
 * // For a launchpad resource
 * const pauseHook = useResourcePause({ resourceType: "deployment", name: "my-launchpad" });
 * pauseHook.pause({ name: "my-launchpad" });
 *
 * // For a cluster resource
 * const pauseHook = useResourcePause({ resourceType: "cluster", name: "my-cluster" });
 * pauseHook.pause("my-cluster");
 */
interface UseResourcePauseOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useResourcePause = (
  target: ResourceTarget,
  options?: UseResourcePauseOptions
) => {
  const devboxTrpcClient = devboxClient.useTRPC();
  const launchpadTrpcClient = launchpadClient.useTRPC();
  const clusterTrpcClient = clusterClient.useTRPC();

  // Determine which type of resource we're dealing with
  const isDevbox = target.resourceType === "devbox";
  const isLaunchpad =
    target.resourceType === "deployment" ||
    target.resourceType === "statefulset";
  const isCluster = target.resourceType === "cluster";

  // Use existing mutation hooks
  const devboxPauseMutation = useMutation(
    devboxTrpcClient.manageDevboxLifecycle.mutationOptions()
  );
  const launchpadPauseMutation = useMutation(
    launchpadTrpcClient.pauseLaunchpad.mutationOptions()
  );
  const clusterPauseMutation = useMutation(
    clusterTrpcClient.pauseCluster.mutationOptions()
  );

  // Return the appropriate mutation based on resource type
  if (isDevbox) {
    return {
      pause: (request: DevboxLifecycleRequest) => {
        devboxPauseMutation.mutate(request);
      },
      isPending: devboxPauseMutation.isPending,
      isError: devboxPauseMutation.isError,
      error: devboxPauseMutation.error,
      resourceType: "devbox" as const,
    };
  } else if (isLaunchpad) {
    return {
      pause: (request: LaunchpadPauseRequest) => {
        launchpadPauseMutation.mutate({ request });
      },
      isPending: launchpadPauseMutation.isPending,
      isError: launchpadPauseMutation.isError,
      error: launchpadPauseMutation.error,
      resourceType: "launchpad" as const,
    };
  } else if (isCluster) {
    return {
      pause: (clusterName: string) => {
        clusterPauseMutation.mutate(clusterName);
      },
      isPending: clusterPauseMutation.isPending,
      isError: clusterPauseMutation.isError,
      error: clusterPauseMutation.error,
      resourceType: "cluster" as const,
    };
  }

  // Fallback for unknown resource types
  return {
    pause: () => {
      throw new Error(`Unsupported resource type: ${target.resourceType}`);
    },
    pauseAsync: async () => {
      throw new Error(`Unsupported resource type: ${target.resourceType}`);
    },
    isPending: false,
    isError: false,
    error: null,
    resourceType: "unknown" as const,
  };
};
