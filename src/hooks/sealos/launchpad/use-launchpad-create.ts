"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create-form-schema";

interface UseLaunchpadCreateOptions {
  addToProject?: boolean;
}

export const useLaunchpadCreate = (options: UseLaunchpadCreateOptions = {}) => {
  const { addToProject = true } = options;
  const { launchpad, project } = useTRPCClients();
  const { selectedProject } = useProjectState();

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

      // Reload window to ensure all data is fresh
      window.location.reload();
    },
    onError: async (error: any, variables) => {
      console.error("Launchpad creation error:", error);

      // Even if launchpad creation failed or output validation failed,
      // we still want to try adding it to the project by name
      if (addToProject && selectedProject && variables?.name) {
        try {
          console.log(
            "⚠️ Launchpad creation failed, but still adding to project by name:",
            variables.name
          );
          const resourceTarget = convertResourceTypeToTarget(
            "deployment",
            variables.name
          );
          await addToProjectMutation.mutateAsync({
            resources: [resourceTarget],
            name: selectedProject,
          });
          toast.warning(
            "Launchpad creation had issues, but it was still added to the project"
          );
        } catch (addError) {
          console.error("Failed to add launchpad to project:", addError);
          toast.error(
            "Launchpad creation failed and could not be added to project"
          );
        }
      } else {
        toast.error(error.message || "Failed to create launchpad application");
      }
    },
  });

  const createLaunchpad = async (data: LaunchpadCreateFormData) => {
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
