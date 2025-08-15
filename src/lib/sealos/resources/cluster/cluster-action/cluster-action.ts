"use client";

import { useMutation } from "@tanstack/react-query";
import {
  useCreateClusterMutation,
  useUpdateClusterMutation,
} from "../cluster-method/cluster-mutation";
import { generateClusterName } from "../cluster-utils";
import type { ClusterApiContext } from "../schemas/cluster-api-context-schemas";
import type {
  CreateClusterRequest,
  UpdateClusterRequest,
  ClusterForm,
} from "../cluster-api/cluster-open-api-schemas";

// Partial request types for easier usage
export type PartialClusterCreateRequest = {
  dbType: string; // Required field
  dbVersion: string; // Required field
  dbName?: string;
  replicas?: number;
  cpu?: number;
  memory?: number;
  storage?: number;
  labels?: Record<string, string>;
  terminationPolicy?: "Delete" | "WipeOut";
};

// Partial update request types
export type PartialClusterUpdateRequest = {
  replicas?: number;
  cpu?: number;
  memory?: number;
  storage?: number;
};

/**
 * Custom hook for creating clusters with default values
 */
export function useCreateClusterAction(context: ClusterApiContext) {
  const baseMutation = useCreateClusterMutation(context);

  return useMutation({
    mutationFn: async (partialRequest: PartialClusterCreateRequest) => {
      // Apply defaults to the partial request
      const dbForm: ClusterForm = {
        terminationPolicy: partialRequest.terminationPolicy || "Delete",
        name: partialRequest.dbName || generateClusterName(),
        type: partialRequest.dbType as any, // Cast to ClusterType
        version: partialRequest.dbVersion,
        resource: {
          cpu: `${partialRequest.cpu || 1000}m`,
          memory: `${partialRequest.memory || 2048}Mi`,
          storage: `${partialRequest.storage || 10}Gi`,
          replicas: partialRequest.replicas || 1,
        },
      };

      const fullRequest: CreateClusterRequest = {
        ...dbForm,
      };

      // Use the base mutation function
      return baseMutation.mutateAsync(fullRequest);
    },
  });
}

/**
 * Custom hook for updating clusters with partial resource updates
 */
export function useUpdateClusterAction(context: ClusterApiContext) {
  const baseMutation = useUpdateClusterMutation(context);

  return useMutation({
    mutationFn: async ({
      clusterName,
      partialRequest,
    }: {
      clusterName: string;
      partialRequest: PartialClusterUpdateRequest;
    }) => {
      // Build the update request with only the provided fields
      const updateRequest: UpdateClusterRequest = {
        resource: {
          cpu: partialRequest.cpu ? `${partialRequest.cpu}m` : "1000m",
          memory: partialRequest.memory
            ? `${partialRequest.memory}Mi`
            : "2048Mi",
          storage: partialRequest.storage
            ? `${partialRequest.storage}Gi`
            : "10Gi",
          replicas: partialRequest.replicas || 1,
        },
      };

      // Use the base mutation function
      return baseMutation.mutateAsync({ clusterName, request: updateRequest });
    },
  });
}
