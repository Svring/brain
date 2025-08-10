import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { STATEFULSET_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { getRelatedResources } from "../relevance-utils";

export const getStatefulsetRelatedResources = async (
  context: K8sApiContext,
  statefulsetName: string,
  builtinResources?: string[],
  customResources?: string[]
): Promise<K8sResource[]> => {
  const defaultBuiltinResources = ["ingress", "service", "pvc", "configmap"];
  const defaultCustomResources = ["issuers", "certificates"];
  const finalBuiltinResources = builtinResources ?? defaultBuiltinResources;
  const finalCustomResources = customResources ?? defaultCustomResources;

  // Check if pod is in the builtin resources
  const hasPod = finalBuiltinResources.includes("pod");
  
  if (hasPod) {
    // Remove pod from the main query
    const resourcesWithoutPod = finalBuiltinResources.filter(resource => resource !== "pod");
    
    // Get resources with APP_DEPLOY_MANAGER label
    const labelSelectors = [
      `${STATEFULSET_RELATE_RESOURCE_LABELS.APP_DEPLOY_MANAGER}=${statefulsetName}`,
    ];
    const mainResources = await getRelatedResources(
      context,
      labelSelectors,
      resourcesWithoutPod,
      finalCustomResources
    );
    
    // Get pods with APP label
    const podLabelSelectors = [
      `${STATEFULSET_RELATE_RESOURCE_LABELS.APP}=${statefulsetName}`,
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
      `${STATEFULSET_RELATE_RESOURCE_LABELS.APP_DEPLOY_MANAGER}=${statefulsetName}`,
    ];
    return getRelatedResources(
      context,
      labelSelectors,
      finalBuiltinResources,
      finalCustomResources
    );
  }
};
