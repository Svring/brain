"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  deleteBuiltinResource,
  deleteCustomResource,
  patchBuiltinResourceMetadata,
  patchCustomResourceMetadata,
  removeBuiltinResourceMetadata,
  removeCustomResourceMetadata,
} from "./k8s-api";
import type {
  BatchDeleteRequest,
  BatchPatchRequest,
  BatchRemoveRequest,
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
