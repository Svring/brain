import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

/**
 * Converts a statefulset resource to a simplified list item with only essential fields
 * @param statefulsetResource - The full statefulset K8s resource object
 * @returns A simplified statefulset list item with name, kind, image, status, and inProject
 */
export const convertStatefulsetToSimplifiedList = (
  statefulsetResource: any
) => {
  const containers = statefulsetResource.spec?.template?.spec?.containers;
  const image =
    Array.isArray(containers) && containers.length > 0
      ? containers[0].image
      : "";

  return {
    name: statefulsetResource.metadata?.name,
    kind: statefulsetResource.kind,
    image: image,
    status: {
      replicas: statefulsetResource.status?.replicas,
      readyReplicas: statefulsetResource.status?.readyReplicas,
    },
    inProject:
      statefulsetResource.metadata?.labels?.[
        "cloud.sealos.io/deploy-on-sealos"
      ],
  };
};

/**
 * Converts an array of statefulset resources to a simplified list
 * @param statefulsetResources - Array of full statefulset K8s resource objects
 * @returns Array of simplified statefulset list items
 */
export const convertStatefulsetListToSimplified = (
  statefulsetResources: any[]
) => {
  return statefulsetResources.map(convertStatefulsetToSimplifiedList);
};
