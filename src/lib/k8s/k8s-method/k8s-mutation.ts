"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  deleteBuiltinResource,
  deleteCustomResource,
  deleteBuiltinResourcesByLabelSelector,
  deleteCustomResourcesByLabelSelector,
  patchBuiltinResourceMetadata,
  patchCustomResourceMetadata,
  removeBuiltinResourceMetadata,
  removeCustomResourceMetadata,
  applyInstanceYaml,
  patchBuiltinResource,
  patchCustomResource,
} from "../k8s-api/k8s-api-mutation";
import {
  getCustomResource,
  getBuiltinResource,
} from "../k8s-api/k8s-api-query";
import { listAllResources } from "./k8s-query";
import { K8sApiContext } from "../k8s-api/k8s-api-schemas/context-schemas";
import {
  BuiltinResourceTarget,
  CustomResourceTarget,
  ResourceTarget,
} from "../k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { CUSTOM_RESOURCES } from "../k8s-constant/k8s-constant-custom-resource";
import { invalidateResourceQueries, convertAndFilterResourceToTarget, flattenProjectResources } from "./k8s-utils";
import {
  INSTANCE_RELATE_RESOURCE_LABELS,
  CLUSTER_RELATE_RESOURCE_LABELS,
} from "../k8s-constant/k8s-constant-label";
import { getClusterRelatedResources } from "@/lib/algorithm/relevance/cluster-relevance";
import { getDeployRelatedResources } from "@/lib/algorithm/relevance/deploy-relevance";
import { getDevboxRelatedResources } from "@/lib/algorithm/relevance/devbox-relevance";
import { getInstanceRelatedResources } from "@/lib/algorithm/relevance/instance-relevance";
import { getStatefulsetRelatedResources } from "@/lib/algorithm/relevance/statefulset-relevance";
import _ from "lodash";

/**
 * Mutation for patching resource metadata (annotations or labels)
 */
export function usePatchResourceMetadataMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      target,
      metadataType,
      key,
      value,
    }: {
      target: CustomResourceTarget | BuiltinResourceTarget;
      metadataType: "annotations" | "labels";
      key: string;
      value: string;
    }) => {
      if (target.type === "custom") {
        return await runParallelAction(
          patchCustomResourceMetadata(context, target, metadataType, key, value)
        );
      }
      return await runParallelAction(
        patchBuiltinResourceMetadata(context, target, metadataType, key, value)
      );
    },
    onSuccess: (_data, variables) => {
      invalidateResourceQueries(queryClient, context, variables.target);
    },
  });
}

/**
 * Mutation for removing resource metadata (annotations or labels)
 */
export function useRemoveResourceMetadataMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      target,
      metadataType,
      key,
    }: {
      target: CustomResourceTarget | BuiltinResourceTarget;
      metadataType: "annotations" | "labels";
      key: string;
    }) => {
      if (target.type === "custom") {
        return await runParallelAction(
          removeCustomResourceMetadata(context, target, metadataType, key)
        );
      }
      return await runParallelAction(
        removeBuiltinResourceMetadata(context, target, metadataType, key)
      );
    },
    onSuccess: (_data, variables) => {
      invalidateResourceQueries(queryClient, context, variables.target);
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
    },
  });
}

/**
 * Mutation for deleting a single resource
 */
export function useDeleteResourceMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      target,
    }: {
      target: CustomResourceTarget | BuiltinResourceTarget;
    }) => {
      if (target.type === "custom") {
        return await runParallelAction(deleteCustomResource(context, target));
      }
      return await runParallelAction(deleteBuiltinResource(context, target));
    },
    onSuccess: (_data, variables) => {
      invalidateResourceQueries(queryClient, context, variables.target);
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
    },
  });
}

/**
 * Mutation for batch patching multiple resources metadata
 */
export function useBatchPatchResourcesMetadataMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      targets,
      metadataType,
      key,
      value,
    }: {
      targets: (CustomResourceTarget | BuiltinResourceTarget)[];
      metadataType: "annotations" | "labels";
      key: string;
      value: string;
    }) => {
      const promises = targets.map((target) => {
        if (target.type === "custom") {
          return runParallelAction(
            patchCustomResourceMetadata(
              context,
              target,
              metadataType,
              key,
              value
            )
          );
        }
        return runParallelAction(
          patchBuiltinResourceMetadata(
            context,
            target,
            metadataType,
            key,
            value
          )
        );
      });

      const results = await Promise.allSettled(promises);
      return {
        success: true,
        results,
        resourceCount: targets.length,
      };
    },
    onSuccess: (_data, variables) => {
      for (const target of variables.targets) {
        invalidateResourceQueries(queryClient, context, target);
      }
    },
  });
}

/**
 * Mutation for batch removing multiple resources metadata
 */
export function useBatchRemoveResourcesMetadataMutation(
  context: K8sApiContext
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      targets,
      metadataType,
      key,
    }: {
      targets: (CustomResourceTarget | BuiltinResourceTarget)[];
      metadataType: "annotations" | "labels";
      key: string;
    }) => {
      const promises = targets.map((target) => {
        if (target.type === "custom") {
          return runParallelAction(
            removeCustomResourceMetadata(context, target, metadataType, key)
          );
        }
        return runParallelAction(
          removeBuiltinResourceMetadata(context, target, metadataType, key)
        );
      });

      const results = await Promise.allSettled(promises);
      return {
        success: true,
        results,
        resourceCount: targets.length,
      };
    },
    onSuccess: (_data, variables) => {
      for (const target of variables.targets) {
        invalidateResourceQueries(queryClient, context, target);
      }
    },
  });
}

/**
 * Mutation for batch deleting multiple resources
 */
export function useBatchDeleteResourcesMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      targets,
    }: {
      targets: (CustomResourceTarget | BuiltinResourceTarget)[];
    }) => {
      const promises = targets.map((target) => {
        if (target.type === "custom") {
          return runParallelAction(deleteCustomResource(context, target));
        }
        return runParallelAction(deleteBuiltinResource(context, target));
      });

      const results = await Promise.allSettled(promises);
      return {
        success: true,
        results,
        resourceCount: targets.length,
      };
    },
    onSuccess: (_data, variables) => {
      for (const target of variables.targets) {
        invalidateResourceQueries(queryClient, context, target);
      }
    },
  });
}

/**
 * Mutation for deleting resources by label selector
 */
export function useDeleteResourcesByLabelSelectorMutation(
  context: K8sApiContext
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      target,
    }: {
      target: (CustomResourceTarget | BuiltinResourceTarget) & {
        labelSelector: string;
      };
    }) => {
      if (target.type === "custom") {
        return await runParallelAction(
          deleteCustomResourcesByLabelSelector(context, target)
        );
      }
      return await runParallelAction(
        deleteBuiltinResourcesByLabelSelector(context, target)
      );
    },
    onSuccess: (_data, variables) => {
      invalidateResourceQueries(queryClient, context, variables.target);
    },
  });
}

/**
 * Mutation for applying instance YAML
 */
export function useApplyInstanceYamlMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ yamlContent }: { yamlContent: string }) => {
      return await runParallelAction(applyInstanceYaml(context, yamlContent));
    },
    onSuccess: () => {
      const instanceConfig = CUSTOM_RESOURCES.instance;
      if (instanceConfig) {
        invalidateResourceQueries(queryClient, context, {
          type: "custom",
          group: instanceConfig.group,
          version: instanceConfig.version,
          plural: instanceConfig.plural,
        });
      }
    },
  });
}

/**
 * Mutation for deleting instance-related resources
 */
export function useDeleteInstanceRelatedMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ instanceName }: { instanceName: string }) => {
      // 1. Get all resources related to the instance
      const instanceResources = await getInstanceRelatedResources(
        context,
        instanceName
      );

      let allResourcesToDelete: any[] = [...instanceResources];
      let allPromises: Promise<any[]>[] = [];

      // 2. For some resource types, get their related resources
      instanceResources.forEach((resource: any) => {
        const kind = resource.kind;
        const name = resource.metadata.name;

        if (kind === "Deployment") {
          allPromises.push(getDeployRelatedResources(context, name));
        } else if (kind === "StatefulSet") {
          allPromises.push(getStatefulsetRelatedResources(context, name));
        } else if (kind === "Cluster") {
          allPromises.push(getClusterRelatedResources(context, name));
        } else if (kind === "Devbox") {
          allPromises.push(getDevboxRelatedResources(context, name));
        }
      });

      const nestedResults = await Promise.all(allPromises);
      nestedResults.forEach((resources) => {
        allResourcesToDelete.push(...resources);
      });

      // 3. Deduplicate resources
      allResourcesToDelete = _.uniqWith(
        allResourcesToDelete,
        (a, b) => a.metadata.uid === b.metadata.uid
      );

      // 4. Delete all resources
      const deletionPromises = allResourcesToDelete
        .map((resource: any) => {
          if (!resource.metadata?.name) {
            return null;
          }

          const apiVersion = resource.apiVersion;
          const kind = resource.kind;
          const name = resource.metadata.name;

          if (apiVersion && apiVersion.includes("/")) {
            // Custom resource
            const [group, version] = apiVersion.split("/");
            // Convert kind to plural (basic pluralization)
            const plural = kind.toLowerCase() + "s";

            return runParallelAction(
              deleteCustomResource(context, {
                type: "custom",
                group,
                version,
                plural,
                name,
              })
            );
          } else {
            // Builtin resource - map kind to resource type
            const resourceTypeMap: Record<string, string> = {
              Deployment: "deployment",
              Service: "service",
              Ingress: "ingress",
              StatefulSet: "statefulset",
              DaemonSet: "daemonset",
              ConfigMap: "configmap",
              Secret: "secret",
              Pod: "pod",
              PersistentVolumeClaim: "pvc",
              HorizontalPodAutoscaler: "horizontalpodautoscaler",
              Role: "role",
              RoleBinding: "rolebinding",
              ServiceAccount: "serviceaccount",
              Job: "job",
              CronJob: "cronjob",
            };

            const resourceType = resourceTypeMap[kind];
            if (resourceType) {
              return runParallelAction(
                deleteBuiltinResource(context, {
                  type: "builtin",
                  resourceType,
                  name,
                })
              );
            }
          }
          return null;
        })
        .filter((p) => p !== null);

      const results = await Promise.allSettled(deletionPromises);
      const deletedCount = results.filter(
        (r) => r.status === "fulfilled"
      ).length;

      return {
        success: true,
        instanceName,
        deletedCount,
        results,
      };
    },
    onSuccess: (_data, variables) => {
      // Invalidate all resource queries
      queryClient.invalidateQueries({
        queryKey: ["k8s"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
    },
  });
}

/**
 * Mutation for deleting cluster-related resources
 */
export function useDeleteClusterRelatedMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clusterName }: { clusterName: string }) => {
      const relatedResources = await getClusterRelatedResources(
        context,
        clusterName
      );

      const deletionPromises = relatedResources
        .map((resource: any) => {
          if (!resource.metadata?.name) {
            return null;
          }

          const apiVersion = resource.apiVersion;
          const kind = resource.kind;
          const name = resource.metadata.name;

          if (apiVersion && apiVersion.includes("/")) {
            // Custom resource
            const [group, version] = apiVersion.split("/");
            // Convert kind to plural (basic pluralization)
            const plural = kind.toLowerCase() + "s";

            return runParallelAction(
              deleteCustomResource(context, {
                type: "custom",
                group,
                version,
                plural,
                name,
              })
            );
          } else {
            // Builtin resource - map kind to resource type
            const resourceTypeMap: Record<string, string> = {
              Role: "role",
              RoleBinding: "rolebinding",
              ServiceAccount: "serviceaccount",
              Secret: "secret",
            };

            const resourceType = resourceTypeMap[kind];
            if (resourceType) {
              return runParallelAction(
                deleteBuiltinResource(context, {
                  type: "builtin",
                  resourceType,
                  name,
                })
              );
            }
          }
          return null;
        })
        .filter((p) => p !== null);

      const results = await Promise.allSettled(deletionPromises);
      const deletedCount = results.filter(
        (r) => r.status === "fulfilled"
      ).length;

      return {
        success: true,
        clusterName,
        deletedCount,
        results,
      };
    },
    onSuccess: (_data, variables) => {
      // Invalidate all resource queries
      queryClient.invalidateQueries({
        queryKey: ["k8s"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
    },
  });
}

/**
 * Mutation for deleting a list of resources, or all resources matching a label selector.
 * It fetches resources by label selector if a list of resources is not provided.
 * Then, it deletes the resources one by one by name for more granular control and feedback.
 */
export function useBulkDeleteResourcesMutation(
  context: K8sApiContext
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      labelSelector,
      resources,
    }: {
      labelSelector?: string;
      resources?: any; // Optional pre-fetched resources to avoid server action serialization issues
    }) => {
      let allResourceItems: any[] = [];

      if (resources) {
        // Use pre-fetched resources if provided
        // Process builtin resources
        Object.entries(resources.builtin || {}).forEach(
          ([name, resourceList]: [string, any]) => {
            if (resourceList && resourceList.items) {
              allResourceItems.push(...resourceList.items);
            }
          }
        );

        // Process custom resources
        Object.entries(resources.custom || {}).forEach(
          ([name, resourceList]: [string, any]) => {
            if (resourceList && resourceList.items) {
              allResourceItems.push(...resourceList.items);
            }
          }
        );
      } else if (labelSelector) {
        // Fetch all resources if not provided
        const fetchedResources = await listAllResources(context, labelSelector);
        if (fetchedResources) {
          Object.values(fetchedResources.builtin).forEach((resourceList: any) => {
            if (resourceList && resourceList.items) {
              allResourceItems.push(...resourceList.items);
            }
          });
          Object.values(fetchedResources.custom).forEach((resourceList: any) => {
            if (resourceList && resourceList.items) {
              allResourceItems.push(...resourceList.items);
            }
          });
        }
      } else {
        throw new Error("Either 'resources' or 'labelSelector' must be provided for bulk deletion.");
      }

      if (allResourceItems.length === 0) {
        return { success: true, deletedCount: 0, results: [] };
      }

      // Delete resources individually by name for granular control
      const deletionPromises: Promise<any>[] = [];

      for (const resource of allResourceItems) {
        if (!resource.metadata?.name) {
          continue;
        }

        // Determine if it's a custom or builtin resource
        const apiVersion = resource.apiVersion;
        const kind = resource.kind;
        const name = resource.metadata.name;

        if (apiVersion && apiVersion.includes("/")) {
          // Custom resource
          const [group, version] = apiVersion.split("/");
          // Convert kind to plural (basic pluralization)
          const plural = kind.toLowerCase() + "s";

          deletionPromises.push(
            runParallelAction(
              deleteCustomResource(context, {
                type: "custom",
                group,
                version,
                plural,
                name,
              })
            )
          );
        } else {
          // Builtin resource - map kind to resource type
          const resourceTypeMap: Record<string, string> = {
            Deployment: "deployment",
            Service: "service",
            Ingress: "ingress",
            StatefulSet: "statefulset",
            DaemonSet: "daemonset",
            ConfigMap: "configmap",
            Secret: "secret",
            Pod: "pod",
            PersistentVolumeClaim: "pvc",
            HorizontalPodAutoscaler: "horizontalpodautoscaler",
            Role: "role",
            RoleBinding: "rolebinding",
            ServiceAccount: "serviceaccount",
            Job: "job",
            CronJob: "cronjob",
          };

          const resourceType = resourceTypeMap[kind];
          if (resourceType) {
            deletionPromises.push(
              runParallelAction(
                deleteBuiltinResource(context, {
                  type: "builtin",
                  resourceType,
                  name,
                })
              )
            );
          }
        }
      }

      const results = await Promise.allSettled(deletionPromises);
      const deletedCount = results.filter(
        (r) => r.status === "fulfilled"
      ).length;

      const result = { success: true, deletedCount, results };
      return result;
    },
    onSuccess: (data) => {
      // Invalidate all resource queries since we don't know exactly what was deleted
      queryClient.invalidateQueries({
        queryKey: ["k8s"],
      });
    },
    onError: (error) => {
      // Invalidate all resource queries since we don't know exactly what was deleted
      queryClient.invalidateQueries({
        queryKey: ["k8s"],
      });
    },
  });
}

/**
 * Mutation for deleting all resources related to a project.
 * This function takes the resources returned by the project-relevance algorithm
 * and converts them to resource targets before deletion.
 */
export function useDeleteAllResourcesMutation(
  context: K8sApiContext
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      resources,
    }: {
      resources: any; // Resources from project-relevance algorithm
    }) => {
      // Flatten project resources to individual K8s resources
      const flattenedResources = flattenProjectResources(resources);
      
      // Convert each resource to resource target using the utility function
      const allResourceTargets = flattenedResources
        .map(convertAndFilterResourceToTarget)
        .filter(Boolean) as (CustomResourceTarget | BuiltinResourceTarget)[];

      if (allResourceTargets.length === 0) {
        return { success: true, deletedCount: 0, results: [] };
      }

      // Delete all resources directly
      const promises = allResourceTargets.map((target) => {
        if (target.type === "custom") {
          return runParallelAction(deleteCustomResource(context, target));
        }
        return runParallelAction(deleteBuiltinResource(context, target));
      });

      const results = await Promise.allSettled(promises);
      const deletedCount = results.filter(
        (r) => r.status === "fulfilled"
      ).length;

      return {
        success: true,
        deletedCount,
        results,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["k8s"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: ["k8s"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
    },
  });
}
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
 * Mutation for adding environment variables to a Kubernetes resource
 * Supports both direct values and secret references
 */
export function useAddEnvToResourceMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      target,
      envVars,
    }: {
      target: ResourceTarget;
      envVars: EnvVar[];
    }) => {
      // Get the current resource to patch
      const currentResource = (await (target.type === "custom"
        ? runParallelAction(
            getCustomResource(context, target as CustomResourceTarget)
          )
        : runParallelAction(
            getBuiltinResource(context, target as BuiltinResourceTarget)
          ))) as any;

      if (!currentResource) {
        throw new Error("Resource not found");
      }

      // Find the container spec path based on resource type
      let containerPath: string;
      if (currentResource.kind === "Deployment") {
        containerPath = "/spec/template/spec/containers";
      } else if (currentResource.kind === "StatefulSet") {
        containerPath = "/spec/template/spec/containers";
      } else if (currentResource.kind === "DaemonSet") {
        containerPath = "/spec/template/spec/containers";
      } else if (currentResource.kind === "Job") {
        containerPath = "/spec/template/spec/containers";
      } else if (currentResource.kind === "CronJob") {
        containerPath = "/spec/jobTemplate/spec/template/spec/containers";
      } else {
        throw new Error(`Unsupported resource type: ${currentResource.kind}`);
      }

      // Build the patch operations
      const patchOps: any[] = [];

      // For each environment variable, add it to all containers
      const containers =
        currentResource.spec?.template?.spec?.containers ||
        currentResource.spec?.jobTemplate?.spec?.template?.spec?.containers ||
        [];

      containers.forEach((container: any, containerIndex: number) => {
        const envPath = `${containerPath}/${containerIndex}/env`;
        const currentEnv = container.env || [];

        envVars.forEach((envVar) => {
          // Check if env var already exists
          const existingIndex = currentEnv.findIndex(
            (e: any) => e.name === envVar.key
          );

          const envVarSpec = {
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

        // Ensure env array exists if it doesn't
        if (!container.env) {
          patchOps.unshift({
            op: "add",
            path: `${containerPath}/${containerIndex}/env`,
            value: [],
          });
        }
      });

      // Apply the patch
      const result = await (target.type === "custom"
        ? runParallelAction(
            patchCustomResource(
              context,
              target as CustomResourceTarget,
              patchOps
            )
          )
        : runParallelAction(
            patchBuiltinResource(
              context,
              target as BuiltinResourceTarget,
              patchOps
            )
          ));

      return result;
    },
    onSuccess: (_data, variables) => {
      invalidateResourceQueries(queryClient, context, variables.target);
    },
  });
}
