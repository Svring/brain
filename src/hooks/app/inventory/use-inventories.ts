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
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { filterResourcesWithoutProject } from "@/lib/app/project/project-method/project-utils";

export interface InventoryByResourceType {
  devboxes: K8sResource[];
  clusters: K8sResource[];
  objectstorages: K8sResource[];
  deployments: K8sResource[];
  // statefulsets: K8sResource[];
  // cronjobs: K8sResource[];
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
        select: (data: any) => {
          if (!data || !data.items) return data;
          return {
            ...data,
            items: filterResourcesWithoutProject(data.items),
          };
        },
      },
      {
        ...listClustersInventoryOptions(
          context || { namespace: "", kubeconfig: "" }
        ),
        enabled: !!context,
        select: (data: any) => {
          if (!data || !data.items) return data;
          return {
            ...data,
            items: filterResourcesWithoutProject(data.items),
          };
        },
      },
      {
        ...listObjectStoragesInventoryOptions(
          context || { namespace: "", kubeconfig: "" }
        ),
        enabled: !!context,
        select: (data: any) => {
          if (!data || !data.items) return data;
          return {
            ...data,
            items: filterResourcesWithoutProject(data.items),
          };
        },
      },
      {
        ...listDeploymentsInventoryOptions(
          context || { namespace: "", kubeconfig: "" }
        ),
        enabled: !!context,
        select: (data: any) => {
          if (!data || !data.items) return data;
          return {
            ...data,
            items: filterResourcesWithoutProject(data.items),
          };
        },
      },
      {
        ...listStatefulSetsInventoryOptions(
          context || { namespace: "", kubeconfig: "" }
        ),
        enabled: !!context,
        select: (data: any) => {
          if (!data || !data.items) return data;
          return {
            ...data,
            items: filterResourcesWithoutProject(data.items),
          };
        },
      },
      {
        ...listCronJobsInventoryOptions(
          context || { namespace: "", kubeconfig: "" }
        ),
        enabled: !!context,
        select: (data: any) => {
          if (!data || !data.items) return data;
          return {
            ...data,
            items: filterResourcesWithoutProject(data.items),
          };
        },
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

    const extractItems = (queryData: unknown): K8sResource[] => {
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
      // statefulsets: extractItems(statefulsetsQuery.data),
      // cronjobs: extractItems(cronjobsQuery.data),
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
