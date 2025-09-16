"use client";

import React from "react";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { useLaunchpadUpdate } from "@/hooks/sealos/launchpad/use-launchpad-update";
import BaseActionMessage from "@/components/chat/messages/system-messages/components/base-action-message";
import { Settings, CircleCheckBigIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useQuery } from "@tanstack/react-query";
import { LaunchpadObject } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";

// Component that handles the success message and system message appending
const LaunchpadUpdateSuccessMessage = ({ args }: { args: any }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">Launchpad updated successfully</p>
        </div>
      </div>
    </div>
  );
};

interface LaunchpadUpdateActionMessageProps {
  args: Partial<LaunchpadUpdateFormData> & { launchpadName: string };
  respond?: (message: string) => void;
  result?: any;
  onSuccess?: (data: any) => void;
}

export const LaunchpadUpdateActionMessage: React.FC<
  LaunchpadUpdateActionMessageProps
> = ({ args, respond, result, onSuccess }) => {
  const { launchpad } = useTRPCClients();
  const target = convertResourceTypeToTarget("deployment", args.launchpadName);

  // Fetch existing launchpad object (to get current configuration)
  // const { data: existingLaunchpad, isLoading: isLoadingLaunchpad } = useQuery(
  //   launchpad.get.queryOptions(target as any) as any
  // ) as { data: LaunchpadObject | undefined; isLoading: boolean };

  // console.log("existingLaunchpad", existingLaunchpad);

  const { updateLaunchpad, isLoading } = useLaunchpadUpdate({
    onSuccess: () => {
      respond?.(`Launchpad "${args.launchpadName}" updated successfully`);
    },
    onError: () => {
      respond?.("Failed to update launchpad");
    },
  });

  const handleSubmit = async (data: LaunchpadUpdateFormData) => {
    try {
      // console.log("Updating launchpad", data);
      const result = await updateLaunchpad(data);
      onSuccess?.(result);
    } catch (error) {
      console.error("Failed to update launchpad:", error);
    }
  };

  // Extract update data from args (excluding launchpadName)
  const { launchpadName, resource, ...updateRest } = args as any;

  // Build defaultValues for the update form
  const defaultValues: Partial<LaunchpadUpdateFormData> | undefined = {
    name: args.launchpadName,
    resource,
    ...updateRest,
  };

  // console.log("LaunchpadUpdateActionMessage - defaultValues:", defaultValues);

  // Show completion message when result is provided (tool result display)
  if (result) {
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
        <LaunchpadUpdateForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          hideDefaultButton={true}
          formId="launchpad-update-form"
        />
      )}
    </BaseActionMessage>
  );
};
