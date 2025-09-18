import { queryOptions } from "@tanstack/react-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
  BuiltinResourceTarget,
  BuiltinResourceTargetSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getDeploymentObject } from "@/lib/sealos/services/bridge/bridge-resources/bridge-sealos/deployment/deployment-bridge-query";
import { listBuiltinResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  convertResourceTypeToTarget,
  convertResourceToTarget,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { buildQueryKey } from "@/lib/k8s/k8s-constant/k8s-constant-query-key";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { DEPLOYMENT_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { getRelatedResources } from "@/lib/sealos/services/relevance/relevance-utils";
import { convertDeploymentListToSimplified } from "./deployment-utils";

export const getDeployment = async (
  context: K8sApiContext,
  target: BuiltinResourceTarget
) => {
  // Test the new composeObjectFromTarget function
  const deploymentObject = await getDeploymentObject(context, target);
  return deploymentObject;
};

export const listDeployment = async (context: K8sApiContext) => {
  const target = BuiltinResourceTargetSchema.parse(
    convertResourceTypeToTarget("deployment")
  );
  const deploymentResourceList = await runParallelAction(
    listBuiltinResources(context, target)
  );
  return convertDeploymentListToSimplified(deploymentResourceList.items);
};

export const getDeploymentRelatedResources = async (
  context: K8sApiContext,
  deployName: string,
  builtinResources?: string[],
  customResources?: string[]
): Promise<K8sResource[]> => {
  const defaultBuiltinResources = ["ingress", "service", "pvc", "configmap"];
  const defaultCustomResources = ["issuer", "certificate"];
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
      `${DEPLOYMENT_RELATE_RESOURCE_LABELS.APP_DEPLOY_MANAGER}=${deployName}`,
    ];
    const mainResources = await getRelatedResources(
      context,
      labelSelectors,
      resourcesWithoutPod,
      finalCustomResources
    );

    // Get pods with APP label
    const podLabelSelectors = [
      `${DEPLOYMENT_RELATE_RESOURCE_LABELS.APP}=${deployName}`,
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
      `${DEPLOYMENT_RELATE_RESOURCE_LABELS.APP_DEPLOY_MANAGER}=${deployName}`,
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
 * Query options for getting a deployment by target
 */
export const getDeploymentOptions = (
  context: K8sApiContext,
  target: BuiltinResourceTarget
) =>
  queryOptions({
    queryKey: ["deployment", target.name],
    queryFn: async () => await getDeployment(context, target),
    enabled: !!context.namespace && !!target.name && !!context.kubeconfig,
  });

/**
 * Query options for listing deployments
 */
export const listDeploymentOptions = (context: K8sApiContext) =>
  queryOptions({
    queryKey: ["deployments"],
    queryFn: async () => await listDeployment(context),
    enabled: !!context.namespace && !!context.kubeconfig,
  });
