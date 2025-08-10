import { queryOptions } from "@tanstack/react-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
  BuiltinResourceTarget,
  BuiltinResourceTargetSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getDeploymentObject } from "@/lib/algorithm/bridge/bridge-resources/bridge-sealos/deployment/deployment-bridge-query";
import { listBuiltinResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  convertResourceTypeToTarget,
  convertResourceToTarget,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { buildQueryKey } from "@/lib/k8s/k8s-constant/k8s-constant-query-key";

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
  const deploymentTargetList = deploymentResourceList.items.map((item) =>
    BuiltinResourceTargetSchema.parse(convertResourceToTarget(item))
  );
  const deploymentPromises = deploymentTargetList.map(
    async (target) => await getDeployment(context, target)
  );
  return await Promise.all(deploymentPromises);
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
    queryKey: ["deployment"],
    queryFn: async () => await listDeployment(context),
    enabled: !!context.namespace && !!context.kubeconfig,
    staleTime: 1000 * 30,
  });
