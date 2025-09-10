"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

interface UseClusterLifecycleOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const useClusterLifecycle = (
  options: UseClusterLifecycleOptions = {}
) => {
  const { onSuccess, onError } = options;
  const { cluster } = useTRPCClients();
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    ...cluster.start.mutationOptions(),
    onSuccess: (_, clusterName) => {
      const message = "Cluster started successfully";
      toast.success(message);
      onSuccess?.(message);
      // Invalidate queries to refresh data
      const target = convertResourceTypeToTarget("cluster", clusterName);
      queryClient.invalidateQueries({
        queryKey: cluster.get.queryKey(target as any),
      });
    },
    onError: (error: any) => {
      const message = error.message || "Failed to start cluster";
      toast.error(message);
      onError?.(message);
    },
  });

  const pauseMutation = useMutation({
    ...cluster.pause.mutationOptions(),
    onSuccess: (_, clusterName) => {
      const message = "Cluster paused successfully";
      toast.success(message);
      onSuccess?.(message);
      // Invalidate queries to refresh data
      const target = convertResourceTypeToTarget("cluster", clusterName);
      queryClient.invalidateQueries({
        queryKey: cluster.get.queryKey(target as any),
      });
    },
    onError: (error: any) => {
      const message = error.message || "Failed to pause cluster";
      toast.error(message);
      onError?.(message);
    },
  });

  const executeAction = async (action: string, clusterName: string) => {
    try {
      switch (action) {
        case "start":
          await startMutation.mutateAsync(clusterName);
          break;
        case "pause":
          await pauseMutation.mutateAsync(clusterName);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Failed to ${action} cluster:`, error);
    }
  };

  const getMutationForAction = (action: string) => {
    switch (action) {
      case "start":
        return startMutation;
      case "pause":
        return pauseMutation;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  };

  return {
    executeAction,
    getMutationForAction,
    isPending: (action: string) => getMutationForAction(action).isPending,
  };
};
