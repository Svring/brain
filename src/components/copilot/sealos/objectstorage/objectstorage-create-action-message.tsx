"use client";

import React from "react";
import { ObjectStorageCreateForm } from "@/components/forms/objectstorage/objectstorage-create-form";
import { ObjectStorageCreateFormData } from "@/schemas/forms/objectstorage/objectstorage-create-form-schema";
import { useObjectStorageCreate } from "@/hooks/sealos/objectstorage/use-objectstorage-create";
import BaseActionMessage from "@/components/chat/messages/system-messages/components/base-action-message";
import { Database } from "lucide-react";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";

// Component that handles the success message and system message appending
const ObjectStorageCreationSuccessMessage = ({ args }: { args: any }) => {
  const target = convertResourceTypeToTarget("objectstoragebucket", args.name);
  const { handleNodeSelect } = useNodeSelect({
    target,
  });

  return (
    <div className="w-full p-4">
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            The object storage bucket has been created successfully.
          </p>
          <button
            onClick={handleNodeSelect}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            View object storage details
          </button>
        </div>
      </div>
    </div>
  );
};

interface ObjectStorageCreateActionMessageProps {
  args: Partial<ObjectStorageCreateFormData>;
  respond?: (message: string) => void;
  status: "inProgress" | "complete" | "executing";
}

export const ObjectStorageCreateActionMessage: React.FC<ObjectStorageCreateActionMessageProps> = ({
  args,
  respond,
  status,
}) => {
  const { createObjectStorage, isLoading } = useObjectStorageCreate({ addToProject: true });

  const handleSubmit = async (data: ObjectStorageCreateFormData) => {
    try {
      await createObjectStorage(data);
      respond?.(`Object storage bucket "${data.name}" created successfully`);
    } catch (error) {
      console.error("Failed to create object storage:", error);
      respond?.("Failed to create object storage bucket");
    }
  };

  // Show completion message when status is complete
  if (status === "complete") {
    return <ObjectStorageCreationSuccessMessage args={args} />;
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Database,
        name: "Create Object Storage",
      }}
      formId="objectstorage-create-form"
      isSubmitting={status === "inProgress" || isLoading}
    >
      <ObjectStorageCreateForm
        defaultValues={args}
        onSubmit={handleSubmit}
        isLoading={status === "inProgress" || isLoading}
        hideDefaultButton={true}
      />
    </BaseActionMessage>
  );
};
