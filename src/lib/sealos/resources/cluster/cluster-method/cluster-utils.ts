/**
 * Generates a random string of lowercase alphabets
 * @param length - The length of the random string (default: 5)
 * @returns A random string of lowercase alphabets
 */
function generateRandomString(length: number = 5): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates an automatic name for a cluster resource
 * @param prefix - Optional prefix for the name (default: 'cluster')
 * @returns A generated name in the format 'cluster-XXXXX' where XXXXX is random lowercase alphabets
 */
export const generateClusterName = (prefix: string = 'cluster'): string => {
  const randomString = generateRandomString(5);
  return `${prefix}-${randomString}`;
};

/**
 * Converts a cluster resource to a simplified list item with only essential fields
 * @param clusterResource - The full cluster K8s resource object
 * @returns A simplified cluster list item with name, kind, type, status, and inProject
 */
export const convertClusterToSimplifiedList = (clusterResource: any) => {
  return {
    name: clusterResource.metadata?.name,
    kind: clusterResource.kind,
    type: clusterResource.spec?.clusterDefinitionRef,
    status: clusterResource.status?.phase,
    inProject:
      clusterResource.metadata?.labels?.["cloud.sealos.io/deploy-on-sealos"],
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
