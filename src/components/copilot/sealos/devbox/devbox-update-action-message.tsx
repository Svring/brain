"use client";

import React from "react";
import { DevboxUpdateForm } from "@/components/forms/devbox/devbox-update-form";
import { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";
import { useDevboxUpdate } from "@/hooks/sealos/devbox/use-devbox-update";
import BaseActionMessage from "@/components/chat/messages/system-messages/components/base-action-message";
import { Code, CircleCheckBigIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

// Component that handles the success message and system message appending
const DevboxUpdateSuccessMessage = ({ args }: { args: any }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">Devbox updated successfully</p>
        </div>
      </div>
    </div>
  );
};

interface DevboxUpdateActionMessageProps {
  args: {
    devboxName: string;
    [key: string]: any;
  };
  respond?: (message: string) => void;
  result?: any;
  onSuccess?: (data: any) => void;
}

export const DevboxUpdateActionMessage: React.FC<
  DevboxUpdateActionMessageProps
> = ({ args, respond, result, onSuccess }) => {
  const { updateDevbox, isLoading } = useDevboxUpdate({
    onSuccess: () => {
      respond?.(`Devbox "${args.devboxName}" updated successfully`);
    },
    onError: () => {
      respond?.("Failed to update devbox");
    },
  });

  const handleSubmit = async (data: DevboxUpdateFormData) => {
    try {
      const result = await updateDevbox(data);
      onSuccess?.(result);
    } catch (error) {
      console.error("Failed to update devbox:", error);
    }
  };

  // Extract update data from args (excluding devboxName)
  const { devboxName, resource, ...updateRest } = args as any;

  // Build defaultValues for the update form
  const defaultValues: Partial<DevboxUpdateFormData> | undefined = {
    name: args.devboxName,
    resource,
    ...updateRest,
  };

  // Show completion message when result is provided (tool result display)
  if (result) {
    return <DevboxUpdateSuccessMessage args={args} />;
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Code,
        name: "Update Devbox",
      }}
      formId="devbox-update-form"
      isSubmitting={isLoading}
    >
      {isLoading ? (
        <div className="w-full p-4">
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4">
              <Spinner variant="circle" size={32} />
              <p className="text-sm text-muted-foreground text-center">
                Updating...
              </p>
            </div>
          </div>
        </div>
      ) : (
        <DevboxUpdateForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          hideDefaultButton={true}
          hidePorts={true}
        />
      )}
    </BaseActionMessage>
  );
};
