import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { DEVBOX_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { getRelatedResources } from "../relevance-utils";

export const getDevboxRelatedResources = async (
  context: K8sApiContext,
  devboxName: string
): Promise<K8sResource[]> => {
  const labelSelectors = [
    `${DEVBOX_RELATE_RESOURCE_LABELS.DEVBOX_MANAGER}=${devboxName}`,
    `${DEVBOX_RELATE_RESOURCE_LABELS.APP_KUBERNETES_NAME}=${devboxName}`,
  ];

  return getRelatedResources(
    context,
    labelSelectors,
    ["ingress", "service", "secret", "pod"],
    ["issuers", "certificates"]
  );
};
