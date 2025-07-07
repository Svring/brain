import type { DeploymentResource } from "@/lib/k8s/schemas/resource-schemas/deployment-schemas";

// Converts a DeploymentResource to node data for DeployNode
export function convertResourceToNode(resource: DeploymentResource) {
  return {
    name: resource.metadata.name,
    readyReplicas: resource.status?.readyReplicas ?? 0,
    replicas: resource.spec?.replicas ?? 0,
  };
}
