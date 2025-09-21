"use client";

import React from "react";
import { LaunchpadCreateSimpleForm } from "@/components/forms/launchpad/launchpad-create-form-simple";
import { LaunchpadSimpleFormData } from "@/components/forms/launchpad/launchpad-create-form-simple";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";

interface LaunchpadCreateSimpleMessageProps {
  onSuccess?: () => void;
}

export const LaunchpadCreateSimpleMessage: React.FC<
  LaunchpadCreateSimpleMessageProps
> = ({ onSuccess }) => {
  const { launchpad, project } = useTRPCClients();
  const { selectedProject } = useProjectState();
  const { invalidateQueries } = useInvalidateQueries();

  const addToProjectMutation = useMutation(
    project.addResources.mutationOptions()
  );

  const createLaunchpadMutation = useMutation({
    ...launchpad.create.mutationOptions(),
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
      invalidateQueries(
        [launchpad.list.queryKey(), project.getResources.queryKey()],
        true
      );
      // Call onSuccess callback if provided
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create launchpad application");
    },
  });

  const handleSubmit = async (data: LaunchpadSimpleFormData) => {
    try {
      console.log("data", data);
      await createLaunchpadMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error creating launchpad:", error);
    }
  };

  return (
    <div className="space-y-3 flex-col p-3 rounded-xl">
      <LaunchpadCreateSimpleForm
        onSubmit={handleSubmit}
        isLoading={createLaunchpadMutation.isPending}
      />
    </div>
  );
};

export default LaunchpadCreateSimpleMessage;
