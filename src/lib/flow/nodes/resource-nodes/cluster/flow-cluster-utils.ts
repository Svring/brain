import type { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { convertResourceToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

// Converts a K8sResource to node data for DatabaseNode
export function convertResourceToNode(resource: K8sResource) {
  return {
    target: convertResourceToTarget(resource),
  };
}
