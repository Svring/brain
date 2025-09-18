import type { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

/**
 * Type definition for TRPC clients used in resource queries
 * Using a more flexible type to accommodate the actual TRPC client structure
 */
export interface TRPCClients {
  devbox: any;
  cluster: any;
  objectstorage: any;
  launchpad: any;
}

/**
 * Get query options for a resource target based on its type and resource type
 * @param target - The resource target to get query options for
 * @param clients - The TRPC clients object
 * @returns Query options for the target, or disabled query if target is invalid
 */
export const getResourceQueryOptions = (
  target: ResourceTarget,
  clients: TRPCClients
) => {
  if (!target) {
    return {
      queryKey: [],
      queryFn: async () => {},
      enabled: false,
    };
  }

  if (target.type === "custom") {
    switch (target.resourceType) {
      case "devbox":
        return clients.devbox.get.queryOptions(target);
      case "cluster":
        return clients.cluster.get.queryOptions(target);
      case "objectstoragebucket":
        return clients.objectstorage.get.queryOptions(target);
      default:
        return {
          queryKey: [],
          queryFn: async () => {},
          enabled: false,
        };
    }
  }

  if (target.type === "builtin") {
    return clients.launchpad.get.queryOptions(target);
  }

  return {
    queryKey: [],
    queryFn: async () => {},
    enabled: false,
  };
};
