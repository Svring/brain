"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { ClusterUpdateFormData } from "@/schemas/forms/cluster/cluster-update-form-schema";

interface UseClusterUpdateOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useClusterUpdate = (options: UseClusterUpdateOptions = {}) => {
  const { onSuccess, onError } = options;
  const { cluster } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();

  const updateClusterMutation = useMutation({
    ...cluster.update.mutationOptions(),
    onSuccess: (data) => {
      toast.success("Cluster updated successfully!");
      onSuccess?.(data);
      invalidateQueries([cluster.get.queryKey()]);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update cluster");
      onError?.(error);
    },
  });

  const updateCluster = async (data: ClusterUpdateFormData) => {
    try {
      await updateClusterMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error updating cluster:", error);
    }
  };

  return {
    updateCluster,
    isLoading: updateClusterMutation.isPending,
  };
};
