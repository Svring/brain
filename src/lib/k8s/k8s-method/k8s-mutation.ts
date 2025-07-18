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
import { K8sApiContext } from "../k8s-api/k8s-api-schemas/context-schemas";
import {
  BuiltinResourceTarget,
  CustomResourceTarget,
  ResourceTarget,
} from "../k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { CUSTOM_RESOURCES } from "../k8s-constant/k8s-constant-custom-resource";
import { invalidateResourceQueries } from "./k8s-utils";
import {
  PROJECT_RELATE_RESOURCE_LABELS,
  CLUSTER_RELATE_RESOURCE_LABELS,
} from "../k8s-constant/k8s-constant-label";

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
      const labelSelector = `${PROJECT_RELATE_RESOURCE_LABELS.MANAGED_BY}=${instanceName}`;

      // Phase 1: Delete dependent resources
      const dependentResults = await Promise.allSettled([
        // Delete services by label selector
        runParallelAction(
          deleteBuiltinResourcesByLabelSelector(context, {
            type: "builtin",
            resourceType: "service",
            labelSelector,
          })
        ),
        // Delete ingresses by label selector
        runParallelAction(
          deleteBuiltinResourcesByLabelSelector(context, {
            type: "builtin",
            resourceType: "ingress",
            labelSelector,
          })
        ),
        // Delete PVCs by label selector
        runParallelAction(
          deleteBuiltinResourcesByLabelSelector(context, {
            type: "builtin",
            resourceType: "pvc",
            labelSelector: `${PROJECT_RELATE_RESOURCE_LABELS.APP}=${instanceName}`,
          })
        ),
        // Delete cert-manager resources if available
        ...(CUSTOM_RESOURCES.issuers
          ? [
              runParallelAction(
                deleteCustomResourcesByLabelSelector(context, {
                  type: "custom",
                  group: CUSTOM_RESOURCES.issuers.group,
                  version: CUSTOM_RESOURCES.issuers.version,
                  plural: CUSTOM_RESOURCES.issuers.plural,
                  labelSelector,
                })
              ),
            ]
          : []),
        ...(CUSTOM_RESOURCES.certificates
          ? [
              runParallelAction(
                deleteCustomResourcesByLabelSelector(context, {
                  type: "custom",
                  group: CUSTOM_RESOURCES.certificates.group,
                  version: CUSTOM_RESOURCES.certificates.version,
                  plural: CUSTOM_RESOURCES.certificates.plural,
                  labelSelector,
                })
              ),
            ]
          : []),
        // Delete configmap and secret by name
        runParallelAction(
          deleteBuiltinResource(context, {
            type: "builtin",
            resourceType: "configmap",
            name: instanceName,
          })
        ),
        runParallelAction(
          deleteBuiltinResource(context, {
            type: "builtin",
            resourceType: "secret",
            name: instanceName,
          })
        ),
        // Delete other resources by name
        runParallelAction(
          deleteBuiltinResource(context, {
            type: "builtin",
            resourceType: "horizontalpodautoscaler",
            name: instanceName,
          })
        ),
        runParallelAction(
          deleteBuiltinResource(context, {
            type: "builtin",
            resourceType: "job",
            name: instanceName,
          })
        ),
        runParallelAction(
          deleteBuiltinResource(context, {
            type: "builtin",
            resourceType: "cronjob",
            name: instanceName,
          })
        ),
        // Delete App custom resource if available
        ...(CUSTOM_RESOURCES.app
          ? [
              runParallelAction(
                deleteCustomResource(context, {
                  type: "custom",
                  group: CUSTOM_RESOURCES.app.group,
                  version: CUSTOM_RESOURCES.app.version,
                  plural: CUSTOM_RESOURCES.app.plural,
                  name: instanceName,
                })
              ),
            ]
          : []),
      ]);

      // Phase 2: Delete main workload resources
      const workloadResults = await Promise.allSettled([
        runParallelAction(
          deleteBuiltinResource(context, {
            type: "builtin",
            resourceType: "deployment",
            name: instanceName,
          })
        ),
        runParallelAction(
          deleteBuiltinResource(context, {
            type: "builtin",
            resourceType: "statefulset",
            name: instanceName,
          })
        ),
      ]);

      return {
        success: true,
        instanceName,
        dependentResults,
        workloadResults,
      };
    },
    onSuccess: (_data, variables) => {
      // Invalidate all resource queries
      // For each resource type, use invalidateResourceQueries
      const resourceTypes = [
        "deployment",
        "service",
        "ingress",
        "statefulset",
        "configmap",
        "secret",
        "pvc",
        "horizontalpodautoscaler",
        "job",
        "cronjob",
      ];
      for (const resourceType of resourceTypes) {
        invalidateResourceQueries(queryClient, context, {
          type: "builtin",
          resourceType,
        });
      }
      if (CUSTOM_RESOURCES.issuers) {
        invalidateResourceQueries(queryClient, context, {
          type: "custom",
          group: CUSTOM_RESOURCES.issuers.group,
          version: CUSTOM_RESOURCES.issuers.version,
          plural: CUSTOM_RESOURCES.issuers.plural,
        });
      }
      if (CUSTOM_RESOURCES.certificates) {
        invalidateResourceQueries(queryClient, context, {
          type: "custom",
          group: CUSTOM_RESOURCES.certificates.group,
          version: CUSTOM_RESOURCES.certificates.version,
          plural: CUSTOM_RESOURCES.certificates.plural,
        });
      }
      if (CUSTOM_RESOURCES.app) {
        invalidateResourceQueries(queryClient, context, {
          type: "custom",
          group: CUSTOM_RESOURCES.app.group,
          version: CUSTOM_RESOURCES.app.version,
          plural: CUSTOM_RESOURCES.app.plural,
        });
      }
    },
  });
}

/**
 * Mutation for deleting cluster-related resources
 */
export function useDeleteClusterRelatedMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ instanceName }: { instanceName: string }) => {
      const labelSelector = `${CLUSTER_RELATE_RESOURCE_LABELS.APP_KUBERNETES_INSTANCE}=${instanceName}`;

      // Phase 1: Delete backups if available
      // NOTE: no reference for backup
      const backupResults = CUSTOM_RESOURCES.backups
        ? await runParallelAction(
            deleteCustomResourcesByLabelSelector(context, {
              type: "custom",
              group: CUSTOM_RESOURCES.backups.group,
              version: CUSTOM_RESOURCES.backups.version,
              plural: CUSTOM_RESOURCES.backups.plural,
              labelSelector,
            })
          )
        : { success: true, deletedCount: 0, results: [] };

      // Phase 2: Delete export service
      // FIXME: All services have reference to statefulset owner, so this could be removed.
      const exportServiceResult = await Promise.allSettled([
        runParallelAction(
          deleteBuiltinResource(context, {
            type: "builtin",
            resourceType: "service",
            name: `${instanceName}-export`,
          })
        ),
      ]);

      // Phase 3: Delete RBAC resources
      const rbacResults = await Promise.allSettled([
        runParallelAction(
          deleteBuiltinResource(context, {
            type: "builtin",
            resourceType: "role",
            name: instanceName,
          })
        ),
        runParallelAction(
          deleteBuiltinResource(context, {
            type: "builtin",
            resourceType: "rolebinding",
            name: instanceName,
          })
        ),
        runParallelAction(
          deleteBuiltinResource(context, {
            type: "builtin",
            resourceType: "serviceaccount",
            name: instanceName,
          })
        ),
      ]);

      // Phase 4: Delete the cluster if available
      const clusterResult = CUSTOM_RESOURCES.cluster
        ? await runParallelAction(
            deleteCustomResource(context, {
              type: "custom",
              group: CUSTOM_RESOURCES.cluster.group,
              version: CUSTOM_RESOURCES.cluster.version,
              plural: CUSTOM_RESOURCES.cluster.plural,
              name: instanceName,
            })
          )
        : { success: true, notFound: true };

      return {
        success: true,
        instanceName,
        backupResults,
        exportServiceResult,
        rbacResults,
        clusterResult,
      };
    },
    onSuccess: (_data, variables) => {
      // Invalidate all resource queries
      const resourceTypes = [
        "role",
        "rolebinding",
        "serviceaccount",
        "service",
      ];
      for (const resourceType of resourceTypes) {
        invalidateResourceQueries(queryClient, context, {
          type: "builtin",
          resourceType,
        });
      }
      if (CUSTOM_RESOURCES.backups) {
        invalidateResourceQueries(queryClient, context, {
          type: "custom",
          group: CUSTOM_RESOURCES.backups.group,
          version: CUSTOM_RESOURCES.backups.version,
          plural: CUSTOM_RESOURCES.backups.plural,
        });
      }
      if (CUSTOM_RESOURCES.cluster) {
        invalidateResourceQueries(queryClient, context, {
          type: "custom",
          group: CUSTOM_RESOURCES.cluster.group,
          version: CUSTOM_RESOURCES.cluster.version,
          plural: CUSTOM_RESOURCES.cluster.plural,
        });
      }
    },
  });
}

/**
 * Mutation for deleting all resources marked by a specific label selector
 * This is used as the final step in project deletion to clean up any remaining resources
 */
export function useDeleteAllResourcesByLabelSelectorMutation(
  context: K8sApiContext
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      labelSelector,
      resources,
    }: {
      labelSelector: string;
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
      }

      if (allResourceItems.length === 0) {
        return { success: true, deletedCount: 0, results: [] };
      }

      // Group resources by type and delete them
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
