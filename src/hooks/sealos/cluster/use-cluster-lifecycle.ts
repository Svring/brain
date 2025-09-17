"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useProjectActions } from "@/contexts/project/project-context";
import { useChatActions } from "@/contexts/chat/chat-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import type { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

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
  const { clearSelectedResource } = useProjectActions();
  const { closeSidebarChat } = useChatActions();

  const startMutation = useMutation({
    ...cluster.start.mutationOptions(),
    onSuccess: (_, target) => {
      const message = "Cluster started successfully";
      toast.success(message);
      onSuccess?.(message);
      invalidateQueries([cluster.get.queryKey()]);
    },
    onError: (error: any) => {
      console.error("Cluster start error:", error);
      const message = error.message || "Failed to start cluster";
      toast.error(message);
      onError?.(message);
    },
  });

  const pauseMutation = useMutation({
    ...cluster.pause.mutationOptions(),
    onSuccess: (_, target) => {
      const message = "Cluster paused successfully";
      toast.success(message);
      onSuccess?.(message);
      invalidateQueries([cluster.get.queryKey()]);
    },
    onError: (error: any) => {
      console.error("Cluster pause error:", error);
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
      const target = convertResourceTypeToTarget(
        "cluster",
        deleteRequest.name
      ) as CustomResourceTarget;
      invalidateQueries([cluster.get.queryKey()], true); // Enable invalidateProjectResources flag
      // Clear selected resource and close sidebar chat after successful deletion
      clearSelectedResource();
      closeSidebarChat();
      // Reload the window after successful deletion
      window.location.reload();
    },
    onError: (error: any) => {
      console.error("Cluster delete error:", error);
      const message = error.message || "Failed to delete cluster";
      toast.error(message);
      onError?.(message);
    },
  });

  const executeAction = async (action: string, clusterName: string) => {
    try {
      const target = convertResourceTypeToTarget(
        "cluster",
        clusterName
      ) as CustomResourceTarget;

      switch (action) {
        case "start":
          await startMutation.mutateAsync(target);
          break;
        case "pause":
          await pauseMutation.mutateAsync(target);
          break;
        case "delete":
          await deleteMutation.mutateAsync({ ...target, name: clusterName });
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
