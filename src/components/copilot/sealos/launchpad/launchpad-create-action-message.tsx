"use client";

import React from "react";
import { LaunchpadCreateForm } from "@/components/forms/launchpad/launchpad-create-form";
import { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { useLaunchpadCreate } from "@/hooks/sealos/launchpad/use-launchpad-create";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
import { Rocket } from "lucide-react";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";

// Component that handles the success message and system message appending
const LaunchpadCreationSuccessMessage = ({ args }: { args: any }) => {
  const target = convertResourceTypeToTarget("deployment", args.name);
  const { handleNodeSelect } = useNodeSelect({
    target,
    messageType: "launchpad.detail",
  });

  return (
    <div className="w-full p-4">
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            The launchpad application has been created successfully.
          </p>
          <button
            onClick={handleNodeSelect}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            View launchpad details
          </button>
        </div>
      </div>
    </div>
  );
};

interface LaunchpadCreateActionMessageProps {
  args: Partial<LaunchpadCreateFormData>;
  respond?: (message: string) => void;
  status: "inProgress" | "complete" | "executing";
}

export const LaunchpadCreateActionMessage: React.FC<LaunchpadCreateActionMessageProps> = ({
  args,
  respond,
  status,
}) => {
  const { createLaunchpad, isLoading } = useLaunchpadCreate({ addToProject: true });

  const handleSubmit = async (data: LaunchpadCreateFormData) => {
    try {
      await createLaunchpad(data);
      respond?.(`Launchpad application "${data.name}" created successfully`);
    } catch (error) {
      console.error("Failed to create launchpad:", error);
      respond?.("Failed to create launchpad application");
    }
  };

  // Show completion message when status is complete
  if (status === "complete") {
    return <LaunchpadCreationSuccessMessage args={args} />;
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Rocket,
        name: "Create Launchpad",
      }}
      formId="launchpad-create-form"
      isSubmitting={status === "inProgress" || isLoading}
    >
      <LaunchpadCreateForm
        defaultValues={args}
        onSubmit={handleSubmit}
        isLoading={status === "inProgress" || isLoading}
        hideDefaultButton={true}
      />
    </BaseActionMessage>
  );
};
