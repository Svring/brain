"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { DevboxCreateFormData } from "@/schemas/forms/devbox/devbox-create-form-schema";

interface UseDevboxCreateOptions {
  addToProject?: boolean;
  onSuccess?: () => void;
}

export const useDevboxCreate = (options: UseDevboxCreateOptions = {}) => {
  const { addToProject = true, onSuccess } = options;
  const { devbox, project } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();
  const { selectedProject } = useProjectState();

  const addToProjectMutation = useMutation(
    project.addResources.mutationOptions()
  );

  const createDevboxMutation = useMutation({
    ...devbox.create.mutationOptions(),
    onSuccess: async (_, variables) => {
      if (addToProject && selectedProject) {
        const resourceTarget = convertResourceTypeToTarget(
          "devbox",
          variables.name
        );
        await addToProjectMutation.mutateAsync({
          resources: [resourceTarget],
          name: selectedProject,
        });
        toast.success("Devbox created and added to project successfully!");
      } else if (addToProject && !selectedProject) {
        toast.error("No project selected. Please select a project first.");
      } else {
        toast.success("Devbox created successfully!");
      }

      // Invalidate queries to refresh the data
      invalidateQueries(
        [devbox.list.queryKey(), project.getResources.queryKey()],
        true
      );

      console.log("[useDevboxCreate] Calling onSuccess callback!");

      // Call onSuccess callback if provided
      onSuccess?.();
    },
    onError: async (error: any) => {
      console.error("Devbox creation error:", error);
      toast.error(error.message || "Failed to create devbox");
    },
  });

  const createDevbox = async (data: DevboxCreateFormData) => {
    try {
      await createDevboxMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error creating devbox:", error);
    }
  };

  return {
    createDevbox,
    isLoading: createDevboxMutation.isPending,
    isAddToProjectLoading: addToProjectMutation.isPending,
  };
};
