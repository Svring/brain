import type { PersistentVolumeClaimResource } from "@/lib/k8s/schemas/resource-schemas/pvc-schemas";

export interface PersistentVolumeNodeData {
  name: string;
  volume: string;
}

export function convertPVCResourceToNodeData(
  resource: PersistentVolumeClaimResource
): PersistentVolumeNodeData {
  const name = resource.metadata.name;

  // Get volume information
  let volume = "";

  if (resource.status?.capacity?.storage) {
    volume = resource.status.capacity.storage;
  } else if (resource.spec?.resources?.requests?.storage) {
    volume = resource.spec.resources.requests.storage;
  } else {
    volume = "Unknown";
  }

  // Add storage class if available
  if (resource.spec?.storageClassName) {
    volume += ` (${resource.spec.storageClassName})`;
  }

  return {
    name,
    volume,
  };
}
