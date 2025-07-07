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
