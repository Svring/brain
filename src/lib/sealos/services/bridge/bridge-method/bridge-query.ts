import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { RESOURCE_BRIDGE_MAP, getResourceTypeFromTarget } from "./bridge-utils";
import { queryOptions } from "@tanstack/react-query";

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
 * Gets multiple resource objects based on a list of targets
 * Processes targets in parallel for better performance
 *
 * @param context - K8s API context
 * @param targets - Array of resource targets
 * @returns Array of resource objects with appropriate enrichments
 */
export async function getAllResourceObjects(
  context: K8sApiContext,
  targets: ResourceTarget[]
) {
  const resourcePromises = targets.map(
    async (target) => await getResourceObject(context, target)
  );
  return await Promise.all(resourcePromises);
}

// ============================================================================
// OPTIONS FUNCTIONS (React Query wrappers)
// ============================================================================

/**
 * Query options for getting a resource object by target
 */
export const getResourceObjectOptions = (
  context: K8sApiContext,
  target: ResourceTarget
) =>
  queryOptions({
    queryKey: ["resource", target.resourceType, target.name || "list"],
    queryFn: async () => await getResourceObject(context, target),
    enabled:
      !!target.resourceType && !!context.namespace && !!context.kubeconfig,
  });

/**
 * Query options for getting multiple resource objects by targets
 */
export const getAllResourceObjectsOptions = (
  context: K8sApiContext,
  targets: ResourceTarget[]
) =>
  queryOptions({
    queryKey: [
      "resource",
      "multiple",
      targets.map((t) => `${t.resourceType}:${t.name || "list"}`).join(","),
    ],
    queryFn: async () => await getAllResourceObjects(context, targets),
    enabled:
      targets.length > 0 &&
      targets.every((target) => !!target.resourceType) &&
      !!context.namespace &&
      !!context.kubeconfig,
    staleTime: 1000 * 30, // 30 seconds
  });

/**
 * Gets all supported resource types that have specific bridge functions
 */
export function getSupportedBridgeResourceTypes(): string[] {
  return Object.keys(RESOURCE_BRIDGE_MAP);
}
