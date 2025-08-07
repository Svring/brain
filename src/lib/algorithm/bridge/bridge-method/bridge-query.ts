import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
  ResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getClusterObject } from "../bridge-resources/bridge-sealos/cluster/cluster-bridge-query";
import { getDeploymentObject } from "../bridge-resources/bridge-sealos/deployment/deployment-bridge-query";
import { getDevboxObject } from "../bridge-resources/bridge-sealos/devbox/devbox-bridge-query";
import { getIngressObject } from "../bridge-resources/bridge-sealos/ingress/ingress-bridge-query";
import { getObjectStorageObject } from "../bridge-resources/bridge-sealos/objectstorage/objectstorage-bridge-query";
import { getStatefulSetObject } from "../bridge-resources/bridge-sealos/statefulset/statefulset-bridge-query";
import { getBrainProjectObject } from "../bridge-resources/bridge-brain/brain-project/brain-project-bridge-query";
import { composeObjectFromTarget } from "./bridge-query-utils";

/**
 * Map of resource types to their corresponding bridge query functions
 */
const RESOURCE_BRIDGE_MAP = {
  // Custom resources
  devbox: getDevboxObject,
  cluster: getClusterObject,
  objectstoragebucket: getObjectStorageObject,

  // Builtin resources
  deployment: getDeploymentObject,
  statefulset: getStatefulSetObject,
  ingress: getIngressObject,

  // Brain resources
  brainproject: getBrainProjectObject,

  // Default for instance (brain projects)
  instance: composeObjectFromTarget,
} as const;

/**
 * Determines the resource type from a target
 */
function getResourceTypeFromTarget(target: ResourceTarget): string {
  // Both custom and builtin targets have resourceType property
  return target.resourceType.toLowerCase();
}

/**
 * Universal function to get a resource object based on its target
 * Automatically determines which specific bridge query function to call
 *
 * @param context - K8s API context
 * @param target - Resource target (either custom or builtin)
 * @returns The resource object with appropriate enrichments
 */
export async function getResourceObject(
  context: K8sApiContext,
  target: ResourceTarget
) {
  const resourceType = getResourceTypeFromTarget(target);
  const bridgeFunction =
    RESOURCE_BRIDGE_MAP[resourceType as keyof typeof RESOURCE_BRIDGE_MAP];
  return bridgeFunction(context, target as any);
}

/**
 * Gets all supported resource types that have specific bridge functions
 */
export function getSupportedBridgeResourceTypes(): string[] {
  return Object.keys(RESOURCE_BRIDGE_MAP);
}
