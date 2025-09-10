"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

interface UseLaunchpadLifecycleOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const useLaunchpadLifecycle = (
  options: UseLaunchpadLifecycleOptions = {}
) => {
  const { onSuccess, onError } = options;
  const { launchpad } = useTRPCClients();
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    ...launchpad.start.mutationOptions(),
    onSuccess: (_, launchpadName) => {
      const message = "Launchpad started successfully";
      toast.success(message);
      onSuccess?.(message);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: launchpad.list.queryKey() });
      const target = convertResourceTypeToTarget("deployment", launchpadName);
      queryClient.invalidateQueries({
        queryKey: launchpad.get.queryKey(target as any),
      });
    },
    onError: (error: any) => {
      const message = error.message || "Failed to start launchpad";
      toast.error(message);
      onError?.(message);
    },
  });

  const pauseMutation = useMutation({
    ...launchpad.pause.mutationOptions(),
    onSuccess: (_, launchpadName) => {
      const message = "Launchpad paused successfully";
      toast.success(message);
      onSuccess?.(message);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: launchpad.list.queryKey() });
      const target = convertResourceTypeToTarget("deployment", launchpadName);
      queryClient.invalidateQueries({
        queryKey: launchpad.get.queryKey(target as any),
      });
    },
    onError: (error: any) => {
      const message = error.message || "Failed to pause launchpad";
      toast.error(message);
      onError?.(message);
    },
  });

  const executeAction = async (action: string, launchpadName: string) => {
    try {
      switch (action) {
        case "start":
          await startMutation.mutateAsync(launchpadName);
          break;
        case "pause":
          await pauseMutation.mutateAsync(launchpadName);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Failed to ${action} launchpad:`, error);
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
