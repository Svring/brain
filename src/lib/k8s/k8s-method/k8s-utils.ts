"use client";

import type { K8sApiContext } from "../k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import type { QueryClient } from "@tanstack/react-query";
import type {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "../k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { K8sResource } from "../k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import {
  BUILTIN_RESOURCES,
  BuiltinResourceConfig,
} from "@/lib/k8s/k8s-constant/k8s-constant-builtin-resource";
import {
  CUSTOM_RESOURCES,
  CustomResourceConfig,
} from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "../k8s-constant/k8s-constant-label";
import { buildQueryKey } from "../k8s-constant/k8s-constant-query-key";

import _ from "lodash";
import { ListAllResourcesResponse } from "../k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";

/**
 * Simplified resource annotation interface
 */
export interface BrainResourcesSimplified {
  custom: { kind: string; name: string }[];
  builtin: { kind: string; name: string }[];
}

/**
 * Convert full ListAllResourcesResponse to simplified annotation format
 */
export function convertResourcesToAnnotation(
  resources: ListAllResourcesResponse
): BrainResourcesSimplified {
  return {
    builtin: _.flatMap(resources.builtin, (resourceList) =>
      _.map(resourceList.items, (item) => ({
        kind: item.kind!,
        name: item.metadata.name!,
      }))
    ),
    custom: _.flatMap(resources.custom, (resourceList) =>
      _.map(resourceList.items, (item) => ({
        kind: item.kind!,
        name: item.metadata.name!,
      }))
    ),
  };
}

/**
 * Convert simplified annotation format to resource targets for batch processing
 * This function creates targets that can be used for API operations
 */
export function convertAnnotationToResourceTargets(
  annotation: BrainResourcesSimplified,
  projectName: string
): {
  builtinTargets: { key: string; target: BuiltinResourceTarget }[];
  customTargets: { key: string; target: CustomResourceTarget }[];
} {
  const labelSelector = `${INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS}=${projectName}`;

  // Get unique kinds from annotation
  const builtinKinds = _.uniqBy(annotation.builtin, "kind");
  const customKinds = _.uniqBy(annotation.custom, "kind");

  // Create builtin resource targets
  const builtinTargets: { key: string; target: BuiltinResourceTarget }[] = [];
  for (const resource of builtinKinds) {
    const resourceKey = Object.keys(BUILTIN_RESOURCES).find(
      (k) => k.toLowerCase() === resource.kind.toLowerCase()
    );
    if (resourceKey) {
      const resourceConfig = BUILTIN_RESOURCES[resourceKey];
      builtinTargets.push({
        key: resourceKey,
        target: {
          type: "builtin",
          resourceType: resourceConfig.resourceType,
          labelSelector,
        },
      });
    }
  }

  // Create custom resource targets
  const customTargets: { key: string; target: CustomResourceTarget }[] = [];
  for (const resource of customKinds) {
    const resourceKey = Object.keys(CUSTOM_RESOURCES).find(
      (k) => k.toLowerCase() === resource.kind.toLowerCase()
    );
    if (resourceKey) {
      const resourceConfig = CUSTOM_RESOURCES[resourceKey];
      customTargets.push({
        key: resourceKey,
        target: {
          type: "custom",
          resourceType: resourceConfig.resourceType,
          group: resourceConfig.group,
          version: resourceConfig.version,
          plural: resourceConfig.plural,
          labelSelector,
        },
      });
    }
  }

  return {
    builtinTargets,
    customTargets,
  };
}

/**
 * Filters out resource types with empty items arrays from builtin and custom resource maps.
 */
export function filterEmptyResources<T extends { items: unknown[] }>(data: {
  builtin: Record<string, T>;
  custom: Record<string, T>;
}): { builtin: Record<string, T>; custom: Record<string, T> } {
  const filteredBuiltin = Object.fromEntries(
    Object.entries(data.builtin).filter(
      ([_, value]) =>
        value &&
        typeof value === "object" &&
        "items" in value &&
        Array.isArray(value.items) &&
        value.items.length > 0
    )
  );

  const filteredCustom = Object.fromEntries(
    Object.entries(data.custom).filter(
      ([_, value]) =>
        value &&
        typeof value === "object" &&
        "items" in value &&
        Array.isArray(value.items) &&
        value.items.length > 0
    )
  );

  return {
    builtin: filteredBuiltin,
    custom: filteredCustom,
  };
}

export const convertResourceToTarget = (
  resource: K8sResource
): CustomResourceTarget | BuiltinResourceTarget => {
  if (!resource.metadata.name) {
    throw new Error("Resource name is required");
  }

  if (!resource.kind) {
    throw new Error("Resource kind is required");
  }

  const lowerKind = resource.kind.toLowerCase();

  // Check builtin resources first
  const builtinConfig = BUILTIN_RESOURCES[lowerKind];
  if (builtinConfig) {
    return {
      type: "builtin",
      resourceType: builtinConfig.resourceType,
      name: resource.metadata.name,
    };
  }

  // Check custom resources
  const customConfig = CUSTOM_RESOURCES[lowerKind];
  if (customConfig) {
    return {
      type: "custom",
      resourceType: customConfig.resourceType,
      group: customConfig.group,
      version: customConfig.version,
      plural: customConfig.plural,
      name: resource.metadata.name,
    };
  }

  throw new Error(`Unknown resource kind: ${resource.kind}`);
};

/**
 * Helper function to invalidate resource queries for both custom and builtin resources
 * Note: This function should only be called from client-side code where QueryClient is available
 */
export async function invalidateResourceQueries(
  queryClient: QueryClient,
  context: K8sApiContext,
  target: CustomResourceTarget | BuiltinResourceTarget
): Promise<void> {
  if (target.type === "custom") {
    // Invalidate custom resource queries
    queryClient.invalidateQueries({
      queryKey: buildQueryKey.projectResources(),
    });
    queryClient.invalidateQueries({
      queryKey: buildQueryKey.listCustomResources(
        target.group,
        target.version,
        context.namespace,
        target.plural
      ),
    });
  } else {
    // Invalidate builtin resource queries
    queryClient.invalidateQueries({
      queryKey: buildQueryKey.projectResources(),
    });
    queryClient.invalidateQueries({
      queryKey: buildQueryKey.listBuiltinResources(
        target.resourceType,
        context.namespace
      ),
    });
  }

  // Invalidate all-resources query
  queryClient.invalidateQueries({
    queryKey: buildQueryKey.listAllResources(context.namespace),
  });
}

/**
 * Get the resource config for a given kind (case-insensitive).
 * Prefers builtin resources if both exist.
 */
export function getResourceConfigFromKind(kind: string) {
  const lowerKind = kind.toLowerCase();
  return (
    BUILTIN_RESOURCES[lowerKind] || CUSTOM_RESOURCES[lowerKind] || undefined
  );
}

/**
 * Convert a resource type string to a resourceTarget.
 * This function creates a target that can be used for API operations.
 * @param resourceType - The resource type string (e.g., "deployment", "service", "issuer")
 * @returns A complete resourceTarget
 * @throws Error if resource type is not found
 */
export function convertResourceTypeToTarget(
  resourceType: string
): CustomResourceTarget | BuiltinResourceTarget {
  const lowerResourceType = resourceType.toLowerCase();

  // Check builtin resources first
  const builtinConfig = BUILTIN_RESOURCES[lowerResourceType];
  if (builtinConfig) {
    return {
      type: "builtin",
      resourceType: builtinConfig.resourceType,
    };
  }

  // Check custom resources
  const customConfig = CUSTOM_RESOURCES[lowerResourceType];
  if (customConfig) {
    return {
      type: "custom",
      resourceType: customConfig.resourceType,
      group: customConfig.group,
      version: customConfig.version,
      plural: customConfig.plural,
    };
  }

  throw new Error(`Unknown resource type: ${resourceType}`);
}

/**
 * Flatten project resources from project-relevance algorithm structure to individual K8s resources
 * @param listAllResourcesResponse - Resources from getProjectRelatedResources
 * @returns Array of individual K8s resources
 */
export function flattenListAllResourcesResponse(
  listAllResourcesResponse: ListAllResourcesResponse
): K8sResource[] {
  const allResources: K8sResource[] = [];

  // Process builtin resources
  Object.values(listAllResourcesResponse.builtin || {}).forEach(
    (resourceList) => {
      if (resourceList && resourceList.items) {
        allResources.push(...resourceList.items);
      }
    }
  );

  // Process custom resources
  Object.values(listAllResourcesResponse.custom || {}).forEach(
    (resourceList) => {
      if (resourceList && resourceList.items) {
        allResources.push(...resourceList.items);
      }
    }
  );

  return allResources;
}

export function convertAndFilterResourceToTarget(
  resource: K8sResource
): CustomResourceTarget | BuiltinResourceTarget | null {
  if (!resource.kind || !resource.metadata?.name) {
    return null;
  }
  try {
    return convertResourceToTarget(resource);
  } catch (error) {
    console.warn(
      `Failed to convert resource to target: ${resource.kind}/${resource.metadata.name}`,
      error
    );
    return null;
  }
}

/**
 * Environment variable types for Kubernetes resources
 */
export interface EnvVarValue {
  type: "value";
  key: string;
  value: string;
}

export interface EnvVarSecretRef {
  type: "secretKeyRef";
  key: string;
  secretName: string;
  secretKey: string;
}

export type EnvVar = EnvVarValue | EnvVarSecretRef;

/**
 * Get the container path for a Kubernetes resource based on its kind
 */
export function getContainerPath(resourceKind: string): string {
  switch (resourceKind) {
    case "Deployment":
    case "StatefulSet":
    case "DaemonSet":
    case "Job":
      return "/spec/template/spec/containers";
    case "CronJob":
      return "/spec/jobTemplate/spec/template/spec/containers";
    default:
      throw new Error(`Unsupported resource type: ${resourceKind}`);
  }
}

/**
 * Extract containers array from a Kubernetes resource
 */
export function getContainersFromResource(resource: any): any[] {
  return (
    resource.spec?.template?.spec?.containers ||
    resource.spec?.jobTemplate?.spec?.template?.spec?.containers ||
    []
  );
}

/**
 * Create environment variable specification for Kubernetes
 */
export function createEnvVarSpec(envVar: EnvVar): any {
  return {
    name: envVar.key,
    ...(envVar.type === "value"
      ? { value: envVar.value }
      : {
          valueFrom: {
            secretKeyRef: {
              name: envVar.secretName,
              key: envVar.secretKey,
            },
          },
        }),
  };
}

/**
 * Build patch operations for adding environment variables to containers
 */
export function buildEnvVarPatchOps(
  containers: any[],
  envVars: EnvVar[],
  containerPath: string
): any[] {
  const patchOps: any[] = [];

  containers.forEach((container: any, containerIndex: number) => {
    const envPath = `${containerPath}/${containerIndex}/env`;
    const currentEnv = container.env || [];

    // Ensure env array exists if it doesn't
    if (!container.env) {
      patchOps.push({
        op: "add",
        path: `${containerPath}/${containerIndex}/env`,
        value: [],
      });
    }

    envVars.forEach((envVar) => {
      // Check if env var already exists
      const existingIndex = currentEnv.findIndex(
        (e: any) => e.name === envVar.key
      );

      const envVarSpec = createEnvVarSpec(envVar);

      if (existingIndex >= 0) {
        // Replace existing env var
        patchOps.push({
          op: "replace",
          path: `${envPath}/${existingIndex}`,
          value: envVarSpec,
        });
      } else {
        // Add new env var
        patchOps.push({
          op: "add",
          path: `${envPath}/-`,
          value: envVarSpec,
        });
      }
    });
  });

  return patchOps;
}

/**
 * Centralized query invalidation for mutations
 */
export function invalidateQueriesAfterMutation(
  queryClient: QueryClient,
  context: K8sApiContext,
  target?: CustomResourceTarget | BuiltinResourceTarget,
  includeInventory: boolean = false
): void {
  if (target) {
    invalidateResourceQueries(queryClient, context, target);
  }

  if (includeInventory) {
    queryClient.invalidateQueries({
      queryKey: buildQueryKey.inventory(),
    });
  }
}

/**
 * Batch operation utility for processing multiple targets
 */
export async function processBatchOperation<T>(
  targets: (CustomResourceTarget | BuiltinResourceTarget)[],
  operation: (
    target: CustomResourceTarget | BuiltinResourceTarget
  ) => Promise<T>
): Promise<{
  success: boolean;
  results: PromiseSettledResult<T>[];
  resourceCount: number;
}> {
  const promises = targets.map(operation);
  const results = await Promise.allSettled(promises);

  return {
    success: true,
    results,
    resourceCount: targets.length,
  };
}

/**
 * Spreads a resource list query result into an array of individual resource objects
 * @param resourceList - The resource list query result containing items array
 * @returns Array of individual resource objects, or empty array if input is invalid
 */
export function flattenResourceList<T extends K8sResource>(
  resourceList: { items?: T[] } | undefined
): T[] {
  if (
    !resourceList ||
    !resourceList.items ||
    !Array.isArray(resourceList.items)
  ) {
    return [];
  }

  return resourceList.items;
}
