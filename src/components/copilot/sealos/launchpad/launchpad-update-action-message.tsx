"use client";

import React from "react";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { useLaunchpadUpdate } from "@/hooks/sealos/launchpad/use-launchpad-update";
import BaseActionMessage from "@/components/chat/messages/system-messages/components/base-action-message";
import { Settings, CircleCheckBigIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";

// Component that handles the success message and system message appending
const LaunchpadUpdateSuccessMessage = ({ args }: { args: any }) => {
  const target = convertResourceTypeToTarget("deployment", args.launchpadName);
  const { handleNodeSelect } = useNodeSelect({
    target,
    messageType: "launchpad.detail",
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">Launchpad updated successfully</p>
        </div>
        <Button onClick={handleNodeSelect} variant="outline" size="sm">
          View launchpad details
        </Button>
      </div>
    </div>
  );
};

interface LaunchpadUpdateActionMessageProps {
  args: Partial<LaunchpadUpdateFormData> & { launchpadName: string };
}

export const LaunchpadUpdateActionMessage: React.FC<
  LaunchpadUpdateActionMessageProps
> = ({ args }) => {
  const { launchpadName, ...formData } = args;

  const { updateLaunchpad, isLoading } = useLaunchpadUpdate();

  const handleSubmit = async (data: LaunchpadUpdateFormData) => {
    try {
      console.log("Updating launchpad", data);
      await updateLaunchpad(data);
    } catch (error) {
      console.error("Failed to update launchpad:", error);
    }
  };

  // Show completion message when status is complete
  if (status === "complete") {
    return <LaunchpadUpdateSuccessMessage args={args} />;
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Settings,
        name: "Update Launchpad",
      }}
      formId="launchpad-update-form"
      isSubmitting={isLoading}
      disabled={isLoading}
      applyButtonText="Update"
      className="bg-background-primary"
    >
      <LaunchpadUpdateForm
        defaultValues={formData}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        hideDefaultButton={true}
        formId="launchpad-update-form"
      />
    </BaseActionMessage>
  );
};
