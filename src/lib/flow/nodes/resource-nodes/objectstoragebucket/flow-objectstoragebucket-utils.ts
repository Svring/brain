import type { ObjectStorageBucket } from "@/lib/k8s/schemas/resource-schemas/object-storage.schemas";

// Converts an ObjectStorageBucket resource to node data for ObjectStorageNode
export function convertResourceToNode(resource: ObjectStorageBucket) {
  return {
    name: resource.metadata.name,
    policy: resource.spec.policy,
  };
}
