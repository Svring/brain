import { queryOptions } from "@tanstack/react-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
  BuiltinResourceTarget,
  BuiltinResourceTargetSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getIngressObject } from "@/lib/algorithm/bridge/bridge-resources/bridge-sealos/ingress/ingress-bridge";
import { listBuiltinResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  convertResourceTypeToTarget,
  convertResourceToTarget,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { buildQueryKey } from "@/lib/k8s/k8s-constant/k8s-constant-query-key";

export const getIngress = async (
  context: K8sApiContext,
  target: BuiltinResourceTarget
) => {
  // Test the new composeObjectFromTarget function
  const ingressObject = await getIngressObject(context, target);
  return ingressObject;
};

export const listIngress = async (context: K8sApiContext) => {
  const target = BuiltinResourceTargetSchema.parse(
    convertResourceTypeToTarget("ingress")
  );
  const ingressResourceList = await runParallelAction(
    listBuiltinResources(context, target)
  );
  const ingressTargetList = ingressResourceList.items.map((item) =>
    BuiltinResourceTargetSchema.parse(convertResourceToTarget(item))
  );
  const ingressPromises = ingressTargetList.map(
    async (target) => await getIngress(context, target)
  );
  return await Promise.all(ingressPromises);
};

// ============================================================================
// OPTIONS FUNCTIONS (React Query wrappers)
// ============================================================================

/**
 * Query options for getting an ingress by target
 */
export const getIngressOptions = (
  context: K8sApiContext,
  target: BuiltinResourceTarget
) =>
  queryOptions({
    queryKey: buildQueryKey.getBuiltinResource(
      context.namespace,
      target.resourceType,
      target.name!
    ),
    queryFn: async () => await getIngress(context, target),
    enabled: !!context.namespace && !!target.name && !!context.kubeconfig,
  });

/**
 * Query options for listing deployments
 */
export const listIngressOptions = (context: K8sApiContext) =>
  queryOptions({
    queryKey: buildQueryKey.listBuiltinResources(context.namespace, "ingress"),
    queryFn: async () => await listIngress(context),
    enabled: !!context.namespace && !!context.kubeconfig,
    staleTime: 1000 * 30,
  });
