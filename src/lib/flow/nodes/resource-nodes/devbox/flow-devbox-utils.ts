import type { AnyKubernetesResource } from "@/lib/k8s/schemas";

// Converts a Devbox resource to node data for DevboxNode
export function convertResourceToNode(resource: AnyKubernetesResource) {
  return {
    name: resource.metadata.name,
  };
}
