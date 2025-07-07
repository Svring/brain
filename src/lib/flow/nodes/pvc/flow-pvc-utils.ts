import type { PersistentVolumeClaimResource } from "@/lib/k8s/schemas/resource-schemas/pvc-schemas";

// Converts a PersistentVolumeClaimResource to node data for PersistentVolumeNode
export function convertResourceToNode(resource: PersistentVolumeClaimResource) {
  return {
    name: resource.metadata.name,
    volume: resource.spec?.volumeName ?? "Unbound",
  };
}
