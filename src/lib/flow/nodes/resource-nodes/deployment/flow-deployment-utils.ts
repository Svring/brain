import type { DeploymentResource } from "@/lib/k8s/schemas/resource-schemas/deployment-schemas";
import { convertToResourceTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { BUILTIN_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-builtin-resource";

// Converts a DeploymentResource to node data for DeployNode
export function convertResourceToNode(resource: DeploymentResource) {
  return {
    name: resource.metadata.name,
    readyReplicas: resource.status?.readyReplicas ?? 0,
    replicas: resource.spec?.replicas ?? 0,
    target: convertToResourceTarget(resource, BUILTIN_RESOURCES.deployment),
  };
}
