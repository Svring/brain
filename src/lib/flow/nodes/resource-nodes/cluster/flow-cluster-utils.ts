import type { ClusterResource } from "@/lib/k8s/schemas/resource-schemas/cluster-schemas";
import { convertToResourceTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";

// Converts a ClusterResource to node data for DatabaseNode
export function convertResourceToNode(resource: ClusterResource) {
  return {
    name: resource.metadata.name,
    state: resource.status?.phase ?? "Unknown",
    target: convertToResourceTarget(resource, CUSTOM_RESOURCES.cluster),
  };
}
