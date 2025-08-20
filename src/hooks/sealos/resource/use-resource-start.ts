import {
  devboxClient,
  launchpadClient,
  clusterClient,
} from "@/components/provider/trpc-provider";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { LaunchpadObject } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import type { LaunchpadStartRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-old-api-schemas/req-res-start-schemas";
import type { DevboxLifecycleRequest } from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas";
import { useMutation } from "@tanstack/react-query";

// Union type for the parameter that can be either devbox, launchpad, or cluster
type ResourceStartTarget = DevboxObject | LaunchpadObject | ClusterObject;

interface UseResourceStartOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useResourceStart = (
  target: ResourceStartTarget,
  options?: UseResourceStartOptions
) => {
  const devboxTrpcClient = devboxClient.useTRPC();
  const launchpadTrpcClient = launchpadClient.useTRPC();
  const clusterTrpcClient = clusterClient.useTRPC();

  // Determine which type of resource we're dealing with
  const isDevbox = target.kind === "Devbox";
  const isLaunchpad =
    target.kind === "Deployment" || target.kind === "StatefulSet";
  const isCluster = target.kind === "Cluster";

  // Use existing mutation hooks
  const devboxStartMutation = useMutation(
    devboxTrpcClient.manageDevboxLifecycle.mutationOptions()
  );
  const launchpadStartMutation = useMutation(
    launchpadTrpcClient.startLaunchpad.mutationOptions()
  );
  const clusterStartMutation = useMutation(
    clusterTrpcClient.startCluster.mutationOptions()
  );

  // Return the appropriate mutation based on resource type
  if (isDevbox) {
    return {
      start: (request: DevboxLifecycleRequest) => {
        devboxStartMutation.mutate(request);
      },
      isPending: devboxStartMutation.isPending,
      isError: devboxStartMutation.isError,
      error: devboxStartMutation.error,
      resourceType: "devbox" as const,
    };
  } else if (isLaunchpad) {
    return {
      start: (request: LaunchpadStartRequest) => {
        launchpadStartMutation.mutate({ request });
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
      throw new Error(`Unsupported resource type: ${target.kind}`);
    },
    startAsync: async () => {
      throw new Error(`Unsupported resource type: ${target.kind}`);
    },
    isPending: false,
    isError: false,
    error: null,
    resourceType: "unknown" as const,
  };
};
