import { queryOptions } from "@tanstack/react-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
  BuiltinResourceTarget,
  BuiltinResourceTargetSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getStatefulSetObject } from "@/lib/sealos/services/bridge/bridge-resources/bridge-sealos/statefulset/statefulset-bridge-query";
import { listBuiltinResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  convertResourceTypeToTarget,
  convertResourceToTarget,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { STATEFULSET_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { getRelatedResources } from "@/lib/sealos/services/relevance/relevance-utils";
import { convertStatefulsetListToSimplified } from "./statefulset-utils";

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
  return convertStatefulsetListToSimplified(statefulSetResourceList.items);
};

export const getStatefulsetRelatedResources = async (
  context: K8sApiContext,
  statefulsetName: string,
  builtinResources?: string[],
  customResources?: string[]
): Promise<K8sResource[]> => {
  const defaultBuiltinResources = ["ingress", "service", "pvc", "configmap"];
  const defaultCustomResources = ["issuers", "certificates"];
  const finalBuiltinResources = builtinResources ?? defaultBuiltinResources;
  const finalCustomResources = customResources ?? defaultCustomResources;

  // Check if pod is in the builtin resources
  const hasPod = finalBuiltinResources.includes("pod");

  if (hasPod) {
    // Remove pod from the main query
    const resourcesWithoutPod = finalBuiltinResources.filter(
      (resource) => resource !== "pod"
    );

    // Get resources with APP_DEPLOY_MANAGER label
    const labelSelectors = [
      `${STATEFULSET_RELATE_RESOURCE_LABELS.APP_DEPLOY_MANAGER}=${statefulsetName}`,
    ];
    const mainResources = await getRelatedResources(
      context,
      labelSelectors,
      resourcesWithoutPod,
      finalCustomResources
    );

    // Get pods with APP label
    const podLabelSelectors = [
      `${STATEFULSET_RELATE_RESOURCE_LABELS.APP}=${statefulsetName}`,
    ];
    const podResources = await getRelatedResources(
      context,
      podLabelSelectors,
      ["pod"],
      []
    );

    // Merge and return both results
    return [...mainResources, ...podResources];
  } else {
    // Original behavior when pod is not included
    const labelSelectors = [
      `${STATEFULSET_RELATE_RESOURCE_LABELS.APP_DEPLOY_MANAGER}=${statefulsetName}`,
    ];
    return getRelatedResources(
      context,
      labelSelectors,
      finalBuiltinResources,
      finalCustomResources
    );
  }
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
    queryKey: ["statefulset", target.name],
    queryFn: async () => await getStatefulSet(context, target),
    enabled: !!context.namespace && !!target.name && !!context.kubeconfig,
  });

/**
 * Query options for listing statefulsets
 */
export const listStatefulSetOptions = (context: K8sApiContext) =>
  queryOptions({
    queryKey: ["statefulsets"],
    queryFn: async () => await listStatefulSet(context),
    enabled: !!context.namespace && !!context.kubeconfig,
    staleTime: 1000 * 30,
  });
