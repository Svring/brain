import type { ObjectStorageBucket } from "@/lib/k8s/schemas/resource-schemas/object-storage.schemas";
import { convertResourceToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";

// Converts an ObjectStorageBucket resource to node data for ObjectStorageNode
export function convertResourceToNode(resource: ObjectStorageBucket) {
  return {
    target: convertResourceToTarget(
      resource,
      CUSTOM_RESOURCES.objectstoragebucket
    ),
  };
}
