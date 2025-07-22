"use client";

import { useAuthState } from "@/contexts/auth/auth-context";
import type { K8sApiContext } from "../k8s-api/k8s-api-schemas/context-schemas";
import { K8sApiContextSchema } from "../k8s-api/k8s-api-schemas/context-schemas";
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
import { runParallelAction } from "next-server-actions-parallel";
import {
  listBuiltinResources,
  listCustomResources,
} from "../k8s-api/k8s-api-query";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "../k8s-constant/k8s-constant-label";

import _ from "lodash";
import { ListAllResourcesResponse } from "../k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";

function getUserKubeconfig(): string | undefined {
  const { auth } = useAuthState();
  return auth?.kubeconfig;
}

export function getDecodedKubeconfig(): string | undefined {
  const kc = getUserKubeconfig();
  if (!kc) {
    throw new Error("Kubeconfig not available");
  }
  return decodeURIComponent(kc);
}

export function getCurrentNamespace(): string | undefined {
  const { auth } = useAuthState();
  return auth?.namespace;
}

/**
 * Helper function to create K8s API context from user data
 */
export function createK8sContext(): K8sApiContext {
  return K8sApiContextSchema.parse({
    namespace: getCurrentNamespace(),
    kubeconfig: getDecodedKubeconfig(),
  });
}

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
 * Convert simplified annotation format back to full ListAllResourcesResponse
 * This function fetches all resources of each kind that has the project label
 */
export async function convertAnnotationToResources(
  annotation: BrainResourcesSimplified,
  context: K8sApiContext,
  projectName: string
): Promise<ListAllResourcesResponse> {
  const labelSelector = `${INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS}=${projectName}`;

  // Get unique kinds from annotation
  const builtinKinds = _.uniqBy(annotation.builtin, "kind");
  const customKinds = _.uniqBy(annotation.custom, "kind");

  // Fetch all builtin resources by kind with project label
  const builtinPromises = builtinKinds.map(async (resource) => {
    const resourceKey = Object.keys(BUILTIN_RESOURCES).find(
      (k) => k.toLowerCase() === resource.kind.toLowerCase()
    );
    if (!resourceKey) return [resource.kind.toLowerCase(), { items: [] }];
    const resourceConfig = BUILTIN_RESOURCES[resourceKey];

    try {
      const result = await runParallelAction(
        listBuiltinResources(context, {
          type: "builtin",
          resourceType: resourceConfig.resourceType,
          labelSelector,
        })
      );
      return [resourceKey, result];
    } catch (error) {
      console.warn(
        `Failed to fetch builtin resources of kind ${resource.kind}:`,
        error
      );
      return [resourceKey, { items: [] }];
    }
  });

  // Fetch all custom resources by kind with project label
  const customPromises = customKinds.map(async (resource) => {
    const resourceKey = Object.keys(CUSTOM_RESOURCES).find(
      (k) => k.toLowerCase() === resource.kind.toLowerCase()
    );
    if (!resourceKey) return [resource.kind.toLowerCase(), { items: [] }];
    const resourceConfig = CUSTOM_RESOURCES[resourceKey];

    try {
      const result = await runParallelAction(
        listCustomResources(context, {
          type: "custom",
          group: resourceConfig.group,
          version: resourceConfig.version,
          plural: resourceConfig.plural,
          labelSelector,
        })
      );
      return [resourceKey, result];
    } catch (error) {
      console.warn(
        `Failed to fetch custom resources of kind ${resource.kind}:`,
        error
      );
      return [resourceKey, { items: [] }];
    }
  });

  const [builtinResults, customResults] = await Promise.all([
    Promise.all(builtinPromises),
    Promise.all(customPromises),
  ]);

  return {
    builtin: _.fromPairs(builtinResults),
    custom: _.fromPairs(customResults),
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

export const convertToResourceTarget = (
  resource: K8sResource,
  config: BuiltinResourceConfig | CustomResourceConfig
): CustomResourceTarget | BuiltinResourceTarget => {
  if (!resource.metadata.name) {
    throw new Error("Resource name is required");
  }

  if (config.type === "custom") {
    return {
      type: "custom",
      group: config.group,
      version: config.version,
      plural: config.plural,
      name: resource.metadata.name,
    };
  }

  if (config.type === "builtin") {
    return {
      type: "builtin",
      resourceType: config.resourceType,
      name: resource.metadata.name,
    };
  }

  throw new Error("Invalid resource type");
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
      queryKey: ["project", "resources"],
    });
    queryClient.invalidateQueries({
      queryKey: [
        "k8s",
        "custom-resources",
        "list",
        target.group,
        target.version,
        context.namespace,
        target.plural,
      ],
    });
  } else {
    // Invalidate builtin resource queries
    queryClient.invalidateQueries({
      queryKey: ["project", "resources"],
    });
    queryClient.invalidateQueries({
      queryKey: [
        "k8s",
        "builtin-resources",
        "list",
        target.resourceType,
        context.namespace,
      ],
    });
  }

  // Invalidate all-resources query
  queryClient.invalidateQueries({
    queryKey: ["k8s", "all-resources", "list", context.namespace],
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
 * Flatten project resources from project-relevance algorithm structure to individual K8s resources
 * @param projectResources - Resources from getProjectRelatedResources
 * @returns Array of individual K8s resources
 */
export function flattenProjectResources(projectResources: ListAllResourcesResponse): K8sResource[] {
  const allResources: K8sResource[] = [];

  // Process builtin resources
  Object.values(projectResources.builtin || {}).forEach((resourceList) => {
    if (resourceList && resourceList.items) {
      allResources.push(...resourceList.items);
    }
  });

  // Process custom resources
  Object.values(projectResources.custom || {}).forEach((resourceList) => {
    if (resourceList && resourceList.items) {
      allResources.push(...resourceList.items);
    }
  });

  return allResources;
}

export function convertAndFilterResourceToTarget(
  resource: K8sResource
): CustomResourceTarget | BuiltinResourceTarget | null {
  if (!resource.kind || !resource.metadata?.name) {
    return null;
  }
  const config = getResourceConfigFromKind(resource.kind);
  if (!config) {
    return null;
  }
  try {
    return convertToResourceTarget(resource, config);
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
 * Generic function to fetch a resource (custom or builtin)
 */
export async function fetchResource(
  context: K8sApiContext,
  target: CustomResourceTarget | BuiltinResourceTarget
): Promise<any> {
  const { getCustomResource, getBuiltinResource } = await import("../k8s-api/k8s-api-query");
  
  if (target.type === "custom") {
    return await runParallelAction(
      getCustomResource(context, target as CustomResourceTarget)
    );
  }
  return await runParallelAction(
    getBuiltinResource(context, target as BuiltinResourceTarget)
  );
}

/**
 * Generic function to apply patch operations to a resource
 */
export async function applyResourcePatch(
  context: K8sApiContext,
  target: CustomResourceTarget | BuiltinResourceTarget,
  patchOps: any[]
): Promise<any> {
  const { patchCustomResource, patchBuiltinResource } = await import("../k8s-api/k8s-api-mutation");
  
  if (target.type === "custom") {
    return await runParallelAction(
      patchCustomResource(context, target as CustomResourceTarget, patchOps)
    );
  }
  return await runParallelAction(
    patchBuiltinResource(context, target as BuiltinResourceTarget, patchOps)
  );
}

/**
 * Generic function to delete a resource
 */
export async function deleteResource(
  context: K8sApiContext,
  target: CustomResourceTarget | BuiltinResourceTarget
): Promise<any> {
  const { deleteCustomResource, deleteBuiltinResource } = await import("../k8s-api/k8s-api-mutation");
  
  if (target.type === "custom") {
    return await runParallelAction(deleteCustomResource(context, target));
  }
  return await runParallelAction(deleteBuiltinResource(context, target));
}

/**
 * Generic function to patch resource metadata
 */
export async function patchResourceMetadata(
  context: K8sApiContext,
  target: CustomResourceTarget | BuiltinResourceTarget,
  metadataType: "annotations" | "labels",
  key: string,
  value: string
): Promise<any> {
  const { patchCustomResourceMetadata, patchBuiltinResourceMetadata } = await import("../k8s-api/k8s-api-mutation");
  
  if (target.type === "custom") {
    return await runParallelAction(
      patchCustomResourceMetadata(context, target, metadataType, key, value)
    );
  }
  return await runParallelAction(
    patchBuiltinResourceMetadata(context, target, metadataType, key, value)
  );
}

/**
 * Generic function to remove resource metadata
 */
export async function removeResourceMetadata(
  context: K8sApiContext,
  target: CustomResourceTarget | BuiltinResourceTarget,
  metadataType: "annotations" | "labels",
  key: string
): Promise<any> {
  const { removeCustomResourceMetadata, removeBuiltinResourceMetadata } = await import("../k8s-api/k8s-api-mutation");
  
  if (target.type === "custom") {
    return await runParallelAction(
      removeCustomResourceMetadata(context, target, metadataType, key)
    );
  }
  return await runParallelAction(
    removeBuiltinResourceMetadata(context, target, metadataType, key)
  );
}

/**
 * Generic function to delete resources by label selector
 */
export async function deleteResourcesByLabelSelector(
  context: K8sApiContext,
  target: (CustomResourceTarget | BuiltinResourceTarget) & { labelSelector: string }
): Promise<any> {
  const { deleteCustomResourcesByLabelSelector, deleteBuiltinResourcesByLabelSelector } = await import("../k8s-api/k8s-api-mutation");
  
  if (target.type === "custom") {
    return await runParallelAction(
      deleteCustomResourcesByLabelSelector(context, target)
    );
  }
  return await runParallelAction(
    deleteBuiltinResourcesByLabelSelector(context, target)
  );
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
      queryKey: ["inventory"],
    });
  }
}

/**
 * Batch operation utility for processing multiple targets
 */
export async function processBatchOperation<T>(
  targets: (CustomResourceTarget | BuiltinResourceTarget)[],
  operation: (target: CustomResourceTarget | BuiltinResourceTarget) => Promise<T>
): Promise<{ success: boolean; results: PromiseSettledResult<T>[]; resourceCount: number }> {
  const promises = targets.map(operation);
  const results = await Promise.allSettled(promises);
  
  return {
    success: true,
    results,
    resourceCount: targets.length,
  };
}
