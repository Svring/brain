import { useDevboxObject } from "@/hooks/sealos/devbox/use-devbox-object";
import { useClusterObject } from "@/hooks/sealos/cluster/use-cluster-object";
import { useObjectstorageObject } from "@/hooks/sealos/objectstorage/use-objectstorage-object";
import { useLaunchpadObject } from "@/hooks/sealos/launchpad/use-launchpad-object";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

type ResourceSelectFunction<TResource = any, TSelected = any> = (
  resource: TResource
) => TSelected;

export const useResourceStatus = <TSelected = any>(
  target: CustomResourceTarget | BuiltinResourceTarget | null,
  select?: ResourceSelectFunction<any, TSelected>,
  enabled: boolean = true
) => {
  const createReturn = (resource: any, query: any) => ({
    ...query,
    resource: resource && select ? select(resource) : resource,
    originalResource: resource,
    status: resource?.status,
  });

  if (!enabled || !target || !target.name) {
    return {
      resource: undefined,
      status: undefined,
      isLoading: false,
    };
  }

  if (target.type === "custom") {
    const queries = {
      devbox: useDevboxObject,
      cluster: useClusterObject,
      objectstoragebucket: useObjectstorageObject,
    };

    const queryFn = queries[target.resourceType as keyof typeof queries];
    if (!queryFn) {
      throw new Error(
        `Unsupported custom resource type: ${target.resourceType}`
      );
    }

    return createReturn(queryFn(target.name).data, queryFn(target.name));
  }

  if (target.type === "builtin") {
    const query = useLaunchpadObject(target.name, target.resourceType);
    return createReturn(query.data, query);
  }

  return {
    resource: undefined,
    status: undefined,
    isLoading: false,
    // error: new Error(`Unsupported target type: ${(target as any).type}`),
  };
};
