import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { CLUSTER_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { getRelatedResourcesByLabel } from "./relevance-utils";

export const getClusterRelatedResources = async (
  context: K8sApiContext,
  clusterName: string
): Promise<K8sResource[]> => {
  return getRelatedResourcesByLabel(
    context,
    CLUSTER_RELATE_RESOURCE_LABELS.APP_KUBERNETES_INSTANCE,
    clusterName,
    ["serviceaccount", "role", "rolebinding", "secret"],
    ["backups"]
  );
};
