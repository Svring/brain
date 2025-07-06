import type { KubernetesResource } from "@/lib/k8s/schemas/resource-schemas/kubernetes-resource-schemas";

export interface ObjectStorageNodeData {
  name: string;
  policy: string;
  icon: string;
}

export function convertKubernetesResourceToObjectStorageNodeData(
  resource: KubernetesResource
): ObjectStorageNodeData {
  const name = resource.metadata.name;

  // Extract policy from annotations or spec
  let policy = "Unknown";

  if (resource.metadata.annotations?.["objectstorage.io/policy"]) {
    policy = resource.metadata.annotations["objectstorage.io/policy"];
  } else if (resource.metadata.annotations?.["storage.policy"]) {
    policy = resource.metadata.annotations["storage.policy"];
  } else if (resource.spec?.policy) {
    policy = resource.spec.policy as string;
  } else if (resource.spec?.accessMode) {
    policy = resource.spec.accessMode as string;
  }

  // Extract icon from annotations or use default
  let icon = "/default-storage-icon.png";

  if (resource.metadata.annotations?.["app.kubernetes.io/icon"]) {
    icon = resource.metadata.annotations["app.kubernetes.io/icon"];
  } else if (resource.metadata.annotations?.["sealos.io/icon"]) {
    icon = resource.metadata.annotations["sealos.io/icon"];
  } else {
    // Set default icons based on storage type
    const resourceName = name.toLowerCase();
    if (resourceName.includes("minio") || resourceName.includes("s3")) {
      icon = "/minio-icon.png";
    } else if (resourceName.includes("ceph")) {
      icon = "/ceph-icon.png";
    }
  }

  return {
    name,
    policy,
    icon,
  };
}
