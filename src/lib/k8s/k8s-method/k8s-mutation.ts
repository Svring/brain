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
} from "../k8s-api/k8s-api-mutation";
import { K8sApiContext } from "../k8s-api/k8s-api-schemas/context-schemas";
import {
  BuiltinResourceTarget,
  CustomResourceTarget,
} from "../k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { CUSTOM_RESOURCES } from "../k8s-constant/k8s-constant-custom-resource";
import { invalidateResourceQueries } from "../k8s-api/k8s-api-utils";

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
      target: (CustomResourceTarget | BuiltinResourceTarget) & { name: string };
    }) => {
      if (target.type === "custom") {
        return await runParallelAction(deleteCustomResource(context, target));
      }
      return await runParallelAction(deleteBuiltinResource(context, target));
    },
    onSuccess: (_data, variables) => {
      invalidateResourceQueries(queryClient, context, variables.target);
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
      targets: ((CustomResourceTarget | BuiltinResourceTarget) & {
        name: string;
      })[];
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
      const labelSelector = `app.kubernetes.io/managed-by=${instanceName}`;

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
            labelSelector: `app=${instanceName}`,
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
      const labelSelector = `app.kubernetes.io/instance=${instanceName}`;

      // Phase 1: Delete backups if available
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
