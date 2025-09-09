"use client";

import React from "react";
import { DevboxCreateForm } from "@/components/forms/devbox/devbox-create-form";
import { DevboxCreateFormData } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

interface DevboxCreateMessageProps {
  payload?: Partial<DevboxCreateFormData>;
}

export const DevboxCreateMessage: React.FC<DevboxCreateMessageProps> = ({
  payload,
}) => {
  const { devbox, project } = useTRPCClients();
  const { selectedProject } = useProjectState();

  const addToProjectMutation = useMutation(
    project.addToProject.mutationOptions()
  );

  const createDevboxMutation = useMutation({
    ...devbox.create.mutationOptions(),
    onSuccess: async (_, variables) => {
      if (!selectedProject) {
        toast.error("No project selected. Please select a project first.");
        return;
      }
      const resourceTarget = convertResourceTypeToTarget(
        "devbox",
        variables.name
      );
      await addToProjectMutation.mutateAsync({
        resources: [resourceTarget],
        name: selectedProject,
      });
      toast.success("Devbox created and added to project successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create devbox");
    },
  });

  const handleSubmit = async (data: DevboxCreateFormData) => {
    try {
      // console.log("data", data);
      await createDevboxMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error creating devbox:", error);
    }
  };

  return (
    <div className="space-y-3 flex-col p-3 rounded-xl">
      <DevboxCreateForm
        defaultValues={payload}
        onSubmit={handleSubmit}
        isLoading={createDevboxMutation.isPending}
      />
    </div>
  );
};

export default DevboxCreateMessage;
