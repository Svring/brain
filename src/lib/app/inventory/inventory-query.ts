"use client";

import { queryOptions, useQueries, useQuery } from "@tanstack/react-query";
import { use, useMemo } from "react";
import type { DevboxColumn } from "@/components/app/inventory/devbox/devbox-table-schema";
import { AuthContext } from "@/contexts/auth-context/auth-context";
import { RESOURCES } from "@/lib/k8s/k8s-constant";
import { listResourcesOptions } from "@/lib/k8s/k8s-query";
import type { K8sApiContext } from "@/lib/k8s/schemas";
import { ResourceTypeTargetSchema } from "@/lib/k8s/schemas";
import {
  getDevboxOptions,
  listDevboxOptions,
} from "@/lib/sealos/devbox/devbox-method/devbox-query";
import { transformDevboxListToNameList } from "@/lib/sealos/devbox/devbox-utils";
import { DevboxApiContextSchema } from "@/lib/sealos/devbox/schemas";
import { transformDevboxToTableRow } from "./inventory-transform";

// Existing devbox table data function (for other uses)
export function getDevboxTableData() {
  const { user } = use(AuthContext);

  // Create devbox context from user data
  const devboxContext = useMemo(() => {
    if (!(user?.regionUrl && user?.kubeconfig && user?.devboxToken)) {
      return null;
    }
    return DevboxApiContextSchema.parse({
      baseURL: user.regionUrl,
      authorization: user.kubeconfig,
      authorizationBearer: user.devboxToken,
    });
  }, [user?.regionUrl, user?.kubeconfig, user?.devboxToken]);

  // Fetch the list of devbox names
  const listQueryOptions = devboxContext
    ? listDevboxOptions(devboxContext, transformDevboxListToNameList)
    : {
        queryKey: ["devbox", "list", "disabled"],
        queryFn: () => Promise.resolve({ data: [] }),
      };

  const { data: devboxNames, isLoading: listLoading } = useQuery({
    ...listQueryOptions,
    enabled: !!devboxContext,
  });

  // Create individual queries for each devbox
  const devboxQueries = useQueries({
    queries: ((devboxNames as string[]) ?? []).map((name: string) => {
      const devboxQueryOptions = devboxContext
        ? getDevboxOptions(name, devboxContext, transformDevboxToTableRow)
        : {
            queryKey: ["devbox", "get", name, "disabled"],
            queryFn: () => Promise.resolve(null),
          };

      return {
        ...devboxQueryOptions,
        enabled: !!name && !!devboxContext,
      };
    }),
  });

  // Transform query results into table rows
  const rows = useMemo(() => {
    return devboxQueries
      .map((query) => query.data)
      .filter((data): data is DevboxColumn => !!data);
  }, [devboxQueries]);

  const isRowsLoading = devboxQueries.some((query) => query.isLoading);
  const isError = devboxQueries.some((query) => query.isError);

  return {
    rows,
    isLoading: listLoading || isRowsLoading,
    isError,
  };
}

// New inventory query functions using k8s-query

/**
 * List devboxes in the current namespace using k8s-query
 */
export const listDevboxesInventoryOptions = (
  context: K8sApiContext,
  postprocess?: (data: unknown) => unknown
) => {
  const devboxResourceConfig = RESOURCES.devbox;

  const resourceTypeTarget = ResourceTypeTargetSchema.parse({
    type: "custom",
    group: devboxResourceConfig.group,
    version: devboxResourceConfig.version,
    namespace: context.namespace,
    plural: devboxResourceConfig.plural,
  });

  const baseOptions = listResourcesOptions(resourceTypeTarget, context);

  return queryOptions({
    ...baseOptions,
    queryKey: ["inventory", "devboxes", "list", context.namespace],
    select: (data) => {
      const resolved = Array.isArray(data) ? (data[0] as unknown) : data;
      return postprocess?.(resolved) ?? resolved;
    },
  });
};

/**
 * List clusters in the current namespace using k8s-query
 */
export const listClustersInventoryOptions = (
  context: K8sApiContext,
  postprocess?: (data: unknown) => unknown
) => {
  const clusterConfig = RESOURCES.cluster;

  const resourceTypeTarget = ResourceTypeTargetSchema.parse({
    type: "custom",
    group: clusterConfig.group,
    version: clusterConfig.version,
    namespace: context.namespace,
    plural: clusterConfig.plural,
  });

  const baseOptions = listResourcesOptions(resourceTypeTarget, context);

  return queryOptions({
    ...baseOptions,
    queryKey: ["inventory", "clusters", "list", context.namespace],
    select: (data) => {
      const resolved = Array.isArray(data) ? (data[0] as unknown) : data;
      return postprocess?.(resolved) ?? resolved;
    },
  });
};

/**
 * List object storage buckets in the current namespace using k8s-query
 */
export const listObjectStoragesInventoryOptions = (
  context: K8sApiContext,
  postprocess?: (data: unknown) => unknown
) => {
  const objectStorageConfig = RESOURCES.objectstoragebucket;

  const resourceTypeTarget = ResourceTypeTargetSchema.parse({
    type: "custom",
    group: objectStorageConfig.group,
    version: objectStorageConfig.version,
    namespace: context.namespace,
    plural: objectStorageConfig.plural,
  });

  const baseOptions = listResourcesOptions(resourceTypeTarget, context);

  return queryOptions({
    ...baseOptions,
    queryKey: ["inventory", "objectstorages", "list", context.namespace],
    select: (data) => {
      const resolved = Array.isArray(data) ? (data[0] as unknown) : data;
      return postprocess?.(resolved) ?? resolved;
    },
  });
};

/**
 * List deployments in the current namespace using k8s-query
 */
export const listDeploymentsInventoryOptions = (
  context: K8sApiContext,
  postprocess?: (data: unknown) => unknown
) => {
  const deploymentConfig = RESOURCES.deployment;

  const resourceTypeTarget = ResourceTypeTargetSchema.parse({
    type: deploymentConfig.resourceType,
    namespace: context.namespace,
  });

  const baseOptions = listResourcesOptions(resourceTypeTarget, context);

  return queryOptions({
    ...baseOptions,
    queryKey: ["inventory", "deployments", "list", context.namespace],
    select: (data) => {
      const resolved = Array.isArray(data) ? (data[0] as unknown) : data;
      return postprocess?.(resolved) ?? resolved;
    },
  });
};

/**
 * List statefulsets in the current namespace using k8s-query
 */
export const listStatefulSetsInventoryOptions = (
  context: K8sApiContext,
  postprocess?: (data: unknown) => unknown
) => {
  const statefulSetConfig = RESOURCES.statefulset;

  const resourceTypeTarget = ResourceTypeTargetSchema.parse({
    type: statefulSetConfig.resourceType,
    namespace: context.namespace,
  });

  const baseOptions = listResourcesOptions(resourceTypeTarget, context);

  return queryOptions({
    ...baseOptions,
    queryKey: ["inventory", "statefulsets", "list", context.namespace],
    select: (data) => {
      const resolved = Array.isArray(data) ? (data[0] as unknown) : data;
      return postprocess?.(resolved) ?? resolved;
    },
  });
};

/**
 * List cronjobs in the current namespace using k8s-query
 */
export const listCronJobsInventoryOptions = (
  context: K8sApiContext,
  postprocess?: (data: unknown) => unknown
) => {
  const cronJobConfig = RESOURCES.cronjob;

  const resourceTypeTarget = ResourceTypeTargetSchema.parse({
    type: cronJobConfig.resourceType,
    namespace: context.namespace,
  });

  const baseOptions = listResourcesOptions(resourceTypeTarget, context);

  return queryOptions({
    ...baseOptions,
    queryKey: ["inventory", "cronjobs", "list", context.namespace],
    select: (data) => {
      const resolved = Array.isArray(data) ? (data[0] as unknown) : data;
      return postprocess?.(resolved) ?? resolved;
    },
  });
};
