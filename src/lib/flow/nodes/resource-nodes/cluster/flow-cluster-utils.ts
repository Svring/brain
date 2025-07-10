import type { ClusterResource } from "@/lib/k8s/schemas/resource-schemas/cluster-schemas";

// Converts a ClusterResource to node data for DatabaseNode
export function convertResourceToNode(resource: ClusterResource) {
  return {
    name: resource.metadata.name,
    state: resource.status?.phase ?? "Unknown",
  };
}
