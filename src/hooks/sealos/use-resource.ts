import { useQuery } from "@tanstack/react-query";
import {
  devboxClient,
  launchpadClient,
} from "@/components/provider/trpc-provider";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { LaunchpadObject } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

// Union type for the parameter that can be either devbox or launchpad
type ResourceTarget = DevboxObject | LaunchpadObject;

interface UseResourceOptions {
  enabled?: boolean;
}

export const useResource = (
  target: ResourceTarget,
  options?: UseResourceOptions
) => {
  const devboxTrpcClient = devboxClient.useTRPC();
  const launchpadTrpcClient = launchpadClient.useTRPC();

  // Determine which type of resource we're dealing with
  const isDevbox = target.kind === "Devbox";
  const isLaunchpad =
    target.kind === "Deployment" || target.kind === "StatefulSet";

  // Convert target to the appropriate format for API calls
  const convertedTarget = convertResourceObjectToTarget({
    kind: target.kind,
    name: target.name,
  });

  // Fetch devbox data if target is a devbox
  const {
    data: devboxData,
    isLoading: devboxLoading,
    error: devboxError,
    refetch: devboxRefetch,
  } = useQuery({
    ...devboxTrpcClient.getDevbox.queryOptions({
      target: convertedTarget as CustomResourceTarget,
    }),
    enabled: isDevbox && (options?.enabled ?? true),
  });

  // Fetch launchpad data if target is a launchpad
  const {
    data: launchpadData,
    isLoading: launchpadLoading,
    error: launchpadError,
    refetch: launchpadRefetch,
  } = useQuery({
    ...launchpadTrpcClient.getLaunchpad.queryOptions(
      convertedTarget as BuiltinResourceTarget
    ),
    enabled: isLaunchpad && (options?.enabled ?? true),
  });

  // Determine the appropriate data, loading state, and error based on resource type
  const getResourceData = () => {
    if (isDevbox) {
      return {
        data: devboxData as DevboxObject | undefined,
        isLoading: devboxLoading,
        error: devboxError,
        refetch: devboxRefetch,
        resourceType: "devbox" as const,
      };
    } else if (isLaunchpad) {
      return {
        data: launchpadData as LaunchpadObject | undefined,
        isLoading: launchpadLoading,
        error: launchpadError,
        refetch: launchpadRefetch,
        resourceType: "launchpad" as const,
      };
    }

    // Fallback for unknown resource types
    return {
      data: undefined,
      isLoading: false,
      error: new Error(`Unsupported resource type: ${target.kind}`),
      refetch: () => Promise.resolve(),
      resourceType: "unknown" as const,
    };
  };

  const { data, isLoading, error, refetch, resourceType } = getResourceData();

  return {
    data,
    isLoading,
    error,
    refetch,
    resourceType,
    // Helper properties for easier access
    isDevbox,
    isLaunchpad,
    // Type-safe data accessors
    devboxData: isDevbox ? (data as DevboxObject) : undefined,
    launchpadData: isLaunchpad ? (data as LaunchpadObject) : undefined,
  };
};
