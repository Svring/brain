"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import { createCluster } from "../cluster-api/cluster-open-api";
import type { ClusterApiContext } from "../cluster-api/cluster-open-api-schemas";
import type {
  CreateClusterRequest,
  CreateClusterResponse,
  ClusterType,
} from "../cluster-api/cluster-open-api-schemas";
import { getClusterVersions } from "../cluster-api/cluster-open-api";
import { toast } from "sonner";

interface CreateClusterActionParams {
  name: string;
  type: ClusterType;
}

/**
 * Hook that wraps useCreateClusterMutation with default parameters
 * Automatically fetches cluster version and sets default resource values
 */
export function useCreateClusterAction(context: ClusterApiContext) {
  const queryClient = useQueryClient();

  return useMutation<CreateClusterResponse, unknown, CreateClusterActionParams>(
    {
      mutationFn: async ({ name, type }: CreateClusterActionParams) => {
        // Fetch available versions for the cluster type
        const versionsResponse = await runParallelAction(
          getClusterVersions(context)
        );

        if (versionsResponse.code !== 200 || !versionsResponse.data) {
          throw new Error("Failed to fetch cluster versions");
        }

        // Find the first available version for the specified type
        const availableVersions = versionsResponse.data[type];
        if (!availableVersions || availableVersions.length === 0) {
          throw new Error(`No versions available for cluster type: ${type}`);
        }

        // Use the first available version
        const version = availableVersions[0];

        // Create the request with default values
        const request: CreateClusterRequest = {
          dbForm: {
            name,
            type,
            version,
            terminationPolicy: "Delete", // Default from schema
            resource: {
              cpu: "1000m", // Default from schema
              memory: "1024Mi", // Default from schema
              storage: "3Gi", // Default from schema
              replicas: 1, // Default from schema
            },
          },
        };

        // Create the cluster
        const response = await runParallelAction(
          createCluster(request, context)
        );
        return response;
      },
      onSuccess: (data, { name, type }) => {
        toast.success(`Cluster "${name}" of type ${type} created successfully`);
        queryClient.invalidateQueries({
          queryKey: ["cluster"],
        });
        queryClient.invalidateQueries({
          queryKey: ["project"],
        });
      },
      onError: (error, { name, type }) => {
        console.error(
          `Failed to create cluster "${name}" of type ${type}:`,
          error
        );
        toast.error(`Failed to create cluster "${name}"`);
        throw error;
      },
    }
  );
}
