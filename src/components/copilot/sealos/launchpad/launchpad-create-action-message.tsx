"use client";

import React from "react";
import { LaunchpadCreateForm } from "@/components/forms/launchpad/launchpad-create-form";
import { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { useLaunchpadCreate } from "@/hooks/sealos/launchpad/use-launchpad-create";
import BaseActionMessage from "@/components/chat/messages/system-messages/components/base-action-message";
import { Rocket, CircleCheckBigIcon } from "lucide-react";

// Component that handles the success message and system message appending
const LaunchpadCreationSuccessMessage = ({ args }: { args: any }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">Launchpad created successfully</p>
        </div>
      </div>
    </div>
  );
};

interface LaunchpadCreateActionMessageProps {
  args: Partial<LaunchpadCreateFormData>;
  respond?: (message: string) => void;
  result?: any;
  onSuccess?: (data: any) => void;
}

export const LaunchpadCreateActionMessage: React.FC<LaunchpadCreateActionMessageProps> = ({
  args,
  respond,
  result,
  onSuccess,
}) => {
  const { createLaunchpad, isLoading } = useLaunchpadCreate({ addToProject: true });

  const handleSubmit = async (data: LaunchpadCreateFormData) => {
    try {
      const result = await createLaunchpad(data);
      respond?.(`Launchpad application "${data.name}" created successfully`);
      onSuccess?.(result);
    } catch (error) {
      console.error("Failed to create launchpad:", error);
      respond?.("Failed to create launchpad application");
    }
  };

  // Show completion message when result is provided (tool result display)
  if (result) {
    return <LaunchpadCreationSuccessMessage args={args} />;
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Rocket,
        name: "Create Launchpad",
      }}
      formId="launchpad-create-form"
      isSubmitting={isLoading}
    >
      <LaunchpadCreateForm
        defaultValues={args}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        hideDefaultButton={true}
      />
    </BaseActionMessage>
  );
};
