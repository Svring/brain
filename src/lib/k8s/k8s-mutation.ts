"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  patchCustomResource,
  patchCustomResourceMetadata,
  patchDeploymentMetadata,
  removeCustomResourceMetadata,
  removeDeploymentMetadata,
} from "./k8s-api";
import type {
  BatchPatchRequest,
  BatchRemoveRequest,
  K8sApiContext,
  PatchCustomResourceMetadataRequest,
  PatchCustomResourceRequest,
  PatchDeploymentMetadataRequest,
  RemoveCustomResourceMetadataRequest,
  RemoveDeploymentMetadataRequest,
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

export function usePatchDeploymentMetadataMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: PatchDeploymentMetadataRequest) => {
      return runParallelAction(
        patchDeploymentMetadata(
          context.kubeconfig,
          context.namespace,
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
          "deployments",
          "get",
          context.namespace,
          variables.name,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["k8s", "deployments", "list", context.namespace],
      });
    },
  });
}

export function useRemoveDeploymentMetadataMutation(context: K8sApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: RemoveDeploymentMetadataRequest) => {
      return runParallelAction(
        removeDeploymentMetadata(
          context.kubeconfig,
          context.namespace,
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
          "deployments",
          "get",
          context.namespace,
          variables.name,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["k8s", "deployments", "list", context.namespace],
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
        if ("type" in resource && resource.type === "deployment") {
          return runParallelAction(
            patchDeploymentMetadata(
              context.kubeconfig,
              context.namespace,
              resource.name,
              request.metadataType,
              request.key,
              request.value
            )
          );
        }
        throw new Error("Unknown resource type");
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
          queryClient.invalidateQueries({
            queryKey: [
              "k8s",
              "deployments",
              "get",
              context.namespace,
              resource.name,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: ["k8s", "deployments", "list", context.namespace],
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
        if ("type" in resource && resource.type === "deployment") {
          return runParallelAction(
            removeDeploymentMetadata(
              context.kubeconfig,
              context.namespace,
              resource.name,
              request.metadataType,
              request.key
            )
          );
        }
        throw new Error("Unknown resource type");
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
          queryClient.invalidateQueries({
            queryKey: [
              "k8s",
              "deployments",
              "get",
              context.namespace,
              resource.name,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: ["k8s", "deployments", "list", context.namespace],
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
