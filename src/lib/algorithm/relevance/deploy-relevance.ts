import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { DEPLOYMENT_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { getRelatedResourcesByLabel } from "./relevance-utils";

export const getDeployRelatedResources = async (
  context: K8sApiContext,
  deployName: string
): Promise<K8sResource[]> => {
  return getRelatedResourcesByLabel(
    context,
    DEPLOYMENT_RELATE_RESOURCE_LABELS.APP_DEPLOY_MANAGER,
    deployName,
    ["ingress", "service", "pvc", "configmap"],
    ["issuers", "certificates"]
  );
};
