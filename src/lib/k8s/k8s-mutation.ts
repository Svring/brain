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
import { getDecodedKubeconfig, getUserKubeconfig } from "./k8s-utils";
import type { BatchPatchRequest, BatchRemoveRequest } from "./schemas";

export function usePatchCustomResourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      group,
      version,
      namespace,
      plural,
      name,
      patchBody,
    }: {
      group: string;
      version: string;
      namespace: string;
      plural: string;
      name: string;
      patchBody: unknown[];
    }) => {
      const kc = getUserKubeconfig();
      if (!kc) {
        throw new Error("Kubeconfig not available");
      }
      const decodedKc = getDecodedKubeconfig(kc);
      return runParallelAction(
        patchCustomResource(
          decodedKc,
          group,
          version,
          namespace,
          plural,
          name,
          patchBody
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
    mutationFn: ({
      group,
      version,
      namespace,
      plural,
      name,
      metadataType,
      key,
      value,
    }: {
      group: string;
      version: string;
      namespace: string;
      plural: string;
      name: string;
      metadataType: "annotations" | "labels";
      key: string;
      value: string;
    }) => {
      const kc = getUserKubeconfig();
      if (!kc) {
        throw new Error("Kubeconfig not available");
      }
      const decodedKc = getDecodedKubeconfig(kc);
      return runParallelAction(
        patchCustomResourceMetadata(
          decodedKc,
          group,
          version,
          namespace,
          plural,
          name,
          metadataType,
          key,
          value
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
    mutationFn: ({
      group,
      version,
      namespace,
      plural,
      name,
      metadataType,
      key,
    }: {
      group: string;
      version: string;
      namespace: string;
      plural: string;
      name: string;
      metadataType: "annotations" | "labels";
      key: string;
    }) => {
      const kc = getUserKubeconfig();
      if (!kc) {
        throw new Error("Kubeconfig not available");
      }
      const decodedKc = getDecodedKubeconfig(kc);
      return runParallelAction(
        removeCustomResourceMetadata(
          decodedKc,
          group,
          version,
          namespace,
          plural,
          name,
          metadataType,
          key
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
    mutationFn: ({
      namespace,
      name,
      metadataType,
      key,
      value,
    }: {
      namespace: string;
      name: string;
      metadataType: "annotations" | "labels";
      key: string;
      value: string;
    }) => {
      const kc = getUserKubeconfig();
      if (!kc) {
        throw new Error("Kubeconfig not available");
      }
      const decodedKc = getDecodedKubeconfig(kc);
      return runParallelAction(
        patchDeploymentMetadata(
          decodedKc,
          namespace,
          name,
          metadataType,
          key,
          value
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
    mutationFn: ({
      namespace,
      name,
      metadataType,
      key,
    }: {
      namespace: string;
      name: string;
      metadataType: "annotations" | "labels";
      key: string;
    }) => {
      const kc = getUserKubeconfig();
      if (!kc) {
        throw new Error("Kubeconfig not available");
      }
      const decodedKc = getDecodedKubeconfig(kc);
      return runParallelAction(
        removeDeploymentMetadata(decodedKc, namespace, name, metadataType, key)
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
    mutationFn: async ({
      resources,
      metadataType,
      key,
      value,
    }: BatchPatchRequest) => {
      const kc = getUserKubeconfig();
      if (!kc) {
        throw new Error("Kubeconfig not available");
      }
      const decodedKc = getDecodedKubeconfig(kc);

      // Execute all mutations in parallel
      const promises = resources.map((resource) => {
        if ("type" in resource && resource.type === "custom") {
          return runParallelAction(
            patchCustomResourceMetadata(
              decodedKc,
              resource.group,
              resource.version,
              resource.namespace,
              resource.plural,
              resource.name,
              metadataType,
              key,
              value
            )
          );
        }
        if ("type" in resource && resource.type === "deployment") {
          return runParallelAction(
            patchDeploymentMetadata(
              decodedKc,
              resource.namespace,
              resource.name,
              metadataType,
              key,
              value
            )
          );
        }
        throw new Error("Unknown resource type");
      });

      const results = await Promise.all(promises);
      return {
        success: true,
        results,
        resourceCount: resources.length,
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
    mutationFn: async ({
      resources,
      metadataType,
      key,
    }: BatchRemoveRequest) => {
      const kc = getUserKubeconfig();
      if (!kc) {
        throw new Error("Kubeconfig not available");
      }
      const decodedKc = getDecodedKubeconfig(kc);

      // Execute all mutations in parallel
      const promises = resources.map((resource) => {
        if ("type" in resource && resource.type === "custom") {
          return runParallelAction(
            removeCustomResourceMetadata(
              decodedKc,
              resource.group,
              resource.version,
              resource.namespace,
              resource.plural,
              resource.name,
              metadataType,
              key
            )
          );
        }
        if ("type" in resource && resource.type === "deployment") {
          return runParallelAction(
            removeDeploymentMetadata(
              decodedKc,
              resource.namespace,
              resource.name,
              metadataType,
              key
            )
          );
        }
        throw new Error("Unknown resource type");
      });

      const results = await Promise.all(promises);
      return {
        success: true,
        results,
        resourceCount: resources.length,
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
