import {
  type ConnectionsByKind,
  collectEnvByWorkload,
  extractEnvironmentVariables,
  extractResourceNames,
  mergeConnectFromByWorkload,
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
 * Process project resources to extract connection information.
 *
 * @param resources Record of resource lists keyed by resource kind
 * @returns Connection information per workload grouped by kind
 */
export const processProjectConnections = (
  resources: Record<string, { items: AnyKubernetesResource[] }>
): ConnectionsByKind => {
  // Extract environment variables from workloads
  const envRecord = extractEnvironmentVariables(resources);

  // Aggregate per workload refs/values
  const envSummaryNested = collectEnvByWorkload(envRecord);

  // Extract resource names as candidates grouped by kind
  const resourceNamesRecord = extractResourceNames(resources);

  // Merge connections from refs and values preserving kind information
  const merged = mergeConnectFromByWorkload(
    envSummaryNested,
    resourceNamesRecord
  );

  return merged;
};
