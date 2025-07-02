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
import { getDecodedKubeconfig } from "./k8s-utils";
import type {
  BatchPatchRequest,
  BatchRemoveRequest,
  PatchCustomResourceMetadataRequest,
  PatchCustomResourceRequest,
  PatchDeploymentMetadataRequest,
  RemoveCustomResourceMetadataRequest,
  RemoveDeploymentMetadataRequest,
} from "./schemas";

export function usePatchCustomResourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: PatchCustomResourceRequest) => {
      const decodedKc = getDecodedKubeconfig();
      return runParallelAction(
        patchCustomResource(
          decodedKc,
          request.group,
          request.version,
          request.namespace,
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
          variables.namespace,
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
          variables.namespace,
          variables.plural,
        ],
      });
    },
  });
}

export function usePatchCustomResourceMetadataMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: PatchCustomResourceMetadataRequest) => {
      const decodedKc = getDecodedKubeconfig();
      return runParallelAction(
        patchCustomResourceMetadata(
          decodedKc,
          request.group,
          request.version,
          request.namespace,
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
          variables.namespace,
          variables.plural,
          variables.name,
        ],
      });
    },
  });
}

export function useRemoveCustomResourceMetadataMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: RemoveCustomResourceMetadataRequest) => {
      const decodedKc = getDecodedKubeconfig();
      return runParallelAction(
        removeCustomResourceMetadata(
          decodedKc,
          request.group,
          request.version,
          request.namespace,
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
          variables.namespace,
          variables.plural,
          variables.name,
        ],
      });
    },
  });
}

export function usePatchDeploymentMetadataMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: PatchDeploymentMetadataRequest) => {
      const decodedKc = getDecodedKubeconfig();
      return runParallelAction(
        patchDeploymentMetadata(
          decodedKc,
          request.namespace,
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
          variables.namespace,
          variables.name,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["k8s", "deployments", "list", variables.namespace],
      });
    },
  });
}

export function useRemoveDeploymentMetadataMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: RemoveDeploymentMetadataRequest) => {
      const decodedKc = getDecodedKubeconfig();
      return runParallelAction(
        removeDeploymentMetadata(
          decodedKc,
          request.namespace,
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
          variables.namespace,
          variables.name,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["k8s", "deployments", "list", variables.namespace],
      });
    },
  });
}

export function useBatchPatchResourcesMetadataMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: BatchPatchRequest) => {
      const decodedKc = getDecodedKubeconfig();

      // Execute all mutations in parallel
      const promises = request.resources.map((resource) => {
        if ("type" in resource && resource.type === "custom") {
          return runParallelAction(
            patchCustomResourceMetadata(
              decodedKc,
              resource.group,
              resource.version,
              resource.namespace,
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
              decodedKc,
              resource.namespace,
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
              resource.namespace,
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
              resource.namespace,
              resource.plural,
            ],
          });
        } else {
          queryClient.invalidateQueries({
            queryKey: [
              "k8s",
              "deployments",
              "get",
              resource.namespace,
              resource.name,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: ["k8s", "deployments", "list", resource.namespace],
          });
        }
      }

      // Also invalidate the all-resources query for affected namespaces
      const namespaces = [
        ...new Set(variables.resources.map((r) => r.namespace)),
      ];
      for (const namespace of namespaces) {
        queryClient.invalidateQueries({
          queryKey: ["k8s", "all-resources", "list", namespace],
        });
      }
    },
  });
}

export function useBatchRemoveResourcesMetadataMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: BatchRemoveRequest) => {
      const decodedKc = getDecodedKubeconfig();

      // Execute all mutations in parallel
      const promises = request.resources.map((resource) => {
        if ("type" in resource && resource.type === "custom") {
          return runParallelAction(
            removeCustomResourceMetadata(
              decodedKc,
              resource.group,
              resource.version,
              resource.namespace,
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
              decodedKc,
              resource.namespace,
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
              resource.namespace,
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
              resource.namespace,
              resource.plural,
            ],
          });
        } else {
          queryClient.invalidateQueries({
            queryKey: [
              "k8s",
              "deployments",
              "get",
              resource.namespace,
              resource.name,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: ["k8s", "deployments", "list", resource.namespace],
          });
        }
      }

      // Also invalidate the all-resources query for affected namespaces
      const namespaces = [
        ...new Set(variables.resources.map((r) => r.namespace)),
      ];
      for (const namespace of namespaces) {
        queryClient.invalidateQueries({
          queryKey: ["k8s", "all-resources", "list", namespace],
        });
      }
    },
  });
}
