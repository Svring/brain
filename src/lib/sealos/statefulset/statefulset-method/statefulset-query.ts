import { queryOptions } from "@tanstack/react-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
  BuiltinResourceTarget,
  BuiltinResourceTargetSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getStatefulSetObject } from "@/lib/algorithm/bridge/bridge-resources/statefulset/statefulset-bridge";
import { listBuiltinResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  convertResourceTypeToTarget,
  convertResourceToTarget,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { buildQueryKey } from "@/lib/k8s/k8s-constant/k8s-constant-query-key";

export const getStatefulSet = async (
  context: K8sApiContext,
  target: BuiltinResourceTarget
) => {
  // Test the new composeObjectFromTarget function
  const statefulSetObject = await getStatefulSetObject(context, target);
  return statefulSetObject;
};

export const listStatefulSet = async (context: K8sApiContext) => {
  const target = BuiltinResourceTargetSchema.parse(
    convertResourceTypeToTarget("statefulset")
  );
  const statefulSetResourceList = await runParallelAction(
    listBuiltinResources(context, target)
  );
  const statefulSetTargetList = statefulSetResourceList.items.map((item) =>
    BuiltinResourceTargetSchema.parse(convertResourceToTarget(item))
  );
  return statefulSetTargetList.map(
    async (target) => await getStatefulSet(context, target)
  );
};

// ============================================================================
// OPTIONS FUNCTIONS (React Query wrappers)
// ============================================================================

/**
 * Query options for getting a statefulset by target
 */
export const getStatefulSetOptions = (
  context: K8sApiContext,
  target: BuiltinResourceTarget
) =>
  queryOptions({
    queryKey: buildQueryKey.getBuiltinResource(
      context.namespace,
      target.resourceType,
      target.name!
    ),
    queryFn: async () => await getStatefulSet(context, target),
    enabled: !!context.namespace && !!target.name && !!context.kubeconfig,
  });

/**
 * Query options for listing statefulsets
 */
export const listStatefulSetOptions = (context: K8sApiContext) =>
  queryOptions({
    queryKey: buildQueryKey.listBuiltinResources(
      context.namespace,
      "statefulset"
    ),
    queryFn: async () => await listStatefulSet(context),
    enabled: !!context.namespace && !!context.kubeconfig,
    staleTime: 1000 * 30,
  });
