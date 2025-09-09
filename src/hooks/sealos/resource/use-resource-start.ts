import {
  devboxClient,
  launchpadClient,
  clusterClient,
} from "@/components/provider/trpc-provider";
import type { LaunchpadStartRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-old-api-schemas/req-res-start-schemas";
import type { DevboxLifecycleRequest } from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas";
import { useMutation } from "@tanstack/react-query";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

/**
 * Hook for starting different types of resources (devbox, launchpad, cluster)
 *
 * @example
 * // For a devbox resource
 * const startHook = useResourceStart({ resourceType: "devbox", name: "my-devbox" });
 * startHook.start({ action: "start", name: "my-devbox" });
 *
 * // For a launchpad resource
 * const startHook = useResourceStart({ resourceType: "deployment", name: "my-launchpad" });
 * startHook.start({ name: "my-launchpad" });
 *
 * // For a cluster resource
 * const startHook = useResourceStart({ resourceType: "cluster", name: "my-cluster" });
 * startHook.start("my-cluster");
 */
interface UseResourceStartOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useResourceStart = (
  target: ResourceTarget,
  options?: UseResourceStartOptions
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
  const devboxStartMutation = useMutation(
    devboxTrpcClient.start.mutationOptions()
  );
  const launchpadStartMutation = useMutation(
    launchpadTrpcClient.startLaunchpad.mutationOptions()
  );
  const clusterStartMutation = useMutation(
    clusterTrpcClient.start.mutationOptions()
  );

  // Return the appropriate mutation based on resource type
  if (isDevbox) {
    return {
      start: (devboxName: string) => {
        devboxStartMutation.mutate(devboxName);
      },
      isPending: devboxStartMutation.isPending,
      isError: devboxStartMutation.isError,
      error: devboxStartMutation.error,
      resourceType: "devbox" as const,
    };
  } else if (isLaunchpad) {
    return {
      start: (request: LaunchpadStartRequest) => {
        launchpadStartMutation.mutate(request);
      },
      isPending: launchpadStartMutation.isPending,
      isError: launchpadStartMutation.isError,
      error: launchpadStartMutation.error,
      resourceType: "launchpad" as const,
    };
  } else if (isCluster) {
    return {
      start: (clusterName: string) => {
        clusterStartMutation.mutate(clusterName);
      },
      isPending: clusterStartMutation.isPending,
      isError: clusterStartMutation.isError,
      error: clusterStartMutation.error,
      resourceType: "cluster" as const,
    };
  }

  // Fallback for unknown resource types
  return {
    start: () => {
      throw new Error(`Unsupported resource type: ${target.resourceType}`);
    },
    startAsync: async () => {
      throw new Error(`Unsupported resource type: ${target.resourceType}`);
    },
    isPending: false,
    isError: false,
    error: null,
    resourceType: "unknown" as const,
  };
};
