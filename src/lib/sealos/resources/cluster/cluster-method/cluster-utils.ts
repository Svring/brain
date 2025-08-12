/**
 * Converts a cluster resource to a simplified list item with only essential fields
 * @param clusterResource - The full cluster K8s resource object
 * @returns A simplified cluster list item with name, kind, type, and status
 */
export const convertClusterToSimplifiedList = (clusterResource: any) => {
  return {
    name: clusterResource.metadata?.name,
    kind: clusterResource.kind,
    type: clusterResource.spec?.clusterDefinitionRef,
    status: clusterResource.status?.phase,
  };
};

/**
 * Converts an array of cluster resources to a simplified list
 * @param clusterResources - Array of full cluster K8s resource objects
 * @returns Array of simplified cluster list items
 */
export const convertClusterListToSimplified = (clusterResources: any[]) => {
  return clusterResources.map(convertClusterToSimplifiedList);
};
