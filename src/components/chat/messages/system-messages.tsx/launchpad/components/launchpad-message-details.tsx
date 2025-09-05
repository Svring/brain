import React from "react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { ImageCreatedAt } from "./launchpad-message-detail/image-created-at";
import { ResourceQuota } from "./launchpad-message-detail/resource-quota";
import { Deployment } from "./launchpad-message-detail/deployment";
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

  const updateLaunchpad = useMutation(
    launchpad.updateLaunchpad.mutationOptions()
  );

  // Parse the resource data as LaunchpadObject
  const launchpadObject: LaunchpadObject | null = resource
    ? LaunchpadObjectSchema.parse(resource)
    : null;

  // console.log("launchpadObject", launchpadObject);

  // Keep the original env for display, format only when editing
  const handleSubmit = async (type: string, data?: any) => {
    // console.log("requestData", data);

    const updateRequest = { name: target.name!, request: data };

    await updateLaunchpad.mutateAsync(updateRequest, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: launchpad.getLaunchpad.queryKey(target),
        });

        toast.success("Launchpad updated successfully!");
      },
      onError: () => {
        toast.error("Failed to update launchpad");
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
      <ImageCreatedAt
        target={target}
        image={launchpadObject?.image}
        createdAt={launchpadObject?.operationalStatus?.createdAt}
        onImageUpdate={handleSubmit}
        isLoading={updateLaunchpad.isPending}
      />

      <ResourceQuota
        resource={launchpadObject?.resource}
        onResourceUpdate={handleSubmit}
        isLoading={updateLaunchpad.isPending}
      />

      <Deployment
        resource={launchpadObject?.resource}
        strategy={launchpadObject?.strategy}
        onDeploymentUpdate={handleSubmit}
        isLoading={updateLaunchpad.isPending}
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
        isLoading={updateLaunchpad.isPending}
      />
    </div>
  );
};

export default LaunchpadMessageDetails;
