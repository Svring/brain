import type { PersistentVolumeClaimResource } from "@/lib/k8s/schemas/resource-schemas/pvc-schemas";
import { convertResourceToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { BUILTIN_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-builtin-resource";

// Converts a PersistentVolumeClaimResource to node data for PersistentVolumeNode
export function convertResourceToNode(resource: PersistentVolumeClaimResource) {
  return {
    name: resource.metadata.name,
    volume: resource.spec?.volumeName ?? "Unbound",
    target: convertResourceToTarget(resource, BUILTIN_RESOURCES.pvc),
  };
}
