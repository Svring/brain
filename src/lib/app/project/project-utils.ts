import {
  type ConnectionsByKind,
  collectEnvByWorkload,
  extractEnvironmentVariables,
  extractResourceNames,
  mergeConnectFromByWorkload,
  processIngressConnections,
} from "@/lib/k8s/k8s-utils";
import type { AnyKubernetesResource } from "@/lib/k8s/schemas";
import { PROJECT_NAME_LABEL_KEY } from "./project-constant";

// Helper function to extract project name from resource metadata
export const getProjectNameFromResource = (
  resource: AnyKubernetesResource
): string | null => {
  return resource.metadata.labels?.[PROJECT_NAME_LABEL_KEY] ?? null;
};

/**
 * Extract cluster names from project resources.
 *
 * @param resources Record of resource lists keyed by resource kind (from getProjectResourcesOptions)
 * @returns Array of cluster names that belong to the project
 */
export const getClusterNamesFromProjectResources = (
  resources: Record<string, { items: AnyKubernetesResource[] }>
): string[] => {
  const clusterResources = resources.cluster?.items || [];

  return clusterResources
    .map((cluster) => cluster.metadata.name)
    .filter((name): name is string => Boolean(name));
};

/**
 * Extract instance names from project resources.
 *
 * @param resources Record of resource lists keyed by resource kind (from getProjectResourcesOptions)
 * @returns Array of instance names that belong to the project
 */
export const getInstanceNamesFromProjectResources = (
  resources: Record<string, { items: AnyKubernetesResource[] }>
): string[] => {
  const instanceResources = resources.instance?.items || [];

  return instanceResources
    .map((instance) => instance.metadata.name)
    .filter((name): name is string => Boolean(name));
};

/**
 * Extract deployment names from project resources.
 *
 * @param resources Record of resource lists keyed by resource kind (from getProjectResourcesOptions)
 * @returns Array of deployment names that belong to the project
 */
export const getDeploymentNamesFromProjectResources = (
  resources: Record<string, { items: AnyKubernetesResource[] }>
): string[] => {
  const deploymentResources = resources.deployment?.items || [];

  return deploymentResources
    .map((deployment) => deployment.metadata.name)
    .filter((name): name is string => Boolean(name));
};

/**
 * Extract statefulset names from project resources.
 *
 * @param resources Record of resource lists keyed by resource kind (from getProjectResourcesOptions)
 * @returns Array of statefulset names that belong to the project
 */
export const getStatefulSetNamesFromProjectResources = (
  resources: Record<string, { items: AnyKubernetesResource[] }>
): string[] => {
  const statefulSetResources = resources.statefulset?.items || [];

  return statefulSetResources
    .map((statefulSet) => statefulSet.metadata.name)
    .filter((name): name is string => Boolean(name));
};

/**
 * Extract other resource names from project resources (excluding clusters, instances, deployments, and statefulsets).
 *
 * @param resources Record of resource lists keyed by resource kind (from getProjectResourcesOptions)
 * @returns Record of resource type to array of resource names
 */
export const getOtherResourceNamesFromProjectResources = (
  resources: Record<string, { items: AnyKubernetesResource[] }>
): Record<string, string[]> => {
  const excludedTypes = new Set([
    "cluster",
    "instance",
    "deployment",
    "statefulset",
  ]);
  const otherResources: Record<string, string[]> = {};

  Object.entries(resources).forEach(([resourceType, resourceList]) => {
    if (!excludedTypes.has(resourceType) && resourceList.items.length > 0) {
      otherResources[resourceType] = resourceList.items
        .map((resource) => resource.metadata.name)
        .filter((name): name is string => Boolean(name));
    }
  });

  return otherResources;
};

/**
 * Remove ingress resources from workload connection candidates
 */
const excludeIngressFromCandidates = (
  resourceNamesRecord: Record<string, string[]>
): Record<string, string[]> => {
  const { ingress: _, ...filtered } = resourceNamesRecord;
  return filtered;
};

/**
 * Process project resources to extract connection information.
 *
 * @param resources Record of resource lists keyed by resource kind
 * @returns Connection information per workload grouped by kind
 */
export const processProjectConnections = (
  resources: Record<string, { items: AnyKubernetesResource[] }>
): ConnectionsByKind => {
  // Step 1: Process ingress connections first
  const ingressConnections = processIngressConnections(resources);

  // Step 2: Process environment-based connections for workloads
  const envRecord = extractEnvironmentVariables(resources);
  const envSummaryNested = collectEnvByWorkload(envRecord);

  // Step 3: Extract resource names but exclude ingress from workload candidates
  const resourceNamesRecord = extractResourceNames(resources);
  const filteredCandidates = excludeIngressFromCandidates(resourceNamesRecord);

  // Step 4: Merge environment-based connections
  const envConnections = mergeConnectFromByWorkload(
    envSummaryNested,
    filteredCandidates
  );

  // Step 5: Combine ingress connections with environment-based connections
  const combinedConnections: ConnectionsByKind = { ...envConnections };

  // Add ingress connections
  if (ingressConnections.ingress) {
    combinedConnections.ingress = ingressConnections.ingress;
  }

  return combinedConnections;
};
