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

interface UseObjectStorageLifecycleOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const useObjectStorageLifecycle = (
  options: UseObjectStorageLifecycleOptions = {}
) => {
  const { onSuccess, onError } = options;
  const { objectstorage, project } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();
  const { clearSelectedResource } = useProjectActions();
  const { selectedProjectResources, selectedProject } = useProjectState();
  const { closeSidebarChat } = useChatActions();
  const { deleteProject } = useProjectLifecycle({ shouldRedirect: true });

  const openHostMutation = useMutation({
    ...objectstorage.openHost.mutationOptions(),
    onSuccess: (_, variables) => {
      const message = "Object storage host opened successfully";
      toast.success(message);
      onSuccess?.(message);
      invalidateQueries([
        objectstorage.list.queryKey(),
        objectstorage.getStatus.queryKey(variables),
      ]);
    },
    onError: (error: any) => {
      console.error("Object storage open host error:", error);
      const message = error.message || "Failed to open object storage host";
      toast.error(message);
      onError?.(message);
    },
  });

  const closeHostMutation = useMutation({
    ...objectstorage.closeHost.mutationOptions(),
    onSuccess: (_, variables) => {
      const message = "Object storage host closed successfully";
      toast.success(message);
      onSuccess?.(message);
      invalidateQueries([
        objectstorage.list.queryKey(),
        objectstorage.getStatus.queryKey(variables),
      ]);
    },
    onError: (error: any) => {
      console.error("Object storage close host error:", error);
      const message = error.message || "Failed to close object storage host";
      toast.error(message);
      onError?.(message);
    },
  });

  const deleteMutation = useMutation({
    ...objectstorage.delete.mutationOptions(),
    onSuccess: async (_, variables) => {
      const message = "Object storage bucket deleted successfully";
      toast.success(message);
      onSuccess?.(message);
      invalidateQueries([objectstorage.list.queryKey()], true);

      // Check if this was the last resource in the project
      if (selectedProjectResources?.length === 1 && selectedProject) {
        // Delete the entire project and redirect
        await deleteProject(selectedProject);
        return; // Early return, project deletion handles cleanup
      }

      // Normal resource deletion cleanup
      clearSelectedResource();
      closeSidebarChat();
      window.location.reload();
    },
    onError: (error: any) => {
      console.error("Object storage delete error:", error);
      const message = error.message || "Failed to delete object storage bucket";
      toast.error(message);
      onError?.(message);
    },
  });

  const executeAction = async (action: string, bucketName: string) => {
    try {
      const target = convertResourceTypeToTarget(
        "objectstoragebucket",
        bucketName
      ) as CustomResourceTarget;

      switch (action) {
        case "openHost":
          await openHostMutation.mutateAsync({ bucket: bucketName });
          break;
        case "closeHost":
          await closeHostMutation.mutateAsync({ bucket: bucketName });
          break;
        case "delete":
          await deleteMutation.mutateAsync({ bucketName });
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Failed to ${action} object storage:`, error);
    }
  };

  const getMutationForAction = (action: string) => {
    switch (action) {
      case "openHost":
        return openHostMutation;
      case "closeHost":
        return closeHostMutation;
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
