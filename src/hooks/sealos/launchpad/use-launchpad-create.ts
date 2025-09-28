"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { useResourceQuotaChecker } from "@/lib/validation/resource-quota-checker";

interface UseLaunchpadCreateOptions {
  addToProject?: boolean;
}

export const useLaunchpadCreate = (options: UseLaunchpadCreateOptions = {}) => {
  const { addToProject = true } = options;
  const { launchpad, project } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();
  const { selectedProject } = useProjectState();
  const { checkAndShowQuotaError } = useResourceQuotaChecker();

  const addToProjectMutation = useMutation(
    project.addResources.mutationOptions()
  );

  const createLaunchpadMutation = useMutation({
    ...launchpad.create.mutationOptions(),
    onSuccess: async (_, variables) => {
      if (addToProject && selectedProject) {
        const resourceTarget = convertResourceTypeToTarget(
          "deployment",
          variables.name
        );
        await addToProjectMutation.mutateAsync({
          resources: [resourceTarget],
          name: selectedProject,
        });
        toast.success(
          "Launchpad application created and added to project successfully!"
        );
      } else if (addToProject && !selectedProject) {
        toast.error("No project selected. Please select a project first.");
      } else {
        toast.success("Launchpad application created successfully!");
      }

      // Invalidate queries to refresh the data
      invalidateQueries(
        [launchpad.list.queryKey(), project.getResources.queryKey()],
        true
      );
    },
    onError: async (error: any) => {
      console.error("Launchpad creation error:", error);
      toast.error(error.message || "Failed to create launchpad application");
    },
  });

  const createLaunchpad = async (data: LaunchpadCreateFormData) => {
    const quotaCheckPassed = checkAndShowQuotaError({
      cpu: data.resource?.cpu || 0.5,
      memory: data.resource?.memory || 0.5, 
      ports: data.ports?.length || 0, 
    });

    if (!quotaCheckPassed) {
      return; 
    }

    try {
      await createLaunchpadMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error creating launchpad:", error);
    }
  };

  return {
    createLaunchpad,
    isLoading: createLaunchpadMutation.isPending,
    isAddToProjectLoading: addToProjectMutation.isPending,
  };
};
