import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { convertK8sStringToNumber } from "@/lib/k8s/k8s-method/k8s-utils";

/**
 * Converts a resource quota resource to a simplified list item with only essential fields
 * @param resourceQuotaResource - The full resource quota K8s resource object
 * @returns A simplified resource quota list item with name, kind, namespace, and spec summary
 */
export const convertResourceQuotaToSimplifiedList = (
  resourceQuotaResource: K8sResource
) => {
  // Extract resource limits from spec.hard
  const hardLimits = resourceQuotaResource.spec?.hard || {};
  const limitsSummary =
    Object.keys(hardLimits).length > 0
      ? `${Object.keys(hardLimits).length} resource limits`
      : "No limits set";

  return {
    name: resourceQuotaResource.metadata?.name,
    kind: resourceQuotaResource.kind,
    namespace: resourceQuotaResource.metadata?.namespace,
    limitsSummary: limitsSummary,
    creationTimestamp: resourceQuotaResource.metadata?.creationTimestamp,
    uid: resourceQuotaResource.metadata?.uid,
  };
};

/**
 * Converts an array of resource quota resources to a simplified list
 * @param resourceQuotaResources - Array of full resource quota resource objects
 * @returns Array of simplified resource quota list items
 */
export const convertResourceQuotaListToSimplified = (
  resourceQuotaResources: K8sResource[]
) => {
  return resourceQuotaResources.map(convertResourceQuotaToSimplifiedList);
};

/**
 * Interface for resource quota summary with limit and used values
 */
export interface ResourceQuotaSummary {
  cpu: { limit: number; used: number };
  memory: { limit: number; used: number };
  storage: { limit: number; used: number };
  ports: { limit: number; used: number };
}

/**
 * Converts a ResourceQuota resource to a structured summary with CPU, memory, storage, and ports
 * @param resourceQuotaResource - The full ResourceQuota K8s resource object
 * @returns Object containing CPU, memory, storage, and ports with limit and used values
 */
export const convertResourceQuotaToSummary = (
  resourceQuotaResource: K8sResource
): ResourceQuotaSummary => {
  const hard =
    (resourceQuotaResource.spec?.hard as Record<string, string>) || {};
  const used =
    (resourceQuotaResource.status?.used as Record<string, string>) || {};

  // Helper function to get limit value with fallback
  const getLimit = (key: string): number => {
    const value = hard[key];
    return value ? convertK8sStringToNumber(value) : 0;
  };

  // Helper function to get used value with fallback
  const getUsed = (key: string): number => {
    const value = used[key];
    return value ? convertK8sStringToNumber(value) : 0;
  };

  return {
    cpu: {
      limit: getLimit("limits.cpu"),
      used: getUsed("limits.cpu"),
    },
    memory: {
      limit: getLimit("limits.memory"),
      used: getUsed("limits.memory"),
    },
    storage: {
      limit: getLimit("requests.storage"),
      used: getUsed("requests.storage"),
    },
    ports: {
      limit: getLimit("services.nodeports"),
      used: getUsed("services.nodeports"),
    },
  };
};
