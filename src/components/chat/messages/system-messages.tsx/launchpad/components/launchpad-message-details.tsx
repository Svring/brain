import React, { useState } from "react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { LaunchpadImage } from "./launchpad-message-detail/launchpad-image";
import { CreatedAt } from "./launchpad-message-detail/created-at";
import { ResourceAndDeployment } from "./launchpad-message-detail/resource-and-deployment";
import { Configuration } from "./launchpad-message-detail/configuration";
import {
  LaunchpadObjectSchema,
  LaunchpadObject,
} from "@/lib/sealos/resources/launchpad/launchpad-object-schema";

interface LaunchpadMessageDetailsProps {
  target: BuiltinResourceTarget;
}

export const LaunchpadMessageDetails: React.FC<
  LaunchpadMessageDetailsProps
> = ({ target }) => {
  const { resource, isLoading, error } = useResourceStatus(target);
  const queryClient = useQueryClient();
  const { launchpad } = useTRPCClients();

  // Track which specific field is being updated
  const [updatingField, setUpdatingField] = useState<string | null>(null);

  const updateLaunchpad = useMutation(launchpad.update.mutationOptions());

  // Parse the resource data as LaunchpadObject
  const launchpadObject: LaunchpadObject | null = resource
    ? LaunchpadObjectSchema.parse(resource)
    : null;

  // console.log("launchpadObject", launchpadObject);

  // Keep the original env for display, format only when editing
  const handleSubmit = async (type: string, data?: any) => {
    // console.log("requestData", data);

    // Set the updating field to show loading state for this specific field
    setUpdatingField(type);

    const updateRequest = { name: target.name!, request: data };

    await updateLaunchpad.mutateAsync(updateRequest, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: launchpad.get.queryKey(target),
        });

        toast.success("Launchpad updated successfully!");
      },
      onError: () => {
        toast.error("Failed to update launchpad");
      },
      onSettled: () => {
        // Clear the updating field when the request is complete
        setUpdatingField(null);
      },
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            Loading launchpad information...
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !launchpadObject) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-4">
          <div className="text-red-600 font-medium">
            Failed to load launchpad information
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CreatedAt createdAt={launchpadObject?.operationalStatus?.createdAt} />
      
      <LaunchpadImage
        image={launchpadObject?.image?.imageName}
        onImageUpdate={handleSubmit}
        isLoading={updatingField === "image"}
      />

      <ResourceAndDeployment
        resource={launchpadObject?.resource}
        strategy={launchpadObject?.strategy}
        onResourceAndDeploymentUpdate={handleSubmit}
        isLoading={updatingField === "resource"}
      />

      <Configuration
        command={launchpadObject?.launchCommand?.command?.join(" ")}
        args={launchpadObject?.launchCommand?.args?.join(" ")}
        envVars={launchpadObject?.env || []}
        configMap={launchpadObject?.configMap}
        storage={
          launchpadObject?.kind === "StatefulSet"
            ? launchpadObject.localStorage
            : undefined
        }
        onConfigUpdate={handleSubmit}
        isLoading={updatingField === "config"}
      />
    </div>
  );
};

export default LaunchpadMessageDetails;
