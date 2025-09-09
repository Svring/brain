import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Select function type for transforming resource data
 */
export type ResourceSelectFunction<TResource = any, TSelected = any> = (
  resource: TResource
) => TSelected;

export const useResourceStatus = <TSelected = any>(
  target: CustomResourceTarget | BuiltinResourceTarget,
  select?: ResourceSelectFunction<any, TSelected>
) => {
  const { devbox, cluster, launchpad, objectstorage } = useTRPCClients();

  // Helper function to create consistent return object
  const createReturn = (
    resource: any,
    rest: any
  ): {
    resource: TSelected;
    originalResource: any;
    status: any;
    [key: string]: any;
  } => {
    const processedResource = select ? select(resource) : resource;
    return {
      ...rest,
      resource: processedResource,
      originalResource: resource,
      status: resource?.status,
    };
  };

  // Handle custom resources
  if (target.type === "custom") {
    if (target.resourceType === "devbox") {
      const query = useQuery(devbox.get.queryOptions(target));
      return createReturn(query.data, query);
    }

    if (target.resourceType === "cluster") {
      const query = useQuery(cluster.get.queryOptions(target));
      return createReturn(query.data, query);
    }

    if (target.resourceType === "objectstoragebucket") {
      const query = useQuery(objectstorage.get.queryOptions(target));
      return createReturn(query.data, query);
    }

    throw new Error(`Unsupported custom resource type: ${target.resourceType}`);
  }

  // Handle builtin resources
  if (target.type === "builtin") {
    const query = useQuery(launchpad.get.queryOptions(target));
    return createReturn(query.data, query);
  }

  // Fallback case - return a default object to prevent undefined destructuring
  return {
    resource: undefined,
    status: undefined,
    isLoading: false,
    error: new Error(`Unsupported target type: ${(target as any).type}`),
  };
};
