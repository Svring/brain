import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { CLUSTER_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { getRelatedResources } from "../relevance-utils";

export const getClusterRelatedResources = async (
  context: K8sApiContext,
  clusterName: string,
  builtinResources?: string[],
  customResources?: string[]
): Promise<K8sResource[]> => {
  const labelSelectors = [
    `${CLUSTER_RELATE_RESOURCE_LABELS.APP_KUBERNETES_INSTANCE}=${clusterName}`,
  ];
  return getRelatedResources(
    context,
    labelSelectors,
    builtinResources ?? ["serviceaccount", "role", "rolebinding", "secret"],
    customResources ?? ["backups"]
  );
};
