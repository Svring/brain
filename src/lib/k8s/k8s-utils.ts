"use client";

import { use } from "react";
import { AuthContext } from "@/contexts/auth-context";
import type { ResourceConfig } from "./k8s-constant";
import { RESOURCES } from "./k8s-constant";
import type { AnyKubernetesResource, ResourceTarget } from "./schemas";

function getUserKubeconfig(): string | undefined {
  const { user } = use(AuthContext);
  return user?.kubeconfig;
}

export function getDecodedKubeconfig(): string {
  const kc = getUserKubeconfig();
  if (!kc) {
    throw new Error("Kubeconfig not available");
  }
  return decodeURIComponent(kc);
}

export function getCurrentNamespace(): string | undefined {
  const { user } = use(AuthContext);
  return user?.namespace;
}

// Filter function to remove resource types with empty items arrays
export const filterEmptyResources = (
  data: Record<string, { items: AnyKubernetesResource[] }>
): Record<string, { items: AnyKubernetesResource[] }> => {
  const filtered: Record<string, { items: AnyKubernetesResource[] }> = {};

  for (const [resourceType, resourceData] of Object.entries(data)) {
    if (resourceData?.items && resourceData.items.length > 0) {
      filtered[resourceType] = resourceData;
    }
  }

  return filtered;
};

// Helper function to convert resource to ResourceTarget
export const convertToResourceTarget = (
  resource: AnyKubernetesResource,
  config: ResourceConfig
): ResourceTarget | null => {
  if (!(resource.metadata.name && resource.metadata.namespace)) {
    return null;
  }

  if (config.type === "custom") {
    return {
      type: "custom",
      group: config.group,
      version: config.version,
      namespace: resource.metadata.namespace,
      plural: config.plural,
      name: resource.metadata.name,
    };
  }

  if (config.type === "builtin") {
    return {
      type: config.resourceType,
      namespace: resource.metadata.namespace,
      name: resource.metadata.name,
    };
  }

  return null;
};

// Helper function to convert all resources to ResourceTarget format
export const convertAllResourcesToTargets = (
  data: Record<string, { items: AnyKubernetesResource[] }>
): ResourceTarget[] => {
  const resources: ResourceTarget[] = [];
  for (const [resourceName, resourceData] of Object.entries(data)) {
    const config = RESOURCES[resourceName as keyof typeof RESOURCES];
    if (config && resourceData?.items) {
      for (const resource of resourceData.items) {
        const target = convertToResourceTarget(resource, config);
        if (target) {
          resources.push(target);
        }
      }
    }
  }
  return resources;
};
