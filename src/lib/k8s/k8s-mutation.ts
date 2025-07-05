"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  patchBuiltinResourceMetadata,
  patchCustomResource,
  patchCustomResourceMetadata,
  removeBuiltinResourceMetadata,
  removeCustomResourceMetadata,
} from "./k8s-api";
import type {
  BatchPatchRequest,
  BatchRemoveRequest,
  K8sApiContext,
  PatchBuiltinResourceMetadataRequest,
  PatchCustomResourceMetadataRequest,
  PatchCustomResourceRequest,
  RemoveBuiltinResourceMetadataRequest,
  RemoveCustomResourceMetadataRequest,
} from "./schemas";

export function usePatchCustomResourceMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: PatchCustomResourceRequest) => {
      return runParallelAction(
        patchCustomResource(
          context.kubeconfig,
          request.group,
          request.version,
          context.namespace,
          request.plural,
          request.name,
          request.patchBody
        )
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "custom-resource",
          "get",
          variables.group,
          variables.version,
          context.namespace,
          variables.plural,
          variables.name,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "custom-resource",
          "list",
          variables.group,
          variables.version,
          context.namespace,
          variables.plural,
        ],
      });
    },
  });
}

export function usePatchCustomResourceMetadataMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: PatchCustomResourceMetadataRequest) => {
      return runParallelAction(
        patchCustomResourceMetadata(
          context.kubeconfig,
          request.group,
          request.version,
          context.namespace,
          request.plural,
          request.name,
          request.metadataType,
          request.key,
          request.value
        )
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "custom-resource",
          "get",
          variables.group,
          variables.version,
          context.namespace,
          variables.plural,
          variables.name,
        ],
      });
    },
  });
}

export function useRemoveCustomResourceMetadataMutation(
  context: K8sApiContext
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: RemoveCustomResourceMetadataRequest) => {
      return runParallelAction(
        removeCustomResourceMetadata(
          context.kubeconfig,
          request.group,
          request.version,
          context.namespace,
          request.plural,
          request.name,
          request.metadataType,
          request.key
        )
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "custom-resource",
          "get",
          variables.group,
          variables.version,
          context.namespace,
          variables.plural,
          variables.name,
        ],
      });
    },
  });
}

export function usePatchBuiltinResourceMetadataMutation(
  context: K8sApiContext
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: PatchBuiltinResourceMetadataRequest) => {
      return runParallelAction(
        patchBuiltinResourceMetadata(
          context.kubeconfig,
          context.namespace,
          request.resourceType,
          request.name,
          request.metadataType,
          request.key,
          request.value
        )
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "builtin-resource",
          "get",
          variables.resourceType,
          context.namespace,
          variables.name,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "builtin-resource",
          "list",
          variables.resourceType,
          context.namespace,
        ],
      });
    },
  });
}

export function useRemoveBuiltinResourceMetadataMutation(
  context: K8sApiContext
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: RemoveBuiltinResourceMetadataRequest) => {
      return runParallelAction(
        removeBuiltinResourceMetadata(
          context.kubeconfig,
          context.namespace,
          request.resourceType,
          request.name,
          request.metadataType,
          request.key
        )
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "builtin-resource",
          "get",
          variables.resourceType,
          context.namespace,
          variables.name,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "k8s",
          "builtin-resource",
          "list",
          variables.resourceType,
          context.namespace,
        ],
      });
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
