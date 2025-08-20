import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { LaunchpadObject } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

// Union type for the parameter that can be either CustomResourceTarget or BuiltinResourceTarget
type ResourceTarget = CustomResourceTarget | BuiltinResourceTarget;

export const useResource = (
  target: ResourceTarget
): {
  data:
    | DevboxObject
    | LaunchpadObject
    | ClusterObject
    | ObjectStorageObject
    | undefined;
  isLoading: boolean;
  error: any;
  refetch: () => void;
  resourceType:
    | "devbox"
    | "launchpad"
    | "cluster"
    | "objectstorage"
    | "unknown";
} => {
  const { devbox, launchpad, cluster, objectStorage } = useTRPCClients();

  const isDevbox = target.type === "custom" && target.resourceType === "devbox";
  const isLaunchpad = target.type === "builtin";
  const isCluster =
    target.type === "custom" && target.resourceType === "cluster";
  const isObjectStorage =
    target.type === "custom" && target.resourceType === "objectstoragebucket";

  console.log("isCluster", isCluster);

  // Fetch devbox data if target is a devbox
  const {
    data: devboxData,
    isLoading: devboxLoading,
    error: devboxError,
    refetch: devboxRefetch,
  } = useQuery({
    ...devbox.getDevbox.queryOptions({
      target: target as CustomResourceTarget,
    }),
    enabled: isDevbox,
  });

  // Fetch launchpad data if target is a launchpad
  const {
    data: launchpadData,
    isLoading: launchpadLoading,
    error: launchpadError,
    refetch: launchpadRefetch,
  } = useQuery({
    ...launchpad.getLaunchpad.queryOptions(target as BuiltinResourceTarget),
    enabled: isLaunchpad,
  });

  // Fetch cluster data if target is a cluster
  const {
    data: clusterData,
    isLoading: clusterLoading,
    error: clusterError,
    refetch: clusterRefetch,
  } = useQuery(
    cluster.getCluster.queryOptions({
      target: target as CustomResourceTarget,
    })
  );

  console.log("clusterData", clusterData);

  // Fetch object storage data if target is object storage
  const {
    data: objectStorageData,
    isLoading: objectStorageLoading,
    error: objectStorageError,
    refetch: objectStorageRefetch,
  } = useQuery({
    ...objectStorage.getObjectStorage.queryOptions({
      target: target as CustomResourceTarget,
    }),
    enabled: isObjectStorage,
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
    } else if (isCluster) {
      return {
        data: clusterData as ClusterObject | undefined,
        isLoading: clusterLoading,
        error: clusterError,
        refetch: clusterRefetch,
        resourceType: "cluster" as const,
      };
    } else if (isObjectStorage) {
      return {
        data: objectStorageData as ObjectStorageObject | undefined,
        isLoading: objectStorageLoading,
        error: objectStorageError,
        refetch: objectStorageRefetch,
        resourceType: "objectstorage" as const,
      };
    }

    // Fallback for unknown resource types
    return {
      data: undefined,
      isLoading: false,
      error: new Error(
        `Unsupported resource type: ${
          (target as any).resourceType || (target as any).type
        }`
      ),
      refetch: () => Promise.resolve(),
      resourceType: "unknown" as const,
    };
  };

  console.log("getResourceData", getResourceData());

  const { data, isLoading, error, refetch, resourceType } = getResourceData();

  return {
    data,
    isLoading,
    error,
    refetch,
    resourceType,
  };
};
