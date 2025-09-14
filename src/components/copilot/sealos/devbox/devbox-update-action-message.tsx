"use client";

import React from "react";
import { DevboxUpdateForm } from "@/components/forms/devbox/devbox-update-form";
import { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";
import { useDevboxUpdate } from "@/hooks/sealos/devbox/use-devbox-update";
import BaseActionMessage from "@/components/chat/messages/system-messages/components/base-action-message";
import { Code } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface DevboxUpdateActionMessageProps {
  args: {
    devboxName: string;
    [key: string]: any;
  };
  respond?: (message: string) => void;
}

export const DevboxUpdateActionMessage: React.FC<
  DevboxUpdateActionMessageProps
> = ({ args, respond }) => {
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
      await updateDevbox(data);
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
