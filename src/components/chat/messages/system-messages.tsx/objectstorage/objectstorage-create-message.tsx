"use client";

import React from "react";
import { ObjectStorageCreateForm } from "@/components/forms/objectstorage/objectstorage-create-form";
import { ObjectStorageCreateFormData } from "@/schemas/forms/objectstorage/objectstorage-create-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

interface ObjectStorageCreatePayload {
  name?: string;
  policy?: "private" | "publicRead" | "publicReadWrite";
}

interface ObjectStorageCreateMessageProps {
  payload: ObjectStorageCreatePayload;
}

export const ObjectStorageCreateMessage: React.FC<
  ObjectStorageCreateMessageProps
> = ({ payload }) => {
  const { objectstorage, project } = useTRPCClients();
  const { selectedProject } = useProjectState();

  const addToProjectMutation = useMutation(
    project.addToProject.mutationOptions()
  );

  const createObjectStorageMutation = useMutation({
    ...objectstorage.createObjectStorage.mutationOptions(),
    onSuccess: async (_, variables) => {
      if (!selectedProject) {
        toast.error("No project selected. Please select a project first.");
        return;
      }
      const resourceTarget = convertResourceTypeToTarget(
        "objectstoragebucket",
        variables.bucketName
      );
      await addToProjectMutation.mutateAsync({
        resources: [resourceTarget],
        name: selectedProject,
      });
      toast.success("Object storage bucket created and added to project successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create object storage bucket");
    },
  });

  const handleSubmit = async (data: ObjectStorageCreateFormData) => {
    try {
      console.log("data", data);
      // await createObjectStorageMutation.mutateAsync({
      //   bucketName: data.name,
      //   bucketPolicy: data.policy,
      // });
    } catch (error) {
      console.error("Error creating object storage:", error);
    }
  };

  return (
    <div className="space-y-3 flex-col p-3 rounded-xl">
      <ObjectStorageCreateForm
        defaultValues={payload}
        onSubmit={handleSubmit}
        isLoading={createObjectStorageMutation.isPending}
      />
    </div>
  );
};

export default ObjectStorageCreateMessage;
