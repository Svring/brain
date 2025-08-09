"use client";

import { getTraffic } from "@/lib/service/traffic/traffic-api/traffic-api-query";
import type { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import type { ResourceConnections } from "./reliance-utils";
import {
  convertToTrafficRequest,
  transformTrafficToReliance,
  correctRelianceResourceTypes,
} from "@/lib/service/traffic/traffic-utils";
import { TrafficApiContext } from "@/lib/service/traffic/schemas/traffic-api-context-schema";
import { runParallelAction } from "next-server-actions-parallel";
import { getCurrentNamespace } from "@/lib/k8s/k8s-api/k8s-api-utils";

/**
 * Infer resource reliance based on traffic flow data.
 * This function takes project resources, flattens them using flattenResourceList,
 * and transforms them into a key-value structure where keys are resource kinds
 * and values are arrays of resource names.
 *
 * @param resources A map of all project resources, grouped by kind with items arrays
 * @returns A record containing resource kinds as keys and arrays of resource names as values
 */
export const inferRelianceFromTraffic = async (
  context: TrafficApiContext,
  resources: Record<string, { items: K8sResource[] }>
) => {
  const processedResources = convertToTrafficRequest(resources);
  const currentNamespace = await getCurrentNamespace(
    decodeURIComponent(context.kubeconfig)
  );

  const traffic = await runParallelAction(
    getTraffic(processedResources, context)
  );

  const reliance = transformTrafficToReliance(traffic, currentNamespace!);

  // Correct resource types by checking actual deployment and statefulset resources
  const deploymentResources = resources.deployment?.items || [];
  const statefulsetResources = resources.statefulset?.items || [];

  const correctedReliance = correctRelianceResourceTypes(
    reliance,
    deploymentResources,
    statefulsetResources
  );

  console.log("correctedReliance", correctedReliance);

  return correctedReliance;
};
