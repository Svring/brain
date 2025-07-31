import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { DEPLOYMENT_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { getRelatedResources } from "../relevance-utils";

export const getDeploymentRelatedResources = async (
  context: K8sApiContext,
  deployName: string,
  builtinResources?: string[],
  customResources?: string[]
): Promise<K8sResource[]> => {
  const labelSelectors = [
    `${DEPLOYMENT_RELATE_RESOURCE_LABELS.APP_DEPLOY_MANAGER}=${deployName}`,
  ];
  return getRelatedResources(
    context,
    labelSelectors,
    builtinResources ?? ["ingress", "service", "pvc", "configmap"],
    customResources ?? ["issuers", "certificates"]
  );
};
