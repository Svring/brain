import type { StatefulSetResource } from "@/lib/k8s/schemas/resource-schemas/statefulset-schemas";

// Converts a StatefulSetResource to node data for StatefulSetNode
export function convertResourceToNode(resource: StatefulSetResource) {
  return {
    name: resource.metadata.name,
    readyReplicas: resource.status?.readyReplicas ?? 0,
    replicas: resource.spec?.replicas ?? 0,
  };
}
