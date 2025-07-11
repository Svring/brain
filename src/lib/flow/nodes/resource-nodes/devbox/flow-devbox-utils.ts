import type { AnyKubernetesResource } from "@/lib/k8s/schemas";
import { convertToResourceTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";

// Converts a Devbox resource to node data for DevboxNode
export function convertResourceToNode(resource: AnyKubernetesResource) {
  return {
    name: resource.metadata.name,
    target: convertToResourceTarget(resource, CUSTOM_RESOURCES.devbox),
  };
}
