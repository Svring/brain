"use client";

import React from "react";
import { LaunchpadCreateForm } from "@/components/forms/launchpad/launchpad-create-form";
import { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create/launchpad-create-form-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

interface LaunchpadCreateMessageProps {
  payload?: Partial<LaunchpadCreateFormData>;
}

export const LaunchpadCreateMessage: React.FC<LaunchpadCreateMessageProps> = ({
  payload,
}) => {
  const { launchpad, project } = useTRPCClients();
  const { selectedProject } = useProjectState();

  const addToProjectMutation = useMutation(
    project.addToProject.mutationOptions()
  );

  const createLaunchpadMutation = useMutation({
    ...launchpad.createLaunchpad.mutationOptions(),
    onSuccess: async (_, variables) => {
      if (!selectedProject) {
        toast.error("No project selected. Please select a project first.");
        return;
      }
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
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create launchpad application");
    },
  });

  const handleSubmit = async (data: LaunchpadCreateFormData) => {
    try {
      console.log("data", data);
      // await createLaunchpadMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error creating launchpad:", error);
    }
  };

  return (
    <div className="space-y-3 flex-col bg-background-secondary p-3 rounded-xl">
      <LaunchpadCreateForm
        defaultValues={payload}
        onSubmit={handleSubmit}
        isLoading={createLaunchpadMutation.isPending}
      />
    </div>
  );
};

export default LaunchpadCreateMessage;
