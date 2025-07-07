import _ from "lodash";
import {
  collectEnvByWorkload,
  extractEnvironmentVariables,
  extractResourceNames,
  mergeConnectFromByWorkload,
  refineConnectFromByWorkload,
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
 * @returns Refined connection information per workload
 */
export const processProjectConnections = (
  resources: Record<string, { items: AnyKubernetesResource[] }>
): Record<string, { connectFrom: string[]; others: string[] }> => {
  // Extract environment variables from workloads
  const envRecord = extractEnvironmentVariables(resources);

  // Aggregate per workload refs/values
  const summaryByWorkload = collectEnvByWorkload(envRecord);

  // Extract resource names as candidates
  const resourceNamesRecord = extractResourceNames(resources);
  const candidateNames = _.flatMap(resourceNamesRecord);

  // Merge connections from refs and values
  const merged = mergeConnectFromByWorkload(summaryByWorkload, candidateNames);

  // Refine connections (remove self-references and pod suffixes)
  const refined = refineConnectFromByWorkload(merged);

  return refined;
};
