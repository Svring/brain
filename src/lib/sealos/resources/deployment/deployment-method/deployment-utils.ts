/**
 * Converts a deployment resource to a simplified list item with only essential fields
 * @param deploymentResource - The full deployment K8s resource object
 * @returns A simplified deployment list item with name, kind, image, and status
 */
export const convertDeploymentToSimplifiedList = (deploymentResource: any) => {
  const containers = deploymentResource.spec?.template?.spec?.containers;
  const image =
    Array.isArray(containers) && containers.length > 0
      ? containers[0].image
      : "";

  return {
    name: deploymentResource.metadata?.name,
    kind: deploymentResource.kind,
    image: image,
    status: {
      replicas: deploymentResource.status?.replicas,
      unavailableReplicas: deploymentResource.status?.unavailableReplicas,
    },
  };
};

/**
 * Converts an array of deployment resources to a simplified list
 * @param deploymentResources - Array of full deployment K8s resource objects
 * @returns Array of simplified deployment list items
 */
export const convertDeploymentListToSimplified = (
  deploymentResources: any[]
) => {
  return deploymentResources.map(convertDeploymentToSimplifiedList);
};
