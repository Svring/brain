import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import type { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";

interface AddResourceToProjectOptions {
  onSuccess?: (projectName: string, addedResources: ResourceTarget[]) => void;
  onError?: (error: any) => void;
}

export function useProjectAddResource(options?: AddResourceToProjectOptions) {
  const [isAdding, setIsAdding] = useState(false);
  const { project } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();
  // Only handle adding resources to project
  const addToProjectMutation = useMutation(
    project.addResources.mutationOptions()
  );

  const addResourcesToProject = async (
    projectName: string,
    targets: ResourceTarget[]
  ) => {
    if (isAdding || !projectName || !targets.length) return;

    try {
      setIsAdding(true);

      // Add all resources to the project
      await addToProjectMutation.mutateAsync({
        resources: targets,
        name: projectName,
      });

      toast.success(
        `Added ${targets.length} resource(s) to project "${projectName}"`
      );

      invalidateQueries([], true);

      // Call success callback if provided
      options?.onSuccess?.(projectName, targets);

      return { projectName, addedResources: targets };
    } catch (error: any) {
      toast.error(
        error.message || "Failed to add resources to project. Please try again."
      );
      options?.onError?.(error);
      throw error;
    } finally {
      setIsAdding(false);
    }
  };

  return {
    addResourcesToProject,
    isAdding,
  };
}
