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
import {
  CPU_OPTIONS,
  MEMORY_OPTIONS,
  STORAGE_OPTIONS,
} from "../k8s-constant/k8s-constant-resource";

import _ from "lodash";
import { Buffer } from "buffer";
import { ListAllResourcesResponse } from "../k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import { getResource } from "./k8s-query";

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
 * Convert a resource object with kind and name properties to a resource target.
 * This function is similar to convertResourceToTarget but takes the name directly from the object.
 *
 * @param resourceObject - Object containing kind and name properties
 * @returns A complete resourceTarget
 * @throws Error if resource kind is not found or name is missing
 */
export const convertResourceObjectToTarget = (resourceObject: {
  kind: string;
  name: string;
}): CustomResourceTarget | BuiltinResourceTarget => {
  if (!resourceObject.name) {
    throw new Error("Resource name is required");
  }

  if (!resourceObject.kind) {
    throw new Error("Resource kind is required");
  }

  const lowerKind = resourceObject.kind.toLowerCase();

  // Check builtin resources first
  const builtinConfig = BUILTIN_RESOURCES[lowerKind];
  if (builtinConfig) {
    return {
      type: "builtin",
      resourceType: builtinConfig.resourceType,
      name: resourceObject.name,
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
      name: resourceObject.name,
    };
  }

  throw new Error(`Unknown resource kind: ${resourceObject.kind}`);
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
  resourceType: string,
  resourceName?: string
): CustomResourceTarget | BuiltinResourceTarget {
  const lowerResourceType = resourceType.toLowerCase();

  // Check builtin resources first
  const builtinConfig = BUILTIN_RESOURCES[lowerResourceType];
  if (builtinConfig) {
    return {
      type: "builtin",
      resourceType: builtinConfig.resourceType,
      name: resourceName,
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
      name: resourceName,
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
  name: string;
  value: string;
}

export interface EnvVarSecretRef {
  type: "secretKeyRef";
  name: string;
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
    name: envVar.name,
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
        (e: any) => e.name === envVar.name
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
 * Resolves environment variables by fetching secret values for secretKeyRef types
 * Converts EnvVarSecretRef to EnvVarValue with resolved secret data
 * Caches fetched secrets to avoid duplicate API calls
 */
export async function resolveEnvVars(
  context: K8sApiContext,
  envVars: EnvVar[]
): Promise<EnvVarValue[]> {
  const resolvedEnvVars: EnvVarValue[] = [];
  const secretCache = new Map<string, any>();

  for (const envVar of envVars) {
    if (envVar.type === "value") {
      // Direct value, no resolution needed
      resolvedEnvVars.push(envVar);
    } else if (envVar.type === "secretKeyRef") {
      // Check if secret is already cached
      if (!secretCache.has(envVar.secretName)) {
        // Create a target for the secret resource
        const secretTarget = {
          type: "builtin" as const,
          resourceType: "secret",
          name: envVar.secretName,
        };

        // Fetch the secret and cache it
        const secret = await getResource(context, secretTarget);
        secretCache.set(envVar.secretName, secret);
      }

      const secret = secretCache.get(envVar.secretName);

      if (secret && secret.data && secret.data[envVar.secretKey]) {
        // Decode base64 secret value
        const secretValue = secret.data[envVar.secretKey];
        if (typeof secretValue === "string") {
          const decodedValue = Buffer.from(secretValue, "base64").toString(
            "utf-8"
          );

          // Convert to EnvVarValue
          resolvedEnvVars.push({
            type: "value",
            name: envVar.name,
            value: decodedValue,
          });
        } else {
          console.warn(
            `Secret key '${envVar.secretKey}' has invalid type in secret '${envVar.secretName}'`
          );
          // Keep original secret ref if resolution fails
          resolvedEnvVars.push({
            type: "value",
            name: envVar.name,
            value: `[SECRET_REF_ERROR: ${envVar.secretName}.${envVar.secretKey}]`,
          });
        }
      } else {
        console.warn(
          `Secret key '${envVar.secretKey}' not found in secret '${envVar.secretName}'`
        );
        // Keep original secret ref if resolution fails
        resolvedEnvVars.push({
          type: "value",
          name: envVar.name,
          value: `[SECRET_REF_ERROR: ${envVar.secretName}.${envVar.secretKey}]`,
        });
      }
    }
  }

  return resolvedEnvVars;
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

/**
 * Convert Kubernetes resource strings to numeric values and find nearest available options
 * @param resource - Object containing cpu, memory, and storage as strings (e.g., "500m", "8Gi", "3Gi")
 * @returns Object with converted numeric values and nearest available options
 */
export function convertK8sResourceToNumeric(resource: {
  cpu?: string;
  memory?: string;
  storage?: string;
}): {
  cpu: { original: number; nearest: number };
  memory: { original: number; nearest: number };
  storage: { original: number; nearest: number };
} {
  const result = {
    cpu: { original: 0, nearest: CPU_OPTIONS[0] as number },
    memory: { original: 0, nearest: MEMORY_OPTIONS[0] as number },
    storage: { original: 0, nearest: STORAGE_OPTIONS[0] as number },
  };

  // Convert CPU from Kubernetes format to numeric cores
  if (resource.cpu) {
    let cpuValue: number;
    if (typeof resource.cpu === "string") {
      if (resource.cpu.endsWith("m")) {
        // Convert millicores to cores (e.g., "500m" -> 0.5)
        cpuValue = parseFloat(resource.cpu.slice(0, -1)) / 1000;
      } else {
        // Direct cores (e.g., "1" -> 1)
        cpuValue = parseFloat(resource.cpu);
      }
    } else {
      cpuValue = Number(resource.cpu);
    }

    result.cpu.original = cpuValue;
    result.cpu.nearest = findNearestValue(cpuValue, CPU_OPTIONS);
  }

  // Convert Memory from Kubernetes format to numeric GB
  if (resource.memory) {
    let memoryValue: number;
    if (typeof resource.memory === "string") {
      if (resource.memory.endsWith("Gi")) {
        // Convert GiB to GB (e.g., "8Gi" -> 8)
        memoryValue = parseFloat(resource.memory.slice(0, -2));
      } else if (resource.memory.endsWith("Mi")) {
        // Convert MiB to GB (e.g., "1024Mi" -> 1)
        memoryValue = parseFloat(resource.memory.slice(0, -2)) / 1024;
      } else if (resource.memory.endsWith("Ki")) {
        // Convert KiB to GB (e.g., "1048576Ki" -> 1)
        memoryValue = parseFloat(resource.memory.slice(0, -2)) / (1024 * 1024);
      } else {
        // Assume bytes and convert to GB
        memoryValue = parseFloat(resource.memory) / (1024 * 1024 * 1024);
      }
    } else {
      memoryValue = Number(resource.memory);
    }

    result.memory.original = memoryValue;
    result.memory.nearest = findNearestValue(memoryValue, MEMORY_OPTIONS);
  }

  // Convert Storage from Kubernetes format to numeric GB
  if (resource.storage) {
    let storageValue: number;
    if (typeof resource.storage === "string") {
      if (resource.storage.endsWith("Gi")) {
        // Convert GiB to GB (e.g., "3Gi" -> 3)
        storageValue = parseFloat(resource.storage.slice(0, -2));
      } else if (resource.storage.endsWith("Mi")) {
        // Convert MiB to GB (e.g., "3072Mi" -> 3)
        storageValue = parseFloat(resource.storage.slice(0, -2)) / 1024;
      } else if (resource.storage.endsWith("Ki")) {
        // Convert KiB to GB (e.g., "3145728Ki" -> 3)
        storageValue =
          parseFloat(resource.storage.slice(0, -2)) / (1024 * 1024);
      } else {
        // Assume bytes and convert to GB
        storageValue = parseFloat(resource.storage) / (1024 * 1024 * 1024);
      }
    } else {
      storageValue = Number(resource.storage);
    }

    result.storage.original = storageValue;
    result.storage.nearest = findNearestValue(storageValue, STORAGE_OPTIONS);
  }

  return result;
}

/**
 * Find the nearest value in an array of available options
 * @param target - The target value to find nearest match for
 * @param options - Array of available options
 * @returns The nearest available option
 */
function findNearestValue(target: number, options: readonly number[]): number {
  if (options.length === 0) return target;

  let nearest = options[0];
  let minDifference = Math.abs(target - nearest);

  for (const option of options) {
    const difference = Math.abs(target - option);
    if (difference < minDifference) {
      minDifference = difference;
      nearest = option;
    }
  }

  return nearest;
}

/**
 * Convert numeric resource values back to Kubernetes format
 * @param resource - Object containing cpu, memory, and storage as numbers
 * @returns Object with Kubernetes-formatted strings
 */
export function convertNumericToK8sResource(resource: {
  cpu?: number;
  memory?: number;
  storage?: number;
}): { cpu?: string; memory?: string; storage?: string } {
  const result: { cpu?: string; memory?: string; storage?: string } = {};

  if (resource.cpu !== undefined) {
    // Convert cores to millicores for CPU
    result.cpu = `${Math.round(resource.cpu * 1000)}m`;
  }

  if (resource.memory !== undefined) {
    // Convert GB to GiB for memory
    result.memory = `${resource.memory}Gi`;
  }

  if (resource.storage !== undefined) {
    // Convert GB to GiB for storage
    result.storage = `${resource.storage}Gi`;
  }

  return result;
}
