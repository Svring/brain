import type { StatefulSetResource } from "@/lib/k8s/schemas/resource-schemas/statefulset-schemas";
import { convertResourceToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { BUILTIN_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-builtin-resource";

// Converts a StatefulSetResource to node data for StatefulSetNode
export function convertResourceToNode(resource: StatefulSetResource) {
  return {
    target: convertResourceToTarget(resource),
  };
}
