"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { ObjectStorageCreateFormData } from "@/schemas/forms/objectstorage/objectstorage-create-form-schema";

interface UseObjectStorageCreateOptions {
  addToProject?: boolean;
}

export const useObjectStorageCreate = (
  options: UseObjectStorageCreateOptions = {}
) => {
  const { addToProject = true } = options;
  const { objectstorage, project } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();
  const { selectedProject } = useProjectState();

  const addToProjectMutation = useMutation(
    project.addResources.mutationOptions()
  );

  const createObjectStorageMutation = useMutation({
    ...objectstorage.create.mutationOptions(),
    onSuccess: async (_, variables) => {
      if (addToProject && selectedProject) {
        const resourceTarget = convertResourceTypeToTarget(
          "objectstoragebucket",
          variables.bucketName
        );
        await addToProjectMutation.mutateAsync({
          resources: [resourceTarget],
          name: selectedProject,
        });
        toast.success(
          "Object storage bucket created and added to project successfully!"
        );
      } else if (addToProject && !selectedProject) {
        toast.error("No project selected. Please select a project first.");
      } else {
        toast.success("Object storage bucket created successfully!");
      }

      // Invalidate queries to refresh the data
      invalidateQueries(
        [objectstorage.list.queryKey(), project.getResources.queryKey()],
        true
      );
    },
    onError: async (error: any, variables) => {
      console.error("Object storage creation error:", error);

      // Even if object storage creation failed or output validation failed,
      // we still want to try adding it to the project by name
      if (addToProject && selectedProject && variables?.bucketName) {
        try {
          console.log(
            "⚠️ Object storage creation failed, but still adding to project by name:",
            variables.bucketName
          );
          const resourceTarget = convertResourceTypeToTarget(
            "objectstoragebucket",
            variables.bucketName
          );
          await addToProjectMutation.mutateAsync({
            resources: [resourceTarget],
            name: selectedProject,
          });
          toast.warning(
            "Object storage creation had issues, but it was still added to the project"
          );
        } catch (addError) {
          console.error("Failed to add object storage to project:", addError);
          toast.error(
            "Object storage creation failed and could not be added to project"
          );
        }
      } else {
        toast.error(error.message || "Failed to create object storage bucket");
      }
    },
  });

  const createObjectStorage = async (data: ObjectStorageCreateFormData) => {
    try {
      await createObjectStorageMutation.mutateAsync({
        bucketName: data.name,
        bucketPolicy: data.policy,
      });
    } catch (error) {
      console.error("Error creating object storage:", error);
    }
  };

  return {
    createObjectStorage,
    isLoading: createObjectStorageMutation.isPending,
    isAddToProjectLoading: addToProjectMutation.isPending,
  };
};
