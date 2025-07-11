import type { StatefulSetResource } from "@/lib/k8s/schemas/resource-schemas/statefulset-schemas";
import { convertToResourceTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { BUILTIN_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-builtin-resource";

// Converts a StatefulSetResource to node data for StatefulSetNode
export function convertResourceToNode(resource: StatefulSetResource) {
  return {
    name: resource.metadata.name,
    readyReplicas: resource.status?.readyReplicas ?? 0,
    replicas: resource.spec?.replicas ?? 0,
    target: convertToResourceTarget(resource, BUILTIN_RESOURCES.statefulset),
  };
}
