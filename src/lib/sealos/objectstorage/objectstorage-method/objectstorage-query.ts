import { queryOptions } from "@tanstack/react-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import {
  CustomResourceTarget,
  CustomResourceTargetSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getObjectStorageObject } from "@/lib/algorithm/bridge/bridge-resources/objectstorage/objectstorage-bridge";
import { listCustomResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  convertResourceTypeToTarget,
  convertResourceToTarget,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { buildQueryKey } from "@/lib/k8s/k8s-constant/k8s-constant-query-key";

export const getObjectStorage = async (
  context: K8sApiContext,
  target: CustomResourceTarget
) => {
  // Test the new composeObjectFromTarget function
  const objectStorageObject = await getObjectStorageObject(context, target);
  return objectStorageObject;
};

export const listObjectStorage = async (context: K8sApiContext) => {
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("objectstoragebucket")
  );
  const objectStorageResourceList = await runParallelAction(
    listCustomResources(context, target)
  );
  const objectStorageTargetList = objectStorageResourceList.items.map((item) =>
    CustomResourceTargetSchema.parse(convertResourceToTarget(item))
  );
  return objectStorageTargetList.map(
    async (target) => await getObjectStorage(context, target)
  );
};

// ============================================================================
// OPTIONS FUNCTIONS (React Query wrappers)
// ============================================================================

/**
 * Query options for getting an objectstorage by target
 */
export const getObjectStorageOptions = (
  context: K8sApiContext,
  target: CustomResourceTarget
) =>
  queryOptions({
    queryKey: buildQueryKey.getObjectStorage(context.namespace, target.name!),
    queryFn: async () => await getObjectStorage(context, target),
    enabled:
      !!target.group &&
      !!target.version &&
      !!context.namespace &&
      !!target.plural &&
      !!target.name &&
      !!context.kubeconfig,
  });

/**
 * Query options for listing objectstorages
 */
export const listObjectStorageOptions = (context: K8sApiContext) =>
  queryOptions({
    queryKey: buildQueryKey.listObjectStorages(context.namespace),
    queryFn: async () => await listObjectStorage(context),
    enabled: !!context.namespace && !!context.kubeconfig,
    staleTime: 1000 * 30,
  });
