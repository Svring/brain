"use client";

import { getTraffic } from "@/lib/hubble/traffic/traffic-api/traffic-api-query";
import type { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import type { ResourceConnections } from "./reliance-utils";
import { flattenResourceList } from "@/lib/k8s/k8s-method/k8s-utils";
import _ from "lodash";

/**
 * Infer resource reliance based on traffic flow data.
 * This function takes project resources, flattens them using flattenResourceList,
 * and transforms them into a key-value structure where keys are resource kinds
 * and values are arrays of resource names.
 * 
 * @param resources A map of all project resources, grouped by kind with items arrays
 * @returns A record containing resource kinds as keys and arrays of resource names as values
 */
export const inferRelianceFromTraffic = (
  resources: Record<string, { items: K8sResource[] }>
): Record<string, string[]> => {
  // Transform the resources structure by flattening each resource list and extracting names
  const flattenedResources = _.mapValues(resources, (resourceList) => {
    const flattened = flattenResourceList(resourceList);
    return flattened
      .map(resource => resource.metadata?.name)
      .filter((name): name is string => Boolean(name));
  });

  // Filter out empty arrays to only include kinds that have actual resources
  const filteredResources = _.pickBy(flattenedResources, (nameArray) => {
    return nameArray.length > 0;
  });

  return filteredResources;
};