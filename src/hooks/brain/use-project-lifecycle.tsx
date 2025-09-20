"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useProjectActions } from "@/contexts/project/project-context";
import { useChatActions } from "@/contexts/chat/chat-context";

interface UseProjectLifecycleOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  shouldRedirect?: boolean; // Only redirect when called from 'one resource left' scenario
}

export const useProjectLifecycle = (
  options: UseProjectLifecycleOptions = {}
) => {
  const { onSuccess, onError, shouldRedirect = false } = options;
  const { project } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();
  const { clearSelectedResource, clearSelectedProject } = useProjectActions();
  const router = useRouter();

  const deleteMutation = useMutation({
    ...project.delete.mutationOptions(),
    onSuccess: (_, name) => {
      invalidateQueries([project.list.queryKey()]);
      const message = `Project ${name} deleted successfully`;
      toast.success(message);
      onSuccess?.(message);

      // Clear project state
      clearSelectedResource();
      clearSelectedProject();

      // Only redirect if this deletion was triggered by 'one resource left' scenario
      if (shouldRedirect) {
        router.push("/projects");
      }
    },
    onError: (error: any) => {
      const message = error.message || "Failed to delete project";
      toast.error(message);
      onError?.(message);
    },
  });

  const deleteProject = async (projectName: string) => {
    try {
      await deleteMutation.mutateAsync(projectName);
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  return {
    deleteProject,
    isDeleting: deleteMutation.isPending,
  };
};
