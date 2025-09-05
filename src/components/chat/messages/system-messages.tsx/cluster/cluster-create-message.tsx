"use client";

import React from "react";
import { ClusterCreateForm } from "@/components/forms/cluster/cluster-create-form";
import { ClusterCreateFormData } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

interface ClusterCreateMessageProps {
  payload?: Partial<ClusterCreateFormData>;
}

export const ClusterCreateMessage: React.FC<ClusterCreateMessageProps> = ({
  payload,
}) => {
  const { cluster, project } = useTRPCClients();
  const { selectedProject } = useProjectState();

  const addToProjectMutation = useMutation(
    project.addToProject.mutationOptions()
  );

  const createClusterMutation = useMutation({
    ...cluster.createCluster.mutationOptions(),
    onSuccess: async (_, variables) => {
      if (!selectedProject) {
        toast.error("No project selected. Please select a project first.");
        return;
      }
      const resourceTarget = convertResourceTypeToTarget(
        "cluster",
        variables.name
      );
      await addToProjectMutation.mutateAsync({
        resources: [resourceTarget],
        name: selectedProject,
      });
      toast.success("Cluster created and added to project successfully!");
    },
    onError: async (error: any, variables) => {
      console.error("Cluster creation error:", error);

      // Even if cluster creation failed or output validation failed,
      // we still want to try adding it to the project by name
      if (selectedProject && variables?.name) {
        try {
          console.log(
            "⚠️ Cluster creation failed, but still adding to project by name:",
            variables.name
          );
          const resourceTarget = convertResourceTypeToTarget(
            "cluster",
            variables.name
          );
          await addToProjectMutation.mutateAsync({
            resources: [resourceTarget],
            name: selectedProject,
          });
          toast.warning(
            "Cluster creation had issues, but it was still added to the project"
          );
        } catch (addError) {
          console.error("Failed to add cluster to project:", addError);
          toast.error(
            "Cluster creation failed and could not be added to project"
          );
        }
      } else {
        toast.error(error.message || "Failed to create cluster");
      }
    },
  });

  const handleSubmit = async (data: ClusterCreateFormData) => {
    try {
      // TODO: Implement cluster creation logic
      await createClusterMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error creating cluster:", error);
    }
  };

  return (
    <div className="space-y-3 flex-col p-3 rounded-xl">
      <ClusterCreateForm
        defaultValues={payload}
        onSubmit={handleSubmit}
        isLoading={createClusterMutation.isPending}
      />
    </div>
  );
};

export default ClusterCreateMessage;
