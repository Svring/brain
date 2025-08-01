import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { DEVBOX_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { getRelatedResources } from "../relevance-utils";

export const getDevboxRelatedResources = async (
  context: K8sApiContext,
  devboxName: string,
  builtinResources?: string[],
  customResources?: string[]
): Promise<K8sResource[]> => {
  const defaultBuiltinResources = ["ingress", "service", "secret", "pod"];
  const defaultCustomResources = ["issuers", "certificates"];
  const finalBuiltinResources = builtinResources ?? defaultBuiltinResources;
  const finalCustomResources = customResources ?? defaultCustomResources;

  // Resources that use APP_KUBERNETES_NAME label
  const appKubernetesNameResources = ["secret", "pod"];
  
  // Check if any APP_KUBERNETES_NAME resources are requested
  const hasAppKubernetesNameResources = finalBuiltinResources.some(resource => 
    appKubernetesNameResources.includes(resource)
  );
  
  if (hasAppKubernetesNameResources) {
    // Separate resources by label type
    const devboxManagerResources = finalBuiltinResources.filter(resource => 
      !appKubernetesNameResources.includes(resource)
    );
    const appKubernetesResources = finalBuiltinResources.filter(resource => 
      appKubernetesNameResources.includes(resource)
    );
    
    const results: K8sResource[] = [];
    
    // Get resources with DEVBOX_MANAGER label
    if (devboxManagerResources.length > 0) {
      const devboxManagerLabelSelectors = [
        `${DEVBOX_RELATE_RESOURCE_LABELS.DEVBOX_MANAGER}=${devboxName}`,
      ];
      const mainResources = await getRelatedResources(
        context,
        devboxManagerLabelSelectors,
        devboxManagerResources,
        finalCustomResources
      );
      results.push(...mainResources);
    }
    
    // Get resources with APP_KUBERNETES_NAME label
    if (appKubernetesResources.length > 0) {
      const appKubernetesLabelSelectors = [
        `${DEVBOX_RELATE_RESOURCE_LABELS.APP_KUBERNETES_NAME}=${devboxName}`,
      ];
      const appKubernetesResourcesResult = await getRelatedResources(
        context,
        appKubernetesLabelSelectors,
        appKubernetesResources,
        []
      );
      results.push(...appKubernetesResourcesResult);
    }
    
    return results;
  } else {
    // Original behavior when no APP_KUBERNETES_NAME resources are requested
    const labelSelectors = [
      `${DEVBOX_RELATE_RESOURCE_LABELS.DEVBOX_MANAGER}=${devboxName}`,
    ];
    return getRelatedResources(
      context,
      labelSelectors,
      finalBuiltinResources,
      finalCustomResources
    );
  }
};
