"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { ClusterUpdateFormData } from "@/schemas/forms/cluster/cluster-update-form-schema";

interface UseClusterUpdateOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useClusterUpdate = (options: UseClusterUpdateOptions = {}) => {
  const { onSuccess, onError } = options;
  const { cluster } = useTRPCClients();

  const updateClusterMutation = useMutation({
    ...cluster.update.mutationOptions(),
    onSuccess: (data) => {
      toast.success("Cluster updated successfully!");
      onSuccess?.(data);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update cluster");
      onError?.(error);
    },
  });

  const updateCluster = async (
    clusterName: string,
    data: ClusterUpdateFormData
  ) => {
    try {
      await updateClusterMutation.mutateAsync({
        clusterName,
        request: data,
      });
    } catch (error) {
      console.error("Error updating cluster:", error);
    }
  };

  return {
    updateCluster,
    isLoading: updateClusterMutation.isPending,
  };
};
