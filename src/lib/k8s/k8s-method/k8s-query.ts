"use client";

import { z } from "zod";
import { queryOptions } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  getBuiltinResource,
  getCustomResource,
  listBuiltinResources,
  listCustomResources,
} from "../k8s-api/k8s-api-query";
import { K8sApiContext } from "../k8s-api/k8s-api-schemas/context-schemas";
import {
  BuiltinResourceTarget,
  CustomResourceTarget,
} from "../k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { ListAllResourcesResponseSchema } from "../k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import { BUILTIN_RESOURCES } from "../k8s-constant/k8s-constant-builtin-resource";
import { CUSTOM_RESOURCES } from "../k8s-constant/k8s-constant-custom-resource";
import {
  BrainResourcesSimplified,
  convertAnnotationToResources,
} from "./k8s-utils";
import _ from "lodash";

/**
 * List all resources (both custom and builtin) in parallel.
 */
const listAllResources = async (
  context: K8sApiContext,
  labelSelector?: string
) => {
  // Prepare builtin resource promises
  const builtinPromises = _.map(BUILTIN_RESOURCES, (config, name) =>
    runParallelAction(
      listBuiltinResources(context, {
        type: "builtin",
        resourceType: config.resourceType,
        labelSelector,
      })
    ).then((result) => [name, result])
  );

  // Prepare custom resource promises
  const customPromises = _.map(CUSTOM_RESOURCES, (config, name) =>
    runParallelAction(
      listCustomResources(context, {
        type: "custom",
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
 * Query options for listing custom resources
 */
export const listCustomResourcesOptions = (
  context: K8sApiContext,
  target: CustomResourceTarget
) =>
  queryOptions({
    queryKey: [
      "k8s",
      "custom-resources",
      "list",
      target.group,
      target.version,
      context.namespace,
      target.plural,
      target.labelSelector,
    ],
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
    queryKey: [
      "k8s",
      "custom-resource",
      "get",
      target.group,
      target.version,
      context.namespace,
      target.plural,
      target.name,
    ],
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
    queryKey: [
      "k8s",
      "builtin-resources",
      "list",
      target.resourceType,
      context.namespace,
      target.labelSelector,
    ],
    queryFn: async () => {
      const result = await runParallelAction(
        listBuiltinResources(context, target)
      );
      return result;
    },
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
    queryKey: [
      "k8s",
      "builtin-resource",
      "get",
      target.resourceType,
      context.namespace,
      target.name,
    ],
    queryFn: async () => {
      const result = await runParallelAction(
        getBuiltinResource(context, target)
      );
      return result;
    },
    enabled:
      !!target.resourceType &&
      !!context.namespace &&
      !!target.name &&
      !!context.kubeconfig,
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
 * Query options for listing all resources (both custom and builtin)
 */
export const listAllResourcesOptions = (
  context: K8sApiContext,
  labelSelector?: string
) =>
  queryOptions({
    queryKey: [
      "k8s",
      "all-resources",
      "list",
      context.namespace,
      labelSelector,
    ],
    queryFn: async () => {
      const result = await listAllResources(context, labelSelector);
      return result;
    },
    enabled: !!context.namespace && !!context.kubeconfig,
    staleTime: 1000 * 30,
  });

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
    queryKey: [
      "k8s",
      "annotation-based-resources",
      "list",
      context.namespace,
      projectName,
      JSON.stringify(annotation),
    ],
    queryFn: async () => {
      const result = await convertAnnotationToResources(
        annotation,
        context,
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

/**
 * Query options for getting a secret by name
 * Secrets are builtin Kubernetes resources
 */
export const getSecretOptions = (context: K8sApiContext, secretName: string) =>
  queryOptions({
    queryKey: ["k8s", "secret", "get", context.namespace, secretName],
    queryFn: async () => {
      const result = await runParallelAction(
        getBuiltinResource(context, {
          type: "builtin",
          resourceType: "secrets",
          name: secretName,
        })
      );
      return result;
    },
    enabled: !!context.namespace && !!context.kubeconfig && !!secretName,
    staleTime: 1000 * 60, // Cache secrets for 1 minute
  });

/**
 * Generate cluster secret name based on cluster name
 * Convention: {clusterName}-conn-credential
 */
export const generateClusterSecretName = (clusterName: string): string => {
  return `${clusterName}-conn-credential`;
};

/**
 * Generate object storage secret name based on object storage name and namespace
 * Convention: object-storage-key-{namespace}-{objectStorageName}
 */
export const generateObjectStorageSecretName = (
  objectStorageName: string,
  namespace: string
): string => {
  return `object-storage-key-${namespace}-${objectStorageName}`;
};

/**
 * Query options for getting a cluster's connection credential secret
 */
export const getClusterSecretOptions = (
  context: K8sApiContext,
  clusterName: string
) => {
  const secretName = generateClusterSecretName(clusterName);
  return getSecretOptions(context, secretName);
};

/**
 * Query options for getting an object storage's key secret
 */
export const getObjectStorageSecretOptions = (
  context: K8sApiContext,
  objectStorageName: string
) => {
  const secretName = generateObjectStorageSecretName(
    objectStorageName,
    context.namespace
  );
  return getSecretOptions(context, secretName);
};
