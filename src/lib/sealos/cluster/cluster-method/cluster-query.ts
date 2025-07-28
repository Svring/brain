import { queryOptions } from "@tanstack/react-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import {
  CustomResourceTarget,
  CustomResourceTargetSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getClusterObject } from "@/lib/algorithm/bridge/bridge-resources/cluster/cluster-bridge";
import { listCustomResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  convertResourceTypeToTarget,
  convertResourceToTarget,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { buildQueryKey } from "@/lib/k8s/k8s-constant/k8s-constant-query-key";

export const getCluster = async (
  context: K8sApiContext,
  target: CustomResourceTarget
) => {
  // Test the new composeObjectFromTarget function
  const clusterObject = await getClusterObject(context, target);
  return clusterObject;
};

export const listCluster = async (context: K8sApiContext) => {
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("cluster")
  );
  const clusterResourceList = await runParallelAction(
    listCustomResources(context, target)
  );
  const clusterTargetList = clusterResourceList.items.map((item) =>
    CustomResourceTargetSchema.parse(convertResourceToTarget(item))
  );
  return clusterTargetList.map(
    async (target) => await getCluster(context, target)
  );
};

// ============================================================================
// OPTIONS FUNCTIONS (React Query wrappers)
// ============================================================================

/**
 * Query options for getting a cluster by target
 */
export const getClusterOptions = (
  context: K8sApiContext,
  target: CustomResourceTarget
) =>
  queryOptions({
    queryKey: buildQueryKey.getCluster(context.namespace, target.name!),
    queryFn: async () => await getCluster(context, target),
    enabled:
      !!target.group &&
      !!target.version &&
      !!context.namespace &&
      !!target.plural &&
      !!target.name &&
      !!context.kubeconfig,
  });

/**
 * Query options for listing clusters
 */
export const listClusterOptions = (context: K8sApiContext) =>
  queryOptions({
    queryKey: buildQueryKey.listClusters(context.namespace),
    queryFn: async () => await listCluster(context),
    enabled: !!context.namespace && !!context.kubeconfig,
    staleTime: 1000 * 30,
  });
