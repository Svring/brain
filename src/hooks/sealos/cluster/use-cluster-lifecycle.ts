"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

interface UseClusterLifecycleOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const useClusterLifecycle = (
  options: UseClusterLifecycleOptions = {}
) => {
  const { onSuccess, onError } = options;
  const { cluster, project } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();

  const startMutation = useMutation({
    ...cluster.start.mutationOptions(),
    onSuccess: (_, clusterName) => {
      const message = "Cluster started successfully";
      toast.success(message);
      onSuccess?.(message);
      const target = convertResourceTypeToTarget("cluster", clusterName);
      invalidateQueries([cluster.get.queryKey(target as any)]);
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
      const target = convertResourceTypeToTarget("cluster", clusterName);
      invalidateQueries([cluster.get.queryKey(target as any)]);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to pause cluster";
      toast.error(message);
      onError?.(message);
    },
  });

  const deleteMutation = useMutation({
    ...cluster.delete.mutationOptions(),
    onSuccess: (_, deleteRequest) => {
      const message = "Cluster deleted successfully";
      toast.success(message);
      onSuccess?.(message);
      const target = convertResourceTypeToTarget("cluster", deleteRequest.name);
      invalidateQueries([
        cluster.get.queryKey(target as any),
        project.getResources.queryKey(),
      ]);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to delete cluster";
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
        case "delete":
          await deleteMutation.mutateAsync({ name: clusterName });
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
      case "delete":
        return deleteMutation;
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
