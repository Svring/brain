"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  applyInstanceYaml,
  deleteBuiltinResource,
  deleteBuiltinResourcesByLabelSelector,
  deleteCustomResource,
  deleteCustomResourcesByLabelSelector,
  patchBuiltinResourceMetadata,
  patchCustomResourceMetadata,
  removeBuiltinResourceMetadata,
  removeCustomResourceMetadata,
} from "./k8s-api";
import {
  CERT_MANAGER_RESOURCES,
  CLUSTER_LABELS,
  KUBEBLOCKS_RESOURCES,
  PROJECT_LABELS,
} from "./k8s-constant";
import type {
  BatchDeleteRequest,
  BatchPatchRequest,
  BatchRemoveRequest,
  DeleteClusterRelatedRequest,
  DeleteInstanceRelatedRequest,
  DeleteResourceRequest,
  K8sApiContext,
  PatchResourceMetadataRequest,
  RemoveResourceMetadataRequest,
} from "./schemas";

export function usePatchResourceMetadataMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: PatchResourceMetadataRequest) => {
      if (request.resource.type === "custom") {
        const result = await runParallelAction(
          patchCustomResourceMetadata(
            context.kubeconfig,
            request.resource.group,
            request.resource.version,
            context.namespace,
            request.resource.plural,
            request.resource.name,
            request.metadataType,
            request.key,
            request.value
          )
        );
        return result;
      }

      // Handle builtin resources
      const result = await runParallelAction(
        patchBuiltinResourceMetadata(
          context.kubeconfig,
          context.namespace,
          request.resource.type,
          request.resource.name,
          request.metadataType,
          request.key,
          request.value
        )
      );
      return result;
    },
    onSuccess: (_data, variables) => {
      if (variables.resource.type === "custom") {
        queryClient.invalidateQueries({
          queryKey: [
            "k8s",
            "custom-resource",
            "get",
            variables.resource.group,
            variables.resource.version,
            context.namespace,
            variables.resource.plural,
            variables.resource.name,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            "k8s",
            "custom-resource",
            "list",
            variables.resource.group,
            variables.resource.version,
            context.namespace,
            variables.resource.plural,
          ],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [
            "k8s",
            "builtin-resource",
            "get",
            variables.resource.type,
            context.namespace,
            variables.resource.name,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            "k8s",
            "builtin-resource",
            "list",
            variables.resource.type,
            context.namespace,
          ],
        });
      }
    },
  });
}

export function useRemoveResourceMetadataMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: RemoveResourceMetadataRequest) => {
      if (request.resource.type === "custom") {
        const result = await runParallelAction(
          removeCustomResourceMetadata(
            context.kubeconfig,
            request.resource.group,
            request.resource.version,
            context.namespace,
            request.resource.plural,
            request.resource.name,
            request.metadataType,
            request.key
          )
        );
        return result;
      }

      // Handle builtin resources
      const result = await runParallelAction(
        removeBuiltinResourceMetadata(
          context.kubeconfig,
          context.namespace,
          request.resource.type,
          request.resource.name,
          request.metadataType,
          request.key
        )
      );
      return result;
    },
    onSuccess: (_data, variables) => {
      if (variables.resource.type === "custom") {
        queryClient.invalidateQueries({
          queryKey: [
            "k8s",
            "custom-resource",
            "get",
            variables.resource.group,
            variables.resource.version,
            context.namespace,
            variables.resource.plural,
            variables.resource.name,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            "k8s",
            "custom-resource",
            "list",
            variables.resource.group,
            variables.resource.version,
            context.namespace,
            variables.resource.plural,
          ],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [
            "k8s",
            "builtin-resource",
            "get",
            variables.resource.type,
            context.namespace,
            variables.resource.name,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            "k8s",
            "builtin-resource",
            "list",
            variables.resource.type,
            context.namespace,
          ],
        });
      }
    },
  });
}

export function useBatchPatchResourcesMetadataMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: BatchPatchRequest) => {
      // Execute all mutations in parallel
      const promises = request.resources.map((resource) => {
        if ("type" in resource && resource.type === "custom") {
          return runParallelAction(
            patchCustomResourceMetadata(
              context.kubeconfig,
              resource.group,
              resource.version,
              context.namespace,
              resource.plural,
              resource.name,
              request.metadataType,
              request.key,
              request.value
            )
          );
        }
        // Handle all builtin resource types
        return runParallelAction(
          patchBuiltinResourceMetadata(
            context.kubeconfig,
            context.namespace,
            resource.type,
            resource.name,
            request.metadataType,
            request.key,
            request.value
          )
        );
      });

      const results = await Promise.all(promises);
      return {
        success: true,
        results,
        resourceCount: request.resources.length,
      };
    },
    onSuccess: (_data, variables) => {
      // Invalidate queries for all affected resources
      for (const resource of variables.resources) {
        if ("type" in resource && resource.type === "custom") {
          queryClient.invalidateQueries({
            queryKey: [
              "k8s",
              "custom-resource",
              "get",
              resource.group,
              resource.version,
              context.namespace,
              resource.plural,
              resource.name,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "k8s",
              "custom-resource",
              "list",
              resource.group,
              resource.version,
              context.namespace,
              resource.plural,
            ],
          });
        } else {
          // Handle all builtin resource types
          queryClient.invalidateQueries({
            queryKey: [
              "k8s",
              "builtin-resource",
              "get",
              resource.type,
              context.namespace,
              resource.name,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "k8s",
              "builtin-resource",
              "list",
              resource.type,
              context.namespace,
            ],
          });
        }
      }

      // Also invalidate the all-resources query for affected namespaces
      queryClient.invalidateQueries({
        queryKey: ["k8s", "all-resources", "list", context.namespace],
      });
    },
  });
}

export function useBatchRemoveResourcesMetadataMutation(
  context: K8sApiContext
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: BatchRemoveRequest) => {
      // Execute all mutations in parallel
      const promises = request.resources.map((resource) => {
        if ("type" in resource && resource.type === "custom") {
          return runParallelAction(
            removeCustomResourceMetadata(
              context.kubeconfig,
              resource.group,
              resource.version,
              context.namespace,
              resource.plural,
              resource.name,
              request.metadataType,
              request.key
            )
          );
        }
        // Handle all builtin resource types
        return runParallelAction(
          removeBuiltinResourceMetadata(
            context.kubeconfig,
            context.namespace,
            resource.type,
            resource.name,
            request.metadataType,
            request.key
          )
        );
      });

      const results = await Promise.all(promises);
      return {
        success: true,
        results,
        resourceCount: request.resources.length,
      };
    },
    onSuccess: (_data, variables) => {
      // Invalidate queries for all affected resources
      for (const resource of variables.resources) {
        if ("type" in resource && resource.type === "custom") {
          queryClient.invalidateQueries({
            queryKey: [
              "k8s",
              "custom-resource",
              "get",
              resource.group,
              resource.version,
              context.namespace,
              resource.plural,
              resource.name,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "k8s",
              "custom-resource",
              "list",
              resource.group,
              resource.version,
              context.namespace,
              resource.plural,
            ],
          });
        } else {
          // Handle all builtin resource types
          queryClient.invalidateQueries({
            queryKey: [
              "k8s",
              "builtin-resource",
              "get",
              resource.type,
              context.namespace,
              resource.name,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "k8s",
              "builtin-resource",
              "list",
              resource.type,
              context.namespace,
            ],
          });
        }
      }

      // Also invalidate the all-resources query for affected namespaces
      queryClient.invalidateQueries({
        queryKey: ["k8s", "all-resources", "list", context.namespace],
      });
    },
  });
}

export function useDeleteResourceMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: DeleteResourceRequest) => {
      if (request.resource.type === "custom") {
        const result = await runParallelAction(
          deleteCustomResource(
            context.kubeconfig,
            request.resource.group,
            request.resource.version,
            context.namespace,
            request.resource.plural,
            request.resource.name
          )
        );
        return result;
      }

      // Handle builtin resources
      const result = await runParallelAction(
        deleteBuiltinResource(
          context.kubeconfig,
          context.namespace,
          request.resource.type,
          request.resource.name
        )
      );
      return result;
    },
    onSuccess: (_data, variables) => {
      if (variables.resource.type === "custom") {
        // Invalidate the specific resource query
        queryClient.invalidateQueries({
          queryKey: [
            "k8s",
            "custom-resource",
            "get",
            variables.resource.group,
            variables.resource.version,
            context.namespace,
            variables.resource.plural,
            variables.resource.name,
          ],
        });
        // Invalidate the list query
        queryClient.invalidateQueries({
          queryKey: [
            "k8s",
            "custom-resource",
            "list",
            variables.resource.group,
            variables.resource.version,
            context.namespace,
            variables.resource.plural,
          ],
        });
      } else {
        // Invalidate the specific resource query
        queryClient.invalidateQueries({
          queryKey: [
            "k8s",
            "builtin-resource",
            "get",
            variables.resource.type,
            context.namespace,
            variables.resource.name,
          ],
        });
        // Invalidate the list query
        queryClient.invalidateQueries({
          queryKey: [
            "k8s",
            "builtin-resource",
            "list",
            variables.resource.type,
            context.namespace,
          ],
        });
      }

      // Also invalidate the all-resources query
      queryClient.invalidateQueries({
        queryKey: ["k8s", "all-resources", "list", context.namespace],
      });
    },
  });
}

export function useBatchDeleteResourcesMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: BatchDeleteRequest) => {
      // Execute all deletions in parallel
      const promises = request.resources.map((resource) => {
        if ("type" in resource && resource.type === "custom") {
          return runParallelAction(
            deleteCustomResource(
              context.kubeconfig,
              resource.group,
              resource.version,
              context.namespace,
              resource.plural,
              resource.name
            )
          );
        }
        // Handle all builtin resource types
        return runParallelAction(
          deleteBuiltinResource(
            context.kubeconfig,
            context.namespace,
            resource.type,
            resource.name
          )
        );
      });

      const results = await Promise.all(promises);
      return {
        success: true,
        results,
        resourceCount: request.resources.length,
      };
    },
    onSuccess: (_data, variables) => {
      // Invalidate queries for all affected resources
      for (const resource of variables.resources) {
        if ("type" in resource && resource.type === "custom") {
          queryClient.invalidateQueries({
            queryKey: [
              "k8s",
              "custom-resource",
              "get",
              resource.group,
              resource.version,
              context.namespace,
              resource.plural,
              resource.name,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "k8s",
              "custom-resource",
              "list",
              resource.group,
              resource.version,
              context.namespace,
              resource.plural,
            ],
          });
        } else {
          // Handle all builtin resource types
          queryClient.invalidateQueries({
            queryKey: [
              "k8s",
              "builtin-resource",
              "get",
              resource.type,
              context.namespace,
              resource.name,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "k8s",
              "builtin-resource",
              "list",
              resource.type,
              context.namespace,
            ],
          });
        }
      }

      // Also invalidate the all-resources query for affected namespaces
      queryClient.invalidateQueries({
        queryKey: ["k8s", "all-resources", "list", context.namespace],
      });
    },
  });
}

export function useDeleteInstanceRelatedMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: DeleteInstanceRelatedRequest) => {
      const { instanceName } = request;

      // Phase 1: Delete dependent resources
      const dependentResults = await Promise.allSettled([
        // Delete services by label selector
        runParallelAction(
          deleteBuiltinResourcesByLabelSelector(
            context.kubeconfig,
            context.namespace,
            "service",
            `${PROJECT_LABELS.APP_DEPLOY_MANAGER}=${instanceName}`
          )
        ),
        // Delete configmap by name
        runParallelAction(
          deleteBuiltinResource(
            context.kubeconfig,
            context.namespace,
            "configmap",
            instanceName
          )
        ),
        // Delete secret by name
        runParallelAction(
          deleteBuiltinResource(
            context.kubeconfig,
            context.namespace,
            "secret",
            instanceName
          )
        ),
        // Delete ingresses by label selector
        runParallelAction(
          deleteBuiltinResourcesByLabelSelector(
            context.kubeconfig,
            context.namespace,
            "ingress",
            `${PROJECT_LABELS.APP_DEPLOY_MANAGER}=${instanceName}`
          )
        ),
        // Delete cert-manager issuers
        runParallelAction(
          deleteCustomResourcesByLabelSelector(
            context.kubeconfig,
            CERT_MANAGER_RESOURCES.issuers.group,
            CERT_MANAGER_RESOURCES.issuers.version,
            context.namespace,
            CERT_MANAGER_RESOURCES.issuers.plural,
            `${PROJECT_LABELS.APP_DEPLOY_MANAGER}=${instanceName}`
          )
        ),
        // Delete cert-manager certificates
        runParallelAction(
          deleteCustomResourcesByLabelSelector(
            context.kubeconfig,
            CERT_MANAGER_RESOURCES.certificates.group,
            CERT_MANAGER_RESOURCES.certificates.version,
            context.namespace,
            CERT_MANAGER_RESOURCES.certificates.plural,
            `${PROJECT_LABELS.APP_DEPLOY_MANAGER}=${instanceName}`
          )
        ),
        // Delete PVCs by label selector (note: different label)
        runParallelAction(
          deleteBuiltinResourcesByLabelSelector(
            context.kubeconfig,
            context.namespace,
            "pvc",
            `${PROJECT_LABELS.APP}=${instanceName}`
          )
        ),
        // Delete HorizontalPodAutoscaler by name
        runParallelAction(
          deleteBuiltinResource(
            context.kubeconfig,
            context.namespace,
            "horizontalpodautoscaler",
            instanceName
          )
        ),
        // Delete Job by name
        runParallelAction(
          deleteBuiltinResource(
            context.kubeconfig,
            context.namespace,
            "job",
            instanceName
          )
        ),
        // Delete CronJob by name
        runParallelAction(
          deleteBuiltinResource(
            context.kubeconfig,
            context.namespace,
            "cronjob",
            instanceName
          )
        ),
        // Delete App custom resource by name
        runParallelAction(
          deleteCustomResource(
            context.kubeconfig,
            "app.sealos.io",
            "v1",
            context.namespace,
            "apps",
            instanceName
          )
        ),
      ]);

      // Check for non-404 errors in dependent resources
      const dependentErrors = dependentResults.filter((result) => {
        if (result.status !== "rejected") return false;

        const error = result.reason;
        // Check various ways 404 errors can be represented
        const is404 =
          error?.code === 404 ||
          error?.response?.status === 404 ||
          error?.message?.includes("404") ||
          error?.message?.includes("not found") ||
          (error?.body &&
            typeof error.body === "string" &&
            error.body.includes('"code":404'));

        return !is404;
      });

      if (dependentErrors.length > 0) {
        throw new Error("Failed to delete dependent resources");
      }

      // Phase 2: Delete main workload resources
      const workloadResults = await Promise.allSettled([
        // Delete deployment by name
        runParallelAction(
          deleteBuiltinResource(
            context.kubeconfig,
            context.namespace,
            "deployment",
            instanceName
          )
        ),
        // Delete statefulset by name
        runParallelAction(
          deleteBuiltinResource(
            context.kubeconfig,
            context.namespace,
            "statefulset",
            instanceName
          )
        ),
      ]);

      // Check for non-404 errors in workload resources
      const workloadErrors = workloadResults.filter((result) => {
        if (result.status !== "rejected") return false;

        const error = result.reason;
        // Check various ways 404 errors can be represented
        const is404 =
          error?.code === 404 ||
          error?.response?.status === 404 ||
          error?.message?.includes("404") ||
          error?.message?.includes("not found") ||
          (error?.body &&
            typeof error.body === "string" &&
            error.body.includes('"code":404'));

        return !is404;
      });

      if (workloadErrors.length > 0) {
        throw new Error("Failed to delete workload resources");
      }

      return {
        success: true,
        instanceName,
        dependentResults,
        workloadResults,
      };
    },
    onSuccess: (_data, variables) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({
        queryKey: ["k8s", "all-resources", "list", context.namespace],
      });

      // Invalidate project-related queries
      queryClient.invalidateQueries({
        queryKey: ["project", "list", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", "get", context.namespace],
      });

      // Invalidate specific resource queries that might have been deleted
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
        queryClient.invalidateQueries({
          queryKey: [
            "k8s",
            "builtin-resource",
            "list",
            resourceType,
            context.namespace,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            "k8s",
            "builtin-resource",
            "get",
            resourceType,
            context.namespace,
            variables.instanceName,
          ],
        });
      }

      // Invalidate custom resource queries
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "custom-resource",
          "list",
          CERT_MANAGER_RESOURCES.issuers.group,
          CERT_MANAGER_RESOURCES.issuers.version,
          context.namespace,
          CERT_MANAGER_RESOURCES.issuers.plural,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "custom-resource",
          "list",
          CERT_MANAGER_RESOURCES.certificates.group,
          CERT_MANAGER_RESOURCES.certificates.version,
          context.namespace,
          CERT_MANAGER_RESOURCES.certificates.plural,
        ],
      });

      // Invalidate app custom resource queries
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "custom-resource",
          "get",
          "app.sealos.io",
          "v1",
          context.namespace,
          "apps",
          variables.instanceName,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "custom-resource",
          "list",
          "app.sealos.io",
          "v1",
          context.namespace,
          "apps",
        ],
      });
    },
  });
}

export function useCreateInstanceMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ yamlContent }: { yamlContent: string }) => {
      const result = await runParallelAction(
        applyInstanceYaml(context.kubeconfig, yamlContent)
      );
      return result;
    },
    onSuccess: () => {
      // Invalidate instance-related queries
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "custom-resource",
          "list",
          "app.sealos.io",
          "v1",
          context.namespace,
          "instances",
        ],
      });

      // Invalidate all-resources query
      queryClient.invalidateQueries({
        queryKey: ["k8s", "all-resources", "list", context.namespace],
      });

      // Invalidate project-related queries
      queryClient.invalidateQueries({
        queryKey: ["project", "list", context.namespace],
      });
    },
  });
}

export function useDeleteClusterRelatedMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: DeleteClusterRelatedRequest) => {
      const { instanceName } = request;

      // Phase 1: Delete backups
      const backupResults = await runParallelAction(
        deleteCustomResourcesByLabelSelector(
          context.kubeconfig,
          KUBEBLOCKS_RESOURCES.backups.group,
          KUBEBLOCKS_RESOURCES.backups.version,
          context.namespace,
          KUBEBLOCKS_RESOURCES.backups.plural,
          `${CLUSTER_LABELS.APP_KUBERNETES_INSTANCE}=${instanceName}`
        )
      );

      // Phase 2: Delete export service
      const exportServiceResult = await Promise.allSettled([
        runParallelAction(
          deleteBuiltinResource(
            context.kubeconfig,
            context.namespace,
            "service",
            `${instanceName}-export`
          )
        ),
      ]);

      // Phase 3: Delete RBAC resources
      const rbacResults = await Promise.allSettled([
        runParallelAction(
          deleteBuiltinResource(
            context.kubeconfig,
            context.namespace,
            "role",
            instanceName
          )
        ),
        runParallelAction(
          deleteBuiltinResource(
            context.kubeconfig,
            context.namespace,
            "rolebinding",
            instanceName
          )
        ),
        runParallelAction(
          deleteBuiltinResource(
            context.kubeconfig,
            context.namespace,
            "serviceaccount",
            instanceName
          )
        ),
      ]);

      // Phase 4: Delete the cluster
      const clusterResult = await runParallelAction(
        deleteCustomResource(
          context.kubeconfig,
          "apps.kubeblocks.io",
          "v1alpha1",
          context.namespace,
          "clusters",
          instanceName
        )
      );

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
      // Invalidate all relevant queries
      queryClient.invalidateQueries({
        queryKey: ["k8s", "all-resources", "list", context.namespace],
      });

      // Invalidate cluster-related queries
      queryClient.invalidateQueries({
        queryKey: ["cluster", "list", context.namespace],
      });
      queryClient.invalidateQueries({
        queryKey: ["cluster", "get", context.namespace],
      });

      // Invalidate specific resource queries that might have been deleted
      const resourceTypes = [
        "role",
        "rolebinding",
        "serviceaccount",
        "service",
      ];

      for (const resourceType of resourceTypes) {
        queryClient.invalidateQueries({
          queryKey: [
            "k8s",
            "builtin-resource",
            "list",
            resourceType,
            context.namespace,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            "k8s",
            "builtin-resource",
            "get",
            resourceType,
            context.namespace,
            variables.instanceName,
          ],
        });
      }

      // Invalidate export service query
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "builtin-resource",
          "get",
          "service",
          context.namespace,
          `${variables.instanceName}-export`,
        ],
      });

      // Invalidate custom resource queries
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "custom-resource",
          "list",
          KUBEBLOCKS_RESOURCES.backups.group,
          KUBEBLOCKS_RESOURCES.backups.version,
          context.namespace,
          KUBEBLOCKS_RESOURCES.backups.plural,
        ],
      });

      // Invalidate cluster custom resource queries
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "custom-resource",
          "get",
          "apps.kubeblocks.io",
          "v1alpha1",
          context.namespace,
          "clusters",
          variables.instanceName,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "custom-resource",
          "list",
          "apps.kubeblocks.io",
          "v1alpha1",
          context.namespace,
          "clusters",
        ],
      });
    },
  });
}
