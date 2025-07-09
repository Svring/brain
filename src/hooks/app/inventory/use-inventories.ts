"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  listClustersInventoryOptions,
  listCronJobsInventoryOptions,
  listDeploymentsInventoryOptions,
  listDevboxesInventoryOptions,
  listObjectStoragesInventoryOptions,
  listStatefulSetsInventoryOptions,
} from "@/lib/app/inventory/inventory-query";
import { createK8sContext } from "@/lib/k8s/k8s-utils";
import type { AnyKubernetesResource } from "@/lib/k8s/schemas";

export interface InventoryByResourceType {
  devboxes: AnyKubernetesResource[];
  clusters: AnyKubernetesResource[];
  objectstorages: AnyKubernetesResource[];
  deployments: AnyKubernetesResource[];
  statefulsets: AnyKubernetesResource[];
  cronjobs: AnyKubernetesResource[];
}

export interface UseInventoriesResult {
  data: InventoryByResourceType;
  isLoading: boolean;
  isError: boolean;
  errors: Error[];
}

/**
 * Hook to list all resource inventories and group them by resource type
 */
export function useInventories(): UseInventoriesResult {
  const context = createK8sContext();

  // Define all inventory queries
  const inventoryQueries = useQueries({
    queries: [
      {
        ...listDevboxesInventoryOptions(
          context || { namespace: "", kubeconfig: "" }
        ),
        enabled: !!context,
      },
      {
        ...listClustersInventoryOptions(
          context || { namespace: "", kubeconfig: "" }
        ),
        enabled: !!context,
      },
      {
        ...listObjectStoragesInventoryOptions(
          context || { namespace: "", kubeconfig: "" }
        ),
        enabled: !!context,
      },
      {
        ...listDeploymentsInventoryOptions(
          context || { namespace: "", kubeconfig: "" }
        ),
        enabled: !!context,
      },
      {
        ...listStatefulSetsInventoryOptions(
          context || { namespace: "", kubeconfig: "" }
        ),
        enabled: !!context,
      },
      {
        ...listCronJobsInventoryOptions(
          context || { namespace: "", kubeconfig: "" }
        ),
        enabled: !!context,
      },
    ],
  });

  // Transform and group results by resource type
  const data = useMemo((): InventoryByResourceType => {
    const [
      devboxesQuery,
      clustersQuery,
      objectstoragesQuery,
      deploymentsQuery,
      statefulsetsQuery,
      cronjobsQuery,
    ] = inventoryQueries;

    const extractItems = (queryData: unknown): AnyKubernetesResource[] => {
      if (!queryData) {
        return [];
      }
      // Handle both direct array and nested items structure
      if (Array.isArray(queryData)) {
        return queryData;
      }
      if (
        queryData &&
        typeof queryData === "object" &&
        "items" in queryData &&
        Array.isArray(queryData.items)
      ) {
        return queryData.items;
      }
      return [];
    };

    return {
      devboxes: extractItems(devboxesQuery.data),
      clusters: extractItems(clustersQuery.data),
      objectstorages: extractItems(objectstoragesQuery.data),
      deployments: extractItems(deploymentsQuery.data),
      statefulsets: extractItems(statefulsetsQuery.data),
      cronjobs: extractItems(cronjobsQuery.data),
    };
  }, [inventoryQueries]);

  const isLoading = inventoryQueries.some((query) => query.isLoading);
  const isError = inventoryQueries.some((query) => query.isError);
  const errors = inventoryQueries
    .filter((query) => query.error)
    .map((query) => query.error as Error);

  return {
    data,
    isLoading,
    isError,
    errors,
  };
}
