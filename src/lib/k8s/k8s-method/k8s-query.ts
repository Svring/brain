"use client";

// Third-party libraries
import { queryOptions } from "@tanstack/react-query";
import _ from "lodash";

// Next.js server actions
import { runParallelAction } from "next-server-actions-parallel";

// Kubernetes API queries
import {
  getBuiltinResource,
  getCustomResource,
  listBuiltinResources,
  listCustomResources,
} from "../k8s-api/k8s-api-query";

// Kubernetes API schemas
import { K8sApiContext } from "../k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
  BuiltinResourceTarget,
  CustomResourceTarget,
} from "../k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { ListAllResourcesResponseSchema } from "../k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";

// Kubernetes constants
import { BUILTIN_RESOURCES } from "../k8s-constant/k8s-constant-builtin-resource";
import { CUSTOM_RESOURCES } from "../k8s-constant/k8s-constant-custom-resource";
import { buildQueryKey } from "../k8s-constant/k8s-constant-query-key";

// Utility functions
import {
  BrainResourcesSimplified,
  convertAnnotationToResourceTargets,
} from "./k8s-utils";

// ============================================================================
// NON-OPTIONS FUNCTIONS (Core business logic)
// ============================================================================

/**
 * List all resources (both custom and builtin) in parallel.
 */
export const listAllResources = async (
  context: K8sApiContext,
  labelSelector?: string,
  builtinResourceTypes?: string[],
  customResourceTypes?: string[]
) => {
  // Filter builtin resources based on provided list
  const builtinResourcesToFetch = builtinResourceTypes
    ? _.pick(BUILTIN_RESOURCES, builtinResourceTypes)
    : {};

  // Filter custom resources based on provided list
  const customResourcesToFetch = customResourceTypes
    ? _.pick(CUSTOM_RESOURCES, customResourceTypes)
    : {};

  // Prepare builtin resource promises only if there are resources to fetch
  const builtinPromises = _.isEmpty(builtinResourcesToFetch)
    ? []
    : _.map(builtinResourcesToFetch, (config, name) =>
        runParallelAction(
          listBuiltinResources(context, {
            type: "builtin",
            resourceType: config.resourceType,
            labelSelector,
          })
        ).then((result) => [name, result])
      );

  // Prepare custom resource promises only if there are resources to fetch
  const customPromises = _.isEmpty(customResourcesToFetch)
    ? []
    : _.map(customResourcesToFetch, (config, name) =>
        runParallelAction(
          listCustomResources(context, {
            type: "custom",
            resourceType: config.resourceType,
            group: config.group,
            version: config.version,
            plural: config.plural,
            labelSelector,
          })
        ).then((result) => [name, result])
      );

  // Execute all promises in parallel
  const [builtinResults, customResults] = await Promise.all([
    Promise.all(builtinPromises),
    Promise.all(customPromises),
  ]);

  return ListAllResourcesResponseSchema.parse({
    builtin: _.fromPairs(builtinResults),
    custom: _.fromPairs(customResults),
  });
};

/**
 * Generic async function to get any resource (custom or builtin)
 */
export const getResource = async (
  context: K8sApiContext,
  target: CustomResourceTarget | BuiltinResourceTarget
) => {
  if (target.type === "custom") {
    return await runParallelAction(getCustomResource(context, target));
  }
  return await runParallelAction(getBuiltinResource(context, target));
};

/**
 * List resources based on annotation data using batch processing
 * This is an optimized version that only fetches the resources listed in the annotation
 */
export const listAnnotationBasedResources = async (
  context: K8sApiContext,
  annotation: BrainResourcesSimplified,
  projectName: string
) => {
  const { builtinTargets, customTargets } = convertAnnotationToResourceTargets(
    annotation,
    projectName
  );

  // Batch process builtin resources
  const builtinPromises = builtinTargets.map(async ({ key, target }) => {
    try {
      const result = await runParallelAction(
        listBuiltinResources(context, target)
      );
      return [key, result];
    } catch (error) {
      console.warn(
        `Failed to fetch builtin resources of type ${target.resourceType}:`,
        error
      );
      return [key, { items: [] }];
    }
  });

  // Batch process custom resources
  const customPromises = customTargets.map(async ({ key, target }) => {
    try {
      const result = await runParallelAction(
        listCustomResources(context, target)
      );
      return [key, result];
    } catch (error) {
      console.warn(
        `Failed to fetch custom resources of type ${target.resourceType}:`,
        error
      );
      return [key, { items: [] }];
    }
  });

  const [builtinResults, customResults] = await Promise.all([
    Promise.all(builtinPromises),
    Promise.all(customPromises),
  ]);

  return ListAllResourcesResponseSchema.parse({
    builtin: _.fromPairs(builtinResults),
    custom: _.fromPairs(customResults),
  });
};

// ============================================================================
// OPTIONS FUNCTIONS (React Query wrappers)
// ============================================================================

/**
 * Query options for listing custom resources
 */
export const listCustomResourcesOptions = (
  context: K8sApiContext,
  target: CustomResourceTarget
) =>
  queryOptions({
    queryKey: buildQueryKey.listCustomResources(
      target.group,
      target.version,
      context.namespace,
      target.plural,
      target.labelSelector
    ),
    queryFn: async () => {
      const result = await runParallelAction(
        listCustomResources(context, target)
      );
      return result;
    },
    enabled:
      !!target.group &&
      !!target.version &&
      !!context.namespace &&
      !!target.plural &&
      !!context.kubeconfig,
  });

/**
 * Query options for getting a custom resource by name
 */
export const getCustomResourceOptions = (
  context: K8sApiContext,
  target: CustomResourceTarget
) =>
  queryOptions({
    queryKey: buildQueryKey.getCustomResource(
      target.group,
      target.version,
      context.namespace,
      target.plural,
      target.name!
    ),
    queryFn: async () => {
      const result = await runParallelAction(
        getCustomResource(context, target)
      );
      return result;
    },
    enabled:
      !!target.group &&
      !!target.version &&
      !!context.namespace &&
      !!target.plural &&
      !!target.name &&
      !!context.kubeconfig,
  });

/**
 * Query options for listing builtin resources
 */
export const listBuiltinResourcesOptions = (
  context: K8sApiContext,
  target: BuiltinResourceTarget
) =>
  queryOptions({
    queryKey: buildQueryKey.listBuiltinResources(
      target.resourceType,
      context.namespace,
      target.labelSelector
    ),
    queryFn: async () =>
      await runParallelAction(listBuiltinResources(context, target)),
    enabled:
      !!target.resourceType && !!context.namespace && !!context.kubeconfig,
  });

/**
 * Query options for getting a builtin resource by name
 */
export const getBuiltinResourceOptions = (
  context: K8sApiContext,
  target: BuiltinResourceTarget
) =>
  queryOptions({
    queryKey: buildQueryKey.getBuiltinResource(
      target.resourceType,
      context.namespace,
      target.name!
    ),
    queryFn: async () =>
      await runParallelAction(getBuiltinResource(context, target)),
    enabled:
      !!target.resourceType &&
      !!context.namespace &&
      !!target.name &&
      !!context.kubeconfig,
  });

/**
 * Query options for listing all resources (both custom and builtin)
 */
export const listAllResourcesOptions = (
  context: K8sApiContext,
  labelSelector?: string,
  builtinResourceTypes?: string[],
  customResourceTypes?: string[]
) =>
  queryOptions({
    queryKey: buildQueryKey.listAllResources(
      context.namespace,
      labelSelector,
      builtinResourceTypes,
      customResourceTypes
    ),
    queryFn: async () => {
      const result = await listAllResources(
        context,
        labelSelector,
        builtinResourceTypes,
        customResourceTypes
      );
      return result;
    },
    enabled: !!context.namespace && !!context.kubeconfig,
    staleTime: 1000 * 30,
  });

/**
 * Generic query options for getting any resource (custom or builtin)
 */
export const getResourceOptions = (
  context: K8sApiContext,
  target: CustomResourceTarget | BuiltinResourceTarget
) => {
  if (target.type === "custom") {
    return getCustomResourceOptions(context, target);
  }
  return getBuiltinResourceOptions(context, target);
};

/**
 * Generic query options for listing any resource (custom or builtin)
 */
export const listResourcesOptions = (
  context: K8sApiContext,
  target: CustomResourceTarget | BuiltinResourceTarget
) => {
  if (target.type === "custom") {
    return listCustomResourcesOptions(context, target);
  }
  return listBuiltinResourcesOptions(context, target);
};

/**
 * Query options for fetching specific resources based on annotation data
 * This is an optimized version that only fetches the resources listed in the annotation
 */
export const listAnnotationBasedResourcesOptions = (
  context: K8sApiContext,
  annotation: BrainResourcesSimplified,
  projectName: string
) =>
  queryOptions({
    queryKey: buildQueryKey.listAnnotationBasedResources(
      context.namespace,
      projectName,
      annotation
    ),
    queryFn: async () => {
      const result = await listAnnotationBasedResources(
        context,
        annotation,
        projectName
      );
      return result;
    },
    enabled:
      !!context.namespace &&
      !!context.kubeconfig &&
      !!annotation &&
      !!projectName,
    staleTime: 1000 * 30,
  });
