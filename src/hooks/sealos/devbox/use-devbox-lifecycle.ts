"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

interface UseDevboxLifecycleOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const useDevboxLifecycle = (options: UseDevboxLifecycleOptions = {}) => {
  const { onSuccess, onError } = options;
  const { devbox, project } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();

  const startMutation = useMutation({
    ...devbox.start.mutationOptions(),
    onSuccess: (_, devboxName) => {
      const message = "Devbox started successfully";
      toast.success(message);
      onSuccess?.(message);
      const target = convertResourceTypeToTarget("devbox", devboxName);
      invalidateQueries([
        devbox.list.queryKey(),
        devbox.get.queryKey(target as any),
      ]);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to start devbox";
      toast.error(message);
      onError?.(message);
    },
  });

  const pauseMutation = useMutation({
    ...devbox.pause.mutationOptions(),
    onSuccess: (_, devboxName) => {
      const message = "Devbox paused successfully";
      toast.success(message);
      onSuccess?.(message);
      const target = convertResourceTypeToTarget("devbox", devboxName);
      invalidateQueries([
        devbox.list.queryKey(),
        devbox.get.queryKey(target as any),
      ]);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to pause devbox";
      toast.error(message);
      onError?.(message);
    },
  });

  const restartMutation = useMutation({
    ...devbox.restart.mutationOptions(),
    onSuccess: (_, devboxName) => {
      const message = "Devbox restarted successfully";
      toast.success(message);
      onSuccess?.(message);
      const target = convertResourceTypeToTarget("devbox", devboxName);
      invalidateQueries([
        devbox.list.queryKey(),
        devbox.get.queryKey(target as any),
      ]);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to restart devbox";
      toast.error(message);
      onError?.(message);
    },
  });

  const shutdownMutation = useMutation({
    ...devbox.shutdown.mutationOptions(),
    onSuccess: (_, devboxName) => {
      const message = "Devbox shutdown successfully";
      toast.success(message);
      onSuccess?.(message);
      const target = convertResourceTypeToTarget("devbox", devboxName);
      invalidateQueries([
        devbox.list.queryKey(),
        devbox.get.queryKey(target as any),
      ]);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to shutdown devbox";
      toast.error(message);
      onError?.(message);
    },
  });

  const deleteMutation = useMutation({
    ...devbox.delete.mutationOptions(),
    onSuccess: (_, devboxName) => {
      const message = "Devbox deleted successfully";
      toast.success(message);
      onSuccess?.(message);
      const target = convertResourceTypeToTarget("devbox", devboxName);
      invalidateQueries(
        [devbox.list.queryKey(), devbox.get.queryKey(target as any)],
        true
      );
    },
    onError: (error: any) => {
      const message = error.message || "Failed to delete devbox";
      toast.error(message);
      onError?.(message);
    },
  });

  const executeAction = async (action: string, devboxName: string) => {
    try {
      switch (action) {
        case "start":
          await startMutation.mutateAsync(devboxName);
          break;
        case "pause":
          await pauseMutation.mutateAsync(devboxName);
          break;
        case "restart":
          await restartMutation.mutateAsync(devboxName);
          break;
        case "shutdown":
          await shutdownMutation.mutateAsync(devboxName);
          break;
        case "delete":
          await deleteMutation.mutateAsync(devboxName);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Failed to ${action} devbox:`, error);
    }
  };

  const getMutationForAction = (action: string) => {
    switch (action) {
      case "start":
        return startMutation;
      case "pause":
        return pauseMutation;
      case "restart":
        return restartMutation;
      case "shutdown":
        return shutdownMutation;
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
