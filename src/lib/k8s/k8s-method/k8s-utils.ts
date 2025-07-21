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
