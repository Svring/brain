"use client";

import React from "react";
import { DevboxCreateForm } from "@/components/forms/devbox/devbox-create-form";
import { DevboxCreateFormData } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { useDevboxCreate } from "@/hooks/sealos/devbox/use-devbox-create";
import { useResourceQuotaChecker } from "@/lib/validation/resource-quota-checker";
import BaseActionMessage from "@/components/chat/messages/system-messages/components/base-action-message";
import { Code, CircleCheckBigIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

// Component that handles the success message and system message appending
const DevboxCreationSuccessMessage = ({ args }: { args: any }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">Devbox created successfully</p>
        </div>
      </div>
    </div>
  );
};

interface DevboxCreateActionMessageProps {
  args: Partial<DevboxCreateFormData>;
  respond?: (message: string) => void;
  result?: any;
  onSuccess?: (data: any) => void;
}

export const DevboxCreateActionMessage: React.FC<
  DevboxCreateActionMessageProps
> = ({ args, respond, result, onSuccess }) => {
  const { createDevbox, isLoading } = useDevboxCreate({ addToProject: true });
  const { checkAndShowQuotaError } = useResourceQuotaChecker();

  const handleSubmit = async (data: DevboxCreateFormData) => {
    
    const quotaCheckPassed = checkAndShowQuotaError({
      cpu: data.resource?.cpu || 2, 
      memory: data.resource?.memory || 4, 
      ports: data.ports?.length || 0, 
    });
    try {
      const result = await createDevbox(data);
      respond?.(`Devbox "${data.name}" created successfully`);
      onSuccess?.(result);
    } catch (error) {
      console.error("Failed to create devbox:", error);
      respond?.("Failed to create devbox");
    }
  };

  // Show completion message when result is provided (tool result display)
  if (result) {
    return <DevboxCreationSuccessMessage args={args} />;
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Code,
        name: "Create Devbox",
      }}
      formId="devbox-create-form"
      isSubmitting={isLoading}
    >
      <DevboxCreateForm
        defaultValues={args}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        hideDefaultButton={true}
      />
    </BaseActionMessage>
  );
};
