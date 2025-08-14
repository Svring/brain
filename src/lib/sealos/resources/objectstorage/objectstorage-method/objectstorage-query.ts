import { queryOptions } from "@tanstack/react-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { ObjectStorageApiContext } from "../schemas/objectstorage-api-context-schemas";
import {
  CustomResourceTarget,
  CustomResourceTargetSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getObjectStorageObject } from "@/lib/sealos/services/bridge/bridge-resources/bridge-sealos/objectstorage/objectstorage-bridge-query";
import { listCustomResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { runParallelAction } from "next-server-actions-parallel";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { convertObjectStorageListToSimplified } from "../objectstorage-utils";
import {
  initObjectStorageUser,
  getObjectStorageStatus,
} from "../objectstorage-api/objectstorage-old-api";

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
  return convertObjectStorageListToSimplified(objectStorageResourceList.items);
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
    queryKey: ["objectstoragebucket", target.name!],
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
    queryKey: ["objectstoragebucket"],
    queryFn: async () => await listObjectStorage(context),
    enabled: !!context.namespace && !!context.kubeconfig,
    staleTime: 1000 * 30,
  });

/**
 * Query options for initializing object storage user
 */
export const initObjectStorageUserOptions = (
  context: ObjectStorageApiContext
) =>
  queryOptions({
    queryKey: ["sealos", "objectstorage", "user", "init"],
    queryFn: async () =>
      await runParallelAction(initObjectStorageUser(context)),
    enabled: !!context.baseURL && !!context.authorization,
    staleTime: 1000 * 60 * 5, // 5 minutes - user credentials don't change often
  });

/**
 * Query options for getting object storage status (static hosting)
 */
export const getObjectStorageStatusOptions = (
  context: ObjectStorageApiContext,
  bucket: string
) =>
  queryOptions({
    queryKey: ["sealos", "objectstorage", "status", bucket],
    queryFn: async () =>
      await runParallelAction(getObjectStorageStatus({ bucket }, context)),
    enabled: !!context.baseURL && !!context.authorization && !!bucket,
    staleTime: 1000 * 30, // 30 seconds - status can change frequently
  });
