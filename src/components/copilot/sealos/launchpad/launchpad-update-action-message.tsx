"use client";

import React from "react";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
import { Settings } from "lucide-react";

interface LaunchpadUpdateActionMessageProps {
  args: Partial<LaunchpadUpdateFormData> & { launchpadName: string };
  respond: (data: any) => void;
  status: "awaiting_message" | "in_progress" | "complete";
}

export const LaunchpadUpdateActionMessage: React.FC<LaunchpadUpdateActionMessageProps> = ({
  args,
  respond,
  status,
}) => {
  const { launchpadName, ...formData } = args;

  const handleSubmit = (data: LaunchpadUpdateFormData) => {
    respond({
      launchpadName,
      ...data,
    });
  };

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Settings,
        name: "Update Launchpad",
      }}
      onApply={() => {
        // This will be handled by the form submission
      }}
      isSubmitting={status === "in_progress"}
      disabled={status === "in_progress"}
      applyButtonText="Update"
      className="bg-background-primary"
    >
      <LaunchpadUpdateForm
        defaultValues={formData}
        onSubmit={handleSubmit}
        isLoading={status === "in_progress"}
        hideDefaultButton={true}
        useSimplePortsMode={!!formData.simplePorts}
      />
    </BaseActionMessage>
  );
};
