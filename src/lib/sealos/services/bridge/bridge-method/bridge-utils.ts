import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getClusterObject } from "../bridge-resources/bridge-sealos/cluster/cluster-bridge-query";
import { getDeploymentObject } from "../bridge-resources/bridge-sealos/deployment/deployment-bridge-query";
import { getDevboxObject } from "../bridge-resources/bridge-sealos/devbox/devbox-bridge-query";
import { getIngressObject } from "../bridge-resources/bridge-sealos/ingress/ingress-bridge-query";
import { getObjectStorageObject } from "../bridge-resources/bridge-sealos/objectstorage/objectstorage-bridge-query";
import { getStatefulSetObject } from "../bridge-resources/bridge-sealos/statefulset/statefulset-bridge-query";
import { getProjectObject } from "@/lib/brain/resources/project/project-method/project-bridge";

/**
 * Map of resource types to their corresponding bridge query functions
 */
export const RESOURCE_BRIDGE_MAP = {
  // Custom resources
  devbox: getDevboxObject,
  cluster: getClusterObject,
  objectstoragebucket: getObjectStorageObject,

  // Builtin resources
  deployment: getDeploymentObject,
  statefulset: getStatefulSetObject,
  ingress: getIngressObject,

  // Default for instance (brain projects)
  instance: getProjectObject,
} as const;

/**
 * Determines the resource type from a target
 */
export function getResourceTypeFromTarget(target: ResourceTarget): string {
  // Both custom and builtin targets have resourceType property
  return target.resourceType?.toLowerCase() || "unknown";
}

/**
 * Gets all supported resource types that have specific bridge functions
 */
export function getSupportedBridgeResourceTypes(): string[] {
  return Object.keys(RESOURCE_BRIDGE_MAP);
}
