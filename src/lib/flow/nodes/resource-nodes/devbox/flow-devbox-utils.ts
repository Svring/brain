import type { AnyKubernetesResource } from "@/lib/k8s/schemas";
import { convertResourceToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";

// Converts a Devbox resource to node data for DevboxNode
export function convertResourceToNode(resource: AnyKubernetesResource) {
  return {
    target: convertResourceToTarget(resource, CUSTOM_RESOURCES.devbox),
  };
}
