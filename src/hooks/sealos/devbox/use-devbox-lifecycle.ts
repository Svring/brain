"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import {
  useProjectActions,
  useProjectState,
} from "@/contexts/project/project-context";
import { useChatActions } from "@/contexts/chat/chat-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useProjectLifecycle } from "@/hooks/brain/use-project-lifecycle";
import type { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface UseDevboxLifecycleOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const useDevboxLifecycle = (options: UseDevboxLifecycleOptions = {}) => {
  const { onSuccess, onError } = options;
  const { devbox, project } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();
  const { clearSelectedResource } = useProjectActions();
  const { selectedProjectResources, selectedProject } = useProjectState();
  const { deleteProject } = useProjectLifecycle({ shouldRedirect: true });

  const startMutation = useMutation({
    ...devbox.start.mutationOptions(),
    onSuccess: (_, target) => {
      const message = "Devbox started successfully";
      toast.success(message);
      onSuccess?.(message);
      invalidateQueries([
        devbox.list.queryKey(),
        devbox.get.queryKey(target),
        devbox.releases.queryKey(target.name),
      ]);
    },
    onError: (error: any) => {
      console.error("Devbox start error:", error);
      const message = error.message || "Failed to start devbox";
      toast.error(message);
      onError?.(message);
    },
  });

  const pauseMutation = useMutation({
    ...devbox.pause.mutationOptions(),
    onSuccess: (_, target) => {
      const message = "Devbox paused successfully";
      toast.success(message);
      onSuccess?.(message);
      invalidateQueries([
        devbox.list.queryKey(),
        devbox.get.queryKey(target),
        devbox.releases.queryKey(target.name),
      ]);
    },
    onError: (error: any) => {
      console.error("Devbox pause error:", error);
      const message = error.message || "Failed to pause devbox";
      toast.error(message);
      onError?.(message);
    },
  });

  const restartMutation = useMutation({
    ...devbox.restart.mutationOptions(),
    onSuccess: (_, target) => {
      const message = "Devbox restarted successfully";
      toast.success(message);
      onSuccess?.(message);
      invalidateQueries([
        devbox.list.queryKey(),
        devbox.get.queryKey(target),
        devbox.releases.queryKey(target.name),
      ]);
    },
    onError: (error: any) => {
      console.error("Devbox restart error:", error);
      const message = error.message || "Failed to restart devbox";
      toast.error(message);
      onError?.(message);
    },
  });

  const shutdownMutation = useMutation({
    ...devbox.shutdown.mutationOptions(),
    onSuccess: (_, target) => {
      const message = "Devbox shutdown successfully";
      toast.success(message);
      onSuccess?.(message);
      invalidateQueries([
        devbox.list.queryKey(),
        devbox.get.queryKey(target),
        devbox.releases.queryKey(target.name),
      ]);
    },
    onError: (error: any) => {
      console.error("Devbox shutdown error:", error);
      const message = error.message || "Failed to shutdown devbox";
      toast.error(message);
      onError?.(message);
    },
  });

  const deleteMutation = useMutation({
    ...devbox.delete.mutationOptions(),
    onSuccess: async (_, target) => {
      const message = "Devbox deleted successfully";
      toast.success(message);
      onSuccess?.(message);
      invalidateQueries(
        [
          devbox.list.queryKey(),
          devbox.get.queryKey(target),
          devbox.releases.queryKey(target.name),
        ],
        true
      );

      // Check if this was the last resource in the project
      if (selectedProjectResources?.length === 1 && selectedProject) {
        // Delete the entire project and redirect
        await deleteProject(selectedProject);
        return; // Early return, project deletion handles cleanup
      }

      // Normal resource deletion cleanup
      clearSelectedResource();
      //
    },
    onError: (error: any) => {
      console.error("Devbox delete error:", error);
      const message = error.message || "Failed to delete devbox";
      toast.error(message);
      onError?.(message);
    },
  });

  const executeAction = async (action: string, devboxName: string) => {
    try {
      const target = convertResourceTypeToTarget(
        "devbox",
        devboxName
      ) as CustomResourceTarget;

      switch (action) {
        case "start":
          await startMutation.mutateAsync(target);
          break;
        case "pause":
          await pauseMutation.mutateAsync(target);
          break;
        case "restart":
          await restartMutation.mutateAsync(target);
          break;
        case "shutdown":
          await shutdownMutation.mutateAsync(target);
          break;
        case "delete":
          await deleteMutation.mutateAsync(target);
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
