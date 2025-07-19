"use client";

import { queryOptions } from "@tanstack/react-query";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import { BUILTIN_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-builtin-resource";
import { listResourcesOptions } from "@/lib/k8s/k8s-method/k8s-query";
import type { K8sApiContext } from "@/lib/k8s/schemas";
import {
  BuiltinResourceTargetSchema,
  CustomResourceTargetSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

/**
 * List devboxes in the current namespace using k8s-query
 */
export const listDevboxesInventoryOptions = (context: K8sApiContext) => {
  const devboxResourceConfig = CUSTOM_RESOURCES.devbox;

  const resourceTarget = CustomResourceTargetSchema.parse({
    type: "custom",
    group: devboxResourceConfig.group,
    version: devboxResourceConfig.version,
    plural: devboxResourceConfig.plural,
  });

  const baseOptions = listResourcesOptions(context, resourceTarget);

  return queryOptions({
    ...baseOptions,
    queryKey: ["inventory", "devboxes", "list", context.namespace],
    select: (data) => {
      return Array.isArray(data) ? (data[0] as unknown) : data;
    },
  });
};

/**
 * List clusters in the current namespace using k8s-query
 */
export const listClustersInventoryOptions = (context: K8sApiContext) => {
  const clusterConfig = CUSTOM_RESOURCES.cluster;

  const resourceTarget = CustomResourceTargetSchema.parse({
    type: "custom",
    group: clusterConfig.group,
    version: clusterConfig.version,
    plural: clusterConfig.plural,
  });

  const baseOptions = listResourcesOptions(context, resourceTarget);

  return queryOptions({
    ...baseOptions,
    queryKey: ["inventory", "clusters", "list", context.namespace],
    select: (data) => {
      return Array.isArray(data) ? (data[0] as unknown) : data;
    },
  });
};

/**
 * List object storage buckets in the current namespace using k8s-query
 */
export const listObjectStoragesInventoryOptions = (context: K8sApiContext) => {
  const objectStorageConfig = CUSTOM_RESOURCES.objectstoragebucket;

  const resourceTarget = CustomResourceTargetSchema.parse({
    type: "custom",
    group: objectStorageConfig.group,
    version: objectStorageConfig.version,
    plural: objectStorageConfig.plural,
  });

  const baseOptions = listResourcesOptions(context, resourceTarget);

  return queryOptions({
    ...baseOptions,
    queryKey: ["inventory", "objectstorages", "list", context.namespace],
    select: (data) => {
      return Array.isArray(data) ? (data[0] as unknown) : data;
    },
  });
};

/**
 * List deployments in the current namespace using k8s-query
 */
export const listDeploymentsInventoryOptions = (context: K8sApiContext) => {
  const deploymentConfig = BUILTIN_RESOURCES.deployment;

  const resourceTarget = BuiltinResourceTargetSchema.parse({
    type: "builtin",
    resourceType: deploymentConfig.resourceType,
  });

  const baseOptions = listResourcesOptions(context, resourceTarget);

  return queryOptions({
    ...baseOptions,
    queryKey: ["inventory", "deployments", "list", context.namespace],
    select: (data) => {
      return Array.isArray(data) ? (data[0] as unknown) : data;
    },
  });
};

/**
 * List statefulsets in the current namespace using k8s-query
 */
export const listStatefulSetsInventoryOptions = (context: K8sApiContext) => {
  const statefulSetConfig = BUILTIN_RESOURCES.statefulset;

  const resourceTarget = BuiltinResourceTargetSchema.parse({
    type: "builtin",
    resourceType: statefulSetConfig.resourceType,
  });

  const baseOptions = listResourcesOptions(context, resourceTarget);

  return queryOptions({
    ...baseOptions,
    queryKey: ["inventory", "statefulsets", "list", context.namespace],
    select: (data) => {
      return Array.isArray(data) ? (data[0] as unknown) : data;
    },
  });
};

/**
 * List cronjobs in the current namespace using k8s-query
 */
export const listCronJobsInventoryOptions = (context: K8sApiContext) => {
  const cronJobConfig = BUILTIN_RESOURCES.cronjob;

  const resourceTarget = BuiltinResourceTargetSchema.parse({
    type: "builtin",
    resourceType: cronJobConfig.resourceType,
  });

  const baseOptions = listResourcesOptions(context, resourceTarget);

  return queryOptions({
    ...baseOptions,
    queryKey: ["inventory", "cronjobs", "list", context.namespace],
    select: (data) => {
      return Array.isArray(data) ? (data[0] as unknown) : data;
    },
  });
};
