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

// Existing devbox table data function (for other uses)
// export function getDevboxTableData() {
//   const { auth } = useAuthContext();

//   // Create devbox context from auth data
//   const devboxContext = useMemo(() => {
//     if (!(auth?.regionUrl && auth?.kubeconfig && auth?.appToken)) {
//       return null;
//     }
//     return DevboxApiContextSchema.parse({
//       baseURL: auth.regionUrl,
//       authorization: auth.kubeconfig,
//       authorizationBearer: auth.appToken,
//     });
//   }, [auth?.regionUrl, auth?.kubeconfig, auth?.appToken]);

//   // Fetch the list of devbox names
//   const listQueryOptions = devboxContext
//     ? listDevboxOptions(devboxContext, transformDevboxListToNameList)
//     : {
//         queryKey: ["devbox", "list", "disabled"],
//         queryFn: () => Promise.resolve({ data: [] }),
//       };

//   const { data: devboxNames, isLoading: listLoading } = useQuery({
//     ...listQueryOptions,
//     enabled: !!devboxContext,
//   });

//   // Create individual queries for each devbox
//   const devboxQueries = useQueries({
//     queries: ((devboxNames as string[]) ?? []).map((name: string) => {
//       const devboxQueryOptions = devboxContext
//         ? getDevboxOptions(name, devboxContext, transformDevboxToTableRow)
//         : {
//             queryKey: ["devbox", "get", name, "disabled"],
//             queryFn: () => Promise.resolve(null),
//           };

//       return {
//         ...devboxQueryOptions,
//         enabled: !!name && !!devboxContext,
//       };
//     }),
//   });

//   // Transform query results into table rows
//   const rows = useMemo(() => {
//     return devboxQueries
//       .map((query) => query.data)
//       .filter((data): data is DevboxColumn => !!data);
//   }, [devboxQueries]);

//   const isRowsLoading = devboxQueries.some((query) => query.isLoading);
//   const isError = devboxQueries.some((query) => query.isError);

//   return {
//     rows,
//     isLoading: listLoading || isRowsLoading,
//     isError,
//   };
// }

// New inventory query functions using k8s-query

/**
 * List devboxes in the current namespace using k8s-query
 */
export const listDevboxesInventoryOptions = (context: K8sApiContext) => {
  const devboxResourceConfig = CUSTOM_RESOURCES.devbox;

  const resourceTypeTarget = CustomResourceTargetSchema.parse({
    type: "custom",
    group: devboxResourceConfig.group,
    version: devboxResourceConfig.version,
    plural: devboxResourceConfig.plural,
  });

  const baseOptions = listResourcesOptions(context, resourceTypeTarget);

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

  const resourceTypeTarget = CustomResourceTargetSchema.parse({
    type: "custom",
    group: clusterConfig.group,
    version: clusterConfig.version,
    plural: clusterConfig.plural,
  });

  const baseOptions = listResourcesOptions(context, resourceTypeTarget);

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

  const resourceTypeTarget = CustomResourceTargetSchema.parse({
    type: "custom",
    group: objectStorageConfig.group,
    version: objectStorageConfig.version,
    plural: objectStorageConfig.plural,
  });

  const baseOptions = listResourcesOptions(context, resourceTypeTarget);

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

  const resourceTypeTarget = BuiltinResourceTargetSchema.parse({
    type: "builtin",
    resourceType: deploymentConfig.resourceType,
  });

  const baseOptions = listResourcesOptions(context, resourceTypeTarget);

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

  const resourceTypeTarget = BuiltinResourceTargetSchema.parse({
    type: "builtin",
    resourceType: statefulSetConfig.resourceType,
  });

  const baseOptions = listResourcesOptions(context, resourceTypeTarget);

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

  const resourceTypeTarget = BuiltinResourceTargetSchema.parse({
    type: "builtin",
    resourceType: cronJobConfig.resourceType,
  });

  const baseOptions = listResourcesOptions(context, resourceTypeTarget);

  return queryOptions({
    ...baseOptions,
    queryKey: ["inventory", "cronjobs", "list", context.namespace],
    select: (data) => {
      return Array.isArray(data) ? (data[0] as unknown) : data;
    },
  });
};
