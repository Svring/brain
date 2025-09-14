"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import type { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface UseLaunchpadLifecycleOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const useLaunchpadLifecycle = (
  options: UseLaunchpadLifecycleOptions = {}
) => {
  const { onSuccess, onError } = options;
  const { launchpad, project } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();

  const startMutation = useMutation({
    ...launchpad.start.mutationOptions(),
    onSuccess: (_, target) => {
      const message = "Launchpad started successfully";
      toast.success(message);
      onSuccess?.(message);
      invalidateQueries([launchpad.list.queryKey(), launchpad.get.queryKey()]);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to start launchpad";
      toast.error(message);
      onError?.(message);
    },
  });

  const pauseMutation = useMutation({
    ...launchpad.pause.mutationOptions(),
    onSuccess: (_, target) => {
      const message = "Launchpad paused successfully";
      toast.success(message);
      onSuccess?.(message);
      invalidateQueries([launchpad.list.queryKey(), launchpad.get.queryKey()]);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to pause launchpad";
      toast.error(message);
      onError?.(message);
    },
  });

  const deleteMutation = useMutation({
    ...launchpad.delete.mutationOptions(),
    onSuccess: (_, target) => {
      const message = "Launchpad deleted successfully";
      toast.success(message);
      onSuccess?.(message);
      invalidateQueries([
        launchpad.list.queryKey(),
        launchpad.get.queryKey(),
        project.getResources.queryKey(),
      ]);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to delete launchpad";
      toast.error(message);
      onError?.(message);
    },
  });

  const executeAction = async (action: string, launchpadName: string) => {
    try {
      const target = convertResourceTypeToTarget(
        "deployment",
        launchpadName
      ) as BuiltinResourceTarget;

      switch (action) {
        case "start":
          await startMutation.mutateAsync(target);
          break;
        case "pause":
          await pauseMutation.mutateAsync(target);
          break;
        case "delete":
          await deleteMutation.mutateAsync(target);
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
