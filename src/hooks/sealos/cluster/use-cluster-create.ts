"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { ClusterCreateFormData } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { useResourceQuotaChecker } from "@/lib/validation/resource-quota-checker";

interface UseClusterCreateOptions {
  addToProject?: boolean;
}

export const useClusterCreate = (options: UseClusterCreateOptions = {}) => {
  const { addToProject = true } = options;
  const { cluster, project } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();
  const { selectedProject } = useProjectState();
  const { checkAndShowQuotaError } = useResourceQuotaChecker();

  const addToProjectMutation = useMutation(
    project.addResources.mutationOptions()
  );

  const createClusterMutation = useMutation({
    ...cluster.create.mutationOptions(),
    onSuccess: async (_, variables) => {
      if (addToProject && selectedProject) {
        const resourceTarget = convertResourceTypeToTarget(
          "cluster",
          variables.name
        );
        await addToProjectMutation.mutateAsync({
          resources: [resourceTarget],
          name: selectedProject,
        });
        toast.success("Cluster created and added to project successfully!");
      } else if (addToProject && !selectedProject) {
        toast.error("No project selected. Please select a project first.");
      } else {
        toast.success("Cluster created successfully!");
      }

      // Invalidate queries to refresh the data
      invalidateQueries(
        [cluster.get.queryKey(), project.getResources.queryKey()],
        true
      );
    },
    onError: async (error: any) => {
      console.error("Cluster creation error:", error);
      toast.error(error.message || "Failed to create cluster");
    },
  });

  const createCluster = async (data: ClusterCreateFormData) => {
    const quotaCheckPassed = checkAndShowQuotaError({
      cpu: data.resource?.cpu || 0.5, 
      memory: data.resource?.memory || 0.5, 
      storage: data.resource?.storage || 1,
    });

    if (!quotaCheckPassed) {
      return; 
    }

    try {
      await createClusterMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error creating cluster:", error);
    }
  };

  return {
    createCluster,
    isLoading: createClusterMutation.isPending,
    isAddToProjectLoading: addToProjectMutation.isPending,
  };
};
