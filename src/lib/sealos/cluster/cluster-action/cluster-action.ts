"use client";

import { useMutation } from "@tanstack/react-query";
import { useCreateClusterMutation } from "../cluster-mutation";
import { generateClusterName } from "../cluster-utils";
import type { ClusterApiContext } from "../schemas/cluster-api-context-schemas";
import type {
  ClusterCreateRequest,
  DbForm,
} from "../schemas/req-res-schemas/req-res-create-schemas";

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
  terminationPolicy?: "Delete" | "Retain";
};

/**
 * Custom hook for creating clusters with default values
 */
export function useCreateClusterAction(context: ClusterApiContext) {
  const baseMutation = useCreateClusterMutation(context);

  return useMutation({
    mutationFn: async (partialRequest: PartialClusterCreateRequest) => {
      // Apply defaults to the partial request
      const dbForm: DbForm = {
        dbType: partialRequest.dbType,
        dbVersion: partialRequest.dbVersion,
        dbName: partialRequest.dbName || generateClusterName(),
        replicas: partialRequest.replicas || 1,
        cpu: partialRequest.cpu || 1000,
        memory: partialRequest.memory || 2048,
        storage: partialRequest.storage || 10,
        labels: partialRequest.labels || {},
        autoBackup: {
          start: false,
          type: "day",
          week: [],
          hour: "0",
          minute: "0",
          saveTime: 7,
          saveType: "d",
        },
        terminationPolicy: partialRequest.terminationPolicy || "Delete",
      };

      const fullRequest: ClusterCreateRequest = {
        dbForm,
        isEdit: false,
      };

      // Use the base mutation function
      return baseMutation.mutateAsync(fullRequest);
    },
  });
}
