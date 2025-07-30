import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { getRelatedResources } from "../relevance-utils";

export const getInstanceRelatedResources = async (
  context: K8sApiContext,
  instanceName: string,
  builtinResources?: string[],
  customResources?: string[]
): Promise<K8sResource[]> => {
  const labelSelectors = [
    `${INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS}=${instanceName}`,
  ];
  return getRelatedResources(
    context,
    labelSelectors,
    builtinResources ?? ["configmap", "deployment", "statefulset"],
    customResources ?? ["devbox", "cluster", "objectstoragebucket"]
  );
};
